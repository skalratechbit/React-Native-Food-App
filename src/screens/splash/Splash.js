import React, { Component } from 'react';
import {
  ImageBackground,
  StatusBar,
  AppState,
  BackHandler
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from "@react-native-community/netinfo";
import { Actions } from 'react-native-router-flux';
import { bindActionCreators } from 'redux';
import {SPLASH_IMAGE} from '../../assets/images';
import { COMMON_BACKGROUND_IMAGE_CONTAINER_STYLE, IF_OS_IS_IOS } from '../../config/common_styles';
import {connect} from 'react-redux';
import { THEME_LEVEL_1 } from '../../config/common_styles/appthemes';
import { actions as appActions } from '../../ducks/setappstate';
import { actions as registerActions } from '../../ducks/register';
import { actions as deliveryActions } from '../../ducks/deliverydetails';
import {
  KEY_USERINFO_AT_CONFIRMSIGNUP,
  KEY_USERINFO_AT_REGISTER,
  USER_TYPE_LOGIN,
  USER_TYPE_REGISTER,
  KEY_USER_CONTACTS
} from '../../config/constants/network_api_keys';
import { actions as homeActions } from '../../ducks/home';
import { actions as cartActions } from '../../ducks/cart';
import { Bubbles } from 'react-native-loader';
import { ORGANIZATION_ID } from '../../config/constants/network_constants';
import Common from "../../components/Common";

class Splash extends Component {


  constructor(props) {
    super(props);
    this.state = { visibilty: false };
  }
  handleConnectionChange = connectionInfo => {
    let isonline = connectionInfo.type !== 'none';
    try {
      this.props.setIsConnected(isonline);
    } catch (e) {
      const { currentState } = AppState;
      //only show dialog if app is active
      if(currentState === 'active')
        this.setState({
          visibilty: true,
        });
    }
  };

  componentWillUnmount() {
    clearTimeout(this.timeoutHandle);
    StatusBar.setHidden(false);
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }
  async componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);

    if (this.props.logout && this.props.logout == true) {
      this.props.clearCart();
      this.props.setUserType('');
      AsyncStorage.clear();
      this.props.setLogindatafromLocalStorageToReduxStore({});
      this.props.setRegisteratafromLocalStorageToReduxStore({});
    }

    //this.props.setCurrency('LBP');
    // NetInfo.addEventListener('connectionChange', this.handleConnectionChange);
    const unsubscribe = NetInfo.addEventListener(this.handleConnectionChange);

    // Unsubscribe
    unsubscribe();

    //AsyncStorage.clear();
    var loginDBData;
    await AsyncStorage.getItem(KEY_USERINFO_AT_CONFIRMSIGNUP).then(
      data => (loginDBData = JSON.parse(data))
    );
    var registerDBData;
    await AsyncStorage.getItem(KEY_USERINFO_AT_REGISTER).then(
      data => (registerDBData = JSON.parse(data))
    );

    const userData = ((
      registerDBData &&
      registerDBData.data &&
      registerDBData.data[0]
      ? registerDBData.data[0].loyalty
      : 0
    ) || (
      loginDBData &&
      loginDBData.data &&
      loginDBData.data.customer
      ? loginDBData.data.customer
      : 0
    ));

    const { CustomerId, LevelName } = (userData || { CustomerId: 'guest' });
    let fetchToken = true;
    let accessToken;
    console.log('CustomerId', CustomerId, userData);
    await AsyncStorage.getItem('ACCESS_TOKEN').then(data => {
      console.log('ACCESS_TOKEN', data);
      const isJSON = String(data).match(/\{/);
      const isToken = String(data).length > 10;
      if(isJSON) {
        const { token, id: tokenId } = JSON.parse(data);
        if(ORGANIZATION_ID == tokenId) {
          //set token for this user since its correct
          accessToken = token;
        }
      }
      console.log('setting ACCESS_TOKEN?', accessToken);
      if(accessToken) this.props.setAccessToken(accessToken);
      else fetchToken = true;
    });
    if(fetchToken) {
      console.log('fetching access token', CustomerId);
      await this.props.getAccessToken({ CustomerId });
    }

    if (!IF_OS_IS_IOS)
      StatusBar.setHidden(true);

    if(!userData) {
      this.props.setUserType(' ');
      Actions.welcome({ type: 'reset' });
      return;
    } else {
      // set user
      if(registerDBData)
        this.props.setRegisteratafromLocalStorageToReduxStore(registerDBData);
      else if(loginDBData)
        this.props.setLogindatafromLocalStorageToReduxStore(loginDBData);

      // set theme
      this.setUsertheme(LevelName);
    }

    const isLoggedInUser = loginDBData.type == USER_TYPE_LOGIN;
    const userType = isLoggedInUser ? USER_TYPE_LOGIN : USER_TYPE_REGISTER;
    this.props.setUserType(userType);
    const { data: { PaymentMethods = [] } } = loginDBData || {};
    if(PaymentMethods)
      this.props.setPaymentMethods(PaymentMethods);

    if(isLoggedInUser)
      this.props.setLogindatafromLocalStorageToReduxStore(loginDBData);
    else
      this.props.setRegisteratafromLocalStorageToReduxStore(registerDBData);

    //User contacts
    let contacts;
    await AsyncStorage.getItem(KEY_USER_CONTACTS).then(data => (contacts = data ? JSON.parse(data) : []));
    this.props.setUserContact(contacts);

    setTimeout(() => {
      //wait a little for access token
      Actions.drawer({ type: 'reset', fromSplash: true });
    }, accessToken ? 4 : 2500);
    //else Actions.welcome({ type: 'reset' });

    if (!IF_OS_IS_IOS)
      StatusBar.setHidden(false);
  }

  handleBackPress = () => {
    return true;
  }

  setUsertheme = LevelName => {
    let theme = THEME_LEVEL_1;
    // if (LevelName == 'Champion') {
    //   theme = THEME_LEVEL_2;
    // } else if(LevelName == 'Hero') {
    //   theme = THEME_LEVEL_3;
    // }
    AsyncStorage.setItem('theme', JSON.stringify(theme));
  };

  render() {
    const { container, subContainer } = styles;
    return (
      <ImageBackground
        style={COMMON_BACKGROUND_IMAGE_CONTAINER_STYLE}
        source={SPLASH_IMAGE}
        resizeMode="stretch"
      >
        <Common.Popup
            onClose={()=>{this.setState({visibilty:false});}}
            // color={thirdColor}
            visibilty={this.state.visibilty}
            heading={'There is a network issue. Ensure you have a stable connection.'}
            // customBody
        />
        <Bubbles size={0} />
      </ImageBackground>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    // remove width and height to override fixed static size
    width: null,
    height: null,
    alignItems: 'center',
    justifyContent: 'center'
  },
  subContainer: {
    position: 'absolute',
    backgroundColor: 'transparent'
  }
};

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      ...appActions,
      ...registerActions,
      ...homeActions,
      ...cartActions,
      ...deliveryActions
    },
    dispatch
  )
});
function mapStateToProps(state) {
  const { app: { userContact = [] } } = state;
  return { userContact };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Splash);
