import { types as deliverydetailsTypes } from '../ducks/deliverydetails';
import { put, call, select } from 'redux-saga/effects';
import { getDataFromJson } from '../config/common_functions';
import { types as stateTypes, getCustomerID, getLoyaltyId, getToken } from '../ducks/setappstate';
import AsyncStorage from '@react-native-community/async-storage';
import { ORGANIZATION_ID, CHANNEL_ID } from '../config/constants/network_constants';
import {
  KEY_TOKEN,
  KEY_ORGANIZATION_ID,
  KEY_CUSTOMER_ID,
  KEY_CUSTOMERID,
  KEY_RECOMMENDED_SHOWING,
  KEY_LOYALTY_ID,
  KEY_LOYALTYID,
  KEY_CHANNEL_ID,
  KEY_LOYALTY_ID_2
} from '../config/constants/network_api_keys';

import { APIS } from '../config/constants/network_constants';
import { appSaga } from './appstate';
import { Actions } from 'react-native-router-flux';
import { types as cartTypes } from '../ducks/cart';
import { pathOr } from 'ramda';

export function* addDeliveryAddress(action) {
  let data;
  const LOYALTY_ID = yield select(getLoyaltyId);
  action.addressData.append(KEY_ORGANIZATION_ID, ORGANIZATION_ID);
  action.addressData.append(KEY_CHANNEL_ID, CHANNEL_ID);
  action.addressData.append(KEY_LOYALTY_ID_2, LOYALTY_ID);

  const requestData = {
    URL: APIS.ADD_DELEIVERY_ADDRESS,
    requestType: 'post',
    requestParams: action.addressData
  };
  data = yield call(appSaga, requestData);
  const { error } = data;
  if (!error) {
    yield put({
      type: deliverydetailsTypes.ADD_DELEIVERY_ADDRESS_SUCCESS,
      payload: data.data.data
    });
    yield put({
      type: deliverydetailsTypes.SET_DISABLED_ITEMS,
      payload: data.data.DisabledItems ? data.data.DisabledItems : []
    });
  } else {
    yield put({ type: deliverydetailsTypes.ADD_DELEIVERY_ADDRESS_FAILURE, payload: [] });
  }
}

export function* editDeliveryAddress(action) {
  let data;
  const LOYALTY_ID = yield select(getLoyaltyId);
  action.params.append(KEY_ORGANIZATION_ID, ORGANIZATION_ID);
  action.params.append(KEY_CHANNEL_ID, CHANNEL_ID);
  action.params.append(KEY_LOYALTY_ID_2, LOYALTY_ID);
  const requestData = {
    URL: APIS.EDIT_DELIVERY_ADDRESS,
    requestType: 'post',
    requestParams: action.params
  };
  data = yield call(appSaga, requestData);
  const { error } = data;
  if (!error && data.data.status==200) {
    yield put({
      type: deliverydetailsTypes.EDIT_DELIVERY_ADDRESS_SUCCESS,
      payload: data.data.data ? data.data.data : []
    });
    yield put({
      type: deliverydetailsTypes.SET_DISABLED_ITEMS,
      payload: data.data.DisabledItems ? data.data.DisabledItems : []
    });

  } else {
    yield put({ type: deliverydetailsTypes.EDIT_DELIVERY_ADDRESS_FAILURE, payload: data.data.message});
  }
}
// export function* removeErrorMessage(){
//   yield put({ type: deliverydetailsTypes.EDIT_DELIVERY_ADDRESS_FAILURE, payload: {}});
// }
const cacheInsertOrderData = data => {
  const obj = {};
  data._parts.map((array) => obj[array[0]] = array[1]);
  AsyncStorage.setItem('cachedOrder', JSON.stringify(obj));
};

const cleartCachedOrder = () => AsyncStorage.removeItem('cachedOrder');
let orderTries = 0;

