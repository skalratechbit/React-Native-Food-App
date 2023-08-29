import { types as branchesTypes } from '../ducks/branches'
import { put, call, select } from 'redux-saga/effects'
import { getDataFromJson } from '../config/common_functions'
import {
  ORGANIZATION_ID,
  CHANNEL_ID,
} from '../config/constants/network_constants'
import { APIS } from '../config/constants/network_constants'
import { appSaga } from './appstate'
import {
  KEY_ORGANIZATION_ID,
  KEY_WHEEL_ID,
  KEY_STORE_ID,
  KEY_CHANNEL_ID,
  KEY_LOYALTY_ID_2,
  KEY_LAT,
  KEY_LONG
} from '../config/constants/network_api_keys'
import {
  types as stateTypes,
  getCustomerID,
  getLoyaltyId,
  getLevelId,
  getToken
} from '../ducks/setappstate'
import { path } from 'ramda'

export function* getBranches (action) {
  var data
  const ACCESS_TOKEN = yield select(getToken)
  const CUSTOMER_ID = yield select(getCustomerID)
  const LOYALTY_ID = yield select(getLoyaltyId)
  const requestData = {
    URL:
      APIS.GET_BRANCHES +
      '?' +
      KEY_ORGANIZATION_ID +
      '=' +
      ORGANIZATION_ID +
      '&' +
      KEY_CHANNEL_ID +
      '=' +
      CHANNEL_ID +
      `&${KEY_LOYALTY_ID_2}=${LOYALTY_ID}`,
    requestType: 'get'
  }
  data = yield call(appSaga, requestData)
  let { error } = data
  if (!error) {
    yield put({
      type: branchesTypes.GET_BRANCHES_SUCCESS,
      payload: getDataFromJson(data) == undefined ? [] : getDataFromJson(data)
    })
    yield put({ type: stateTypes.SET_LOADING, payload: false })
  } else {
    yield put({ type: stateTypes.SET_LOADING, payload: false })
    yield put({ type: branchesTypes.GET_BRANCHES_FAILURE, payload: [] })
  }
}

export function* getBranchesForBeacon (action) {
  var data
  const ACCESS_TOKEN = yield select(getToken)
  const CUSTOMER_ID = yield select(getCustomerID)
  const LOYALTY_ID = yield select(getLoyaltyId)
  const requestData = {
    URL:
      APIS.GET_BRANCHES +
      '?' +
      KEY_ORGANIZATION_ID +
      '=' +
      ORGANIZATION_ID +
      '&' +
      KEY_CHANNEL_ID +
      '=' +
      CHANNEL_ID +
      `&${KEY_LOYALTY_ID_2}=${LOYALTY_ID}`,
    requestType: 'get'
  }
  data = yield call(appSaga, requestData)
  // keep loading until beacon detection is done.
  yield put({ type: stateTypes.SET_LOADING, payload: true })
  let { error } = data
  if (!error) {
    yield put({
      type: branchesTypes.GET_BRANCHES_FOR_BEACON_SUCCESS,
      payload: getDataFromJson(data) == undefined ? [] : getDataFromJson(data)
    })
  } else {
    yield put({
      type: branchesTypes.GET_BRANCHES_FOR_BEACON_FAILURE,
      payload: []
    })
  }
}

export function* getWheelGame ({ wheelData: { StoreNumber, WheelID } }) {
  yield put({ type: stateTypes.SET_LOADING, payload: true })
  yield put({ type: branchesTypes.RESET_WHEEL_GAME })

  const LOYALTY_ID = yield select(getLoyaltyId)
  const formData = new FormData()

  formData.append(KEY_ORGANIZATION_ID, ORGANIZATION_ID)
  formData.append(KEY_CHANNEL_ID, CHANNEL_ID)
  formData.append(KEY_LOYALTY_ID_2, LOYALTY_ID)
  formData.append(KEY_WHEEL_ID, WheelID)
  formData.append(KEY_STORE_ID, StoreNumber)

  const requestData = {
    URL: APIS.WHEEL_GAME,
    requestType: 'POST',
    requestParams: formData
  }

  const data = yield call(appSaga, requestData)
  let { error } = data
  const status = error || data?.data?.data == undefined ? 201 : path(['data', 'status'], data)
  const playData = error || data?.data?.data == undefined ? {} : path(['data', 'data'], data)
  const message = error || data?.data?.data == undefined ? "" : path(['data', 'message'], data)
   yield put({
    type: branchesTypes.SET_WHEEL_GAME,
    payload: { playData, status, message }
   })
  yield put({ type: stateTypes.SET_LOADING, payload: false })
}

export function* getWheelOptions ({ position: { latitude, longitude } }) {
  yield put({ type: stateTypes.SET_LOADING, payload: true })
  yield put({ type: branchesTypes.RESET_WHEEL_GAME })
  const ACCESS_TOKEN = yield select(getToken)
  const CUSTOMER_ID = yield select(getCustomerID)
  const LOYALTY_ID = yield select(getLoyaltyId)
  const LEVEL_ID = yield select(getLevelId)
  const URL =
    `${APIS.WHEEL_OPTIONS}?${KEY_CHANNEL_ID}=${CHANNEL_ID}&` +
    `${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&${KEY_LOYALTY_ID_2}=${LOYALTY_ID}&${KEY_LAT}=${latitude}&${KEY_LONG}=${longitude}`
  const requestType = 'get'
  const requestData = { URL, requestType }
  const data = yield call(appSaga, requestData)
  let { error } = data
  const optionsData = error ? [] : path(['data', 'data'], data)
  const zone = error ? null : path(['data', 'zone'], data)
  const message = error ? [] : path(['data', 'message'], data)
  yield put({
    type: branchesTypes.SET_WHEEL_OPTIONS,
    payload: { optionsData, zone, message }
  })
  yield put({ type: stateTypes.SET_LOADING, payload: false })
}
