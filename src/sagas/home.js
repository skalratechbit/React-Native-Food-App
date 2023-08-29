import { types as homeTypes } from "../ducks/home";
import { put, call, select } from "redux-saga/effects";
import { getDataFromJson } from "../config/common_functions";
import {
  types as stateTypes,
  checkNetwork,
  getCustomerID,
  getToken,
  getLoyaltyId
} from "../ducks/setappstate";
import { ORGANIZATION_ID, CHANNEL_ID } from "../config/constants/network_constants";
import {
  KEY_ORGANIZATION_ID,
  KEY_TOKEN,
  KEY_CUSTOMER_ID,
  KEY_CUSTOMERID,
  KEY_CHANNEL_ID,
  KEY_LOYALTY_ID_2
} from "../config/constants/network_api_keys";
import { getDataService } from "../services/services";
import { APIS } from "../config/constants/network_constants";
import { IF_OS_IS_IOS } from "../config/common_styles";
import { appSaga } from "./appstate";
import DeviceInfo from "react-native-device-info";
import VersionNumber from 'react-native-version-number';
import { path, pathOr } from 'ramda';

export function* fetchMeals(action) {
  var data;
  const connected = yield select(checkNetwork);
  const ACCESS_TOKEN = yield select(getToken);
  const CUSTOMER_ID = yield select(getCustomerID);
  const URL = `${
    APIS.MEALS_GET
  }?${KEY_TOKEN}=${ACCESS_TOKEN}&${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&category_id=21&start=0&limit=50&${KEY_CUSTOMER_ID}=${CUSTOMER_ID}`;
  const requestData = {
    URL: URL,
    requestType: "get"
  };

  if (connected) {
    yield put({ type: stateTypes.SET_LOADING, payload: false });
    data = yield getDataService(URL);
    //data  = yield call(appSaga,requestData)

    let { error } = data;
    if (!error) {
      yield put({ type: stateTypes.SET_LOADING, payload: false });
      //

      yield put({
        type: homeTypes.FETCH_MEALS_SUCCESS,
        payload: getDataFromJson(data)
      });
      //
    } else {
      yield put({ type: stateTypes.SET_LOADING, payload: false });
      yield put({ type: stateTypes.SHOW_ERROR, error: error });
      yield put({ type: homeTypes.FETCH_MEALS_FAILURE });
    }
  } else {
    yield put({ type: stateTypes.SET_LOADING, payload: false });
    yield put({ type: stateTypes.SHOW_ERROR, error: "No internet connection" });
  }
}

export function* fetchUsualMeals(action) {
  var data;
  const connected = yield select(checkNetwork);
  const ACCESS_TOKEN = yield select(getToken);
  let ID = yield select(getCustomerID);
  const url =
    APIS.USUAL_MEALS_GET +
    "?" +
    KEY_TOKEN +
    "=" +
    ACCESS_TOKEN +
    "&" +
    KEY_ORGANIZATION_ID +
    "=" +
    ORGANIZATION_ID +
    "&" +
    KEY_CUSTOMER_ID +
    "=" +
    ID;

  const requestData = {
    URL: url,
    requestType: "get"
  };
  if (connected) {
    yield put({ type: stateTypes.API_NAME, payload: "two" });
    //yield put ({ type : stateTypes.SET_LOADING , payload:true })
    data = yield getDataService(url);
    //data  = yield call(appSaga,requestData)

    let { error } = data;
    if (!error) {
      yield put({ type: stateTypes.SET_LOADING, payload: false });
      yield put({
        type: homeTypes.FETCH_USUAL_MEALS_SUCCESS,
        payload: getDataFromJson(data) == undefined ? [] : getDataFromJson(data)
      });
    } else {
      yield put({ type: stateTypes.SET_LOADING, payload: false });
      yield put({ type: stateTypes.SHOW_ERROR, error: error });
      yield put({ type: homeTypes.FETCH_USUAL_MEALS_FAILURE, payload: [] });
    }
  } else {
    yield put({ type: stateTypes.SET_LOADING, payload: false });
    yield put({ type: stateTypes.SHOW_ERROR, error: "No internet connection" });
  }
}

