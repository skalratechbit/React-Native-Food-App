import React, { Component } from 'react';

import { Platform } from 'react-native';
import { Actions } from 'react-native-router-flux';

import FCM, {
  FCMEvent,
  RemoteNotificationResult,
  WillPresentNotificationResult,
  NotificationType
} from 'react-native-fcm';

export default class PushNotifications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inited: false,
      LoyaltyId: null
    };
  }

  componentDidMount() {
    console.log('MOUNTING NOTIFICATIONS', this.props.LoyaltyId);
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

  async initializeNotifications(LoyaltyId) {
    await FCM.requestPermissions();

    const topic = 'agora_p_21';
    console.log('LoyaltyId', LoyaltyId);
    FCM.subscribeToTopic('/topics/agora_p_21');
    FCM.subscribeToTopic('/topics/agora_pr_' + LoyaltyId);

    // FCM.getFCMToken().then(token => {
    //   console.log('FCM Token (getFCMToken)', token);
    // });

    // FCM.getInitialNotification().then(notif => {
    //   console.log('INITIAL NOTIFICATION', notif);
    // });

    this.notificationListner = FCM.on(FCMEvent.Notification, async notif => {
      console.log('Notification', notif);
      if (notif.local_notification) {
        //return;
      }
      if (notif.opened_from_tray) {
        console.log('OPENED SENT NOTIFICATION FROM TRAY');
        if (
          (notif['google.sent_time'] && notif['google.message_id']) ||
          (notif.id && notif.title)
        ) {
          //if it has a sent time and message id or title then go to notification
          Actions.notifications();
        }
        return;
      }
      console.log('Platform.OS', Platform.OS);
      if (Platform.OS === 'ios') {
        //optional
        //iOS requires developers to call completionHandler to end notification process. If you do not call it your background remote notifications could be throttled, to read more about it see the above documentation link.
        //This library handles it for you automatically with default behavior (for remote notification, finish with NoData; for WillPresent, finish depend on "show_in_foreground"). However if you want to return different result, follow the following code to override
        //notif._notificationType is available for iOS platfrom
        switch (notif._notificationType) {
          case NotificationType.Remote:
            console.log('notif', notif);
            notif.finish(RemoteNotificationResult.NewData); //other types available: RemoteNotificationResult.NewData, RemoteNotificationResult.ResultFailed
            break;
          case NotificationType.NotificationResponse:
            console.log('notif', notif);
            notif.finish();
            break;
          case NotificationType.WillPresent:
            console.log('notif', notif);
            notif.finish(WillPresentNotificationResult.All); //other types available: WillPresentNotificationResult.None
            break;
        }
      }
      // this.showLocalNotification(notif);
    });

    this.refreshTokenListener = FCM.on(FCMEvent.RefreshToken, token => {
      console.log('FCM Token (refreshUnsubscribe)', token);
    });
    FCM.enableDirectChannel();
    this.channelConnectionListener = FCM.on(FCMEvent.DirectChannelConnectionChanged, data => {
      console.log('direct channel connected', data);
    });

    //   FCM.requestPermissions()
    // .then(() => {
    //   FCM.enableDirectChannel();
    //     FCM.getFCMToken().then(() => FCM.subscribeToTopic('/topics/agora_p_21'));
    //   FCM.getInitialNotification().then((notif) => {
    //
    //     FCM.presentLocalNotification({
    //       title: "notif.title",
    //       body: notif.body,
    //       priority: "high",
    //       click_action: "notif.click_action",
    //       show_in_foreground: true,
    // 	    local: true
    // });
    //   });
    //   console.log("options");
    //
    // });
  }

  showLocalNotification(notif) {
    console.log('', notif);
    FCM.presentLocalNotification({
      title: notif.title,
      body: notif.body,
      priority: 'high',
      click_action: notif.click_action,
      show_in_foreground: true,
      local: true
    });
  }

  render() {
    return null;
  }
}