export function* putOrder(action) {
  const LOYALTY_ID = yield select(getLoyaltyId);
  action.orderData.append(KEY_ORGANIZATION_ID, ORGANIZATION_ID);
  action.orderData.append(KEY_CHANNEL_ID, CHANNEL_ID);
  action.orderData.append(KEY_LOYALTY_ID_2, LOYALTY_ID);
  //cache form data
  console.log('action.orderData', action.orderData);
  cacheInsertOrderData(action.orderData);
  const requestData = {
    URL: APIS.PUT_ORDER,
    requestType: 'post',
    requestParams: action.orderData,
    dataType: 'formdata'
  };
  yield put({ type: deliverydetailsTypes.PUT_ORDER_SUCCESS, payload: '' });
  const data = yield call(appSaga, requestData);

  if(data !== undefined) {
    let message = data && data.data && data.data.message || '';
    let error = data && data.error || false;
    let status = data && data.data && data.data.status || '';

    const orderInserted = message === 'success';
    const status200 = status === true;
    const hasSuccess = !error && orderInserted && status200;
    console.log('hasSuccess', hasSuccess);
    console.log('status200', status200);
    console.log('orderInserted', orderInserted);
    // reset order retries
    if (!action.retry) orderTries = 0;
    if (hasSuccess) {
      // clear cached order
      cleartCachedOrder();
      yield put({
        type: deliverydetailsTypes.PUT_ORDER_SUCCESS,
        payload: getDataFromJson(data) == undefined ? [] : getDataFromJson(data)
      });

      yield put({ type: 'add_item_to_cart', payload: [] });
      Actions.drawer({ type: 'reset' });

      //clear delivery details selected address memory
      AsyncStorage.removeItem('selectedAddressIndex');
      AsyncStorage.removeItem(KEY_RECOMMENDED_SHOWING);
      yield put({ type: cartTypes.SET_PROMO_CODE, payload: '' });
      Actions.myorders();
    } else {
      if(orderTries < 3) {
        action.retry = orderTries += 1;
        console.log('retrying order', action.retry);
        yield putOrder(action);
      } else {
        yield put({ type: stateTypes.SET_LOADING, payload: false });
        yield put({ type: deliverydetailsTypes.PUT_ORDER_FAILURE, payload: '' });
        // clear cached order
        // cleartCachedOrder();
      }
    }
  }
}

export function* preOrder(action) {
  const LOYALTY_ID = yield select(getLoyaltyId);
  action.orderData.append(KEY_ORGANIZATION_ID, ORGANIZATION_ID);
  action.orderData.append(KEY_CHANNEL_ID, CHANNEL_ID);
  action.orderData.append(KEY_LOYALTY_ID_2, LOYALTY_ID);
  //cache form data
  console.log('action.orderData', action.orderData);
  cacheInsertOrderData(action.orderData);
  const requestData = {
    URL: APIS.PUT_ORDER,
    requestType: 'post',
    requestParams: action.orderData,
    dataType: 'formdata'
  };
  yield put({ type: deliverydetailsTypes.PUT_ORDER_SUCCESS, payload: '' });
  const data = yield call(appSaga, requestData);
  const { error, data: { message, status } } = data || { data: {} };
  const orderInserted = message === 'success';
  const status200 = status === true;
  const hasSuccess = !error && orderInserted && status200;
  console.log('pre hasSuccess', hasSuccess);
  console.log('per status200', status200);
  console.log('pre orderInserted', orderInserted);
  // reset order retries
  if (!action.retry) orderTries = 0;
  if (hasSuccess) {
    // clear cached order
    cleartCachedOrder();
    yield put({
      type: deliverydetailsTypes.PRE_ORDER_SUCCESS,
      payload: getDataFromJson(data) == undefined ? [] : getDataFromJson(data)
    });

    yield put({ type: 'add_item_to_cart', payload: [] });
    // Actions.drawer({ type: 'reset' });

    //clear delivery details selected address memory
    AsyncStorage.removeItem('selectedAddressIndex');
    AsyncStorage.removeItem(KEY_RECOMMENDED_SHOWING);
    yield put({ type: cartTypes.SET_PROMO_CODE, payload: '' });
    //Actions.myorders();
  } else {
    if(orderTries < 3) {
      action.retry = orderTries += 1;
      console.log('retrying order', action.retry);
      yield preOrder(action);
    } else {
      yield put({ type: stateTypes.SET_LOADING, payload: false });
      yield put({ type: deliverydetailsTypes.PUT_ORDER_FAILURE, payload: '' });
      // clear cached order
      // cleartCachedOrder();
    }
  }
}