export function* fetchUserOrdersCount(action) {
  let data;
  const connected = yield select(checkNetwork);
  const ACCESS_TOKEN = yield select(getToken);
  // const APP_VERSION = yield select(appVersion);
  const LOYALTY_ID = yield select(getLoyaltyId);
  const appVersion = yield VersionNumber.appVersion;
  let MAC_ADDRESS = "";
  const { pagination = { limit: 5, offset: 0 } } = action;
  // console.log('fetchUserOrdersCount ACCESS_TOKEN', ACCESS_TOKEN);
  if (!IF_OS_IS_IOS)
    yield DeviceInfo.getMacAddress().then(MacAddress => (MAC_ADDRESS = MacAddress));
  if (connected) {
    let ID = yield select(getCustomerID);

    let url =
      APIS.GET_ORDER_COUNT +
      `?${KEY_CHANNEL_ID}=${CHANNEL_ID}` +
      `&${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}` +
      `&${KEY_LOYALTY_ID_2}=${LOYALTY_ID}`;

    //track app version per session
    // let sentAppVersion;
    // yield AsyncStorage.getItem("appVersion").then(data => (sentAppVersion = data));
    // if (APP_VERSION !== sentAppVersion) {
    //   AsyncStorage.setItem("appVersion", String(APP_VERSION));
    //   url += `&appVersion=${APP_VERSION}`;
    // }

    //add pagination to get request
    url += `&limit=${pagination.limit}&row=${pagination.offset}`;

    const requestData = {
      URL: url,
      requestType: "get"
    };

    yield put({ type: stateTypes.SET_LOADING, payload: true });
    data = yield getDataService(url, ACCESS_TOKEN);
    if (pagination.append) data.data.append = true;

    let { error } = data;
    if (!error && data?.data?.data != undefined) {
      yield put({ type: stateTypes.SET_LOADING, payload: false });
      yield put({
        type: homeTypes.FETCH_USER_ORDER_COUNT_SUCCESS,
        payload: data.data.data
      });
      const dataJson = getDataFromJson(data.data.data.rows);
      if (dataJson && dataJson.length > 5) {
        //yield delay(6000);
        yield put({ type: homeTypes.FETCH_USUAL_MEALS });
      } else {
        //yield delay(6000);
        //yield put ({ type:"fetch_meals" })
      }
    } else {
      yield put({ type: stateTypes.SET_LOADING, payload: false });
      yield put({ type: stateTypes.SHOW_ERROR, error: error });
      yield put({ type: homeTypes.FETCH_USER_ORDER_COUNT_FAILURE });
      yield put({
        type: homeTypes.FETCH_USER_ORDERS_FAILURE,
        payload: []
      });
    }
  } else {
    yield put({ type: stateTypes.SET_LOADING, payload: false });
    yield put({ type: stateTypes.SHOW_ERROR, error: "No internet connection" });
  }
}

export function* fetchLastOrder(action) {
  yield put({ type: stateTypes.SET_LOADING, payload: true });
  const ACCESS_TOKEN = yield select(getToken);
  const CUSTOMER_ID = yield select(getCustomerID);
  const requestData = {
    URL: `${
      APIS.GET_LAST_ORDER
    }?${KEY_TOKEN}=${ACCESS_TOKEN}&${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&${KEY_CUSTOMERID}=${CUSTOMER_ID}`,
    requestType: 'get'
  };
  const response = yield call(appSaga, requestData);
  let { error } = response;
  if (!error) {
    const data = pathOr(null, ['data', 'data', '0'], response);
    yield put({ type: homeTypes.SET_LAST_ORDER, payload: data });
  } else {
    // retry
  }

  yield put({ type: stateTypes.SET_LOADING, payload: false });
}

export function* cancelOrder(action) {
  const LOYALTY_ID = yield select(getLoyaltyId);

  action.params.append(KEY_ORGANIZATION_ID, ORGANIZATION_ID);
  action.params.append(KEY_CHANNEL_ID, CHANNEL_ID);
  action.params.append(KEY_LOYALTY_ID_2, LOYALTY_ID);

  const requestData = {
    URL: APIS.CANCEL_ORDER,
    requestType: "post",
    requestParams: action.params
  };
  const data = yield call(appSaga, requestData);
  let { error } = data;
  if (!error) {
    yield put({
      type: homeTypes.SET_CANCEL_ORDER_STATUS,
      payload: pathOr({}, ['data'], data)
    });
  } else {
    yield put({ type: homeTypes.CANCEL_ORDER_FAILURE });
    yield put({ type: stateTypes.SHOW_ERROR, error: error });
  }
}

export function* getBanners(action) {
  const connected = yield select(checkNetwork);
  const ACCESS_TOKEN = yield select(getToken);
  const CUSTOMER_ID = yield select(getCustomerID);
  const LOYALTY_ID = yield select(getLoyaltyId);
  const URL = `${APIS.GET_BANNERS}?${KEY_CHANNEL_ID}=${CHANNEL_ID}&${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&${KEY_LOYALTY_ID_2}=${LOYALTY_ID}`;
  const requestData = { URL: URL, requestType: "get" };

  if (connected) {
    const data = yield call(appSaga, requestData);
    const { error } = data;
    if (!error) {
      const banners = path(['data', 'data'], data);
      yield put({
        type: homeTypes.SET_BANNERS,
        payload: banners
      });
    }
  }
}
