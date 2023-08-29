import { types as registerTypes, getLoyaltyOldData } from '../ducks/register';
import { types as stateTypes, checkNetwork, getUserType, getCustomerID, getToken, getLoyaltyId } from '../ducks/setappstate';
import { put, select, call } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import AsyncStorage from '@react-native-community/async-storage';
import { AppEventsLogger } from 'react-native-fbsdk';
import { pathOr } from 'ramda';

// import {LoadingComponent} from '../components/CommonLoader'
import { ORGANIZATION_ID, CHANNEL_ID, TOKEN } from '../config/constants/network_constants';
import {
  KEY_ORGANIZATION_ID,
  KEY_CUSTOMER_ID,
  KEY_TOKEN,
  KEY_USERINFO_AT_CONFIRMSIGNUP,
  KEY_USERINFO_AT_REGISTER,
  KEY_CHANNEL_ID,
  KEY_LOYALTY_ID_2
} from '../config/constants/network_api_keys';

import { APIS } from '../config/constants/network_constants';
import { Actions } from 'react-native-router-flux';
import { appSaga } from './appstate';
import { THEME_LEVEL_1 } from '../config/common_styles/appthemes';


export function* getPinCode(action) {
  const connected = yield select(checkNetwork);
  if (connected) {
    yield put({ type: stateTypes.API_NAME, payload: 'get1' });
    yield put({ type: stateTypes.SET_LOADING, payload: true });
    const CUSTOMER_ID = yield select(getCustomerID);
    action.userData.append(KEY_CUSTOMER_ID, CUSTOMER_ID);
    action.userData.append(KEY_CHANNEL_ID, CHANNEL_ID);

    const data = yield call(appSaga, {
      URL: `${APIS.SIGNUP_POST}`,
      requestType: 'post',
      requestParams: action.userData,
      initialToken: true
    });
    const { error } = data || {};
    if (!error) {
      yield put({ type: stateTypes.SET_LOADING, payload: false });

      yield put({
        type: registerTypes.GET_PINCODE_SUCCESS,
        payload: data
      });
      const responsedata = convertData(data);

      if (responsedata !== undefined) {
       
        if (responsedata.status) {
          goToPincodeScreen(responsedata);
        } else {
          yield put({ type: stateTypes.SHOW_ERROR, error: responsedata.statusMessage || responsedata.message });
        }
      } else {
        yield put({ type: stateTypes.SHOW_ERROR, error: 'Invalid Response' });
      }
    } else {
      yield put({ type: stateTypes.SET_LOADING, payload: false });
      yield put({ type: stateTypes.SHOW_ERROR, error });

      //yield put({ type: registerTypes.GET_PINCODE_FAILURE })
    }
  } else {
    yield put({ type: stateTypes.SHOW_ERROR, error });
  }
}
export function* getResendCode(action) {
  const connected = yield select(checkNetwork);
  if (connected) {
    yield put({ type: stateTypes.SET_LOADING, payload: true });
    const CUSTOMER_ID = yield select(getCustomerID);
    action.userData.append(KEY_CUSTOMER_ID, CUSTOMER_ID);
    action.userData.append(KEY_CHANNEL_ID, CHANNEL_ID);

    const data = yield call(appSaga, {
      URL: `${APIS.RESENDCODE_POST}`,
      requestType: 'post',
      requestParams: action.userData,
      initialToken: true
    });
    const { error } = data;
    if (!error) {
      yield put({ type: stateTypes.SET_LOADING, payload: false });
      yield put({
        type: registerTypes.GET_RESENDCODE_SUCCESS,
        payload: data
      });
      const responsedata = convertData(data);
      if (responsedata !== undefined) {
        responsedata.data.CountryCode = '961';
        yield put({ type: stateTypes.SHOW_ERROR, error: 'Successfully sent' });
        refreshPincodeScreen(responsedata);
      } else {
        yield put({ type: stateTypes.SHOW_ERROR, error: 'Invalid Response' });
      }
    } else {
      yield put({ type: stateTypes.SET_LOADING, payload: false });
      yield put({ type: stateTypes.SHOW_ERROR, error });

    }
  } else {
    yield put({ type: stateTypes.SHOW_ERROR, error });
  }
}

const setUsertheme = points => {
  AsyncStorage.setItem('theme', JSON.stringify(THEME_LEVEL_1));
};