export function* getAddressTypes() {
  let data;
  const ID = yield select(getCustomerID);
  const ACCESS_TOKEN = yield select(getToken);
  const LOYALTY_ID = yield select(getLoyaltyId);
  const URL = `${
    APIS.GET_CHECKOUT_DETAILS
  }?${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&${KEY_CHANNEL_ID}=${CHANNEL_ID}&${KEY_LOYALTY_ID_2}=${LOYALTY_ID}`;

  const requestData = {
    URL,
    requestType: 'get'
  };
  data = yield call(appSaga, requestData);

  const { error } = data;
  if (!error) {
    let addressType = [];
    const _data = data.data.data;

    let paymentMethods = _data.PaymentMethods;
    // const index1 = paymentMethods.findIndex(a => a.POSCode === "260");
    // index1 > -1 && paymentMethods.splice(index1, 1);
    // const index2 = paymentMethods.findIndex(a => a.POSCode === "259");
    // index2 > -1 && paymentMethods.splice(index2, 1);

    // yield put({ type: deliverydetailsTypes.GET_PROVINCES_CITIES });
    yield put({
      type: deliverydetailsTypes.GET_ADDRESS_TYPES_SUCCESS,
      payload: {
        addressType: _data.AddressTypes,
        addresses: _data.Addresses,
        disabledItems: _data.DisabledItems,
        minimumAmount:_data.MinimumCheckAmount
      }
    });

    yield put({
      type: deliverydetailsTypes.GET_PROVINCES_CITIES_SUCCESS,
      payload: _data.Geo
    });

    yield put({
      type: deliverydetailsTypes.GET_SPECIAL_INSTRUCTIONS_SUCCESS,
      payload: _data.SpecialInstructions
    });

    yield put({
      type: deliverydetailsTypes.SET_PAYMENT_METHODS,
      payload: paymentMethods
    });

    yield put({
      type: deliverydetailsTypes.SET_WALLET_DATA,
      payload: _data.Wallet
    });

    yield put({
      type: deliverydetailsTypes.SET_MINIMUM_ONLINE_PAYMENT,
      payload: _data.MinimumOnlinePayment
    });

    yield put({
      type: deliverydetailsTypes.SET_CHECKOUT_TOKENS,
      payload: _data.GatewayToken
    });

    yield put({
      type: deliverydetailsTypes.GET_ADDRESS_ERROR_MESSAGES,
      payload: data
    });
  } else {
    yield put({ type: deliverydetailsTypes.GET_ADDRESS_TYPES_FAILURE, payload: {} });
  }
}

export function* getProvincesCities(action) {
  let data;
  const ACCESS_TOKEN = yield select(getToken);
  const CUSTOMER_ID = yield select(getCustomerID);
  const URL = `${
    APIS.GET_PROVINCES_CITIES
  }?${KEY_TOKEN}=${ACCESS_TOKEN}&${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&${KEY_CUSTOMER_ID}=${CUSTOMER_ID}`;

  const requestData = {
    URL,
    requestType: 'get'
  };
  data = yield call(appSaga, requestData);
  const { error } = data;
  if (!error) {
    yield put({
      type: deliverydetailsTypes.GET_PROVINCES_CITIES_SUCCESS,
      payload: getDataFromJson(data) == undefined ? [] : getDataFromJson(data)
    });
  } else {
    yield put({ type: deliverydetailsTypes.GET_PROVINCES_CITIES_FAILURE, payload: [] });
  }
}

export function* getTrackOrders(action) {
  let data;
  const ACCESS_TOKEN = yield select(getToken);
  const CUSTOMER_ID = yield select(getCustomerID);
  const URL = `${
    APIS.GET_TRACK_ORDERS
  }?${KEY_TOKEN}=${ACCESS_TOKEN}&${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&${KEY_CUSTOMER_ID}=${CUSTOMER_ID}&${KEY_CUSTOMERID}=${
    action.customerId
  }`;

  const requestData = {
    URL,
    requestType: 'get'
  };
  data = yield call(appSaga, requestData);
  const { error } = data;
  if (!error) {
    yield put({
      type: deliverydetailsTypes.GET_TRACK_ORDERS_SUCCESS,
      payload: getDataFromJson(data) == undefined ? [] : getDataFromJson(data)
    });
  } else {
    yield put({ type: deliverydetailsTypes.GET_TRACK_ORDERS_FAILURE, payload: [] });
  }
}

export function* getPaymentMethods(action) {
  const ACCESS_TOKEN = yield select(getToken);
  const CUSTOMER_ID = yield select(getCustomerID);
  const URL = `${
    APIS.GET_PAYMENT_METHODS
  }?${KEY_TOKEN}=${ACCESS_TOKEN}&${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&${KEY_CUSTOMERID}=${CUSTOMER_ID}`;

  const requestData = {
    URL,
    requestType: 'get'
  };
  const data = yield call(appSaga, requestData);
  const { error } = data;
  if (!error) {
    yield put({
      type: deliverydetailsTypes.SET_PAYMENT_METHODS,
      payload: pathOr([], ['data', 'data'], data)
    });
  }
}

