import React, { Component } from 'react';
import {
  TextInput,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import {scale} from 'react-native-size-matters';
import AsyncStorage from '@react-native-community/async-storage';
import CommonLoader from '../../components/CommonLoader';
import { Logo, CommonInput } from '../../components';
import ExtraPopUp from '../deliverydetails/ExtraPopUp';
import {
  BACKGROUND_IMAGE,
  FLAG_IMAGE,
  EGYPT_FLAG_IMAGE,
  SYRIA_FLAG_IMAGE,
  UAE_FLAG_IMAGE
} from '../../assets/images';

import { APP_COLOR_BLACK, APP_COLOR_WHITE } from '../../config/colors';
import {
  DINENGSCHRIFT_REGULAR,
  ROADSTER_REGULAR,
  HELVETICANEUE_LT_STD_CN,
  DINENGSCHRIFT_BOLD
} from '../../assets/fonts';
import strings from '../../config/strings/strings';
import { Button, Item } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import {
  IF_OS_IS_IOS,
  FONT_SCALLING,
  SCREEN_WIDTH,
  SCREEN_HEIGHT
} from '../../config/common_styles';
import { MOBILE_DEVICE_ID } from '../../config/constants/network_api_keys';
import { getThemeByLevel } from '../../config/common_styles/appthemes';
import {
  COMMON_BUTTON_STYLE,
  COMMON_BUTTON_TEXT_STYLE,
  COMMON_BOTTOM_CLICKABLE_TEXT_STYLE,
  COMMON_INPUT_STYLE,
  BUTTON_WIDTH,
  INPUT_HEIGHT,
  COMMON_BUTTON_RADIOUS,
  COMMON_OVERLAY_VIEW_STYLE,
  COMMON_MARGIN_BETWEEN_COMPONENTS,
  COMMON_BACKGROUND_IMAGE_CONTAINER_STYLE,
  USER_INPUTS_ERROR_TEXT_STYLE
} from '../../config/common_styles';
import { bindActionCreators } from 'redux';
import { actions as registerActions } from '../../ducks/register';
import { ORGANIZATION_ID } from '../../config/constants/network_constants';
import {
  KEY_TOKEN,
  KEY_ORGANIZATION_ID,
  KEY_MOBILE_NUMBER,
  KEY_COUNTRY_CODE,
  KEY_EMAIL,
  KEY_CARD_CODE,
  KEY_MOBILE_DEVICE_ID
} from '../../config/constants/network_api_keys';
import { validate } from '../../config/common_functions';
import { actions as appstateAction } from '../../ducks/setappstate';
import PhoneInput from 'react-native-phone-input';
import Countries from  '../../json/countries.json';

const LOGIN_TEXT_SIZE = 34.2;

const countries = [
  {
    ID: '0',
    value: '0',
    label: 'Labnan',
    image: FLAG_IMAGE
  },
  {
    ID: '1',
    value: '1',
    label: 'Egypt',
    image: EGYPT_FLAG_IMAGE
  },
  {
    ID: '2',
    value: '2',
    label: 'Syria',
    image: SYRIA_FLAG_IMAGE
  },
  {
    ID: '3',
    value: '3',
    label: 'UAE',
    image: UAE_FLAG_IMAGE
  }
];

class Register extends Component {
  state = {
    selectedCountryCode: countries[0].value,
    selectedImage: countries[0].image,
    mobile: '',
    email: '',
    loyaltyCardNumber: '',
    error: '',
    loading: false,
    componentTheme: getThemeByLevel('challenger'),
    isConfirming: false
  };

  componentDidMount() {
    this.setInitialStateData();
  }

  setInitialStateData() {
    const countryCode = this.phoneInput.getCountryCode();
    this.setState({
      selectedCountryCode: countryCode,
      countryData: this.phoneInput.getPickerData(),
      isConfirming: false
    });
  }

  validateUserInputs() {
    let InputError = null;
    const countryCode = this.phoneInput.getCountryCode();
    const { mobile, email } = this.state;
    const validatedMobile = validate('string', mobile.trim(), 'Mobile Number');
    const validatedEmail = validate('email', email.trim(), 'Email');
    const firstDigit = mobile.substr(0, 1);

    if(mobile.trim() == '') {
      InputError = ' Mobile Number cannot be empty';
    } else if(email.trim() == '') {
      InputError = ' Email canot be empty';
    } else if (this.state.mobile.length < 7) {
      InputError = ' Mobile Number Minimum length is 7';
    } else if (countryCode == 961) {
      //for Lebanon numbers
      if(mobile.length < 8 && firstDigit != 3) {
        InputError = ' Enter the 8 digit Lebanon Mobile Number';
      } else if (mobile.length > 8) {
        InputError = ' Only 8 digits needed for your Mobile Number';
      }
    } else if (validatedEmail) {
      InputError = validatedEmail;
    } else if (validatedMobile) {
      InputError = validatedMobile;
    }

    this.setState({ error: InputError });
    return InputError;
  }

  getUserInputsData() {
    const { selectedCountryCode, mobile, email, loyaltyCardNumber } = this.state;
    const mobileNumber = mobile.trim().replace(/^0+/, '');
    const formData = new FormData();
    const { ACCESS_TOKEN } = this.props;

    formData.append(KEY_TOKEN, ACCESS_TOKEN);
    formData.append(KEY_COUNTRY_CODE, selectedCountryCode);
    formData.append(KEY_MOBILE_NUMBER, selectedCountryCode + mobileNumber);
    formData.append(KEY_ORGANIZATION_ID, ORGANIZATION_ID);
    formData.append(KEY_EMAIL, email ? email.toLowerCase() : '');
    formData.append(KEY_CARD_CODE, loyaltyCardNumber);
    formData.append(KEY_MOBILE_DEVICE_ID, MOBILE_DEVICE_ID);

    AsyncStorage.setItem(KEY_CARD_CODE, loyaltyCardNumber);
    return formData;
  }

  onValueChange(value) {}

  onPress = (event, caption) => {
    switch (caption) {
      case strings.FORGOT_PASSWORD:
        break;

      case strings.BACK:
        Actions.pop();
        break;

      case strings.CONFIRM:
        if (!this.validateUserInputs()) {
          this.setState({ isConfirming: true });
          this.confirmEnabler();
          this.props.getPinCodeFromServer(this.getUserInputsData());
        }
        break;
    }
  };

  confirmEnabler() {
    setTimeout(() => {
      this.setState({ isConfirming: false });
    }, 2e3);
  }

  handleKeyDown = e => {
    const regex = /[0-9]/;
    if (e.nativeEvent.key != 'Backspace') {
      if (regex.test(e.nativeEvent.key)) {
        const number = this.state.mobile + e.nativeEvent.key;
        this.setState({ mobile: number });
      }
    } else {
    }
  };

  onChangeMobileNumber(mobile) {
    this.setState({ mobile: this.state.mobile });
  }

  selectCountry = country => {
    const countryCode = this.phoneInput.getCountryCode();
    this.setState(
      {
        selectedCountryCode: countryCode
      },
      () => {
        this.MobileInput.focus();
      }
    );
  };

  onPressFlag(event) {
    this.countryPicker.openModal();
  }

  handleSetPhoneInputRef = ref => {
    this.phoneInput = ref;
  }

  onExtraAccept = () => {
    this.props.disableError()
  };

  onExtraCross = () => {
    this.props.disableError()
  }

  render() {
    const {
      subContainer,
      inputStyle,
      flagStyle,
      phoneInputStyle,
      phoneInputTextStyle,
      noBottomBorder,
      footStyle,
      isMandatoryStyle,
      outTouchStyle
    } = styles;

    const { isConfirming, selectedCountryCode } = this.state;

    const deviceCountry = 'lb';
    const initialCountry = 'lb'; //deviceCountry.toLowerCase();

    return (
      <ImageBackground style={COMMON_BACKGROUND_IMAGE_CONTAINER_STYLE} source={BACKGROUND_IMAGE}  resizeMode="stretch">
        <View style={COMMON_OVERLAY_VIEW_STYLE} />
        <ExtraPopUp
          onCrossPress={this.onExtraCross}
          modalVisibilty={this.props.commonError.status}
          selectedHeading={'UH-OH!'}
          selectedSubHeading={this.props.commonError.message}
          // selectedDetails={this.state.selectedDetails}
          // appTheme={this.state.componentTheme}
          onAccept={this.onExtraAccept}
        />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={outTouchStyle}>
            <CommonLoader />

            <View style={[subContainer, { marginTop: 25, marginBottom: 20 }]}>
              <Logo />
            </View>
            <Text allowFontScaling={FONT_SCALLING} style={USER_INPUTS_ERROR_TEXT_STYLE}>
              {this.state.error}
            </Text>
            <View style={subContainer}>
              <Item style={[COMMON_INPUT_STYLE, noBottomBorder]}>
                <PhoneInput
                  ref={this.handleSetPhoneInputRef}
                  textProps={{ editable: false }}
                  // TODO: 1. Improve this to be dynamic to the user's correct country location
                  //       2. Improve the whole process logic to only use PhoneInput's TextInput
                  initialCountry={initialCountry}
                  value={selectedCountryCode}
                  onSelectCountry={this.selectCountry}
                  offset={8}
                  flagStyle={flagStyle}
                  style={phoneInputStyle}
                  textStyle={phoneInputTextStyle}
                  countriesList={Countries}
                />

                <TextInput
                  ref={ref => (this.MobileInput = ref)}
                  style={inputStyle}
                  placeholder={`${strings.MOBILE.toUpperCase()}*`}
                  placeholderTextColor={'#BBBBBB'}
                  value={this.state.mobile}
                  underlineColorAndroid="transparent"
                  onChangeText={mobile => this.setState({ mobile: mobile.replace(/[^0-9]/g, '') })}
                  onFocus={() => this.setState({ error: '' })}
                  // onKeyPress={this.handleKeyDown}
                  keyboardType="phone-pad"
                  returnKeyType="done"
                />
              </Item>
            </View>
            <View style={subContainer}>
              <CommonInput
                placeholder={`${strings.EMAIL.toUpperCase()}*`}
                value={this.state.email}
                secureTextEntry={false}
                onChangeText={email => this.setState({ email })}
                onFocus={() => this.setState({ error: '' })}
                keyboardType="email-address"
              />
            </View>

            <View style={[subContainer, footStyle]}>
              <Button
                disabled={isConfirming}
                onPress={event => this.onPress(event, strings.CONFIRM)}
                style={[COMMON_BUTTON_STYLE, { opacity: isConfirming ? 0.5 : 1 }]}>
                <Text
                  allowFontScaling={FONT_SCALLING}
                  style={[COMMON_BUTTON_TEXT_STYLE, { fontFamily: ROADSTER_REGULAR, fontSize: scale(15) }]}>
                  {strings[isConfirming ? 'CONFIRMING' : 'CONFIRM'].toUpperCase()}
                </Text>
              </Button>
              <Text style={isMandatoryStyle}>* is mandatory</Text>
              <View style={[{ height: 52, alignSelf: 'center', marginTop: 20 }]}>
                <TouchableOpacity
                  onPress={event => this.onPress(event, strings.BACK)}
                  style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    allowFontScaling={FONT_SCALLING}
                    style={[
                      COMMON_BOTTOM_CLICKABLE_TEXT_STYLE,
                      { fontFamily: HELVETICANEUE_LT_STD_CN }
                    ]}>
                    {strings.BACK.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              </View>
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
    fontSize: 21,
    fontFamily: DINENGSCHRIFT_BOLD,
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
    width: BUTTON_WIDTH
  },
  loginTextStyle: {
    alignSelf: 'center',
    color: APP_COLOR_WHITE,
    fontSize: LOGIN_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_BOLD,
    textAlign: 'center'
  },
  inputStyle: {
    backgroundColor: APP_COLOR_WHITE,
    // width: BUTTON_WIDTH - 100,
    height: INPUT_HEIGHT,
    flex: 2,
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'stretch',
    borderRadius: COMMON_BUTTON_RADIOUS,
    paddingTop: 4,
    color: APP_COLOR_BLACK,
    fontSize: 13,
    paddingLeft: 10,
    paddingRight: 10,
    fontFamily: DINENGSCHRIFT_REGULAR
  },
  pickerStyle: {
    height: INPUT_HEIGHT,
    width: 180,
    position: 'absolute',
    left: 0
    //color: 'transparent'
  },
  flagStyle: {
    width: 25,
    height: 17
  },
  phoneInputStyle: {
    width: 'auto',
    paddingLeft: 15,
    flex: 1
  },
  noBottomBorder: { borderBottomWidth: 0 },
  phoneInputTextStyle: {
    backgroundColor: APP_COLOR_WHITE,
    width: 'auto',
    minWidth: 80,
    height: INPUT_HEIGHT - 2,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 4,
    color: APP_COLOR_BLACK,
    fontSize: 12,
    fontFamily: DINENGSCHRIFT_BOLD
  },
  footStyle: { marginTop: 20 },
  isMandatoryStyle: {
    color: 'white',
    marginTop: 10
  }
};
const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      ...registerActions,
      ...appstateAction
    },
    dispatch
  )
});
function mapStateToProps(state) {

  return { ACCESS_TOKEN: state.app.accessToken, loadingState: state.app.loading, commonError: state.app.commonError };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Register);
