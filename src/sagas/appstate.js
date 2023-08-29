import { types as deliveryTypes } from '../ducks/deliverydetails';
import { types as homeTypes } from '../ducks/home';
import { put, call, select } from 'redux-saga/effects';
import AsyncStorage from '@react-native-community/async-storage';
import { path, pathOr } from 'ramda';
import { Actions } from 'react-native-router-flux';
import VersionNumber from 'react-native-version-number';
import DeviceInfo from "react-native-device-info";
import { IF_OS_IS_IOS } from "../config/common_styles";
import firebase from 'react-native-firebase';
import { Platform } from 'react-native';
import {
  types as stateTypes,
  checkNetwork,
  getLoyaltyId,
  getCustomerID,
  getUserType,
  getToken,
  getInitialToken,
  getForceLogOut
} from '../ducks/setappstate';
import { ORGANIZATION_ID, CHANNEL_ID, VKey_ID } from '../config/constants/network_constants';
import {
  KEY_ORGANIZATION_ID,
  KEY_TOKEN,
  KEY_APP_CURRENCY,
  KEY_MANUAL_LOGOUT,
  KEY_LOYALTYID,
  KEY_CUSTOMER_ID,
  KEY_CUSTOMERID,
  KEY_LOYALTY_ID,
  KEY_LOYALTY_LEVEL_ID,
  KEY_SIDE_MENU,
  KEY_DEVICE_ID,
  KEY_PUSH_ID,
  MOBILE_DEVICE_ID,
  KEY_ERROR,
  KEY_VERSION,
  KEY_APP_VERSION,
  KEY_OS_VERSION,
  KEY_OS_PLATFORM,
  KEY_VKEY_ID,
  KEY_CHANNEL_ID,
  KEY_LOYALTY_ID_2,
  KEY_DEVICE_MODEL
} from '../config/constants/network_api_keys';
import {
  postDataService,
  getDataService,
  postDataServiceWithFormData
} from '../services/services';
import { APIS } from '../config/constants/network_constants';
import { getDataFromJson } from '../config/common_functions';

const FailedErrorMsg =
  'UH-OH! Something went wrong.\nContact our Support with as much information as possible.';

export function* appSaga(requestData) {
  var data;
  const connected = yield select(checkNetwork);
  const isGet = requestData.requestType == 'get';
  const ACCESS_TOKEN = yield select(getToken);
  const INITIAL_TOKEN = yield select(getInitialToken);

  if (connected) {
    yield put({ type: stateTypes.SET_LOADING, payload: true });
    if (isGet) {
      data = yield getDataService(requestData.URL, ACCESS_TOKEN);
    } else if (requestData.requestType == 'post_file') {
      data = yield postDataServiceWithFormData(requestData.requestParams, requestData.URL);
    } else {
      data = yield postDataService(requestData.requestParams, requestData.URL, requestData.initialToken ? INITIAL_TOKEN : ACCESS_TOKEN);
    }

    let { error } = data;

    if (!error) {
      if (data.status == 200) {
        yield put({ type: stateTypes.SET_LOADING, payload: false });
        return data || {};
      } else {
        // try to refetch token and retry once
        if (data.message && data.message.match(/token/i)) {
          console.log('got Emergency token error', data, requestData);
          if (!requestData.retry) {
            const CustomerId = yield select(getCustomerID);
            const token = yield call(getAccessToken, {
              params: { CustomerId }
            });
            console.log('Emergency token', token);
            requestData.retry = true;
            if (isGet) {
              requestData.URL.replace(/token=[a-zA-Z0-9\._-]*/, 'token=' + token);
            } else requestData.requestParams.append('token', token);
            data = yield call(appSaga, requestData);
            return data || {};
          } else {
            yield put({ type: stateTypes.SET_LOADING, payload: false });
            return {};
          }
        } else {
          yield put({ type: stateTypes.SET_LOADING, payload: false });
          // yield put({
          //   type: stateTypes.SHOW_ERROR,
          //   error: data.message || FailedErrorMsg
          // });
          return data || {};
        }
      }
    } else {
      yield put({ type: stateTypes.SET_LOADING, payload: false });
      // yield put({ type: stateTypes.SHOW_ERROR, error: data.error === 404 ? 'No data found' : FailedErrorMsg });
      return data || {};
    }
  } else {
    yield put({ type: stateTypes.SET_LOADING, payload: false });
    yield put({ type: stateTypes.SHOW_ERROR, error: 'No internet connection' });
    return data || {};
  }
  // }
}

