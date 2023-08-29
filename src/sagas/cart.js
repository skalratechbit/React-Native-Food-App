import { types as cartTypes } from '../ducks/cart';
import { put, call, select } from 'redux-saga/effects';
import AsyncStorage from '@react-native-community/async-storage';
import { getDataFromJson } from '../config/common_functions';
import { path } from 'ramda';
import { ORGANIZATION_ID, CHANNEL_ID } from '../config/constants/network_constants';
import { APIS } from '../config/constants/network_constants';
import { appSaga } from './appstate';
import {
  KEY_ORGANIZATION_ID,
  KEY_CHANNEL_ID,
  KEY_TOKEN,
  KEY_CUSTOMER_ID,
  KEY_LOYALTY_ID,
  KEY_LOYALTY_ID_2,
  KEY_LEVEL_ID,
  KEY_FAVORITES,
  KEY_FAVORITE_ITEM_ID
} from '../config/constants/network_api_keys';
import {
  types as stateTypes,
  getCustomerID,
  getToken,
  getLoyaltyId,
  getLevelId
} from '../ducks/setappstate';
import { validatePromoCode } from '../helpers/CartHelper';

export function* addItemToCart(action) {
  var data;
  const connected = yield select(checkNetwork);
  const requestData = {
    URL: URL,
    requestType: 'get'
  };

  if (connected) {
    //yield put ({ type : stateTypes.SET_LOADING , payload:true })
    //  data = yield getDataService(URL)
    data = yield call(appSaga, requestData);

    let { error } = data;
    if (!error) {
    } else {
      //yield put ({ type : stateTypes.SET_LOADING , payload:false })
      ///  yield put({ type : stateTypes.SHOW_ERROR , error:error })
      yield put({ type: categoryTypes.FETCH_CATEGORIES_FAILURE });
    }
  } else {
    //yield put ({ type : stateTypes.SET_LOADING , payload:false })
    //yield put({ type : stateTypes.SHOW_ERROR , error:"No internet connection" })
  }
}

