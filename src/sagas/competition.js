import {
  types as competitionTypes,
  getCompetitionId
} from '../ducks/competition'
import { put, call, select } from 'redux-saga/effects'
import { ORGANIZATION_ID } from '../config/constants/network_constants'
import {
  KEY_ORGANIZATION_ID,
  KEY_CUSTOMER_ID,
  KEY_LOYALTY_ID,
  KEY_LOYALTY_LEVEL_ID,
  KEY_TOKEN,
  KEY_ORDER_TYPE,
  KEY_COMPETITION_ID,
  KEY_STATUS,
  KEY_ACCEPTED,
  KEY_REJECTED
} from '../config/constants/network_api_keys'
import { APIS } from '../config/constants/network_constants'
import {
  types as stateTypes,
  getCustomerID,
  getLoyaltyId,
  getToken,
  getLevelId
} from '../ducks/setappstate'
import { appSaga } from './appstate'
import { pathOr } from 'ramda'

export function * getCompetitionData (action) {
  yield put({ type: stateTypes.SET_LOADING, payload: true })
  const CustomerId = yield select(getCustomerID)
  const LoyaltyId = yield select(getLoyaltyId)
  const ACCESS_TOKEN = yield select(getToken)
  const requestURL =
    `${APIS.GET_COMPETITION}?${KEY_TOKEN}=${ACCESS_TOKEN}` +
    `&${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&${KEY_CUSTOMER_ID}=${CustomerId}` +
    `&${KEY_LOYALTY_ID}=${LoyaltyId}&${KEY_ORDER_TYPE}=delivery`
  const requestData = {
    URL: requestURL,
    requestType: 'get'
  }
  const response = yield call(appSaga, requestData)
  const { error } = response
  if (!error) {
    const data = pathOr({}, ['data', 'data', '0'], response)
    yield put({
      type: competitionTypes.SET_COMPETITION,
      payload: data
    })
  }
  yield put({ type: stateTypes.SET_LOADING, payload: false })
}

export function * respondToCompetitionTerms ({ CompetitionId, Agreed }) {
  const CustomerId = yield select(getCustomerID)
  const LoyaltyId = yield select(getLoyaltyId)
  const ACCESS_TOKEN = yield select(getToken)
  const formdata = new FormData()

  formdata.append(KEY_TOKEN, ACCESS_TOKEN)
  formdata.append(KEY_ORGANIZATION_ID, ORGANIZATION_ID)
  formdata.append(KEY_CUSTOMER_ID, CustomerId)
  formdata.append(KEY_LOYALTY_ID, LoyaltyId)
  formdata.append(KEY_COMPETITION_ID, CompetitionId)
  formdata.append(KEY_STATUS, Agreed ? KEY_ACCEPTED : KEY_REJECTED)

  const requestData = {
    URL: APIS.COMPETITION_AGREEMENT,
    requestParams: formdata,
    requestType: 'post'
  }
  const response = yield call(appSaga, requestData)
  const { error } = response
  if (!error) {
    const data = pathOr([], ['data'], response)
    // refresh competition data
    if (data.success) {
      yield put({
        type: competitionTypes.GET_COMPETITION
      })
    }
  }
}

export function * getCompetitionRanking () {
  const CompetitionId = yield select(getCompetitionId)
  const CustomerId = yield select(getCustomerID)
  const LoyaltyId = yield select(getLoyaltyId)
  const ACCESS_TOKEN = yield select(getToken)
  const LEVEL_ID = yield select(getLevelId)
  const requestURL =
    `${APIS.COMPETITION_RANKING}?${KEY_TOKEN}=${ACCESS_TOKEN}` +
    `&${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&${KEY_CUSTOMER_ID}=${CustomerId}` +
    `&${KEY_LOYALTY_ID}=${LoyaltyId}&${KEY_ORDER_TYPE}=delivery` +
    `&${KEY_COMPETITION_ID}=${CompetitionId}&${KEY_LOYALTY_LEVEL_ID}=${LEVEL_ID}`
  const requestData = {
    URL: requestURL,
    requestType: 'get'
  }
  const response = yield call(appSaga, requestData)
  const { error } = response
  if (!error) {
    const data = pathOr([], ['data', 'data'], response)
    yield put({
      type: competitionTypes.SET_COMPETITION_RANKING,
      payload: data
    })
  }
}
