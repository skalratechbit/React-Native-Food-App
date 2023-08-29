export const types = {
  SEND_AMOUNT: 'send_amount',
  SEND_AMOUNT_SUCCESS: 'send_amount_success',
  SEND_AMOUNT_FAILURE: 'send_amount_failure',

  USER_DETAILS: 'user_details',
  USER_DETAILS_SUCCESS: 'user_details_success',
  USER_DETAILS_FAILURE: 'user_details_failure',

  GET_LOYALTY_CORNER: 'GET_LOYALTY_CORNER',
  GET_LOYALTY_CORNER_SUCCESS: 'GET_LOYALTY_CORNER_SUCCESS',
  GET_LOYALTY_CORNER_FAILURE: 'GET_LOYALTY_CORNER_FAILURE',

  GET_SQUAD_DETAIL: 'GET_SQUAD_DETAIL',
  GET_SQUAD_DETAIL_SUCCESS: 'get_squad_detail_success',
  GET_SQUAD_DETAIL_FAILURE: 'get_squad_detail_failure',

  INSER_TPAYMENT_PARTS: 'inser_tpayment_parts',
  INSER_TPAYMENT_PARTS_SUCCESS: 'inser_tpayment_parts_success',
  INSER_TPAYMENT_PARTS_FAILURE: 'inser_tpayment_parts_failure',

  PRE_INSERT_PAYMENT_PARTS: 'pre_insert_payment_parts',
  PRE_INSERT_PAYMENT_SUCCESS: 'pre_insert_payment_success',

  PRE_INSERT_DINE_IN_PAYMENT: 'pre_insert_dine_in_payment',
  PRE_INSERT_DINE_IN_PAYMENT_SUCCESS: 'pre_insert_dine_in_payment_success',
  PRE_INSERT_DINE_IN_PAYMENT_FAILURE: 'pre_insert_dine_in_payment_failure',

  INSERT_DINE_IN_PAYMENT: 'insert_dine_in_payment',
  INSERT_DINE_IN_PAYMENT_SUCCESS: 'insert_dine_in_payment_success',
  INSERT_DINE_IN_PAYMENT_FAILURE: 'insert_dine_in_payment_failure',

  SEND_SCANQR_DETAIL: 'send_scanqr_detail',
  SEND_SCANQR_DETAIL_SUCCESS: 'send_scanqr_detail_success',
  SEND_SCANQR_DETAIL_FAILURE: 'send_scanqr_detail_failure',

  SEND_TO_FRIEND: 'send_to_friend',
  SEND_TO_FRIEND_SUCCESS: 'send_to_friend_success',
  SSEND_TO_FRIEND_FAILURE: 'ssend_to_friend_failure',

  GET_DINE_IN_SCAN :'get_dine_in_scan',
  GET_DINE_IN_SCAN_SUCCESS :'get_dine_in_scan_success',
  GET_DINE_IN_SCAN_FAILURE :'get_dine_in_scan_success',

  UPDATE_SCANNER_DETAIL : 'update_scanner_detail',
  UPDATE_SCANNER_DETAIL_SUCCESS : 'update_scanner_detail_success'
};

const INITIAL_STATE = {
  sendAmount: '',
  userDetails: {},
  squadCorner: {},
  squadDetail: [],
  insertPaymentPartsResponse: {},
  scannerDetail: [],
  gameData: {},
  sendToFriend: {},
  insertTimestamp: 0,
  preInsertPaymentResponse: {}
};

//export  default (state= INITIAL_STATE , action) => {

