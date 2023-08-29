import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import {
  DRAWER_FOOTER_TWITTER_IMAGE,
  DRAWER_FOOTER_FACEBOOK_IMAGE,
  DRAWER_FOOTER_YOUTUBE_IMAGE,
  DRAWER_FOOTER_INSTAGRAM_IMAGE,
} from '../../assets/images';
import { APP_COLOR_GREEN, APP_COLOR_WHITE, APP_COLOR_BLACK } from '../colors';
import strings from '../../config/strings/strings';
import { DrawerMenuButton } from '../../components/DrawerMenuButton';
import { IF_OS_IS_IOS } from '../../config/common_styles';
import { connect } from 'react-redux';
import { actions as homeActions } from '../../ducks/home';
import { actions as setappstateActions } from '../../ducks/setappstate';
import { actions as cartActions } from '../../ducks/cart';
import { getUserObject } from '../../helpers/UserHelper';
import { getThemeByLevel } from '../../config/common_styles/appthemes';

import { bindActionCreators } from 'redux';
import firebase from 'react-native-firebase';
import Common from "../../components/Common";

const FOOTER_HEIGHT = 75;
const FOOTER_SOCIAL_ICON_SIZE = 51;

class DrawerContent extends React.Component {

  state = {
    componentTheme: {},
    alertVisibilty: false,
    alertTitle: '',
  };
  componentDidMount() {

  }
  componentWillReceiveProps(nextProps) {
    //set component's theme
    this.setState({
      componentTheme: getThemeByLevel(nextProps.LevelName)
    });
  }

  loginRegisterNotification(location) {
    this.setState( {
      alertVisibilty: true,
      alertTitle: `Please Log In / Register\nto ${location}`,
    });
  }

  onPress(event, caption, data) {
    const { userType } = this.props;
    const isLoggedInOrRegistered = userType == 'login' || userType == 'register';
    switch (caption.toLowerCase()) {
      case 'home':
        Actions.drawer({ type: 'reset' });
        Actions.home({ drawerMenu: true });
        break;

      case 'ourmenu':
        Actions.ourmenu();
        break;

      case 'favorites':
        {
          if (isLoggedInOrRegistered) {
            Actions.favorites({title:data.title.toUpperCase()});
          } else {
            this.loginRegisterNotification(`see ${strings.FAVORITES}`);
          }
        }
        break;

      case 'squadcorner':
        if (isLoggedInOrRegistered) {
          if (IF_OS_IS_IOS) {
            Actions.drawer({ type: 'reset' });
            Actions.squadcorner();
          } else {
            Actions.squadcorner();
          }
        } else {
          this.loginRegisterNotification('access Loyalty Corner');
        }
        break;

      case 'profile':
        if (isLoggedInOrRegistered) {
          if (IF_OS_IS_IOS) {
            Actions.drawer({ type: 'reset' });
            Actions.edit_profile({ title: data.title.toUpperCase() });
            // Actions.squadcorner();
          } else {
            Actions.edit_profile({ title: data.title.toUpperCase() });
            // Actions.squadcorner();
          }
        } else {
          this.loginRegisterNotification('access Loyalty Corner');
        }
        break;

      case 'myorders':
        if (isLoggedInOrRegistered) {
          if (IF_OS_IS_IOS) {
            Actions.drawer({ type: 'reset' });
            Actions.myorders({ title: data.title.toUpperCase() });
          } else {
            Actions.myorders({ title: data.title.toUpperCase() });
          }
        } else {
          this.loginRegisterNotification('Track Orders');
        }

        break;

      case 'boost_your_stars':
        if (isLoggedInOrRegistered) Actions.boost_your_stars();
        else this.loginRegisterNotification(strings.BOOST_YOUR_STARS);
        break;

      case 'vouchers':
        if (isLoggedInOrRegistered) {
          if (IF_OS_IS_IOS) {
            Actions.drawer({ type: 'reset' });
            Actions.vouchers({ title: data.title.toUpperCase() });
          } else {
            Actions.vouchers({ title: data.title.toUpperCase() });
          }
        } else {
          this.loginRegisterNotification(`see ${strings.VOUCHERS}`);
        }
        break;

      case 'weareat':
        Actions.weareat({ title: data.title.toUpperCase() });
        break;

      case 'about':
        Actions.about({ title: data.title.toUpperCase() });

        break;

      case 'notifications':
        if (isLoggedInOrRegistered) Actions.notifications({title:data.title.toUpperCase()});
        else this.loginRegisterNotification(`view ${strings.NOTIFICATIONS}`);
        break;

      case 'contact':
        {
          if (isLoggedInOrRegistered) {
            Actions.contact({title:data.title.toUpperCase()});
          } else {
            this.loginRegisterNotification(strings.CONTACT_DRAWER);
          }
        }
        break;

      case 'competition':
      case 'competitions':
        if (isLoggedInOrRegistered) {
          Actions.competitions({ MenuLabel: data.title });
        } else {
          this.loginRegisterNotification(strings.COMPETITION);
        }
      break;

      case 'log in': {
        this.props.setUserType('');
        Actions.register();
        // Actions.reset('splash');
        break;
      }
      case 'facebook':
        Linking.openURL('https://www.facebook.com/bartartine');
        break;
      case 'twitter':
        Linking.openURL('https://twitter.com/bar_tartine');
        break;
      case 'instagram':
          Linking.openURL('https://www.instagram.com/bartartine/');
          break;
      case 'youtube':
        Linking.openURL('https://www.youtube.com/channel/UCbXErIYR2HSbxGl-XMvqKoQ');
        break;

      case (strings.LOG_OUT.toLowerCase()):
        {
          this.props.logoutLog();
          firebase.messaging().unsubscribeFromTopic(`/topics/agora_pr_${this.props.LoyaltyId}`);
          Actions.reset('splash', { logout: true });
        }
        break;
      default:
    }
  }

