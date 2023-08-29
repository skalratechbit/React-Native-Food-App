export const types = {
  ADD_DELEIVERY_ADDRESS: 'add_deleivery_address',
  ADD_DELEIVERY_ADDRESS_SUCCESS: 'add_deleivery_address_success',
  ADD_DELEIVERY_ADDRESS_FAILURE: 'fadd_deleivery_address_failure',

  PUT_ORDER: 'put_order',
  PRE_ORDER: 'pre_order',
  PRE_ORDER_SUCCESS: 'pre_order_success',
  PUT_ORDER_SUCCESS: 'put_order_success',
  PUT_ORDER_FAILURE: 'put_order_failure',

  GET_ADDRESS_TYPES: 'GET_ADDRESS_TYPES',
  GET_ADDRESS_TYPES_SUCCESS: 'get_address_types_success',
  GET_ADDRESS_TYPES_FAILURE: 'get_address_types_failure',
  GET_ADDRESS_ERROR_MESSAGES: 'get_address_error_messages',

  GET_PROVINCES_CITIES: 'get_provinces_cities',
  GET_PROVINCES_CITIES_SUCCESS: 'get_provinces_cities_success',
  GET_PROVINCES_CITIES_FAILURE: 'get_provinces_cities_failure',

  GET_TRACK_ORDERS: 'get_track_orders',
  GET_TRACK_ORDERS_SUCCESS: 'get_track_orders_success',
  GET_TRACK_ORDERS_FAILURE: 'get_track_orders_failure',

  EDIT_DELIVERY_ADDRESS: 'edit_delivery_address',
  EDIT_DELIVERY_ADDRESS_SUCCESS: 'edit_delivery_address_success',
  SET_DISABLED_ITEMS: 'set_disabled_items',
  EDIT_DELIVERY_ADDRESS_FAILURE: 'edit_delivery_address_failure',
  GET_SPECIAL_INSTRUCTIONS: 'get_special_instructions',
  GET_SPECIAL_INSTRUCTIONS_SUCCESS: 'get_special_instructions_success',
  GET_DELIVERY_SCREEN_DATA: 'get_delivery_screen_data',
  SET_CHECKOUT_TOKENS: 'set_checkout_tokens',
  SET_PAYMENT_METHODS: 'set_payment_methods',
  SET_WALLET_DATA: 'set_wallet_data',
  SET_MINIMUM_ONLINE_PAYMENT: 'set_minimun_online_payment',
  GET_PAYMENT_METHODS: 'get_payment_methods',
  GET_PAYMENT_TOKENS: 'get_payment_tokens',
  SET_NOTES_DESCRIPTION: 'set_notes_description',
  DELETE_CREDIT_CARD: 'delete_credit_card'
};

const INITIAL_STATE = {
  addedDeliveryAddresse: {},
  orderStatus: '',
  orderTimestamp: 0,
  addresstype: [],
  error_messages: {},
  provincesCities: [],
  trackOrders: [],
  addresses: [],
  edittedAddress: {},
  specialInstructions: [],
  notesDescription: '',
  checkoutTokens: [],
  paymentMethods: [],
  walletData: {},
  minimumOnlinePayment: 0,
  disabledItems: [],
};

export default function reducer (state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case types.ADD_DELEIVERY_ADDRESS_SUCCESS:
      return { ...state, addresses: action.payload };
      break;

    case types.ADD_DELEIVERY_ADDRESS_FAILURE:
      return { ...state, addedDeliveryAddresse: {} };
      break;

    case types.PUT_ORDER_SUCCESS:
      return { ...state, orderStatus: action.payload };
      break;

    case types.PRE_ORDER_SUCCESS:
      return {
        ...state,
        orderStatus: action.payload,
        orderTimestamp: new Date().getTime()
      };
      break;

    case types.PUT_ORDER_FAILURE:
      return { ...state, orderStatus: 'failed' };
      break;

    case types.GET_ADDRESS_TYPES_SUCCESS:
      return {
        ...state,
        addresstypes: action.payload.addressType,
        addresses: action.payload.addresses,
        disabledItems: action.payload.disabledItems,
        minimumAmount:action.payload.minimumAmount,
      };
      break;

    case types.GET_ADDRESS_ERROR_MESSAGES:
      return {
        ...state,
        error_messages: action.payload.data.error_messages
      };
      break;

    case types.GET_ADDRESS_TYPES_FAILURE:
      return { ...state, addresstypes: [] };
      break;

    case types.GET_PROVINCES_CITIES_SUCCESS:
      return { ...state, provincesCities: action.payload };
      break;

    case types.GET_PROVINCES_CITIES_FAILURE:
      return { ...state, provincesCities: [] };
      break;

    case types.GET_TRACK_ORDERS_SUCCESS:
      return { ...state, trackOrders: action.payload };
      break;

    case types.GET_TRACK_ORDERS_FAILURE:
      return { ...state, trackOrders: [] };
      break;

    case types.EDIT_DELIVERY_ADDRESS_SUCCESS:
      return { ...state, addresses: action.payload };
      break;

    case types.SET_DISABLED_ITEMS:
      return { ...state, disabledItems: action.payload };
      break;

    case types.EDIT_DELIVERY_ADDRESS_FAILURE:
      return { ...state, error_messages: action.payload };
      break;

    case types.GET_SPECIAL_INSTRUCTIONS_SUCCESS:
      return { ...state, specialInstructions: action.payload };
      break;

    case types.SET_NOTES_DESCRIPTION:
      return { ...state, notesDescription: action.payload };
      break;

    case types.SET_CHECKOUT_TOKENS:
      // console.log('setting GatewayToken', action.payload);
      return { ...state, checkoutTokens: action.payload };
      break;

    case types.SET_PAYMENT_METHODS:
      return { ...state, paymentMethods: action.payload };
      break;

    case types.SET_WALLET_DATA:
      return { ...state, walletData: action.payload };
      break;

    case types.SET_MINIMUM_ONLINE_PAYMENT:
      return { ...state, minimumOnlinePayment: action.payload };
      break;

    default:
      return state;
      break;
  }
}

export const actions = {
  addDeliveryAddress: addressData => ({
    type: types.ADD_DELEIVERY_ADDRESS,
    addressData
  }),
  putOrder: orderData => ({ type: types.PUT_ORDER, orderData }),
  preOrder: orderData => ({ type: types.PRE_ORDER, orderData }),
  getAddressTypes: () => ({ type: types.GET_ADDRESS_TYPES }),
  getPaymentMethods: () => ({ type: types.GET_PAYMENT_METHODS }),
  setPaymentMethods: data => ({
    type: types.SET_PAYMENT_METHODS,
    payload: data
  }),
  getSpecialInstructions: () => ({ type: types.GET_SPECIAL_INSTRUCTIONS }),
  getDeliveryScreenData: () => ({ type: types.GET_DELIVERY_SCREEN_DATA }),
  getPaymentTokens: () => ({ type: types.GET_PAYMENT_TOKENS }),
  getprovincesCities: () => ({ type: types.GET_PROVINCES_CITIES }),
  getTrackOrders: customerId => ({ type: types.GET_TRACK_ORDERS, customerId }),
  editDeliveryAddress: params => ({ type: types.EDIT_DELIVERY_ADDRESS, params }),
  removeErrorMessage: () => ({
    type: types.EDIT_DELIVERY_ADDRESS_FAILURE,
    payload: {}
  }),
  deleteCreditCard: CreditCardId => ({ type: types.DELETE_CREDIT_CARD, CreditCardId })
};
