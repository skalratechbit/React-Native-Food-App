import React, { Component } from 'react';
import {
  Text,
  Image,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { isIphoneX } from 'react-native-iphone-x-helper';
import { Actions } from 'react-native-router-flux';
import {
  HOME_DRAWER_IMAGE,
  OUR_MENU_DRAWER_IMAGE,
  NOTIFICATIONS_DRAWER_IMAGE, HOME_DELIVERY_DRIVER
} from '../assets/images';
import { DINENGSCHRIFT_REGULAR } from '../assets/fonts';
import strings from '../config/strings/strings';
import { APP_COLOR_BLACK, APP_COLOR_WHITE } from '../config/colors';
import {scale} from 'react-native-size-matters';

const SCREEN_WIDTH = Dimensions.get('window').width;

//custom animations
Animatable.initializeRegistryWithDefinitions({
  bottomNavCropIn: {
    from: {
      paddingTop: 0,
      paddingBottom: 0,
      height: 0
    },
    to: {
      height: 80,
      paddingTop: 20,
      paddingBottom: 20
    }
  }
});

class IphoneXMenu extends Component {
  state = {
    showNav: false
  };

  buttomNavTabs = (() => [
    {
      label: strings.HOME,
      icon: HOME_DRAWER_IMAGE,
      route: 'home'
    },
    {
      label: strings.OUR_MENU,
      icon: OUR_MENU_DRAWER_IMAGE,
      route: 'ourmenu'
    },
    {
      label: strings.MY_ORDERS,
      icon: HOME_DELIVERY_DRIVER,
      route: 'myorders'
    },
    {
      label: strings.NOTIFICATIONS,
      icon: NOTIFICATIONS_DRAWER_IMAGE,
      route: 'notifications'
    }
  ])();

  showNav(how) {
    this.setState({
      showNav: how
    });
  }

  handleMenuButtonPress(event) {
    const {
      data: { route }
    } = this;
    //call route
    Actions[route]();
  }

  renderButton(navData) {
    const { buttomNavTabs } = this;
    const lastButton = buttomNavTabs[buttomNavTabs.length - 1];
    const isLastButton = navData.label == lastButton.label;
    return (
      <View
        key={navData.label}
        style={[styles.buttomNavButton, { borderRightWidth: Number(!isLastButton) }]}
        title={navData.label}>
        <TouchableOpacity
          syle={styles.navTouchAble}
          data={navData}
          onPress={this.handleMenuButtonPress}>
          <Image style={styles.buttomNavIcon} source={navData.icon} resizeMode={'contain'} />
          <Text style={styles.buttomNavText}>{navData.label.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderNavButtons() {
    const { buttomNavTabs } = this;
    return buttomNavTabs.map(navData => this.renderButton(navData));
  }

  render() {
    const isiPhoneX = isIphoneX();
    return (
      <View>
        {
          isiPhoneX /*&& showNav*/ ? (
            <Animatable.View
              style={styles.bottomNav}
              // delay={3e3}
              delay={500}
              animation={'bottomNavCropIn'}
              // duration={1e3}
              delay={200}
              easing="ease-out-expo">
              {this.renderNavButtons()}
            </Animatable.View>
          ) : null
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bottomNav: {
    overflow: 'hidden',
    width: SCREEN_WIDTH,
    height: 80,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: APP_COLOR_BLACK,
    flexDirection: 'row'
  },
  buttomNavButton: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightColor: APP_COLOR_WHITE,
    borderRightWidth: 1
  },
  navTouchAble: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttomNavIcon: {
    alignSelf: 'center',
    maxWidth: 30,
    maxHeight: 30,
    marginBottom: 5
  },
  buttomNavText: {
    alignSelf: 'center',
    color: APP_COLOR_WHITE,
    fontSize: scale(8),
    fontFamily: DINENGSCHRIFT_REGULAR
  }
});

export default IphoneXMenu;