export function* getFreeStarter(action) {
  var data;
  let ID = yield select(getCustomerID);
  const ACCESS_TOKEN = yield select(getToken);
  const requestData = {
    URL:
      APIS.GET_FREE_STARTER +
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
  let { error } = data;
  if (!error) {
    yield put({
      type: cartTypes.GET_FREE_STARTER_SUCCESS,
      payload: getDataFromJson(data) == undefined ? [] : getDataFromJson(data)
    });
  } else {
    yield put({ type: cartTypes.GET_FREE_STARTER_FAILURE, payload: [] });
  }
}

export function* getFavorites(action) {
  yield put({ type: stateTypes.SET_LOADING, payload: true });
  const ACCESS_TOKEN = yield select(getToken);
  const ID = yield select(getCustomerID);
  const LOYALTY_ID = yield select(getLoyaltyId);

  const requestData = {
    requestType: 'get',
    URL:
      `${APIS.GET_FAVORITES}?${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&` +
      `${KEY_LOYALTY_ID_2}=${LOYALTY_ID}&` +
      `${KEY_CHANNEL_ID}=${CHANNEL_ID}`
  };
  const data = yield call(appSaga, requestData);
  let { error } = data;
  let favorites = [];
  if (!error) {
    try {
      favorites = path(['data', 'data'], data);
      yield put({ type: cartTypes.SET_FAVORITES, payload: favorites.rows });
      // yield AsyncStorage.setItem(KEY_FAVORITES, JSON.stringify(favorites.rows));
    } catch (e) {
      console.log('error Parsing favorites', favorites, data);
    }
  } else if (error === 404) {
    // yield put({ type: stateTypes.SHOW_ERROR, error: 'No favorites data found' });
    yield put({ type: stateTypes.SET_LOADING, payload: false });
  }
  console.log('putting favorites', favorites);
  yield put({ type: cartTypes.SET_FAVORITES, payload: favorites.rows });
  yield put({ type: stateTypes.SET_LOADING, payload: false });
}

export function* deleteFavorite(action) {
  yield put({ type: stateTypes.SET_LOADING, payload: true });
  const ACCESS_TOKEN = yield select(getToken);
  const ID = yield select(getCustomerID);
  const LOYALTY_ID = yield select(getLoyaltyId);
  const ITEM_ID = action.payload;
  const formData = new FormData();

  // create form data
  formData.append(KEY_ORGANIZATION_ID, ORGANIZATION_ID);
  formData.append(KEY_CHANNEL_ID, CHANNEL_ID);
  formData.append(KEY_LOYALTY_ID_2, LOYALTY_ID);
  formData.append(KEY_FAVORITE_ITEM_ID, ITEM_ID);

  const requestData = {
    requestType: 'POST',
    URL: `${APIS.DELETE_FAVORITE}`,
    requestParams: formData
  };
  const data = yield call(appSaga, requestData);
  const { error } = data;
  const success = (data.data.status === '200' || data.data.message === 'success');
  const deletedSuccess = !error && success;
  yield put({ type: cartTypes.RESET_FAVORITE_STATES });
  yield put({
    type: cartTypes.DELETED_FAVORITE,
    payload: deletedSuccess ? ITEM_ID : false
  });
  yield put({ type: stateTypes.SET_LOADING, payload: false });
}

export function* saveFavorite(action) {
  yield put({ type: stateTypes.SET_LOADING, payload: true });
  const ACCESS_TOKEN = yield select(getToken);
  const ID = yield select(getCustomerID);
  const LOYALTY_ID = yield select(getLoyaltyId);
  const { item_id, item_data } = action.payload;
  const formData = new FormData();

  // create form data
  formData.append(KEY_ORGANIZATION_ID, ORGANIZATION_ID);
  formData.append(KEY_CHANNEL_ID, CHANNEL_ID);
  formData.append(KEY_LOYALTY_ID_2, LOYALTY_ID);
  formData.append('ItemId', item_id);
  formData.append('ItemData', item_data);

  const requestData = {
    requestType: 'POST',
    URL: `${APIS.SAVE_FAVORITE}`,
    requestParams: formData
  };
  const data = yield call(appSaga, requestData);
  const { error } = data;
  const success = (data?.data?.status === '200' || data?.data?.message === 'success');
  const savedSuccess = !error && success;
  let savedItem = JSON.parse(item_data);
  savedItem.FavoriteId = data?.data?.data?.id;
  // const savedItem = {
  //   ...FavoriteId: data?.data?.data?.id,
  //   ...item_data,
  // };
  yield put({ type: cartTypes.RESET_FAVORITE_STATES });
  yield put({
    type: cartTypes.SAVED_FAVORITE,
    payload: savedSuccess ? savedItem : false
  });
  yield put({ type: stateTypes.SET_LOADING, payload: false });
}

export function* validatePromo(action) {
  const promoCode = action.payload;
  yield put({ type: stateTypes.SET_LOADING, payload: true });
  yield put({ type: cartTypes.SET_PROMO_CODE, payload: promoCode });
  const ACCESS_TOKEN = yield select(getToken);
  const CUSTOMER_ID = yield select(getCustomerID);
  const LOYALTY_ID = yield select(getLoyaltyId);
  const LEVEL_ID = yield select(getLevelId);
  action.payload.append(KEY_ORGANIZATION_ID, ORGANIZATION_ID);
  action.payload.append(KEY_CHANNEL_ID, CHANNEL_ID);
  action.payload.append(KEY_LOYALTY_ID_2, LOYALTY_ID);
  const requestData = {
    requestType: 'post',
    URL: `${APIS.CHECK_PROMO}`,
    dataType: 'formdata',
    requestParams: action.payload,
  };
  const data = yield call(appSaga, requestData);
  const { error } = data;

  const success = path(['data', 'message'], data) === 'success';
  const gotResults = !error && success;

  if(gotResults) {
    const Promos = path(['data', 'data'], data);
    const validation = validatePromoCode(action.payload._parts[0][1], Promos);
    const { valid, reason, promo ,Items } = validation || {};
    if(validation && valid)
      yield put({ type: cartTypes.PROMO_VALIDATED, payload: {...promo,Items:Items,PromoCode:action.payload._parts[0][1]} });
    else
      yield put({ type: cartTypes.PROMO_INVALID, payload: reason });
  }else {
    yield put({ type: cartTypes.PROMO_INVALID, payload: '' });
  }

  yield put({ type: stateTypes.SET_LOADING, payload: false });
}

export function* getCartPromos(action) {
  yield put({ type: stateTypes.SET_LOADING, payload: true });
  const ACCESS_TOKEN = yield select(getToken);
  const CUSTOMER_ID = yield select(getCustomerID);
  const LOYALTY_ID = yield select(getLoyaltyId);
  const LEVEL_ID = yield select(getLevelId);
  const requestData = {
    requestType: 'get',
    URL: `${APIS.GET_PROMO}?${KEY_TOKEN}=${ACCESS_TOKEN}` +
         `&${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}` +
         `&${KEY_LOYALTY_ID_2}=${LOYALTY_ID}&${KEY_LEVEL_ID}=${LEVEL_ID}` +
         `&${KEY_CUSTOMER_ID}=${CUSTOMER_ID}`
  };
  const data = yield call(appSaga, requestData);
  const { error } = data;
  const success = path(['data', 'message'], data) === 'success';
  const gotResults = !error && success;
  const cartPromos = gotResults ? path(['data', 'data'], data) : [];
  yield put({ type: cartTypes.SET_CART_PROMOS, payload: cartPromos || [] });
  yield put({ type: stateTypes.SET_LOADING, payload: false });
}