export function* getSpecialInstructions(actions) {
  const ACCESS_TOKEN = yield select(getToken);
  const CUSTOMER_ID = yield select(getCustomerID);
  const URL = `${
    APIS.GET_SPECIAL_INSTRUCTIONS
  }?${KEY_TOKEN}=${ACCESS_TOKEN}&${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&${KEY_CUSTOMER_ID}=${CUSTOMER_ID}`;

  const requestData = {
    URL,
    requestType: 'get'
  };
  const data = yield call(appSaga, requestData);
  const { error } = data;
  if (!error) {
    const payload = getDataFromJson(data) || [];
    const extra = pathOr('', ['data', 'extra', '0', 'Title'], data);
    yield put({
      type: deliverydetailsTypes.GET_SPECIAL_INSTRUCTIONS_SUCCESS,
      payload
    });
    yield put({
      type: deliverydetailsTypes.SET_NOTES_DESCRIPTION,
      payload: extra
    });
  }
}

export function* getDeliveryScreenData(actions) {
  const ACCESS_TOKEN = yield select(getToken);
  const CUSTOMER_ID = yield select(getCustomerID);
  const LOYALTY_ID = yield select(getLoyaltyId);
  const URL = `${
    APIS.GET_DELIVERY_SCREEN_DATA
  }?${KEY_TOKEN}=${ACCESS_TOKEN}&${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&${KEY_CUSTOMER_ID}=${CUSTOMER_ID}&${KEY_LOYALTY_ID}=${LOYALTY_ID}`;
  const requestData = {
    URL,
    requestType: 'get'
  };
  const data = yield call(appSaga, requestData);
  const { error } = data;
  if (!error) {
    const { GatewayToken } = pathOr({}, ['data', 'data'], data);
    console.log('GatewayToken', GatewayToken, 'data', data);
    yield put({
      type: deliverydetailsTypes.SET_CHECKOUT_TOKENS,
      payload: GatewayToken
    });
  }
}

export function* getPaymentTokens(actions) {
  const ACCESS_TOKEN = yield select(getToken);
  const CUSTOMER_ID = yield select(getCustomerID);
  const LOYALTY_ID = yield select(getLoyaltyId);
  const URL = `${
    APIS.GET_PAYMENT_TOKENS
  }?${KEY_TOKEN}=${ACCESS_TOKEN}&${KEY_ORGANIZATION_ID}=${ORGANIZATION_ID}&${KEY_CUSTOMER_ID}=${CUSTOMER_ID}&${KEY_LOYALTYID}=${LOYALTY_ID}`;
  const requestData = {
    URL,
    requestType: 'get'
  };
  const data = yield call(appSaga, requestData);
  const { error } = data;
  if (!error) {
    const GatewayTokens = pathOr({}, ['data', 'data'], data);
    console.log('GatewayTokens', GatewayTokens, 'data', data);
    yield put({
      type: deliverydetailsTypes.SET_CHECKOUT_TOKENS,
      payload: GatewayTokens
    });
  }
}

export function* deleteCreditCard(actions) {
  const ACCESS_TOKEN = yield select(getToken);
  const CUSTOMER_ID = yield select(getCustomerID);
  const LOYALTY_ID = yield select(getLoyaltyId);
  let formData = new FormData();
  formData.append(KEY_ORGANIZATION_ID, ORGANIZATION_ID);
  formData.append(KEY_CHANNEL_ID, CHANNEL_ID);
  formData.append(KEY_LOYALTY_ID_2, LOYALTY_ID);
  formData.append('CreditCardId', actions.CreditCardId);

  const URL = `${APIS.DELETE_CREDIT_CARD}`;
  const requestData = {
    URL,
    requestType: 'post',
    requestParams: formData
  };
  const data = yield call(appSaga, requestData);
  const { error } = data;
  if (!error) {
    const GatewayTokens = pathOr({}, ['data', 'data'], data);
    console.log('Delete tokens', GatewayTokens, 'data', data);
    yield call(getAddressTypes);
    // yield put({
    //   type: deliverydetailsTypes.SET_CHECKOUT_TOKENS,
    //   payload: _data.GatewayToken
    // });
  }
}