export function* confirmSignup(action) {
  const connected = yield select(checkNetwork);

  if (connected) {
    yield put({ type: stateTypes.USER_TYPE, payload: 'register' });
    yield put({ type: stateTypes.SET_LOADING, payload: true });
    const CUSTOMER_ID = yield select(getCustomerID);
    action.userData.append(KEY_ORGANIZATION_ID, ORGANIZATION_ID);
    action.userData.append(KEY_CHANNEL_ID, CHANNEL_ID);

    const data = yield call(appSaga, {
      URL: `${APIS.SIGNUP_CONFIRMATION}`,
      requestType: 'post',
      requestParams: action.userData,
      initialToken: true
    });
    const { error } = data;
    if (!error) {
      const responsedata = convertData(data);
      if (responsedata.message === 'pin error') {
        yield put({ type: stateTypes.SHOW_ERROR, error: 'Incorrect Pin!' });
      }

      if (responsedata.message.PinCode === 'The PinCode field must be exactly 6 characters in length.') {
        yield put({ type: stateTypes.SHOW_ERROR, error: 'The PinCode field must be exactly 6 characters in length.' });
      }

      if (responsedata !== undefined) {
        yield put({ type: stateTypes.SET_LOADING, payload: false });
        yield AsyncStorage.setItem(KEY_USERINFO_AT_CONFIRMSIGNUP, JSON.stringify(responsedata));
        yield put({
          type: registerTypes.CONFIRM_SIGNUP_SUCCESS,
          payload: responsedata
        });

        if (responsedata.type == 'register') {
          yield put({ type: stateTypes.USER_TYPE, payload: 'register' });
          Actions.join({
            mobileNumber: responsedata.data.MobileNumber,
            CountryCode: responsedata.data.CountryCode,
            requestId: responsedata.data.RequestId,
            email: responsedata.data.Email,
          });
        } else if (responsedata.type == 'login') {
          AsyncStorage.setItem('ACCESS_TOKEN', responsedata.data.token);
          yield put({ type: stateTypes.SET_ACCESS_TOKEN, payload: responsedata.token });
          setUsertheme(responsedata.data?.customer?.LevelName);
          //set token to be used in the whole app
          yield put({ type: stateTypes.USER_TYPE, payload: 'login' });
          yield delay(400);
          //yield put ({type : homeTypes.FETCH_USER_ORDER_COUNT })

          Actions.reset('drawer');
        }
      } else {
        yield put({ type: stateTypes.SHOW_ERROR, error: 'Invalid Response' });
      }
    } else {
      yield put({ type: stateTypes.SET_LOADING, payload: false });
      yield put({ type: stateTypes.SHOW_ERROR, error });
      //yield put({ type: registerTypes.CONFIRM_SIGNUP_FAILURE })
    }
  } else {
    yield put({ type: stateTypes.SHOW_ERROR, error });
  }
}
const goToPincodeScreen = responsedata => {
  Actions.pincode({
    MobileNumber: responsedata.data.MobileNumber,
    CountryCode: responsedata.data.CountryCode,
    RequestId: responsedata.data.RequestId,
    pinCode: responsedata.data.SMS
  });
};
const refreshPincodeScreen = responsedata => {
  //console.log('===========', responsedata.data.PinCode);

  Actions.refresh({
    key: Actions.currentScene,
    MobileNumber: responsedata.data.MobileNumber,
    CountryCode: responsedata.data.CountryCode,
    RequestId:responsedata.data.RequestId,
    pinCode: responsedata.data.PinCode
  });
};

export function* registerUser(action) {
  const connected = yield select(checkNetwork);
  if (connected) {
    yield put({ type: stateTypes.SET_LOADING, payload: true });
    const CUSTOMER_ID = yield select(getCustomerID);
    action.userData.append(KEY_CHANNEL_ID, CHANNEL_ID);
    const data = yield call(appSaga, {
      URL: `${APIS.REGISTER_USER}`,
      requestType: 'post',
      requestParams: action.userData,
      initialToken: true
    });
    const { error } = data;
    if (!error && data?.data.status === true) {
      const responsedata = convertData(data);
      responsedata.type = "login";

      AsyncStorage.setItem('ACCESS_TOKEN', responsedata.token);
      yield put({ type: stateTypes.SET_ACCESS_TOKEN, payload: responsedata.token });

      yield AsyncStorage.setItem(KEY_USERINFO_AT_REGISTER, JSON.stringify(responsedata), () => {});
      yield AsyncStorage.setItem(KEY_USERINFO_AT_CONFIRMSIGNUP, JSON.stringify(responsedata));
      yield put({ type: stateTypes.SET_LOADING, payload: false });

      yield put({
        type: registerTypes.CONFIRM_SIGNUP_SUCCESS,
        payload: responsedata
      });
      yield put({ type: stateTypes.USER_TYPE, payload: 'register' });

      AppEventsLogger.logEvent("fb_mobile_complete_registration");

      setUsertheme(responsedata.data?.customer?.LevelName);
      yield delay(400);
      //yield put ({ type:homeTypes.FETCH_MEALS })
      Actions.drawer({ type: 'reset' });
      Actions.home({ drawerMenu: true });
    } else {
      yield put({ type: stateTypes.SET_LOADING, payload: false });
      yield put({ type: stateTypes.SHOW_ERROR, error });
      //yield put({ type: registerTypes.REGISTER_USER_FAILURE })
    }
  } else {
    yield put({ type: stateTypes.SHOW_ERROR, error });
  }
}

