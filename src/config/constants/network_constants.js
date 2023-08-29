import CONF from 'react-native-config'

console.log('CONF', CONF)
const isDevAPI = CONF.API == 'staging'
const isDevOrg = CONF.ORG == 'staging'

export const API_SUFFIX = isDevAPI ? 'apiv2/' : 'apiv2/'
export const API_PREFIX = isDevAPI ? 'dev.' : 'api.'

export const BASE_DOMAIN = `https://api.agora.ventures/`
export const BASE_URL = `${BASE_DOMAIN}`

export const TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJvcmdhbml6YXRpb25faWQiOiIyMyIsInRpbWUiOjE1OTIyOTY4NzQsImNoYW5uZWxfaWQiOiIxIn0.MtzVzJg1rn_83I14sfkbrMn0ALEq0dWOADgNKuBeQdw'
export const ORGANIZATION_ID = 10068
export const VKey_ID = 'C7lMNjn23'
export const CHANNEL_ID = '1'
export const TIME_OUT = 25000
// export const TIME_OUT = 1000;
export const CURRENCY = 'LBP'
export const WHEEL_GAME_ID = 3
export const APP_STORE_ID = 1350373136

export const BEACON_IDS = [
  '6665542b-41a1-0201-931c-6a82db9b78c1',
  '6665542b-41a1-0301-931c-6a82db9b78c1',
  '6665542b-41a1-1101-931c-6a82db9b78c1',
  '6665542b-41a1-2101-931c-6a82db9b78c1',
  '6665542b-41a1-0401-931c-6a82db9b78c1',
  '6665542b-41a1-1301-931c-6a82db9b78c1',
  '6665542b-41a1-2201-931c-6a82db9b78c1',
  '6665542b-41a1-1601-931c-6a82db9b78c1',
  '6665542b-41a1-0901-931c-6a82db9b78c1',
  '6665542b-41a1-2001-931c-6a82db9b78c1'
]
export const APIS = {
  GET_TOKEN: BASE_URL + 'auth/GenerateToken',
  GET_INIT_DATA: BASE_URL + 'Home',
  GET_LAST_ORDER: `${BASE_URL}orders/GetLastOrder`,
  LOGIN_POST: BASE_URL + 'auth/Login',
  LOGOUT_POST: BASE_URL + 'auth/Logout',
  REGISTER_USER: BASE_URL + 'auth/Register',
  SIGNUP_POST: BASE_URL + 'auth/Signup',
  GET_SIDE_MENU: BASE_URL + 'auth/GetAppSideMenu',
  CATEGORIES_GET: BASE_URL + 'categories/',
  SIGNUP_CONFIRMATION: BASE_URL + 'auth/SignupConfirmation',
  GET_MENU_ITEMS: BASE_URL + 'menu/get',
  MEALS_GET: BASE_URL + 'items/GetMeals',
  USUAL_MEALS_GET: BASE_URL + 'orders/GetUsual',
  GET_ORDER_COUNT: BASE_URL + 'orders/history',
  GET_SPECIAL_INSTRUCTIONS: BASE_URL + 'orders/GetSpecialInstructions',
  RESENDCODE_POST: BASE_URL + 'auth/ResendSMS',
  ADD_DELEIVERY_ADDRESS: BASE_URL + 'address/add',
  PUT_ORDER: BASE_URL + 'orders/add',
  SEND_AMOUNT: BASE_URL + 'loyalty/amount/send',
  GET_ADDRESS_TYPES: BASE_URL + 'auth/GetAddressTypes',
  GET_PROVINCES_CITIES: BASE_URL + 'geo/GetProvincesCities',
  GET_CUSTOMER_DETAILS: BASE_URL + 'customer',
  GET_TRACK_ORDERS: BASE_URL + 'orders/GetTrackOrders',
  GET_DELIVERY_SCREEN_DATA: `${BASE_URL}settings/GetDeliveryScreenData`,
  GET_PAYMENT_TOKENS: `${BASE_URL}settings/GetPaymentTokens`,
  DELETE_CREDIT_CARD: `${BASE_URL}credit-cards/delete`,
  GET_CHECKOUT_TOKENS: `${BASE_URL}checkout/token`,
  GET_CHECKOUT_DETAILS: `${BASE_URL}checkout`,
  GET_MONTHLY_LOYALTY_TIERS: BASE_URL + 'loyalty/corner/details',
  GET_ALL_NOTIFICATIONS: BASE_URL + 'notifications',
  GET_BANNERS: `${BASE_URL}structure/get`,
  CHECK_VERSION: `${BASE_URL}geo/ForceUpdate`,
  FORCE_LOGOUT: `${BASE_URL}forcelogout`,
  SEND_FIREBASE_TOKEN: `${BASE_URL}notifications/set-push`,
  GET_LOYALTY_CORNER: BASE_URL + 'loyalty/corner',
  CONFIRM_TRANSFER: BASE_URL + 'loyalty/confirm-transfer',
  RECEIVED_AMOUNT_CONFIRMATION: BASE_URL + 'auth/ConfirmNotification',
  UPDATE_NOTIFICATION_STATUS: BASE_URL + 'notifications/status',
  GET_BRANCHES: BASE_URL + 'branches',
  GET_VOUCHERS: BASE_URL + 'loyalty/vouchers/list',
  GET_DINE_IN_SCAN: BASE_URL + 'dine-in/scan',
  DINE_IN_PAYMENT: BASE_URL + 'dine-in/payment',
  GET_CURRENCY: BASE_URL + 'auth/GetCurrency',
  SEND_SCANQR_DETAIL: BASE_URL + 'orders/Scan',
  INSERT_PAYMENT_PARTS: BASE_URL + 'payment/InsertPaymentParts',
  GET_PAYMENT_METHODS: `${BASE_URL}payment/GetPaymentMethods`,
  EDIT_DELIVERY_ADDRESS: BASE_URL + 'address/edit',
  EDIT_ACCOUNT: BASE_URL + 'customer',
  CONTACT_US: BASE_URL + 'contact',
  GET_CONTACT_INFO: `${BASE_URL}contact`,
  GET_ABOUT_INFO: `${BASE_URL}about`,

  GET_FREE_STARTER: BASE_URL + 'items/GetFreeStarter',
  // FB_CONNECT: BASE_URL + 'challenges/FbConnect',
  FB_CONNECT: BASE_URL + 'games/facebook/connect',

  SEND_TO_FRIEND: BASE_URL + 'loyalty/voucher-app/send',

  GET_PROMO: `${BASE_URL}promo/GetPromo`,
  CHECK_PROMO: `${BASE_URL}promo/check`,

  SEND_TO_FRIEND_RESPONSE: BASE_URL + 'vouchers/SendToFriendResponse',
  CANCEL_ORDER: BASE_URL + 'orders/cancel',
  GAMES: `${BASE_URL}games`,
  SPREAD_THE_WORD: `${BASE_URL}games/spread-the-word`,
  GET_FAVORITES: `${BASE_URL}menu/favorite`,
  DELETE_FAVORITE: `${BASE_URL}menu/favorite/delete`,
  SAVE_FAVORITE: `${BASE_URL}menu/favorite`,
  WHEEL_GAME: `${BASE_URL}games/wheel/spin`,
  WHEEL_OPTIONS: `${BASE_URL}games/wheel/config/`,
  GET_COMPETITION: `${BASE_URL}competitions/get`,
  COMPETITION_AGREEMENT: `${BASE_URL}competitions/Agreement`,
  COMPETITION_RANKING: `${BASE_URL}competitions/Ranking`,
  ERROR_LOGING: `${BASE_URL}settings/SaveLogs`
}

export const COUNTRY_CODE = 961
