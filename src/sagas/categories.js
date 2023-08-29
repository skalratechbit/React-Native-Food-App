import { types as categoryTypes } from "../ducks/categories";
import { put, call, select } from "redux-saga/effects";
import AsyncStorage from '@react-native-community/async-storage';
import { getDataFromJson } from "../config/common_functions";

import { types as stateTypes, checkNetwork, getToken, getCustomerID, getLoyaltyId, getCustomerInfo, getInitialToken } from "../ducks/setappstate";
import { ORGANIZATION_ID, CHANNEL_ID } from "../config/constants/network_constants";
import { KEY_ORGANIZATION_ID, KEY_CHANNEL_ID, KEY_LOYALTY_ID_2 } from "../config/constants/network_api_keys";
import { getDataService } from "../services/services";
import { APIS } from "../config/constants/network_constants";
import { appSaga } from "./appstate";

let FIRST_MENU_FETCH = true;
let FIRST_CATEGORIES_FETCH = true;

export function* fetchCategories(action) {
  var data;
  const connected = yield select(checkNetwork);
  const LOYALTY_ID = yield select(getLoyaltyId);
  const ACCESS_TOKEN = yield select(getToken);
  const customerInfo = yield select(getCustomerInfo);
  const INITIAL_TOKEN = yield select(getInitialToken);

  let isAuth = customerInfo && Object.keys(customerInfo).length > 0;

  const URL = isAuth ? `${
    APIS.CATEGORIES_GET
  }?${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&${KEY_CHANNEL_ID}=${CHANNEL_ID}&${KEY_LOYALTY_ID_2}=${LOYALTY_ID}`
  : `${APIS.CATEGORIES_GET}?${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&${KEY_CHANNEL_ID}=${CHANNEL_ID}`;

  const requestData = {
    URL: URL,
    requestType: "get"
  };

  if (connected) {
    yield put({ type: stateTypes.SET_LOADING, payload: FIRST_CATEGORIES_FETCH });

    let data = null;
    if (FIRST_CATEGORIES_FETCH) {
      yield AsyncStorage.getItem("CATEGORIES_GET").then(results => {
        try {
          if(results) data = JSON.parse(results)
        } catch (e) {
          FIRST_CATEGORIES_FETCH = false;
        }
      });
    }

    //fetching
    data = isAuth ? yield getDataService(URL, ACCESS_TOKEN) : yield getDataService(URL, INITIAL_TOKEN);
    FIRST_CATEGORIES_FETCH = false;

    let { error } = data;
    if (!error) {

      yield put({ type: stateTypes.SET_LOADING, payload: false });

      try {
        AsyncStorage.setItem("CATEGORIES_GET", JSON.stringify(data));
        yield put({
          type: categoryTypes.FETCH_CATEGORIES_SUCCESS,
          payload: getDataFromJson(data)
        });
      } catch(e) {
        yield put({ type: stateTypes.SHOW_ERROR, error: e });
        yield put({ type: categoryTypes.FETCH_CATEGORIES_FAILURE });
      }

    } else {
      yield put({ type: stateTypes.SET_LOADING, payload: false });
      yield put({ type: stateTypes.SHOW_ERROR, error: error });
      yield put({ type: categoryTypes.FETCH_CATEGORIES_FAILURE });
    }
  } else {
    yield put({ type: stateTypes.SET_LOADING, payload: false });
    yield put({ type: stateTypes.SHOW_ERROR, error: "No internet connection" });
  }
}

export function* fetchMenueItems(action) {
  var data;
  const connected = yield select(checkNetwork);

  if (connected) {
    yield put({ type: stateTypes.SET_LOADING, payload: true });
    let data = yield getDataService(APIS.GET_MENU_ITEMS + action.requestByData);

    let { error } = data;
    if (!error) {
      yield put({ type: stateTypes.SET_LOADING, payload: false });
      yield put({
        type: categoryTypes.FETCH_MENU_ITEMS_SUCCESS,
        payload: {
          items: getDataFromJson(data) == undefined ? [] : getDataFromJson(data),
          icons: data.data.icons
        }
      });
    } else {
      yield put({ type: stateTypes.SET_LOADING, payload: false });
      yield put({ type: stateTypes.SHOW_ERROR, error: error });
      yield put({ type: categoryTypes.FETCH_MENU_ITEMS_FAILURE });
    }
  } else {
    yield put({ type: stateTypes.SET_LOADING, payload: false });
    yield put({ type: stateTypes.SHOW_ERROR, error: "No internet connection" });
  }
  //}
}

export function* getAllMenu(action) {
  const connected = yield select(checkNetwork);
  const LOYALTY_ID = yield select(getLoyaltyId);
  const customerInfo = yield select(getCustomerInfo);
  const INITIAL_TOKEN = yield select(getInitialToken);
  let isAuth = customerInfo && Object.keys(customerInfo).length > 0;

  console.log('Customer--->', customerInfo)

  const GET_ALL_MENU = isAuth ? `${APIS.GET_MENU_ITEMS}?${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&${KEY_CHANNEL_ID}=${CHANNEL_ID}&${KEY_LOYALTY_ID_2}=${LOYALTY_ID}`
  : `${APIS.GET_MENU_ITEMS}?${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&${KEY_CHANNEL_ID}=${CHANNEL_ID}`;

  if (connected) {
    // yield put({ type: stateTypes.SET_LOADING, payload: true });
    let data = null;
    if (FIRST_MENU_FETCH) {
      try {
        yield AsyncStorage.getItem("GET_ALL_MENU").then(results => {
          if(results) data = JSON.parse(results);
        });
      } catch (e) {
        FIRST_MENU_FETCH = false;
      }
    }

    //fetching
    if (!FIRST_MENU_FETCH || !data)
      data = isAuth ? yield call(appSaga, {
        URL: GET_ALL_MENU,
        requestType: 'get'
      }) : yield getDataService(GET_ALL_MENU, INITIAL_TOKEN);
    FIRST_MENU_FETCH = false;

    const { error } = data;
    if (!error) {
      // yield put({ type: stateTypes.SET_LOADING, payload: false });
      try {
        AsyncStorage.setItem("GET_ALL_MENU", JSON.stringify(data));
        const allMenu = getDataFromJson(data);

        const menuIcons = data && data.data && data.data.data ? data.data.data.icons : [];
        yield put({
          type: categoryTypes.GET_ALL_MENU_SUCCESS,
          payload: { allMenu, menuIcons }
        });
      } catch(e) {
        yield put({ type: categoryTypes.GET_ALL_MENU_FAILURE, payload: [] });
      }
    } else {
      // yield put({ type: stateTypes.SET_LOADING, payload: false });
      // yield put({ type: stateTypes.SHOW_ERROR, error: error });
      yield put({ type: categoryTypes.GET_ALL_MENU_FAILURE, payload: [] });
    }
  } else {
    // yield put({ type: stateTypes.SET_LOADING, payload: false });
    // yield put({ type: stateTypes.SHOW_ERROR, error: 'No internet connection' });
  }
  //}
}
