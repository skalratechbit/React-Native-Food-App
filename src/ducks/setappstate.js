import VersionNumber from 'react-native-version-number';
import { THEME_LEVEL_1 } from '../config/common_styles/appthemes';

export const types = {
  SET_LOADING: 'set_loading',
  GET_PINCODE_SUCCESS: 'get_pincode_success',
  GET_PINCODE_FAILURE: 'get_pincode_failure',

  SHOW_ERROR: 'show_error',
  DISABLE_ERROR: 'disable_error',
  SET_ERROR: 'set_error',
  SET_IS_CONNECTED: 'set_is_connected',
  USER_TYPE: 'user_type',

  API_NAME: 'api_name',
  APP_THEME: 'app_theme',
  USER_CONTACTS: 'user_contacts',

  CLEAR_STORE: 'clear_store',
  SET_CURRENCY: 'set_currency',
  SET_SIDE_MENU: 'set_side_menu',
  GET_SIDE_MENU: 'get_side_menu',

  GET_CURRENCY: 'get_currency',
  GET_CURRENCY_SUCCESS: 'get_currency_success',
  GET_CURRENCY_FAILURE: 'get_currency_failure',

  GET_SPIN_WHEEL: 'get_spin_wheel',
  GET_SPIN_WHEEL_SUCCESS: 'get_spin_wheel_success',
  GET_SPIN_WHEEL_FAILURE: 'get_spin_wheel_failure',

  GAMES: 'GAMES',
  GAMES_SUCCESS: 'games_success',
  GAMES_FAILURE: 'games_failure',

  FB_CONNECT: 'fb_connect',
  FB_CONNECT_SUCCESS: 'fb_connect_succsess',
  FB_CONNECT_FAILURE: 'fb_connect_failure',
  SPREAD_THE_WORD: 'spread_the_word',
  SPREAD_THE_WORD_SUCCESS: 'spread_the_word_success',
  SPREAD_THE_WORD_FAILURE: 'spread_the_word_failure',
  GET_ACCESS_TOKEN: 'get_access_token',
  SET_ACCESS_TOKEN: 'set_access_token',
  PN_INITED: 'push_inited',
  GET_VERSION_STATUS: 'get_version_status',
  SET_VERSION_STATUS: 'set_version_status',
  SET_FORCE_LOGOUT: 'set_force_log_out',
  GET_APP_INIT_DATA: 'get_app_init_data',
  SEND_FIREBASE_TOKEN: 'send_firebase_token',
  LOG_ERROR_REPORT: 'log_error_report',
  LOGOUT_LOG: 'logout_log',
  TOGGLE_LOADER: 'toggle_loader',
};
import { getUserObject, getUserAccessToken } from '../helpers/UserHelper';

const APP_INITIAL_STATE = {};
export default function(
  state = {
    loading: false,
    isConnected: true,
    apiname: '',
    appTheme: THEME_LEVEL_1,
    userContact: [],
    updatedStars: '',
    walletAmountBalance: '',
    userType: '',
    LevelName: '',
    hasFreeStarter: '',
    freeStarterId: '',
    fbConnectData: '',
    freeStarterExpiryDate: '',
    spreadTheWordData: {},
    accessToken: '',
    pnInited: false,
    sideMenu: [],
    shouldGetVersion: false,
    forceLogOut: false,
    commonError: { status: false, message: '' },
    toggleLoader: false
  },
  action
) {
  switch (action.type) {
    case types.SET_ERROR:
      return { ...state, commonError: { status: action.payload.status, message: action.payload.message} };

    case types.SET_LOADING:
      return { ...state, loading: action.payload };

    case types.TOGGLE_LOADER:
      return { ...state, toggleLoader: action.payload }; 

    case types.SET_IS_CONNECTED:
      return { ...state, isConnected: action.payload };

    case types.SET_SIDE_MENU:
      const sideMenu = (action.payload || [])
      .sort((a, b) => {
        const aWeight = parseInt(a.weight)
        const bWeight = parseInt(b.weight)
        return aWeight < bWeight ? -1 : aWeight > bWeight ? 1 : 0
      })
      return { ...state, sideMenu };

    case types.USER_TYPE:
      return { ...state, userType: action.payload };

    case types.API_NAME:
      return { ...state, apiname: action.payload };

    // case types.APP_THEME:{
    // 	if (action.payload==1)
    // 	return {...state, appTheme: THEME_LEVEL_1 };
    // 	if (action.payload==2)
    // 	return {...state, appTheme: THEME_LEVEL_2 };
    // 	if (action.payload==3)
    // 	return {...state, appTheme: THEME_LEVEL_3 };
    //
    // }
    case types.USER_CONTACTS:
      return { ...state, userContact: action.payload };

    // case types.SET_CURRENCY:
    // return {...state, currency: 'LBP' };
    //  break

    case types.GET_SPIN_WHEEL_SUCCESS:
      return {
        ...state,
        SpinTheWheel: action.payload
      };

    case types.GET_CURRENCY_SUCCESS:
      const { Loyalty, Currency } = action.payload;
      const {
        TotalAmounts = 0,
        TotalPoints = 0,
        TierBalance = 0,
        WalletAmountBalance = 0,
        LevelName,
        HasFreeStarter = false,
        FreeStarterId = 0,
        FreeStarterExpiryDate = null,
        StartDate,
        EndDate,
        LoyaltyId
      } = Loyalty || {};
      return {
        ...state,
        currency: Currency,
        updatedStars: TotalPoints,
        walletAmountBalance: TotalAmounts,
        LevelName: LevelName,
        StartDate,
        EndDate,
        LoyaltyId,
        hasFreeStarter: HasFreeStarter,
        freeStarterId: FreeStarterId,
        freeStarterExpiryDate: FreeStarterExpiryDate
      };
      break;

    case types.GET_CURRENCY_FAILURE:
      return { ...state, currency: '', AmountBalance: '', updatedStars: '' };
      break;

    case types.PN_INITED:
      return { ...state, pnInited: action.payload };
      break;

    case types.GAMES_SUCCESS:
        return { ...state, gamesData: action.payload };
        break;
  
    case types.GAMES_FAILURE:
        return { ...state, gamesData: [] };
        break;

    case types.FB_CONNECT_SUCCESS:
      return { ...state, fbConnectData: action.payload };
      break;

    case types.FB_CONNECT_FAILURE:
      return { ...state, fbConnectData: [] };
      break;
    case types.SPREAD_THE_WORD_SUCCESS:
      return {
        ...state,
        spreadTheWordData: {
          ...action.payload,
          timestamp: new Date().getTime()
        }
      };
      break;
    case types.SET_ACCESS_TOKEN:
      return {
        ...state,
        accessToken: action.payload || action.params
      };
      break;
    case types.SPREAD_THE_WORD_FAILURE:
      return {
        ...state,
        spreadTheWordData: { error: true, timestamp: new Date().getTime() }
      };
      break;

    case types.SET_VERSION_STATUS:
      return { ...state, shouldGetVersion: action.payload };
      break;

    case types.SET_FORCE_LOGOUT:
      return {...state, forceLogOut: action.payload};
      break;
    default:
      return state;
  }
}

