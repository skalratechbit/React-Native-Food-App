
export const types = {

  GET_ALL_NOTIFICATIONS: 'get_all_notifications',
  GET_ALL_NOTIFICATIONS_SUCCESS: 'gget_all_notifications_success',
  GET_ALL_NOTIFICATIONS_FAILURE: 'get_all_notifications_failure',

  TRANSFER_CONFIRMATION: 'transfer_confirmation',
  TRANSFER_CONFIRMATION_SUCCESS: 'transfer_confirmation_success',
  TRANSFER_CONFIRMATION_FAILURE: 'transfer_confirmation_failure',

  UPDATE_NOTIFICATION_STATUS: 'update_notification_status',
  UPDATE_NOTIFICATION_STATUS_SUCCESS: 'update_notification_status_success',
  UPDATE_NOTIFICATION_STATUS_FAILURE: 'update_notification_status_failure',

  // SEND_TO_FRIEND_RESPONSE: 'send_to_friend_response',
  // SEND_TO_FRIEND_RESPONSE_SUCCESS: 'send_to_friend_response_success',
  // SEND_TO_FRIEND_RESPONSE_FAILURE: 'send_to_friend_response_failure',
}

const defaultNotifactions = { rows: [], TotalUnread: 0, message: '' }
const INITIAL_STATE = { notifications: defaultNotifactions, confirmation: '' };

//export  default (state= INITIAL_STATE , action) => {

export default function reducer(state = INITIAL_STATE, action = {}) {

  switch (action.type) {

    case types.GET_ALL_NOTIFICATIONS_SUCCESS:
    return {...state, notifications: action.payload };
    break;

    case types.GET_ALL_NOTIFICATIONS_FAILURE:
    return {...state, notifications: defaultNotifactions};
    break;

    case types.TRANSFER_CONFIRMATION_SUCCESS:
    return {...state, notifications: action.payload};
    break;

    case types.TRANSFER_CONFIRMATION_FAILURE:
    return {...state, notifications: defaultNotifactions};
    break;

    case types.UPDATE_NOTIFICATION_STATUS_SUCCESS:
    return {...state, notifications: action.payload};
    break;

    case types.UPDATE_NOTIFICATION_STATUS_FAILURE:
    return {...state, notifications: defaultNotifactions};
    break;

    // case types.SEND_TO_FRIEND_RESPONSE_SUCCESS:
    // return {...state, notifications: action.payload};
    // break;
    //
    // case types.SEND_TO_FRIEND_RESPONSE_FAILURE:
    // return {...state, notifications: []};
    // break;

    default:
    return state;
    break;
  }
};


export const actions = {
  confirmTransfer: (params) => ({ type: types.TRANSFER_CONFIRMATION,params}),
  getAllNotifications: () => ({ type: types.GET_ALL_NOTIFICATIONS}),
  updateNotificationStatus: (params) => ({ type: types.UPDATE_NOTIFICATION_STATUS,params}),

  //confirmSendToFriendResponse: (params) => ({ type: types.SEND_TO_FRIEND_RESPONSE,params}),
}