function convertData(data) {
  let array = {};

  try {
    const object = JSON.stringify(data);
    const obj = JSON.parse(object) || {};
    array = obj.data;
    // array = array.data;
  } catch (e) {
  } finally {
  }

  return array;
}

export function* editAcount(action) {
  let data;
  const LOYALTY_ID = yield select(getLoyaltyId);
  action.params.append(KEY_ORGANIZATION_ID, ORGANIZATION_ID);
  action.params.append(KEY_CHANNEL_ID, CHANNEL_ID);
  action.params.append(KEY_LOYALTY_ID_2, LOYALTY_ID);
  const requestData = {
    URL: APIS.EDIT_ACCOUNT,
    requestType: 'post',
    requestParams: action.params
  };
  data = yield call(appSaga, requestData);
  const { error } = data;
  if (!error) {
    yield put({
      type: registerTypes.EDIT_ACCOUNT_SUCCESS,
      payload: data.data
    });
    // Actions.squadcorner();
    Actions.drawer({ type: 'reset' });
    Actions.home({ drawerMenu: true });
  }
  else {
    yield put({ type: registerTypes.EDIT_ACCOUNT_FAILURE, payload: [] });
  }
}

export function* contactUs(action) {
  const LOYALTY_ID = yield select(getLoyaltyId);
  action.params.append(KEY_LOYALTY_ID_2, LOYALTY_ID);
  const requestData = {
    URL: APIS.CONTACT_US,
    requestType: 'post',
    requestParams: action.params
  };
  const data = yield call(appSaga, requestData);
  yield put({ type: stateTypes.SET_LOADING, payload: true });
  const { error } = data;
  if (!error) {
    yield put({ type: stateTypes.SET_LOADING, payload: false });
    if (data?.data) {
      yield put({
        type: registerTypes.CONTACT_US_SUCCESS,
        payload: data?.data
      });
    } else {
      yield put({ type: registerTypes.CONTACT_US_FAILURE, payload: [] });
    }

  } else {
    yield put({ type: stateTypes.SET_LOADING, payload: false });
    yield put({ type: registerTypes.CONTACT_US_FAILURE, payload: [] });
  }
}

export function* getContactInfo(action) {
  const LOYALTY_ID = yield select(getLoyaltyId);
  const URL = `${APIS.GET_CONTACT_INFO}?${KEY_CHANNEL_ID}=${CHANNEL_ID}&${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&${KEY_LOYALTY_ID_2}=${LOYALTY_ID}`;
  const requestType = 'get'
  const requestData = { URL, requestType };
  const data = yield call(appSaga, requestData);
  const { error } = data;
  if (!error) {
    yield put({
      type: registerTypes.SET_CONTACT_INFO,
      payload: pathOr({}, ['data', 'data'], data)
    });
  } else {
    yield put({ type: registerTypes.CONTACT_US_FAILURE, payload: [] });
  }
}

export function* getAboutInfo() {
  const LOYALTY_ID = yield select(getLoyaltyId);
  const URL = `${APIS.GET_ABOUT_INFO}?${KEY_CHANNEL_ID}=${CHANNEL_ID}&${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&${KEY_LOYALTY_ID_2}=${LOYALTY_ID}`;
  const requestType = 'get'
  const requestData = { URL, requestType };
  const data = yield call(appSaga, requestData);
  const { error } = data;
  if (!error) {
    yield put({
      type: registerTypes.SET_ABOUT_INFO,
      payload: pathOr({}, ['data', 'data'], data)
    });
  } else {
    yield put({ type: registerTypes.SET_ABOUT_INFO, payload: {} });
  }
}
