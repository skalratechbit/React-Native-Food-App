export const types = {
  GET_PINCODE: 'get_pincode',
  GET_PINCODE_SUCCESS: 'get_pincode_success',
  GET_PINCODE_FAILURE: 'get_pincode_failure',

  CONFIRM_SIGNUP: 'confirm_signup',
  CONFIRM_SIGNUP_SUCCESS: 'confirm_signup_success',
  CONFIRM_SIGNUP_FAILURE: 'confirm_signup_failure',

  REGISTER_USER: 'register_user',
  REGISTER_USER_SUCCESS: 'register_user_success',
  REGISTER_USER_FAILURE: 'register_user_failure',

  GET_RESENDCODE: 'get_resendcode',
  GET_RESENDCODE_SUCCESS: 'get_resendcode_success',
  GET_RESENDCODE_FAILURE: 'get_resendcode_failure',

  SET_LOYALTY_OLDDATA: 'setLoyalty_OldData',
  SET_LOYALTY_ID: 'setLoyalty_Id',

  EDIT_ACCOUNT: 'edit_account',
  EDIT_ACCOUNT_SUCCESS: 'edit_account_success',
  EDIT_ACCOUNT_FAILURE: 'edit_account_failure',

  CONTACT_US: 'contact_us',
  CONTACT_US_SUCCESS: 'contact_us_success',
  CONTACT_US_FAILURE: 'contact_us_failure',
  SET_CONTACT_DATA_DEFAULT: 'set_contact_data_default',

  GET_CONTACT_INFO: 'get_contact_info',
  SET_CONTACT_INFO: 'set_contact_info',
  SET_INITIALTOKEN: 'set_initial_token',

  GET_ABOUT_INFO: 'get_about_info',
  SET_ABOUT_INFO: 'set_about_info'
};

const INITIAL_STATE = {
  resendPinCode: '',
  registerdPinCode: '',
  loggedinUserInfo: {},
  loyaltyOlddata: '',
  loyaltyId: '',
  editedAccountData: {},
  contactUsData: { timestamp: 0 },
  contactUsInfo: {},
  aboutInfo: { Title: 'About Us', Details: '' },
  initalToken: ''
};

//export  default (state= INITIAL_STATE , action) => {

export default function reducer(state = INITIAL_STATE, action = {}) {
  // if(action.type== "fetch_meals")
  // return state;

  switch (action.type) {
    case types.GET_PINCODE_SUCCESS:
      return { registerdPinCode: action.payload };
      break;

    case types.GET_PINCODE_FAILURE:
      return { registerdPinCode: '' };
      break;

    case types.CONFIRM_SIGNUP_SUCCESS:
      return { ...state, loggedinUserInfo: action.payload };
      break;

    case types.REGISTER_USER_SUCCESS:
      return { ...state, registerUserInfo: action.payload };
      break;

    case types.GET_RESENDCODE_SUCCESS:
      return { resendPinCode: action.payload };
      break;

    case types.GET_RESENDCODE_FAILURE:
      return { resendPinCode: '' };
      break;

    case types.SET_LOYALTY_OLDDATA:
      return { ...state, loyaltyOlddata: action.payload };
      break;

    case types.SET_LOYALTY_ID:
      return { ...state, loyaltyId: action.payload };
      break;

    case types.EDIT_ACCOUNT_SUCCESS:
      return { ...state, editedAccountData: action.payload };
      break;

    case types.EDIT_ACCOUNT_FAILURE:
      return { ...state, editedAccountData: '' };
      break;

    case types.CONTACT_US_SUCCESS:
      return { ...state, contactUsData: { ...action.payload, error: false, timestamp: new Date().getTime() } };
      break;

    case types.CONTACT_US_FAILURE:
      return { ...state, contactUsData: { ...state.contactUsData, error: true, timestamp: new Date().getTime() } };
      break;

    case types.SET_CONTACT_DATA_DEFAULT:
      return { ...state, contactUsData: { ...state.contactUsData, timestamp: 0 } };
      break;
    case types.SET_CONTACT_INFO:
      return { ...state, contactUsInfo: action.payload };
      break;

    case types.SET_ABOUT_INFO:
    return { ...state, aboutInfo: action.payload };
    break;

    case types.SET_INITIALTOKEN:
      return { ...state, initalToken: action.payload}

    default:
      return state;
      break;
  }
}

export const getLoyaltyOldData = state => state.register.loyaltyOlddata;
export const getLoyaltyId = state => state.register.loyaltyOlddata;
export const getInitialToken = state => state.register.initalToken;

export const actions = {
  getPinCodeFromServer: userData => ({ type: types.GET_PINCODE, userData }),
  confirmSignup: userData => ({ type: types.CONFIRM_SIGNUP, userData }),
  registerUser: userData => ({ type: types.REGISTER_USER, userData }),
  getResendCodeFromServer: userData => ({ type: types.GET_RESENDCODE, userData }),
  setLogindatafromLocalStorageToReduxStore: data => ({
    type: types.CONFIRM_SIGNUP_SUCCESS,
    payload: data
  }),
  setRegisteratafromLocalStorageToReduxStore: data => ({
    type: types.REGISTER_USER_SUCCESS,
    payload: data
  }),
  setLoyaltyOldData: data => ({ type: types.REGISTER_USER_SUCCESS, payload: data }),

  editAcount: params => ({ type: types.EDIT_ACCOUNT, params }),
  contactUs: params => ({ type: types.CONTACT_US, params }),
  setContactDataDefault: params => ({ type: types.SET_CONTACT_DATA_DEFAULT, params }),
  getContactInfo: () => ({ type: types.GET_CONTACT_INFO }),
  getAboutInfo: () => ({ type: types.GET_ABOUT_INFO })
};
