import { types as vouchersTypes } from '../ducks/vouchers'
import { types as cartTypes } from '../ducks/cart'
import { put, call, select } from 'redux-saga/effects'
import { getDataFromJson } from '../config/common_functions'
import { CHANNEL_ID, ORGANIZATION_ID } from '../config/constants/network_constants'
import { APIS } from '../config/constants/network_constants'
import { appSaga } from './appstate'
import {
  KEY_ORGANIZATION_ID,
  KEY_TOKEN,
  KEY_CUSTOMER_ID,
  KEY_CODE,
  KEY_CAPTURE,
  KEY_CHANNEL_ID,
  KEY_LOYALTY_ID_2
} from '../config/constants/network_api_keys'
import {
  types as stateTypes,
  getLoyaltyCardCode,
  gethasFreeStarter,
  getToken,
  getCustomerID,
  getLoyaltyId,
} from '../ducks/setappstate'

export function * getVouchers (action) {
  var data
  const LOYALTY_ID = yield select(getLoyaltyId)
  const requestData = {
    URL: `${
      APIS.GET_VOUCHERS
    }?${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&${KEY_CHANNEL_ID}=${CHANNEL_ID}&${KEY_LOYALTY_ID_2}=${LOYALTY_ID}`,
    requestType: 'get'
  }
  data = yield call(appSaga, requestData)
  let { error } = data
  if (!error) {
    yield put({
      type: vouchersTypes.GET_VOUCHERS_SUCCESS,
      payload: getDataFromJson(data) == undefined ? [] : getDataFromJson(data)
    })

  } else {
    yield put({ type: vouchersTypes.GET_VOUCHERS_FAILURE, payload: [] })
  }
}

export function * getVouchersWithCapture (action) {
  var data
  let code = yield select(getLoyaltyCardCode)
  const ACCESS_TOKEN = yield select(getToken)
  const CUSTOMER_ID = yield select(getCustomerID)
  const requestData = {
    URL: `${
      APIS.GET_VOUCHERS
    }?${KEY_TOKEN}=${ACCESS_TOKEN}&${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&${KEY_CUSTOMER_ID}=${CUSTOMER_ID}&${KEY_CODE}=${code}&${KEY_CAPTURE}=${
      action.Capture
    }`,
    requestType: 'get'
  }
  data = yield call(appSaga, requestData)
  let { error } = data || {}

  if (!error) {
    yield put({
      type: vouchersTypes.GET_VOUCHERS_SUCCESS_CAPTURE_DELIVERY,
      payload: getDataFromJson(data) == undefined ? [] : getDataFromJson(data)
    })
    let hasFreeStarter = yield select(gethasFreeStarter)
    if (hasFreeStarter == 1) {
      yield put({ type: cartTypes.GET_FREE_STARTER })
    }
  } else {
    yield put({
      type: vouchersTypes.GET_VOUCHERS_FAILURE_CAPTURE_DELIVERY,
      payload: []
    })
  }
}

export function * getDineVouchers (action) {
  var data
  const LOYALTY_ID = yield select(getLoyaltyId)
  const requestData = {
    URL: `${
      APIS.GET_VOUCHERS
    }?${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&${KEY_CHANNEL_ID}=${CHANNEL_ID}&${KEY_LOYALTY_ID_2}=${LOYALTY_ID}`,
    requestType: 'get'
  }
  data = yield call(appSaga, requestData)
  let { error } = data
  if (!error) {
    yield put({
      type: vouchersTypes.GET_VOUCHERS_CAPTURE_DINE_IN_SUCCESS,
      payload: getDataFromJson(data) == undefined ? [] : getDataFromJson(data)
    })
  } else {
    yield put({
      type: vouchersTypes.GET_VOUCHERS_CAPTURE_DINE_IN_FAILURE,
      payload: []
    })
  }
}