export function* getAppInitialData(action) {
  yield put({ type: stateTypes.SET_LOADING, payload: true });
  const appVersion = yield VersionNumber.appVersion;
  const DeviceId = DeviceInfo.getUniqueId()
  const ACCESS_TOKEN = yield select(getToken);
  const LOYALTY_ID = yield select(getLoyaltyId);
  const CUSTOMER_ID = yield select(getCustomerID);

  let MAC_ADDRESS = "";
  if (!IF_OS_IS_IOS)
    yield DeviceInfo.getMacAddress().then(MacAddress => (MAC_ADDRESS = MacAddress));
  // AppVersion:1.0
  // OsPlatform:android
  const requestData = {
    URL: `${
      APIS.GET_INIT_DATA
    }?${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&${KEY_CHANNEL_ID}=${CHANNEL_ID}&${KEY_LOYALTY_ID_2}=${LOYALTY_ID}&AppVersion=${appVersion}&OsPlatform=${Platform.OS}&DeviceId=${DeviceId}`,
    requestType: 'get'
  };

  const data = yield call(appSaga, requestData);
  console.log('getAppInitialData', data);
  let { error } = data;
  if (!error) {
    const multiData = pathOr([], ['data', 'data'], data);
    console.log('appState saga', multiData);
    const { Banners, Currency, SideMenu, HomeSlider = [], ForceUpdate, OrdersHistory, Addresses, Loyalty, ExtraCharge, ForceLogout, SpinTheWheel } = multiData;
    // console.log("MinimumOrderAmount==========>",MinimumOrderAmount);
    // yield setBanners(Banners);
    yield setSidemenu(SideMenu);
    yield setSliders(HomeSlider)
    yield setCurency({ Currency, Loyalty });
    yield setSpinWheel(SpinTheWheel);
    yield setForceUpdate(ForceUpdate);
    if(ForceLogout!==undefined)  yield setForceLogOut(ForceLogout);
    // yield setOrderHistory(OrdersHistory);
    yield setExtraCharge(ExtraCharge);
    // optional and can be omitted
    if(Addresses) yield setAddresses(Addresses);
  } else {
    // retry
  }

  yield put({ type: stateTypes.SET_LOADING, payload: false });
}

export function* setSliders(Sliders) {
  yield put({
    type: homeTypes.SET_SLIDES,
    payload: Sliders
  });
};

export function* setCurency({ Currency = 'LBP', Loyalty }) {
  yield AsyncStorage.setItem(KEY_APP_CURRENCY, Currency);
  yield put({
    type: stateTypes.GET_CURRENCY_SUCCESS,
    payload: { Currency, Loyalty }
  });
};

export function* setSpinWheel(SpinWheel) {
  yield put({
    type: stateTypes.GET_SPIN_WHEEL_SUCCESS,
    payload: SpinWheel
  });
};

export function* setAddresses({ Addresses = [] }) {
  yield put({
    type: deliveryTypes.EDIT_DELIVERY_ADDRESS_SUCCESS,
    payload: Addresses
  });
};

// export function* setBanners(banners) {
//   // const banners = path(['data', 'data'], data);
//   yield put({
//     type: homeTypes.SET_BANNERS,
//     payload: banners
//   });
// };

export function* setSidemenu(sideMenu = []) {
  try {
    yield AsyncStorage.setItem(KEY_SIDE_MENU, JSON.stringify(sideMenu));
    yield put({ type: stateTypes.SET_SIDE_MENU, payload: sideMenu });
  } catch (e) {
    console.error('error Parsing menu', data)
  }
};

export function* setOrderHistory(ordersHistory) {
  yield put({
    type: homeTypes.FETCH_USER_ORDER_COUNT_SUCCESS,
    payload: ordersHistory
  });
  // const dataJson = getDataFromJson(data);
  // if (dataJson && dataJson.length > 5) {
  //   //yield delay(6000);
  //   yield put({ type: homeTypes.FETCH_USUAL_MEALS });
  // } else {
  //   //yield delay(6000);
  //   //yield put ({ type:"fetch_meals" })
  // }
};

export function* setExtraCharge(extraCharge) {
  yield put({
    type: homeTypes.FETCH_EXTRA_CHARGE_SUCCESS,
    payload: extraCharge
  });
}

