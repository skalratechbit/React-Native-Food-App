import { types as squardcornerTypes } from '../ducks/squardcorner';
import { types as deliverydetailsTypes } from '../ducks/deliverydetails';
import { put, call, select } from 'redux-saga/effects';
import { getDataFromJson } from '../config/common_functions';
import { ORGANIZATION_ID, CHANNEL_ID } from '../config/constants/network_constants';
import { APIS } from '../config/constants/network_constants';
import { appSaga } from './appstate';

import {
  KEY_ORGANIZATION_ID,
  KEY_CUSTOMER_ID,
  KEY_LOYALTY_ID_2,
  CAPTURE_DINE_IN,
  KEY_CHANNEL_ID
} from '../config/constants/network_api_keys';
import { types as stateTypes, getCustomerID, getToken, getLoyaltyId } from '../ducks/setappstate';
import { pathOr } from 'ramda'

export function* sendAmount(action) {
  var data;
  const requestData = {
    URL: APIS.SEND_AMOUNT,
    requestType: 'post',
    requestParams: action.amountData
  };
  data = yield call(appSaga, requestData);
  let { error } = data;
  if (!error) {
    if (data?.data?.status === 404) {
      yield put({ type: squardcornerTypes.SEND_AMOUNT_SUCCESS, payload: { message: data.data.message?.ReceiverMobile } });
      yield put({ type: stateTypes.SHOW_ERROR, error: data.data.message?.ReceiverMobile });
    } else {
      yield put({
        type: squardcornerTypes.SEND_AMOUNT_SUCCESS,
        payload: data.data
      });
    }
  } else {
    yield put({ type: squardcornerTypes.SEND_AMOUNT_FAILURE, payload: [] });
    yield put({ type: stateTypes.SHOW_ERROR, error: error });
  }
}

export function* userDetails(action) {
  const LOYALTY_ID = yield select(getLoyaltyId);
  const CUSTOMER_ID = yield select(getCustomerID);
  const GET_USER_DETAILS_URL =
    APIS.GET_CUSTOMER_DETAILS +
    '?' +
    KEY_ORGANIZATION_ID +
    '=' +
    ORGANIZATION_ID +
    '&' +
    KEY_CHANNEL_ID +
    '=' +
    CHANNEL_ID +
    '&' +
    KEY_LOYALTY_ID_2 +
    '=' +
    LOYALTY_ID;
  const requestData = {
    URL: GET_USER_DETAILS_URL + '&' + KEY_CUSTOMER_ID + '=' + CUSTOMER_ID,
    requestType: 'get'
  };
  
  let data = yield call(appSaga, requestData);
  let { error } = data;
  if (!error) {
    yield put({
      type: squardcornerTypes.USER_DETAILS_SUCCESS,
      payload: getDataFromJson(data) == undefined ? [] : getDataFromJson(data)
    });
    yield call(delay, 2000);
    yield put({ type: stateTypes.TOGGLE_LOADER, payload: false });
  } else {
    yield put({ type: squardcornerTypes.USER_DETAILS_FAILURE, payload: [] });
    yield call(delay, 2000);
    yield put({ type: stateTypes.TOGGLE_LOADER, payload: false });
  }
}

const delay = time => new Promise(resolve => setTimeout(resolve, time));

export function* getLoyaltyCorner() {
  var data;
  const LOYALTY_ID = yield select(getLoyaltyId);
  const GET_LOYALTY_DETAILS_URL =
    APIS.GET_LOYALTY_CORNER +
    '?' +
    KEY_ORGANIZATION_ID +
    '=' +
    ORGANIZATION_ID +
    '&' +
    KEY_CHANNEL_ID +
    '=' +
    CHANNEL_ID +
    '&' +
    KEY_LOYALTY_ID_2 +
    '=' +
    LOYALTY_ID;
  const requestData = {
    URL: GET_LOYALTY_DETAILS_URL,
    requestType: 'get'
  };
  data = yield call(appSaga, requestData);
  
  let { error } = data;
  if (!error) {
    yield put({
      type: squardcornerTypes.GET_LOYALTY_CORNER_SUCCESS,
      payload: getDataFromJson(data) == undefined ? [] : getDataFromJson(data)
    });
    yield put({
      type: squardcornerTypes.GET_SQUAD_DETAIL
    })
  } else {
    yield put({ type: squardcornerTypes.GET_LOYALTY_CORNER_FAILURE, payload: [] });
  }
}