  mapDrawerList() {
    const { componentTheme: { thirdColor } } = this.state;
    const { CustomerId, sideMenu } = this.props;
    return sideMenu
    .filter(menu => parseInt(menu.status === undefined ? 1 : menu.status))
    .map((data, i) => {
      const drawerConfig = {
        color: thirdColor,
        key: i,
        onPress: event => this.onPress(event, data.url, data),
        title: data.title.toUpperCase(),
        imageSource: { uri: data.imageSource },
        width: parseInt(data.width),
        height: parseInt(data.height),
        notify: parseInt(data.notify) === 1,
        action_key: data.url
      };
      if(CustomerId) {
        drawerConfig.showCounter = data.title == strings.NOTIFICATIONS ? true : false;
        drawerConfig.unReadNotificationCount = this.props.notificationsCount;
      }
      return (<DrawerMenuButton {...drawerConfig} iconVisible={false} />);
    });
  }

  render() {
    const {
      container,
      footerStyle,
      socialIconSty,
      // youtubeIcon,
      instragramIcon,
      menuList,
      socialButton
    } = styles;

    const { componentTheme: { thirdColor },
      alertVisibilty,
      alertTitle } = this.state;
    const { CustomerId } = this.props;
    const LOG_VERB = 'LOG' + (CustomerId ? '_OUT' : 'IN');
    const LOG_ACTION = strings[LOG_VERB];
    const logInOutConfig = {
      color: thirdColor,
      key: '',
      onPress: event => this.onPress(event, LOG_ACTION),
      title: LOG_ACTION.toUpperCase(),
      imageSource: ''
    };
    return (
      <View style={container}>
        <ScrollView style={menuList}>
          {this.mapDrawerList()}
          <Common.Popup
              onClose={() => {
                this.setState({
                  alertVisibilty: false,
                  alertTitle: ''
                });
              }}
              color={thirdColor}
              visibilty={alertVisibilty}
              heading={alertTitle}

          />
          {<DrawerMenuButton noBorder {...logInOutConfig} iconVisible={false}/>}
        </ScrollView>
        <View style={[footerStyle, { backgroundColor: APP_COLOR_BLACK }]}>
          <TouchableOpacity style={socialButton} onPress={event => this.onPress(event, strings.FACEBOOK)}>
            <Image style={socialIconSty} source={DRAWER_FOOTER_FACEBOOK_IMAGE} />
          </TouchableOpacity>
          <TouchableOpacity style={socialButton} onPress={event => this.onPress(event, strings.TWITTER)}>
            <Image style={socialIconSty} source={DRAWER_FOOTER_TWITTER_IMAGE} />
          </TouchableOpacity>
          <TouchableOpacity style={socialButton} onPress={event => this.onPress(event, strings.INSTAGRAM)}>
            <Image style={[socialIconSty, instragramIcon]} source={DRAWER_FOOTER_INSTAGRAM_IMAGE} />
          </TouchableOpacity>
          <TouchableOpacity style={socialButton} onPress={event => this.onPress(event, strings.YOUTUBE)}>
            <Image style={socialIconSty} source={DRAWER_FOOTER_YOUTUBE_IMAGE} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
const styles = {
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    position: 'relative',
    backgroundColor: APP_COLOR_BLACK,
  },
  lineStyle: {
    height: 1,
    width: '100%',
    backgroundColor: APP_COLOR_WHITE
  },
  menuList: {
    flex: 10
  },
  footerStyle: {
    borderBottomWidth: 1,
    borderBottomColor: APP_COLOR_WHITE,
    // justifyContent: "space-between",
    flexDirection: "row",
    padding: 10,
    paddingTop: 10,
    paddingBottom: 10,
    height: FOOTER_HEIGHT,
    backgroundColor: APP_COLOR_GREEN,
    justifyContent: 'center',
    alignItems: 'center'
  },
  socialButton: {
    flex: 1,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center"
  },
  socialIconSty: {
    width: FOOTER_SOCIAL_ICON_SIZE,
    height: FOOTER_SOCIAL_ICON_SIZE,
    resizeMode: 'contain'
  },
  instragramIcon: {
    width: 53,
    height: 38
  }
};

function mapStateToProps(state) {
  const { LoyaltyId = 0, LevelName, CustomerId } = getUserObject(state);
  const {
    app: { loading, userType, sideMenu },
    home: { userOrdersCount = { data: [], total: 0 } },
    notifications: { notifications: { TotalUnread = 0 } }
  } = state;

  return {
    sideMenu,
    CustomerId,
    userType,
    LoyaltyId,
    LevelName,
    loadingState: loading,
    historyData: userOrdersCount.data,
    notificationsCount: TotalUnread,
  };
}

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      ...homeActions,
      ...setappstateActions,
      ...cartActions
    },
    dispatch
  )
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DrawerContent);
