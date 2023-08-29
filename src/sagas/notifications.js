import { types as notificationsTypes } from "../ducks/notifications";
import { put, call, select } from "redux-saga/effects";
import { getDataFromJson } from "../config/common_functions";
import { ORGANIZATION_ID, CHANNEL_ID } from "../config/constants/network_constants";
import { APIS } from "../config/constants/network_constants";
import { appSaga } from "./appstate";
import {
  KEY_ORGANIZATION_ID,
  KEY_LOYALTY_ID_2,
  KEY_CHANNEL_ID
} from "../config/constants/network_api_keys";
import { types as stateTypes, getCustomerID, getLoyaltyId, getToken } from "../ducks/setappstate";
import { Actions } from "react-native-router-flux";
const defaultNotifactions = { rows: [], TotalUnread: 0, message: '' }

export function* confirmTransfer(action) {
  const requestData = {
    URL: APIS.CONFIRM_TRANSFER,
    requestType: "post",
    requestParams: action.params
  };
  console.log('request data', requestData);
  const data = yield call(appSaga, requestData);
  let { error } = data;
  if (!error) {
    // const notificationsData = getDataFromJson(data);
    // yield put({
    //   type: notificationsTypes.TRANSFER_CONFIRMATION_SUCCESS,
    //   payload: !notificationsData ? defaultNotifactions : { ...notificationsData, message: "success" }
    // });
    Actions.home();
  } else {
    yield put({ type: notificationsTypes.TRANSFER_CONFIRMATION_FAILURE });
    yield put({ type: stateTypes.SHOW_ERROR, error: error });
  }
}

export function* confirmSendToFriendResponse(action) {
  const requestData = {
    URL: APIS.SEND_TO_FRIEND_RESPONSE,
    requestType: "post",
    requestParams: action.params
  };
  const data = yield call(appSaga, requestData);
  let { error } = data;
  if (!error) {
    const notificationsData = getDataFromJson(data);
    yield put({
      type: notificationsTypes.SEND_TO_FRIEND_RESPONSE_SUCCESS,
      payload: !notificationsData ? defaultNotifactions : { ...notificationsData, message: "success" }
    });
  } else {
    yield put({ type: notificationsTypes.SEND_TO_FRIEND_RESPONSE_FAILURE, payload: [] });
    yield put({ type: stateTypes.SHOW_ERROR, error: error });
  }
}

export function* updateNotificationStatus(action) {
  const LOYALTY_ID = yield select(getLoyaltyId)
  action.params.append(KEY_ORGANIZATION_ID, ORGANIZATION_ID);
  action.params.append(KEY_CHANNEL_ID, CHANNEL_ID);
  action.params.append(KEY_LOYALTY_ID_2, LOYALTY_ID)
  const requestData = {
    URL: APIS.UPDATE_NOTIFICATION_STATUS,
    requestType: "post",
    requestParams: action.params
  };
  const data = yield call(appSaga, requestData);
  let { error } = data;
  if (!error) {
    const notificationsData = getDataFromJson(data);
    yield put({
      type: notificationsTypes.UPDATE_NOTIFICATION_STATUS_SUCCESS,
      payload: !notificationsData ? defaultNotifactions : { ...notificationsData, message: "updated" }
    });
  } else {
    yield put({ type: notificationsTypes.UPDATE_NOTIFICATION_STATUS_FAILURE, payload: [] });
    yield put({ type: stateTypes.SHOW_ERROR, error: error });
  }
}

export function* getAllNotifications(action) {
  const ACCESS_TOKEN = yield select(getToken);
  const CUSTOMER_ID = yield select(getCustomerID);
  const LOYALTY_ID = yield select(getLoyaltyId);
  const requestData = {
    URL: `${
      APIS.GET_ALL_NOTIFICATIONS
    }?${KEY_CHANNEL_ID}=${CHANNEL_ID}&${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&${KEY_LOYALTY_ID_2}=${LOYALTY_ID}`,
    requestType: "get"
  };
  const data = yield call(appSaga, requestData);

  let { error } = data || { error: true };
  if (!error) {
    const notificationsData = getDataFromJson(data);
    yield put({
      type: notificationsTypes.GET_ALL_NOTIFICATIONS_SUCCESS,
      payload: !notificationsData ? defaultNotifactions : { ...notificationsData }
    });
  } else {
    yield put({ type: notificationsTypes.GET_ALL_NOTIFICATIONS_FAILURE, payload: defaultNotifactions });
  }
}
