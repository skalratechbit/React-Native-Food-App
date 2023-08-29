import React, { Component } from 'react';

import { AppState } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { actions } from '../ducks/setappstate';
import firebase from 'react-native-firebase';
import { connect } from 'react-redux';
import type { RemoteMessage, Notification, NotificationOpen } from 'react-native-firebase';

class PushNotifications extends Component {

  constructor(props) {
    super(props);
    this.state = {
      inited: false,
      LoyaltyId: null,
      backgroundNotification: null,
      appState: 'active'
    };
  }

  componentDidMount() {
    const { LoyaltyId } = this.props;
     console.log('MOUNTING NOTIFICATIONS', LoyaltyId);

     if(LoyaltyId)
      this.initializeNotifications(LoyaltyId);
  }

  componentWillReceiveProps(nextProps) {
    const { LoyaltyId: nextLoyaltyId } = nextProps;
    const { inited, LoyaltyId } = this.state;
    if (nextLoyaltyId && nextLoyaltyId != LoyaltyId && !inited) {
      //mark as initialized
      this.setState(
        {
          inited: true,
          LoyaltyId
        },
        () => this.initializeNotifications(nextLoyaltyId)
      );
    }
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppState);
  }

  async initializeNotifications(LoyaltyId) {
    this.FCM = FCM = firebase.messaging();
    this.FBN = FBN = firebase.notifications();
    const enabled = await FCM.hasPermission();
    if(!enabled) {
      try {
        // requests permissions from the user
        FCM.requestPermission();
      } catch(e) {
        //alert("Failed to grant permission")
      }
    }
    console.log('LoyaltyId', LoyaltyId);
    FCM.getToken().then(this.handleGotToken);
    FCM.subscribeToTopic('/topics/agora_p_21');
    FCM.subscribeToTopic(`/topics/agora_pr_${LoyaltyId}`);
    FCM.onMessage(this.handleMessage);
    FBN.onNotification(this.handleNotification);
    FBN.onNotificationOpened(this.handleNotificationOpened);
    FBN.getInitialNotification().then(this.handleInitialNotification);

    AppState.addEventListener('change', this.handleAppState);

  }

  //handlers
  handleGotToken = (token) => {
    // gets the device's push token
    console.log('firebase push token', token);
    if (token) {
      this.props.sendFireBaseToken(token);
    }
  }

  handleInitialNotification = (notificationOpen: NotificationOpen) => {
    console.log('INIT NOtification', this.props.pnInited, notificationOpen);
    if (notificationOpen && this.props.pnInited == false) {
      // Get information about the notification that was opened
      const notification: Notification = notificationOpen.notification;
      console.log('notification object', this.props.pnInited, notification);
      this.handleNotificationRedirection(notification);
      this.props.setPnInited(true);
    }
  }

  handleNotificationOpened = (notificationOpen: NotificationOpen) => {
     console.log('On Notification Opened', notificationOpen);
    if (notificationOpen) {
      // Get information about the notification that was opened
      const notification: Notification = notificationOpen.notification;
       console.log('notification object', notification);
       this.handleNotificationRedirection(notification);
    }
  }

  handleNotificationRedirection = notification => {
    const { _data}  = notification;
    if(_data) {
      console.log('Notification Object RAW', _data);
      const NotificationObject = _data;
      const { screen_redirect } = NotificationObject;
      console.log('Notification Object JSON', NotificationObject);
      const isHome = screen_redirect == 'home';
      const homeReset = { drawerMenu: true };
      console.log('RedirectionUrl from JSON', screen_redirect);
      if(screen_redirect) Actions[screen_redirect.toLowerCase()](isHome ? homeReset : null);
      else Actions.notifications();
    }
  }

  handleMessage = (message: RemoteMessage) => {
     console.log('handleMessage: SHOULD DISPLAY THIS MESSAGE HERE', message);
     // alert('HandleMessage from RemoteMessage');
  }

  handleNotification = (notification: Notification) => {
     console.log('handleNotification', notification);
    const { currentScene } = Actions;
    //show the noitification if the user is not on the my orders or noitifications screen
    const showNotifacation = !currentScene.match(/myorders|notifications/);
    if(showNotifacation) {
      try {
        // Actions.notifications();
        // new firebase.notifications.Notification()
        // .setNotificationId(notification._notificationId)
        // .setTitle(notification._title)
        // .setBody(notification._body)
        // .setData(notification._data)
        // FBN.displayNotification(notification);
      } catch(e) {
        console.info(e);
      }
    }
  }

  handleAppState = (newState) => {
     console.log('APP STATE CHANGE', newState);
    const { backgroundNotification } = this.state;
    const state = { appState: newState };
    if (newState === 'active' && backgroundNotification != null) {
       console.log('WOULD SHOW NOTIFICATION HERE from app background to active', backgroundNotification);
      state.backgroundNotification = null;
    }
    this.setState(state);
  }

  render() {
    return null;
  }
}

function mapStateToProps(state) {
  const { app: { pnInited } } = state;
  return {
    pnInited
  };
}
export default connect(
  mapStateToProps,
  actions
)(PushNotifications);