export function* getSquadDetail(action) {
  var data;
  const LOYALTY_ID = yield select(getLoyaltyId);
  const requestData = {
    URL:
      APIS.GET_MONTHLY_LOYALTY_TIERS +
      '?' +
      KEY_ORGANIZATION_ID +
      '=' +
      ORGANIZATION_ID +
      '&' + 
      KEY_CHANNEL_ID +
      '=' +
      CHANNEL_ID +
      '&' +
      KEY_LOYALTY_ID_2 +
      '=' +
      LOYALTY_ID,
    requestType: 'get'
  };
  data = yield call(appSaga, requestData);
  let { error } = data;
  if (!error) {
    yield put({
      type: squardcornerTypes.GET_SQUAD_DETAIL_SUCCESS,
      payload: getDataFromJson(data) == undefined ? [] : data.data
    });
  } else {
    yield put({ type: squardcornerTypes.GET_SQUAD_DETAIL_FAILURE, payload: [] });
  }
}

export function* insertPaymentParts(action) {
  yield put({ type: stateTypes.SET_LOADING, payload: true });
  var data;
  const requestData = {
    URL: APIS.INSERT_PAYMENT_PARTS,
    requestType: 'post',
    requestParams: action.params
  };
  data = yield call(appSaga, requestData);
  let { error } = data;
  if (!error) {
    yield put({
      type: squardcornerTypes.INSER_TPAYMENT_PARTS_SUCCESS,
      payload: data.data
    });

    // Actions.drawer({type:"reset"})
  } else {
    yield put({ type: squardcornerTypes.INSER_TPAYMENT_PARTS_FAILURE, payload: [] });
    yield put({ type: stateTypes.SHOW_ERROR, error: error });
  }
  yield put({ type: stateTypes.SET_LOADING, payload: false });
}

export function* preInsertPaymentParts(action) {
  yield put({ type: stateTypes.SET_LOADING, payload: true });
  var data;
  const requestData = {
    URL: APIS.INSERT_PAYMENT_PARTS,
    requestType: 'post',
    requestParams: action.params
  };
  data = yield call(appSaga, requestData);
  let { error } = data;
  if (!error) {
    yield put({
      type: squardcornerTypes.PRE_INSERT_PAYMENT_SUCCESS,
      payload: pathOr({}, ['data'], data)
    });
    // Actions.drawer({type:"reset"})
  } else {
    yield put({ type: squardcornerTypes.INSER_TPAYMENT_PARTS_FAILURE, payload: [] });
    yield put({ type: stateTypes.SHOW_ERROR, error: error });
  }
  yield put({ type: stateTypes.SET_LOADING, payload: false });
}

export function* sendScanqrDetail(action) {
  var data;
  const requestData = {
    URL: APIS.SEND_SCANQR_DETAIL,
    requestType: 'post',
    requestParams: action.params
  };
  // console.log("request parmater",requestData.requestParams);

  data = yield call(appSaga, requestData);
  // console.log("data ========>", data);
  let { error } = data;
  if (!error) {
    yield put({
      type: squardcornerTypes.SEND_SCANQR_DETAIL_SUCCESS,
      payload: data
    });
    const Capture = CAPTURE_DINE_IN;
    //  yield put({ type: vouchersTypes.GET_VOUCHERS_CAPTURE ,Capture })
  } else {
    yield put({ type: squardcornerTypes.SEND_SCANQR_DETAIL_FAILURE, payload: [] });
    yield put({ type: stateTypes.SHOW_ERROR, error: error });
  }
}