export const getToken = state => getUserAccessToken(state);
export const getInitialToken = state => state.app.accessToken;
export const appVersion = () => VersionNumber.appVersion;
export const getCustomerInfo = state =>
  state.app.userType == 'login' ? state.register.loggedinUserInfo : state.register.loggedinUserInfo;
export const checkNetwork = state => state.app.isConnected;
export const getUserType = state => state.app.userType;
export const getCustomerID = state => getUserObject(state).CustomerId || 'guest';
export const getLoyaltyId = state => getUserObject(state).LoyaltyId;
export const getLevelId = state => getUserObject(state).LevelId;
export const gethasFreeStarter = state => state.app.hasFreeStarter;
export const getLoyaltyCardCode = state => getUserObject(state).LoyaltyCardCode;
export const getForceLogOut = state => state.app.forceLogOut;

export const actions = {
  setIsConnected: isConnected => ({
    type: types.SET_IS_CONNECTED,
    payload: isConnected
  }),
  setLoadingState: loading => ({
    type: types.SET_LOADING,
    loading: loading === true
  }),
  setUserType: userType => ({ type: types.USER_TYPE, payload: userType }),
  setAppTheme: userLevel => ({ type: types.APP_THEME, payload: userLevel }),
  // setApiName: (apiname) => ({ type: types.API_NAME,  apiname: apiname }),
  getAccessToken: params => ({ type: types.GET_ACCESS_TOKEN, params }),
  setAccessToken: params => ({ type: types.SET_ACCESS_TOKEN, params }),
  setUserContact: contact => ({ type: types.USER_CONTACTS, payload: contact }),
  setPnInited: inited => ({ type: types.PN_INITED, payload: inited }),
  getCurrency: () => ({ type: types.GET_CURRENCY }),
  getSideMenu: () => ({ type: types.GET_SIDE_MENU }),
  setSideMenu: () => ({ type: types.SET_SIDE_MENU }),
  setCurrencyFromLocalDBToReduxStore: currency => ({
    type: types.GET_CURRENCY_SUCCESS,
    payload: currency
  }),
  getGames: () => ({
    type: types.GAMES,
  }),
  fbConnect: params => ({ type: types.FB_CONNECT, params }),
  spreadTheWord: params => ({ type: types.SPREAD_THE_WORD, params }),
  setVersionStatus: status => ({
    type: types.SET_VERSION_STATUS,
    payload: status
  }),
  getAppInitialData: () => ({ type: types.GET_APP_INIT_DATA }),
  getVersionStatus: version => ({ type: types.GET_VERSION_STATUS, version }),
  // clearAppReduxStore: () => ({ type: types.CLEAR_STORE, }),
  sendFireBaseToken: (token) => ({ type: types.SEND_FIREBASE_TOKEN, token }),
  logErrorReport: log => ({ type: types.LOG_ERROR_REPORT, log }),
  logoutLog: () => ({ type: types.LOGOUT_LOG }),
  disableError: () => ({ type: types.DISABLE_ERROR }),
  setForceFalse: payload => ({ type: types.SET_FORCE_LOGOUT, payload }),
  toggleLoader: data => ({ type: types.TOGGLE_LOADER, payload: data }),
};