export function* setForceUpdate(updateData) {
  let shouldGetVersion = 0;
  try {
    const { Status = 0 } = updateData;
    if (Status) shouldGetVersion = parseInt(Status);
  } catch (e) {
    console.log('error checking app version update', updateData);
  }
  yield put({
    type: stateTypes.SET_VERSION_STATUS,
    payload: updateData
  });
  if (shouldGetVersion) Actions.update({ type: 'reset' });
};

export function* setForceLogOut(updateData) {
  const { ForceLogoutId, ForceLogoutStatus } = updateData;
  if (ForceLogoutStatus) {
    const LOYALTY_ID = yield select(getLoyaltyId);
    let formData = new FormData();
    formData.append(KEY_ORGANIZATION_ID, ORGANIZATION_ID);
    formData.append(KEY_CHANNEL_ID, CHANNEL_ID);
    formData.append(KEY_DEVICE_ID, MOBILE_DEVICE_ID);
    formData.append(KEY_LOYALTY_ID_2, LOYALTY_ID);
    formData.append('LogoutHeaderId', ForceLogoutId);

    const requestData = {
      URL: APIS.FORCE_LOGOUT,
      requestType: 'post',
      requestParams: formData
    };
    const data = yield call(appSaga, requestData);
    let { error } = data;
    if (!error) {
      const multiData = pathOr([], ['data', 'data'], data);

      yield put({
        type: stateTypes.SET_FORCE_LOGOUT,
        payload: multiData?.status === 200 ? true : false
      });
    }
  } else {
    yield put({
      type: stateTypes.SET_FORCE_LOGOUT,
      payload: false
    });
  }
};

export function* getCurrency(action) {
  var data;

  const userType = yield select(getUserType);
  var requestData;
  const ACCESS_TOKEN = yield select(getToken);
  const ID = yield select(getCustomerID);

  requestData = {
    URL:
      APIS.GET_CURRENCY +
      '?' +
      KEY_TOKEN +
      '=' +
      ACCESS_TOKEN +
      '&' +
      KEY_ORGANIZATION_ID +
      '=' +
      ORGANIZATION_ID +
      '&' +
      KEY_CUSTOMER_ID +
      '=' +
      ID,
    requestType: 'get'
  };

  data = yield call(appSaga, requestData);

  // console.log('log data', data);
  let { error } = data;
  if (!error) {
    yield AsyncStorage.setItem(
      KEY_APP_CURRENCY,
      JSON.stringify(data.data.Currency ? data.data.Currency : ''),
      () => {}
    );
    yield put({
      type: stateTypes.GET_CURRENCY_SUCCESS,
      payload: data.data.Currency ? data.data : ''
    });
  } else {
    yield put({ type: stateTypes.GET_CURRENCY_FAILURE, payload: [] });
  }
}

export function* getSideMenu(action) {
  const ACCESS_TOKEN = yield select(getToken);
  const ID = yield select(getCustomerID);

  const requestData = {
    requestType: 'get',
    URL:
      `${APIS.GET_SIDE_MENU}?${KEY_TOKEN}=${ACCESS_TOKEN}&` +
      `${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&` +
      `${KEY_CUSTOMER_ID}=${ID}`
  };
  const data = yield call(appSaga, requestData);
  let { error } = data;
  if (!error) {
    let sideMenu = [];
    try {
      sideMenu = path(['data', 'data'], data);
      yield AsyncStorage.setItem(KEY_SIDE_MENU, JSON.stringify(sideMenu));
    } catch (e) {
      console.error('error Parsing menu', data);
    }
    yield put({ type: stateTypes.SET_SIDE_MENU, payload: sideMenu });
  }
}

export function* fbConnect(action) {
  const ACCESS_TOKEN = yield select(getToken);
  // const CUSTOMER_ID = yield select(getCustomerID);

  // add customer id
  // action.params.append(KEY_CUSTOMER_ID, CUSTOMER_ID);

  const requestData = {
    URL: APIS.FB_CONNECT,
    requestType: 'post',
    requestParams: action.params
  };
  const data = yield call(appSaga, requestData);
  let { error } = data;
  if (!error) {
    yield put({
      type: stateTypes.FB_CONNECT_SUCCESS,
      payload: data.data
    });
  } else {
    yield put({ type: stateTypes.FB_CONNECT_FAILURE, payload: [] });
  }
}

