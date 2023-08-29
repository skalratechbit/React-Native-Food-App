import { takeEvery, all } from 'redux-saga/effects';

import * as categories from './categories';
import * as competition from './competition';
import * as register from './register';
import * as ui from './ui';
import * as cart from './cart';
import * as home from './home';
import * as deliverydetails from './deliverydetails';
import * as squardcorner from './squardcorner';
import * as notifications from './notifications';
import * as branches from './branches';
import * as vouchers from './vouchers';
import * as appstate from './appstate';

import { types as categoryTypes } from '../ducks/categories';
import { types as competitionTypes } from '../ducks/competition';
import { types as registerTypes } from '../ducks/register';
import { types as stateAppTypes } from '../ducks/setappstate';
import { types as cartTypes } from '../ducks/cart';
import { types as homeTypes } from '../ducks/home';
import { types as deliverydetailsTypes } from '../ducks/deliverydetails';
import { types as squardcornerTypes } from '../ducks/squardcorner';
import { types as notificationsTypes } from '../ducks/notifications';
import { types as branchesTypes } from '../ducks/branches';
import { types as vouchersTypes } from '../ducks/vouchers';

const rootSaga = function* rootSaga() {
  yield all([
    takeEvery(categoryTypes.FETCH_CATEGORIES, categories.fetchCategories),
    takeEvery(categoryTypes.FETCH_MENU_ITEMS, categories.fetchMenueItems),
    takeEvery(categoryTypes.GET_ALL_MENU, categories.getAllMenu),

    takeEvery(homeTypes.FETCH_MEALS, home.fetchMeals),
    takeEvery(homeTypes.FETCH_USUAL_MEALS, home.fetchUsualMeals),
    takeEvery(homeTypes.FETCH_USER_ORDER_COUNT, home.fetchUserOrdersCount),
    takeEvery(homeTypes.CANCEL_ORDER, home.cancelOrder),
    takeEvery(homeTypes.FETCH_LAST_ORDER, home.fetchLastOrder),
    takeEvery(homeTypes.GET_BANNERS, home.getBanners),

    takeEvery(registerTypes.REGISTER_USER, register.registerUser),
    takeEvery(registerTypes.GET_PINCODE, register.getPinCode),
    takeEvery(registerTypes.CONFIRM_SIGNUP, register.confirmSignup),
    takeEvery(registerTypes.GET_RESENDCODE, register.getResendCode),
    takeEvery(registerTypes.EDIT_ACCOUNT, register.editAcount),
    takeEvery(registerTypes.CONTACT_US, register.contactUs),
    takeEvery(registerTypes.GET_CONTACT_INFO, register.getContactInfo),
    takeEvery(registerTypes.GET_ABOUT_INFO, register.getAboutInfo),

    takeEvery(deliverydetailsTypes.ADD_DELEIVERY_ADDRESS, deliverydetails.addDeliveryAddress),
    takeEvery(deliverydetailsTypes.PRE_ORDER, deliverydetails.preOrder),
    takeEvery(deliverydetailsTypes.PUT_ORDER, deliverydetails.putOrder),
    takeEvery(deliverydetailsTypes.GET_ADDRESS_TYPES, deliverydetails.getAddressTypes),
    takeEvery(deliverydetailsTypes.GET_PROVINCES_CITIES, deliverydetails.getProvincesCities),
    takeEvery(deliverydetailsTypes.GET_TRACK_ORDERS, deliverydetails.getTrackOrders),
    takeEvery(deliverydetailsTypes.EDIT_DELIVERY_ADDRESS, deliverydetails.editDeliveryAddress),
    // takeEvery(deliverydetailsTypes.EDIT_DELIVERY_ADDRESS, deliverydetails.removeErrorMessage),
    takeEvery(deliverydetailsTypes.GET_PAYMENT_METHODS, deliverydetails.getPaymentMethods),
    takeEvery(
      deliverydetailsTypes.GET_SPECIAL_INSTRUCTIONS,
      deliverydetails.getSpecialInstructions
    ),
    takeEvery(deliverydetailsTypes.GET_DELIVERY_SCREEN_DATA, deliverydetails.getDeliveryScreenData),
    takeEvery(deliverydetailsTypes.GET_PAYMENT_TOKENS, deliverydetails.getPaymentTokens),
    takeEvery(deliverydetailsTypes.DELETE_CREDIT_CARD, deliverydetails.deleteCreditCard),

    takeEvery(squardcornerTypes.SEND_AMOUNT, squardcorner.sendAmount),
    takeEvery(squardcornerTypes.USER_DETAILS, squardcorner.userDetails),
    takeEvery(squardcornerTypes.GET_SQUAD_DETAIL, squardcorner.getSquadDetail),
    takeEvery(squardcornerTypes.GET_LOYALTY_CORNER, squardcorner.getLoyaltyCorner),
    takeEvery(squardcornerTypes.INSER_TPAYMENT_PARTS, squardcorner.insertPaymentParts),
    takeEvery(squardcornerTypes.PRE_INSERT_PAYMENT_PARTS, squardcorner.preInsertPaymentParts),
    takeEvery(squardcornerTypes.PRE_INSERT_DINE_IN_PAYMENT, squardcorner.preInsertDineInPayment),
    takeEvery(squardcornerTypes.INSERT_DINE_IN_PAYMENT, squardcorner.insertDineInPayment),
    takeEvery(squardcornerTypes.SEND_SCANQR_DETAIL, squardcorner.sendScanqrDetail),
    takeEvery(squardcornerTypes.SEND_TO_FRIEND, squardcorner.sendToFriend),
    takeEvery(squardcornerTypes.GET_DINE_IN_SCAN, squardcorner.getDineScan),
    takeEvery(squardcornerTypes.UPDATE_SCANNER_DETAIL, squardcorner.updateScannerDetail),

    takeEvery(branchesTypes.GET_BRANCHES_FOR_BEACON, branches.getBranchesForBeacon),
    takeEvery(branchesTypes.GET_WHEEL_GAME, branches.getWheelGame),
    takeEvery(branchesTypes.GET_WHEEL_OPTIONS, branches.getWheelOptions),

    takeEvery(notificationsTypes.GET_ALL_NOTIFICATIONS, notifications.getAllNotifications),
    takeEvery(notificationsTypes.TRANSFER_CONFIRMATION, notifications.confirmTransfer),
    takeEvery(
      notificationsTypes.UPDATE_NOTIFICATION_STATUS,
      notifications.updateNotificationStatus
    ),

    takeEvery(branchesTypes.GET_BRANCHES, branches.getBranches),
    takeEvery(vouchersTypes.GET_VOUCHERS, vouchers.getVouchers),
    takeEvery(vouchersTypes.GET_VOUCHERS_CAPTURE, vouchers.getVouchersWithCapture),
    takeEvery(vouchersTypes.GET_VOUCHERS_CAPTURE_DINE_IN, vouchers.getDineVouchers),

    takeEvery(stateAppTypes.SHOW_ERROR, ui.showErrorAlert),
    takeEvery(stateAppTypes.DISABLE_ERROR, ui.disableError),
    takeEvery(stateAppTypes.GET_CURRENCY, appstate.getCurrency),
    takeEvery(stateAppTypes.GAMES, appstate.getGames),
    takeEvery(stateAppTypes.FB_CONNECT, appstate.fbConnect),
    takeEvery(stateAppTypes.SPREAD_THE_WORD, appstate.spreadTheWord),
    takeEvery(stateAppTypes.GET_ACCESS_TOKEN, appstate.getAccessToken),
    takeEvery(stateAppTypes.GET_SIDE_MENU, appstate.getSideMenu),
    takeEvery(stateAppTypes.GET_VERSION_STATUS, appstate.getVersionStatus),
    takeEvery(stateAppTypes.GET_APP_INIT_DATA, appstate.getAppInitialData),
    takeEvery(stateAppTypes.SEND_FIREBASE_TOKEN, appstate.sendFireBaseToken),
    takeEvery(stateAppTypes.LOG_ERROR_REPORT, appstate.logErrorReport),
    takeEvery(stateAppTypes.LOGOUT_LOG, appstate.logoutLog),

    takeEvery(competitionTypes.GET_COMPETITION, competition.getCompetitionData),
    takeEvery(competitionTypes.RESPOND_TO_COMPETITION_TERMS, competition.respondToCompetitionTerms),
    takeEvery(competitionTypes.GET_COMPETITION_RANKING, competition.getCompetitionRanking),

    takeEvery(cartTypes.GET_FREE_STARTER, cart.getFreeStarter),
    takeEvery(cartTypes.GET_FAVORITES, cart.getFavorites),
    takeEvery(cartTypes.DELETE_FAVORITE, cart.deleteFavorite),
    takeEvery(cartTypes.SAVE_FAVORITE, cart.saveFavorite),
    takeEvery(cartTypes.VALIDATE_PROMO, cart.validatePromo),
    takeEvery(cartTypes.GET_CART_PROMOS, cart.getCartPromos)
  ]);
};

export default rootSaga;
