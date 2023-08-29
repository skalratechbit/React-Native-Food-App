import React, { Component } from 'react';
import {
  Text,
  View,
  ImageBackground,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity
} from 'react-native';
import {scale} from 'react-native-size-matters';
import { connect } from 'react-redux';
import { Logo, CommonInput } from '../../components';
import CommonLoader from '../../components/CommonLoader';
import ExtraPopUp from '../deliverydetails/ExtraPopUp';
import { BACKGROUND_IMAGE } from '../../assets/images';

import { APP_COLOR_WHITE } from '../../config/colors';
import {
  DINENGSCHRIFT_REGULAR,
  ROADSTER_REGULAR,
  HELVETICANEUE_LT_STD_CN,
  DINENGSCHRIFT_BOLD
} from '../../assets/fonts';
import strings from '../../config/strings/strings';
import { Button } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { bindActionCreators } from 'redux';
import {
  COMMON_BUTTON_STYLE,
  COMMON_BUTTON_TEXT_STYLE,
  COMMON_BOTTOM_CLICKABLE_TEXT_STYLE,
  COMMON_OVERLAY_VIEW_STYLE,
  COMMON_REGISTER_LOGIN_FLOW_TEXT_STYLE,
  BUTTON_WIDTH,
  COMMON_BOTTOM_UNDERLINED_TEXT_TOP_MARGIN,
  COMMON_MARGIN_BETWEEN_COMPONENTS,
  COMMON_BACKGROUND_IMAGE_CONTAINER_STYLE,
  USER_INPUTS_ERROR_TEXT_STYLE,
  FONT_SCALLING,
  SCREEN_WIDTH,
  SCREEN_HEIGHT
} from '../../config/common_styles';
import { actions } from '../../ducks/register';
import { actions as appstateAction } from '../../ducks/setappstate';
import { IF_OS_IS_IOS } from '../../config/common_styles';
import { MOBILE_DEVICE_ID } from '../../config/constants/network_api_keys';
import { ORGANIZATION_ID } from '../../config/constants/network_constants';
import DeviceInfo from 'react-native-device-info';