export function* getAccessToken(action) {
  console.log('called getAccessToken', action);

  const {
    params: { VKey }
  } = action;

  let formdata = new FormData()

  formdata.append(KEY_ORGANIZATION_ID, ORGANIZATION_ID);
  formdata.append(KEY_VKEY_ID, VKey_ID);
  formdata.append(KEY_CHANNEL_ID, CHANNEL_ID);


  // const data = {
  //   KEY_ORGANIZATION_ID: ORGANIZATION_ID,
  //   KEY_VKEY_ID: VKey_ID,
  //   KEY_CHANNEL_ID: CHANNEL_ID
  // }

  const requestURL = `${
    APIS.GET_TOKEN
  }`;
  const requestData = {
    URL: requestURL,
    requestType: 'post',
    requestParams: formdata
  };
  const response = yield call(appSaga, requestData);
  // yield put({ type: stateTypes.SET_LOADING, payload: false });
  const { error } = response;
  if (!error && typeof response.data === 'object') {
    const {
      data: { token = '' }
    } = response;
    console.log('setting access token', token);
    yield put({
      type: stateTypes.SET_ACCESS_TOKEN,
      payload: token
    });
    AsyncStorage.setItem('ACCESS_TOKEN', JSON.stringify({ token: token, id: ORGANIZATION_ID }));
    return token;
  } else {
    // yield put({
    //   type: stateTypes.SET_ACCESS_TOKEN,
    //   payload: ''
    // });
  }
}


export function* getGames() {
  const LOYALTY_ID = yield select(getLoyaltyId);
  const requestData = {
    requestType: 'get',
    URL: `${APIS.GAMES}?${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&${KEY_CHANNEL_ID}=${CHANNEL_ID}&${KEY_LOYALTY_ID_2}=${LOYALTY_ID}`
  };
  let data = yield call(appSaga, requestData);
  let { error } = data;
  if (!error) {
    yield put({
      type: stateTypes.GAMES_SUCCESS,
      payload: getDataFromJson(data) == undefined ? [] : getDataFromJson(data)
    })
    yield put({ type: stateTypes.SET_LOADING, payload: false })
  } else {
    yield put({ type: stateTypes.SET_LOADING, payload: false })
    yield put({ type: stateTypes.GAMES_FAILURE, payload: [] })
  }
}

export function* spreadTheWord(action) {
  const userType = yield select(getUserType);
  const {
    params: { formData }
  } = action;

  if (userType == 'login' || userType == 'register') {
    const requestURL = `${
      APIS.SPREAD_THE_WORD
    }`;

    const requestData = {
      URL: requestURL,
      requestType: 'post',
      requestParams: formData
    };
    const response = yield call(appSaga, requestData);
    yield put({ type: stateTypes.SET_LOADING, payload: false });
    const { error } = response;
    if (!error && typeof response.data === 'object') {
      yield put({
        type: stateTypes.SPREAD_THE_WORD_SUCCESS,
        payload: response.data
      });
    } else {
      yield put({
        type: stateTypes.SPREAD_THE_WORD_FAILURE,
        payload: { error: true }
      });
    }
  }
}

export function* getVersionStatus({ version }) {
  const ACCESS_TOKEN = yield select(getToken);
  const CUSTOMER_ID = yield select(getCustomerID);
  const requestData = {
    requestType: 'get',
    URL:
      `${APIS.CHECK_VERSION}?${KEY_TOKEN}=${ACCESS_TOKEN}&` +
      `${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&` +
      `${KEY_CUSTOMER_ID}=${CUSTOMER_ID}&version=${version}`
  };
  const data = yield call(appSaga, requestData);
  let shouldGetVersion = 0;
  let { error } = data;
  if (!error) {
    try {
      const updateData = path(['data', 'data'], data);
      const { Update = 0 } = updateData;
      if (Update) shouldGetVersion = parseInt(Update);
    } catch (e) {
      console.log('error checking app version update', data);
    }
    yield put({
      type: stateTypes.SET_VERSION_STATUS,
      payload: shouldGetVersion
    });
    if (shouldGetVersion) Actions.update({ type: 'reset' });
  }
}