export default function reducer(state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case types.SEND_AMOUNT_SUCCESS:
      return { ...state, sendAmount: { ...action.payload, timestamp: new Date().getTime() } };
      break;

    case types.SEND_AMOUNT_FAILURE:
      return { ...state, sendAmount: '' };
      break;

    case types.USER_DETAILS_SUCCESS:
      return { ...state, userDetails: action.payload };
      break;

    case types.USER_DETAILS_FAILURE:
      return { ...state, userDetails: '' };
      break;

    case types.GET_LOYALTY_CORNER_SUCCESS:
      return {...state, squadCorner: action.payload};

    case types.GET_LOYALTY_CORNER_FAILURE:
      return {...state, squadCorner: action.payload};

    case types.GET_SQUAD_DETAIL_SUCCESS:
      return { ...state, squadDetail: {data: action.payload.data, Themes: action.payload.Themes} };
      break;

    case types.GET_SQUAD_DETAIL_FAILURE:
      return { ...state, squadDetail: action.payload };
      break;
        
    case types.UPDATE_SCANNER_DETAIL_SUCCESS:
     return {
       ...state,
       scannerDetail: []
     };
     break;

    case types.INSER_TPAYMENT_PARTS_SUCCESS:
      return { ...state, insertPaymentPartsResponse: action.payload };
      break;

    case types.PRE_INSERT_PAYMENT_SUCCESS:
      return { ...state, preInsertPaymentResponse: action.payload, insertTimestamp: new Date().getTime() };
      break;

    case types.INSER_TPAYMENT_PARTS_FAILURE:
      return { ...state, insertPaymentPartsResponse: [] };
      break;

    case types.SEND_SCANQR_DETAIL_SUCCESS:
      const { status, data, game_data } = action.payload.data;
      return {
        ...state,
        scannerDetail: { ...data, status },
        gameData: game_data
      };
      break;

    case types.PRE_INSERT_DINE_IN_PAYMENT_SUCCESS:
      return { ...state, preInsertPaymentResponse: action.payload, insertTimestamp: new Date().getTime() };
      break;

    case types.PRE_INSERT_DINE_IN_PAYMENT_FAILURE:
      return { ...state, preInsertPaymentResponse: action.payload };
      break;

    case types.INSERT_DINE_IN_PAYMENT_SUCCESS:
      return { ...state, insertPaymentPartsResponse: action.payload };
      break;

    case types.INSERT_DINE_IN_PAYMENT_FAILURE:
      return { ...state, insertPaymentPartsResponse: action.payload };
      break;  

    case types.SEND_SCANQR_DETAIL_FAILURE:
      return { ...state, scannerDetail: [] };
      break;

    case types.SEND_TO_FRIEND_SUCCESS:
      return { ...state, sendToFriend: { ...action.payload, timestamp: new Date().getTime() } };
      break;

    case types.SSEND_TO_FRIEND_FAILURE:
      return { ...state, sendToFriend: [] };
      break;

    case types.GET_DINE_IN_SCAN_SUCCESS:
      return {...state, scannerDetail:   { 
        ...action.payload.data.data,
        message:action.payload.data.message,
        status: action.payload.data.status }};
      break;
    
    case types.GET_DINE_IN_SCAN_FAILURE:
      return {...state, scannerDetail: { 
        ...action.payload?.data?.data,
        message:action.payload?.data?.message,
        status: action.payload?.data?.status } };
      break;
        

    default:
      return state;
      break;
  }
}

export const actions = {
  sendAmount: amountData => ({ type: types.SEND_AMOUNT, amountData }),
  userDetails: userData => ({ type: types.USER_DETAILS, userData }),
  getLoyaltyCorner: () => ({ type: types.GET_LOYALTY_CORNER }),
  getSquadDetail: () => ({ type: types.GET_SQUAD_DETAIL }),
  insertPaymentParts: params => ({ type: types.INSER_TPAYMENT_PARTS, params }),
  preInsertPaymentParts: params => ({ type: types.PRE_INSERT_PAYMENT_PARTS, params }),
  sendScanqrDetail: params => ({ type: types.SEND_SCANQR_DETAIL, params }),
  sendToFriend: params => ({ type: types.SEND_TO_FRIEND, params }),
  getDineScan: (params) => ({type: types.GET_DINE_IN_SCAN, params}),
  preInsertDineInPayment: params => ({ type: types.PRE_INSERT_DINE_IN_PAYMENT, params }),
  insertDineInPayment: params => ({ type: types.INSERT_DINE_IN_PAYMENT, params }),
  updateScannerDetail: params => ({ type: types.UPDATE_SCANNER_DETAIL })
};
