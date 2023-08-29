import { PermissionsAndroid } from "react-native";
import { IF_OS_IS_IOS } from '../config/common_styles';

export const getUserAccessToken = state => {
  const {
    register: { loggedinUserInfo, registerUserInfo },
    app: { userType }
  } = state;
  const isLoggedInUser = loggedinUserInfo && loggedinUserInfo.data && loggedinUserInfo.data.customer;
  const isRegisteredUser = registerUserInfo && registerUserInfo.data && registerUserInfo.data[0];
  if((isLoggedInUser || isRegisteredUser) && state.app && userType) {
    if(isLoggedInUser) return loggedinUserInfo.token;
    else if(isRegisteredUser) return registerUserInfo.data[0].loyalty;
  } else return {};
};

export const getUserObject = state => {
  const {
    register: { loggedinUserInfo, registerUserInfo },
    app: { userType }
  } = state;
  const isLoggedInUser = loggedinUserInfo && loggedinUserInfo.data && loggedinUserInfo.data.customer;
  const isRegisteredUser = registerUserInfo && registerUserInfo.data && registerUserInfo.data[0];
  if((isLoggedInUser || isRegisteredUser) && state.app && userType) {
    if(isLoggedInUser) return loggedinUserInfo.data.customer;
    else if(isRegisteredUser) return registerUserInfo.data[0].loyalty;
  } else return {};
};

export const getUserPaymentMethods = state => {
  const {
    deliverydetails: {
      paymentMethods
    },
    register: {
      loggedinUserInfo = {}
    }
  } = state;
  const { data = { PaymentMethods: [] } } = loggedinUserInfo
  return paymentMethods.length ? paymentMethods : data.PaymentMethods;
};

export const getUserAddresses = state => {
  const {
    register: { loggedinUserInfo }
  } = state;
  const { data = { addresses: [] } } = loggedinUserInfo || {};
  return data.addresses;
};

export const readUserContacts = async ({ callback, failedCallback }) => {
  const ContactPermissionTitle = 'Bar Tartine needs to read your Contacts';
  const ContactPermissionMsg =
    'Bar Tartine needs to access your contacts so you may select people ' +
    'to share vouchers, redeemable points and app experiences with.';
  const { GRANTED } = PermissionsAndroid.RESULTS;

  if(!IF_OS_IS_IOS)
    try {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: ContactPermissionTitle,
          message: ContactPermissionMsg
        }
      ).then(ReadRights => {
        if (ReadRights === GRANTED) {
          if(callback) callback()
        } else {
          alert(
            "Bar Tartine does not have permission to read your Contacts. Grant Permission for a better experience."
          );
        }
      })
    } catch (e) {
      if(failedCallback) failedCallback()
    }
  else callback()
}

export const readUserLocation = async ({ callback, failedCallback }) => {
  const PermissionTitle = 'Bar Tartine needs to access your location.';
  const PermissionMsg =
    'Bar Tartine needs to access your proximity to one of our diners.';
  const { GRANTED } = PermissionsAndroid.RESULTS;

  if(!IF_OS_IS_IOS)
    try {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: PermissionTitle,
          message: PermissionMsg
        }
      ).then(Rights => {
        if (!Rights === GRANTED) {
          alert(
            "Bar Tartine does not have permission to access your Location. Grant Permission to enable Location based features."
          );
        } else {
          if(callback) callback()
        }
      })
    } catch (e) {
      if(failedCallback) failedCallback()
    }
  else callback()
}