export function* sendToFriend(action) {
  const requestData = {
    URL: APIS.SEND_TO_FRIEND,
    requestType: 'post',
    requestParams: action.params
  };
  let data = yield call(appSaga, requestData);

  let { error } = data;
  if (!error) {
    if (data?.data?.status === 404) {
      yield put({ type: squardcornerTypes.SEND_TO_FRIEND_SUCCESS, payload: { message: data.data.message?.ReceiverMobile } });
      yield put({ type: stateTypes.SHOW_ERROR, error: data.data.message?.ReceiverMobile });
    } else {
      yield put({
        type: squardcornerTypes.SEND_TO_FRIEND_SUCCESS,
        payload: data.data
      });
    }
  } else {
    yield put({ type: squardcornerTypes.SSEND_TO_FRIEND_FAILURE, payload: [] });
    yield put({ type: stateTypes.SHOW_ERROR, error: error });
  }
}

export function* insertDineInPayment(action) {
  yield put({ type: stateTypes.SET_LOADING, payload: true });
  var data;
  const requestData = {
    URL: APIS.DINE_IN_PAYMENT,
    requestType: 'post',
    requestParams: action.params
  };
  data = yield call(appSaga, requestData);
  let { error } = data;
  if (!error && data?.data?.status == true) {
    yield put({
      type: squardcornerTypes.INSERT_DINE_IN_PAYMENT_SUCCESS,
      payload: pathOr({}, ['data'], data)
    });
    // Actions.drawer({type:"reset"})
  } else {
    yield put({ type: squardcornerTypes.INSERT_DINE_IN_PAYMENT_FAILURE, payload: pathOr({}, ['data'], data) });
    yield put({ type: stateTypes.SHOW_ERROR, error: error });
  }
  yield put({ type: stateTypes.SET_LOADING, payload: false });
}

export function* preInsertDineInPayment(action) {
  yield put({ type: stateTypes.SET_LOADING, payload: true });
  var data;
  const requestData = {
    URL: APIS.DINE_IN_PAYMENT,
    requestType: 'post',
    requestParams: action.params
  };
  data = yield call(appSaga, requestData);
  let { error } = data;
  if (!error && data?.data?.data?.URL != undefined) {
    yield put({
      type: squardcornerTypes.PRE_INSERT_DINE_IN_PAYMENT_SUCCESS,
      payload: pathOr({}, ['data'], data)
    });
    // Actions.drawer({type:"reset"})
  } else {
    yield put({ type: squardcornerTypes.INSERT_DINE_IN_PAYMENT_FAILURE, payload: [] });
    yield put({ type: stateTypes.SHOW_ERROR, error: error });
  }
  yield put({ type: stateTypes.SET_LOADING, payload: false });
}

export function * getDineScan (action) {
  var data
  const requestData = {
    URL:APIS.GET_DINE_IN_SCAN,
    requestType: 'post',
    requestParams: action.params
  }
  data = yield call(appSaga, requestData)
  let { error } = data
  if (!error && error !== undefined || data?.data?.status === true) {
    yield put({
      type: squardcornerTypes.GET_DINE_IN_SCAN_SUCCESS,
      payload: data
    })
    yield put({
      type: deliverydetailsTypes.SET_CHECKOUT_TOKENS,
      payload: data?.data?.data?.GatewayToken
    })
    yield put({
      type: deliverydetailsTypes.SET_PAYMENT_METHODS,
      payload: data?.data?.data?.PaymentMethods
    })
  } else {
    yield put({
      type: squardcornerTypes.GET_DINE_IN_SCAN_FAILURE,
      payload: data
    })
  }
}

export function * updateScannerDetail () {
    yield put({
      type: squardcornerTypes.UPDATE_SCANNER_DETAIL_SUCCESS,
      payload: {}
    })
}