export function* sendFireBaseToken({ token }) {
  const ACCESS_TOKEN = yield select(getToken);
  const CUSTOMER_ID = yield select(getCustomerID);
  const LOYALTY_ID = yield select(getLoyaltyId);
  const AppVersion = yield VersionNumber.appVersion;
  const DeviceId = DeviceInfo.getUniqueId()
  const OSPlatform = yield DeviceInfo.getSystemName()
  const OSVersion = yield DeviceInfo.getSystemVersion()

  const formData = new FormData();
  formData.append(KEY_TOKEN, ACCESS_TOKEN)
  formData.append(KEY_ORGANIZATION_ID, ORGANIZATION_ID)
  formData.append(KEY_CHANNEL_ID, CHANNEL_ID)
  formData.append(KEY_CUSTOMER_ID, CUSTOMER_ID)
  formData.append(KEY_LOYALTY_ID_2, LOYALTY_ID)
  formData.append(KEY_PUSH_ID, token)
  formData.append(KEY_APP_VERSION, AppVersion)
  formData.append(KEY_DEVICE_ID, MOBILE_DEVICE_ID)
  formData.append(KEY_OS_VERSION, OSVersion)
  formData.append(KEY_OS_PLATFORM, OSPlatform)
  formData.append(KEY_DEVICE_MODEL, OSPlatform)
  formData.append('AllowPush', 1)

  const requestData = {
    URL: APIS.SEND_FIREBASE_TOKEN,
    requestType: 'post',
    requestParams: formData
  };
  console.log('Sending FireBase Token')
  const data = yield call(appSaga, requestData);
  let { error } = data;
  if (!error) {
    // success
    console.log('FireBase Token Sent Successfully', data)
    const ForceLogout = yield select(getForceLogOut);
    console.log('logout--->', ForceLogout)
    if(ForceLogout === true) {
      firebase.messaging().unsubscribeFromTopic(`/topics/agora_pr_${LOYALTY_ID}`);
      // yield call(logoutLog, () => Actions.reset('splash', { logout: true }));
    }
  } else {
    // failure
    console.log('Sending FireBase Token Failed', data)
  }
}

export function* logoutLog(successCallback) {
  const ACCESS_TOKEN = yield select(getToken);
  const CUSTOMER_ID = yield select(getCustomerID);
  const LOYALTY_ID = yield select(getLoyaltyId);
  const AppVersion = yield VersionNumber.appVersion;
  const DeviceId = DeviceInfo.getUniqueId()
  const formData = new FormData();
  const isAutomatic = typeof successCallback == 'function'

  formData.append(KEY_TOKEN, ACCESS_TOKEN)
  formData.append(KEY_ORGANIZATION_ID, ORGANIZATION_ID)
  formData.append(KEY_CUSTOMERID, CUSTOMER_ID)
  formData.append(KEY_DEVICE_ID, MOBILE_DEVICE_ID)
  formData.append(KEY_VERSION, AppVersion)
  formData.append(KEY_LOYALTYID, LOYALTY_ID)
  formData.append(KEY_MANUAL_LOGOUT, isAutomatic ? '0' : '1')

  const requestData = {
    URL: APIS.LOGOUT_POST,
    requestType: 'post',
    requestParams: formData
  };
  const data = yield call(appSaga, requestData);

  yield put({
    type: stateTypes.SET_FORCE_LOGOUT,
    payload: false
  });

  let { error } = data;
  if (!error) {
    // success
    console.log('Remote Logged Out Successfully', data)
    yield put({
      type: homeTypes.FETCH_USER_ORDER_COUNT_SUCCESS,
      payload: {rows:[], total: 0, pending_orders: 0}
    });
    if(isAutomatic) successCallback()
  } else {
    // failure
    console.log('Remote Logged Out Error', error)
  }
}

export function* logErrorReport({ log }) {
  const ACCESS_TOKEN = yield select(getToken);
  const CUSTOMER_ID = yield select(getCustomerID);
  const AppVersion = yield VersionNumber.appVersion;
  const DeviceId = DeviceInfo.getUniqueId()
  const formData = new FormData();
  formData.append(KEY_TOKEN, ACCESS_TOKEN)
  formData.append(KEY_ORGANIZATION_ID, ORGANIZATION_ID)
  formData.append(KEY_CUSTOMERID, CUSTOMER_ID)
  formData.append(KEY_ERROR, log)
  formData.append(KEY_DEVICE_ID, MOBILE_DEVICE_ID)
  formData.append(KEY_VERSION, AppVersion)

  const requestData = {
    URL: APIS.ERROR_LOGING,
    requestType: 'post',
    requestParams: formData
  };
  const data = yield call(appSaga, requestData);
  console.log('Logging Error', log)
  let { error } = data;
  if (!error) {
    // success
    console.log('Logged Error Successfully')
  } else {
    // failure
    console.log('Error Logging Error', error)
  }
}
