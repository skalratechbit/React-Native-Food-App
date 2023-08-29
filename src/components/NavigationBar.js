import React, { Component } from 'react';
import { Text, Image, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage'
import { LOGO_BRAND_IMAGE, HEADER_BURGER_MENU_ICON } from '../assets/images';
import { Actions } from 'react-native-router-flux';
import ExtraPopUp from '../screens/deliverydetails/ExtraPopUp';
import { APP_COLOR_WHITE, APP_COLOR_BLACK, APP_COLOR_RED } from '../config/colors';
import { DINENGSCHRIFT_REGULAR, ROADSTER_REGULAR } from '../assets/fonts';
import {
  IF_OS_IS_IOS,
  GET_HEADER_HEIGHT,
  GET_HEADER_PADDINGTOP,
  FONT_SCALLING
} from '../config/common_styles';
import { KEY_RECOMMENDED_SHOWING } from '../config/constants/network_api_keys';
import { Button } from 'native-base';
import { getUserObject } from '../helpers/UserHelper';
import { getThemeByLevel } from '../config/common_styles/appthemes';
import { connect } from 'react-redux';
import PushNotifications from './PushNotifications';

const LOGO_WIDTH = 168;
const LOGO_HEIGHT = 28;
const MENU_ICON_WIDTH = 27;
const MENU_ICON_HEIGHT = 17;
const BURGER_MENU_ICON_PADDING = 30;
const ROADSTER_TEXT_SIZE = 36.5;
const CART_NO_TEXT_SIZE = 18;
const CART_NO_VIEW_SIZE = 21.5;
const CART_WIDTH = 31;
const CART_HEIGHT = 26.5;
const CART_MARGIN_RIGHT = 5;
const DINER_TEXT_SIZE = 10;
const RIGHT_CONTAINER_RIGHT_MARGIN = 10;
const CENTER_ITEM_LEFT_MARGIN = 61;
const NAVBAR_HEIGHT = GET_HEADER_HEIGHT();
const NAVBAR_TOP_PADDING = GET_HEADER_PADDINGTOP();

class NavigationBar extends Component {
  state = {
    cartCount: 0,
    showIcon: null,
    componentTheme: {},
    drawerState: Actions.currentScene,
    extraPopupVisible: false,
    extraPopupMessage: ''
  };
  onDrawPress = () => {
    if (Actions.currentScene === 'DrawerOpen') {
      Actions.drawerClose();
    } else {
      Actions.drawerOpen();
    }
    this.setState({
      drawerState: Actions.currentScene
    })
  };
  async goToCart() {
    let hideRecommended;
    await AsyncStorage.getItem(KEY_RECOMMENDED_SHOWING).then(data => {
      hideRecommended = JSON.parse(data);
    });
    Actions.yourcart({
      hideRecommended
    });
  }

  onCartPress = () => {
    if (this.state.cartCount > 0) {
      if (this.props.userType == 'login' || this.props.userType == 'register') {
        this.goToCart();
      } else {
        this.setState({
          extraPopupVisible: true,
          extraPopupMessage: 'Login to see cart'
        });
        // alert('Login to see cart');
        Actions.register();
      }
    }
  };

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {
    console.log('Cart--->', nextProps.cartItemsCount)
    this.setState({
      cartCount: nextProps.cartItemsCount,
      showIcon: nextProps.cartItemsCount == 0 ? null : 1,
      componentTheme: getThemeByLevel(nextProps.LevelName)
    });
  }

  renderMenuAlertNotify (hasAlertNotify) {
    const { drawerState } = this.state;
    const notOpen = drawerState !== 'DrawerOpen';
    return hasAlertNotify && notOpen ? <View style={styles.alertCircle} /> : null;
  }
  onExtraCross = () => {
    this.setState({ extraPopupVisible: false })
  }

  onExtraAccept = () => {
    // var dateTime = new Date()
    // Moment.locale('en')
    // this.selectOrderTime(1, dateTime, true)
    this.setState({ extraPopupVisible: false })
  };

  render() {
    const {
      containerStyle,
      logoImageStyle,
      cartNumberTextStyle,
      leftIconStyle,
      leftStyle,
      rightStyle,
      cartImageStyle,
      bodyStyle,
      notifyCircle,
      notifyText
    } = styles;

    const { unreadNotifications, sideMenu } = this.props;
    const hasAlertNotify = sideMenu.filter(menu => parseInt(menu.notify) === 1).length > 0
    const {
      componentTheme: { thirdColor }
    } = this.state;
    return (
      <View androidStatusBarColor="transparent" iosBarStyle="light-content" style={containerStyle}>
        <ExtraPopUp
          onCrossPress={this.onExtraCross}
          modalVisibilty={this.state.extraPopupVisible}
          selectedHeading={'UH-OH!'}
          selectedSubHeading={this.state.extraPopupMessage}
          // selectedDetails={this.state.selectedDetails}
          appTheme={this.state.componentTheme}
          onAccept={this.onExtraAccept}
        />
        <View style={leftStyle}>
          {this.props.left ? (
            <Button onPress={this.onDrawPress} transparent>
              {unreadNotifications > 0 ? (
                <View style={[notifyCircle, { backgroundColor: thirdColor }]}>
                  <Text style={notifyText}>{unreadNotifications}</Text>
                </View>
              ) : null}
              {this.renderMenuAlertNotify(hasAlertNotify)}
              <Image style={leftIconStyle} source={HEADER_BURGER_MENU_ICON} />
            </Button>
          ) : null}
          {this.props.center ? (
            <View style={bodyStyle}>
              <Image style={logoImageStyle} source={LOGO_BRAND_IMAGE} />
            </View>
          ) : null}
        </View>
        {this.state.showIcon && (
          <View style={[rightStyle]}>
            {this.props.right && this.state.cartCount > 0 ? (
              <Button onPress={this.onCartPress} transparent>
                <Image style={cartImageStyle} source={this.state.componentTheme.CART_IMAGE} />
                <Text
                  allowFontScaling={FONT_SCALLING}
                  style={[cartNumberTextStyle, { backgroundColor: thirdColor }]}>
                  {this.state.cartCount}
                </Text>
              </Button>
            ) : null}
          </View>
        )}
        <PushNotifications LoyaltyId={this.props.LoyaltyId} />
      </View>
    );
  }
}

const styles = {
  containerStyle: {
    height: NAVBAR_HEIGHT,
    backgroundColor: APP_COLOR_BLACK,
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: NAVBAR_TOP_PADDING
  },
  logoImageStyle: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
    resizeMode: 'contain'
  },
  bodyStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: CENTER_ITEM_LEFT_MARGIN
  },
  cartImageStyle: {
    width: CART_WIDTH,
    height: CART_HEIGHT,
    marginRight: CART_MARGIN_RIGHT
  },
  rightStyle: {
    alignItems: 'center',
    width: null,
    position: 'absolute',
    right: RIGHT_CONTAINER_RIGHT_MARGIN,
    paddingTop: NAVBAR_TOP_PADDING,
    justifyContent: 'flex-end'
  },
  roadsterTextStyle: {
    alignSelf: 'center',
    color: APP_COLOR_WHITE,
    fontSize: ROADSTER_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    paddingTop: IF_OS_IS_IOS ? 10 : 0,
    paddingLeft: 4
  },
  leftIconStyle: {
    width: MENU_ICON_WIDTH,
    height: MENU_ICON_HEIGHT,
    paddingLeft: BURGER_MENU_ICON_PADDING,
    paddingRight: BURGER_MENU_ICON_PADDING,
    resizeMode: 'contain'
  },
  leftStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  cartNumberTextStyle: {
    color: APP_COLOR_WHITE,
    fontSize: CART_NO_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    backgroundColor: APP_COLOR_RED,
    paddingLeft: IF_OS_IS_IOS ? 5 : 5,
    paddingRight: IF_OS_IS_IOS ? 5 : 5,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: IF_OS_IS_IOS ? 12 : 25,
    borderColor: 'red',
    paddingTop: IF_OS_IS_IOS ? 5 : 0,
    overflow: IF_OS_IS_IOS ? 'hidden' : 'visible',
    minWidth: CART_NO_VIEW_SIZE,
    minHeight: CART_NO_VIEW_SIZE
  },
  dinerTextStyle: {
    alignSelf: 'center',
    color: APP_COLOR_WHITE,
    fontSize: DINER_TEXT_SIZE,
    fontFamily: ROADSTER_REGULAR,
    marginLeft: -8,
    transform: [{ rotate: '-90deg' }],
    marginTop: -3
  },
  notifyCircle: {
    backgroundColor: APP_COLOR_RED,
    borderRadius: IF_OS_IS_IOS ? 12 : 25,
    width: 15,
    height: 15,
    position: 'absolute',
    left: 8,
    top: 6,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: IF_OS_IS_IOS ? 3 : 0
  },
  notifyText: {
    color: APP_COLOR_WHITE,
    fontSize: 11,
    fontFamily: DINENGSCHRIFT_REGULAR
  },
  alertCircle: {
    width: 14,
    height: 14,
    backgroundColor: 'red',
    position: 'absolute',
    borderRadius: 6,
    left: 23,
    zIndex: 1
  }
};

function mapStateToProps(state) {
  const { LevelName, LoyaltyId } = getUserObject(state);
  const {
    app: { userType, sideMenu },
    cart: { cartItemsArray = [] },
    notifications: {
      notifications: { TotalUnread = 0 }
    }
  } = state;
  let cartItemsCount = 0;
  cartItemsArray.map(cartItem => {
    cartItemsCount += cartItem?.quantity ? cartItem.quantity : 0
  });

  return {
    sideMenu,
    LevelName,
    LoyaltyId,
    cartItemsCount,
    userType,
    unreadNotifications: TotalUnread
  };
}
export default connect(
  mapStateToProps,
  null
)(NavigationBar);