const LOGIN_TEXT_SIZE = 34.2;
class Pincode extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pinCode: '',
      loading: false,
      userData: {},
      resending: false,
      validationMessage: '',
      macAddress: ''
    };
  }
  componentDidMount() {
    this.resetInitialData();
    if(!IF_OS_IS_IOS)
      DeviceInfo.getMacAddress()
        .then(macAddress => this.setState({ macAddress }));
  }

  componentWillReceiveProps(newProps) {
  }

  resetInitialData() {
    this.setState({
      resending: false
    });
  }

  resendEnabler() {
    setTimeout(() => {
      this.setState({
        resending: false
      });
    }, 2e3);
  }

  getData() {
    const formdataresend = new FormData();
    const { ACCESS_TOKEN } = this.props;
    formdataresend.append('token', ACCESS_TOKEN);
    formdataresend.append('MobileNumber', this.props.MobileNumber);
    formdataresend.append('CountryCode', this.props.CountryCode);
    formdataresend.append('RequestId', this.props.RequestId);
    formdataresend.append('OrgId', String(ORGANIZATION_ID));

    return formdataresend;
  }

  onPress = (event, caption) => {
    switch (caption) {
      case strings.CONTINUE:
        const {
          pinCode: validPinCode,
          RequestId,
          CountryCode,
          MobileNumber,
          ACCESS_TOKEN
        } = this.props;
        const { pinCode: enteredPinCode, macAddress } = this.state;
        const isValidPin = Number(enteredPinCode);
        const hasEnteredPin = enteredPinCode.trim() !== '';
        let validationMessage = '';
        if (!isValidPin) validationMessage = 'Your Pin Code is invalid.';
        if (!hasEnteredPin) validationMessage = 'Please enter your Pin Code.';
        this.setState({ validationMessage });
        if (!isValidPin || !hasEnteredPin) return;
        else {
          //submit form data
          const formdata = new FormData();
          formdata.append('token', ACCESS_TOKEN);
          formdata.append('CountryCode', CountryCode);
          formdata.append('MobileNumber', MobileNumber);
          formdata.append('PinCode', enteredPinCode); //this.props.pinCode
          formdata.append('RequestId', RequestId);
          formdata.append('MobileDeviceId', MOBILE_DEVICE_ID);
          formdata.append('organization_id', String(ORGANIZATION_ID));
          if(!IF_OS_IS_IOS)
            formdata.append('MacAddress', macAddress);
          this.props.confirmSignup(formdata);
        }
        break;

      case strings.RESEND_CODE:
        this.setState({ resending: true });
        this.resendEnabler();
        this.props.getResendCodeFromServer(this.getData());
        break;

      case strings.BACK:
        Actions.pop();
      default:
    }
  };

  clearValidationMessage = () => {
    this.setState({ validationMessage: '' });
  };

  render() {
    const {
      subContainer,
      errorTextStyle,
      outTouchStyle
    } = styles;
    const { resending, validationMessage, componentTheme } = this.state;
    const { commonError } = this.props
    return (
      <ImageBackground style={COMMON_BACKGROUND_IMAGE_CONTAINER_STYLE} source={BACKGROUND_IMAGE}  resizeMode="stretch">
        <View style={COMMON_OVERLAY_VIEW_STYLE} />
        <ExtraPopUp
          onCrossPress={() => this.props.disableError()}
          modalVisibilty={this.props.commonError.status}
          selectedHeading={commonError.message && commonError.message.includes('Success') ? ' ' : 'UH-OH!'}
          selectedSubHeading={this.props.commonError.message}
          onAccept={() => this.props.disableError()}
        />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={outTouchStyle}>
            {this.props.loadingState && <CommonLoader />}

            <View style={subContainer}>
              <Logo />
            </View>
            <View style={subContainer}>
              <Text
                allowFontScaling={FONT_SCALLING}
                style={[
                  COMMON_REGISTER_LOGIN_FLOW_TEXT_STYLE,
                  { fontFamily: DINENGSCHRIFT_REGULAR }
                ]}>
                {strings.ENTER_THE_PIN_CODE.toUpperCase()}
              </Text>
            </View>

            <View style={subContainer}>
              <CommonInput
                placeholder={`${strings.PIN_CODE.toUpperCase()}*`}
                value={this.state.pinCode}
                onChangeText={pinCode => this.setState({ pinCode })}
                onFocus={this.clearValidationMessage}
                autoFocus
                keyboardType="phone-pad"
                textContentType="oneTimeCode"
              />
              <Text
                allowFontScaling={FONT_SCALLING}
                style={[USER_INPUTS_ERROR_TEXT_STYLE, errorTextStyle]}>
                {validationMessage}
              </Text>
            </View>
            <View style={subContainer}>
              <Button
                disabled={!!this.props.loadingState}
                onPress={event => this.onPress(event, strings.CONTINUE)}
                style={COMMON_BUTTON_STYLE}>
                <Text
                  allowFontScaling={FONT_SCALLING}
                  style={[COMMON_BUTTON_TEXT_STYLE, { fontFamily: ROADSTER_REGULAR, fontSize: scale(15) }]}>
                  {strings.CONTINUE.toUpperCase()}
                </Text>
              </Button>
            </View>

            <TouchableOpacity
              disabled={resending}
              onPress={event => this.onPress(event, strings.RESEND_CODE)}
              style={[
                subContainer,
                { marginTop: COMMON_BOTTOM_UNDERLINED_TEXT_TOP_MARGIN },
                { opacity: resending ? 0.5 : 1 }
              ]}>
              <Text
                allowFontScaling={FONT_SCALLING}
                style={[
                  COMMON_BOTTOM_CLICKABLE_TEXT_STYLE,
                  { fontFamily: DINENGSCHRIFT_BOLD }
                ]}>
                {strings.RESEND_CODE.toUpperCase()}
              </Text>
            </TouchableOpacity>

            <View style={[{ height: 52, alignSelf: 'center', marginTop: 20 }]}>
              <TouchableOpacity
                onPress={event => this.onPress(event, strings.BACK)}
                style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  allowFontScaling={FONT_SCALLING}
                  style={[
                    COMMON_BOTTOM_CLICKABLE_TEXT_STYLE,
                    { fontFamily: DINENGSCHRIFT_BOLD }
                  ]}>
                  {strings.BACK.toUpperCase()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ImageBackground>
    );
  }
}

const styles = {
  outTouchStyle: {
    width: SCREEN_WIDTH + 1,
    height: SCREEN_HEIGHT + 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  backTextStyle: {
    fontSize: 30,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    color: APP_COLOR_WHITE
  },
  arrowImageStyle: {
    marginEnd: 5,
    marginBottom: IF_OS_IS_IOS ? 8 : 0
  },
  container: {
    flex: 1,
    // remove width and height to override fixed static size
    width: null,
    height: null,
    alignItems: 'center',
    justifyContent: 'center'
  },
  subContainer: {
    backgroundColor: 'transparent',
    marginBottom: COMMON_MARGIN_BETWEEN_COMPONENTS,
    marginTop: COMMON_MARGIN_BETWEEN_COMPONENTS
  },
  forgotPasswordSubContainer: {
    backgroundColor: 'transparent',
    marginBottom: COMMON_MARGIN_BETWEEN_COMPONENTS,
    width: BUTTON_WIDTH,
    marginStart: 25
  },
  loginTextStyle: {
    alignSelf: 'center',
    color: APP_COLOR_WHITE,
    fontSize: LOGIN_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    textAlign: 'center'
  },
  errorTextStyle: {
    textAlign: 'center',
    paddingTop: 2
  },
  isMandatoryStyle: {
    color: 'white',
    marginTop: 10,
    textAlign: 'left',
    // alignSelf: 'flex-start'
  }
};
function mapStateToProps(state) {
  return {
    ACCESS_TOKEN: state.app.accessToken,
    loadingState: state.app.loading,
    apiname: state.app.apiname,
    commonError: state.app.commonError
  };
}
const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      ...actions,
      ...appstateAction
    },
    dispatch
  )
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Pincode);
