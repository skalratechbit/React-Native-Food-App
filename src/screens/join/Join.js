import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  ImageBackground,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  NativeModules
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { connect } from 'react-redux';
import moment from 'moment';
import DateTimePicker from 'react-native-modal-datetime-picker';
import ImagePicker from 'react-native-image-picker';
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel
} from 'react-native-simple-radio-button';
import { CommonInput } from '../../components';
import { BACKGROUND_IMAGE, CAMERA_IMAGE } from '../../assets/images';
import {scale} from 'react-native-size-matters';
import { APP_COLOR_WHITE } from '../../config/colors';
import {
  DINENGSCHRIFT_REGULAR,
  ROADSTER_REGULAR,
  HELVETICANEUE_LT_STD_CN,
  PACIFICO
} from '../../assets/fonts';
import strings from '../../config/strings/strings';
import { Button } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { actions } from '../../ducks/register';
import CommonLoader from '../../components/CommonLoader';
import {
  IF_OS_IS_IOS,
  FONT_SCALLING,
  SCREEN_WIDTH,
  SCREEN_HEIGHT
} from '../../config/common_styles';

import {
  COMMON_BUTTON_STYLE,
  COMMON_BUTTON_TEXT_STYLE,
  COMMON_BOTTOM_CLICKABLE_TEXT_STYLE,
  COMMON_INPUT_STYLE,
  COMMON_OVERLAY_VIEW_STYLE,
  BUTTON_WIDTH,
  COMMON_MARGIN_BETWEEN_COMPONENTS,
  COMMON_REGISTER_LOGIN_FLOW_TEXT_STYLE,
  COMMON_BACKGROUND_IMAGE_CONTAINER_STYLE,
  USER_INPUTS_ERROR_TEXT_STYLE
} from '../../config/common_styles';
import { ORGANIZATION_ID, CHANNEL_ID } from '../../config/constants/network_constants';
import { validate } from '../../config/common_functions';

import { KEY_CARD_CODE } from '../../config/constants/network_api_keys';

import _ from 'lodash';

const LOGIN_TEXT_SIZE = 34.2;
const PROFILE_IMAGE_SIZE = 112.5;
const TAKE_PICTURE = 'Take_Picture';

class Join extends Component {
  state = {
    gender_radio_props: [
      { label: `${strings.MALE.toUpperCase()}*`, value: 0 },
      { label: `${strings.FEMALE.toUpperCase()}*`, value: 1 }
    ],
    genderIndex: 0,
    notifications_radio_props: [
      { label: strings.ALLOW_PUSH_NOTIFICATIONS.toUpperCase(), value: 0 },
      { label: strings.ALLOW_LOCATION_NOTIFICATIONS.toUpperCase(), value: 1 }
    ],
    pushNotificationsIndex: 0,
    locationNotificationsIndex: 0,

    fname: '',
    lname: '',
    error: '',
    loading: false,
    date: '',
    currentDate: new Date(),
    selectedPushnotionTypeArray: [0, 1],
    profile_image: ''
  };

  componentDidMount() {
    //console.log('this.props.loyaltyOlddata', this.props.loyaltyOlddata);
    if (this.props.loyaltyOlddata) {
      this.setState({
        fname: this.props.loyaltyOlddata.FirstName,
        lname: this.props.loyaltyOlddata.LastName,
        date: this.props.loyaltyOlddata.Birthday,
        genderIndex: this.props.loyaltyOlddata.Gender == 'M' ? 0 : 1
      });
    }

    AsyncStorage.getItem(KEY_CARD_CODE).then(loyaltyCardNumber =>
      this.setState({ loyaltyCardNumber })
    );
  }

  componentWillReceiveProps(newProps) {
    if (newProps.phone_pic_url !== undefined) {
      this.setState({ profile_image: newProps.phone_pic_url });
    }
  }

  radioButtonPressed = value => {
    if (this.state.selectedPushnotionTypeArray.indexOf(value) >= 0) {
      const array = this.state.selectedPushnotionTypeArray;
      const index = array.indexOf(value);
      array.splice(index, 1);
      this.setState({ selectedPushnotionTypeArray: array }, () => {});
    } else {
      const joined = this.state.selectedPushnotionTypeArray.concat(value);
      this.setState({ selectedPushnotionTypeArray: joined }, () => {});
    }
  };

  validateUserInputs() {
    let InputError = null;

    if (validate('string', this.state.fname.trim(), 'First Name')) {
      InputError = validate('string', this.state.fname.trim(), 'First Name');
    }
    else if (validate('string',this.state.lname,'Last Name'))
    {
        InputError=validate('string',this.state.lname.trim(),'Last Name');
    }
    else if (validate('string',this.state.date,'Date'))
    {
        InputError=validate('string',this.state.date.trim(),'Date');
    }
    this.setState({ error: InputError });

    return InputError;
  }
  getUserInputsData() {
    //console.log(this.state.selectedPushnotionTypeArray);
    const formdata = new FormData();
    const {
      mobileNumber,
      requestId,
      email,
      loyaltyOlddata,
      CountryCode,
      ACCESS_TOKEN
    } = this.props;
    const {
      fname,
      lname,
      genderIndex,
      date,
      loyaltyCardNumber
    } = this.state;

    //access countrycode previously saved in the join / registration

    formdata.append('token', ACCESS_TOKEN);
    formdata.append('MobileNumber', mobileNumber.replace(CountryCode, ''));
    formdata.append('CountryCode', Number(CountryCode));
    formdata.append('RequestId', requestId.trim());
    formdata.append('FirstName', fname.trim());
    formdata.append('LastName', lname.trim());
    formdata.append('OrgId', ORGANIZATION_ID);
    formdata.append('ChannelId', CHANNEL_ID);
    formdata.append('Gender', genderIndex == 0 ? 'male' : 'female');
    formdata.append('Birthday', date.trim());
    formdata.append('Email', email.trim());
    formdata.append('AppVersion', '1.0');
    if (loyaltyCardNumber) formdata.append(KEY_CARD_CODE, loyaltyCardNumber);

    if (this.state.selectedPushnotionTypeArray.length == 0) {
      formdata.append('PushNotification', 0);
      formdata.append('BeaconNotification', 0);
    } else if (this.state.selectedPushnotionTypeArray.length == 2) {
      formdata.append('PushNotification', 1);
      formdata.append('BeaconNotification', 1);
    } else if (this.state.selectedPushnotionTypeArray.length == 1) {
      if (this.state.selectedPushnotionTypeArray[0] == 1) {
        formdata.append('PushNotification', 0);
        formdata.append('BeaconNotification', 1);
      } else {
        formdata.append('BeaconNotification', 0);
        formdata.append('PushNotification', 1);
      }
    }

    if (loyaltyOlddata) {
      formdata.append('CurrentBalance', loyaltyOlddata.CurrentBalance);
      formdata.append('RedeemableAmount', loyaltyOlddata.RedeemableAmount);
      formdata.append('LifetimeBalance', loyaltyOlddata.LifetimeBalance);
      formdata.append('PROGRAM_ID', loyaltyOlddata.PROGRAM_ID);
      formdata.append('DESCRIPTION', loyaltyOlddata.DESCRIPTION);
    }

    if (this.state.profile_image) {
      formdata.append('Photo', {
        uri: this.state.profile_image,
        type: 'image/png',
        name: 'image'
      });
    }
    //console.log(formdata);
    return formdata;
  }

  onPress = (event, caption) => {
    switch (caption) {
      case strings.FORGOT_PASSWORD:
        // alert(strings.FORGOT_PASSWORD);
        break;
      case strings.SUBMIT:
        if (!this.validateUserInputs()) {
          this.props.registerUser(this.getUserInputsData());
        }
        break;
      case strings.BACK:
        Actions.pop();
        break;
      default:
    }
  };

  handleSelectProfilePhoto = () => {
    ImagePicker.showImagePicker(
      {
        cameraType: 'front',
        quality: 0.8,
        maxWidth: 500,
        maxHeight: 500
      },
      response => {
        const didDecline = response.didCancel || response.error;
        this.setState({ profile_image: didDecline ? null : response.uri });
      }
    );
  };

  _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

  _handleDatePicked = async date => {
    this.setState({ date: moment(date).format('YYYY-MM-DD'), currentDate: date });
    this._hideDateTimePicker();
  };

  render() {
    const {
      subContainer,
      profileImageStyle,
      radioButtonViewStyle,
      radioContainerStyle,
      outTouchStyle
    } = styles;
    const isDarkMode = NativeModules.RNDarkMode.initialMode === 'dark';
    return (
      <ImageBackground style={COMMON_BACKGROUND_IMAGE_CONTAINER_STYLE} source={BACKGROUND_IMAGE} resizeMode={'stretch'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={outTouchStyle}>
            {this.props.loadingState && <CommonLoader noAutoOff={true} />}
            <View style={COMMON_OVERLAY_VIEW_STYLE} />
            <View style={subContainer}>
              <Text
                allowFontScaling={FONT_SCALLING}
                style={[
                  COMMON_REGISTER_LOGIN_FLOW_TEXT_STYLE,
                  { fontFamily: PACIFICO,fontSize:scale(18) }
                ]}>
                {strings.JOIN_THE_SQUAD.toLowerCase()}
              </Text>
            </View>
            <View style={subContainer}>
              <TouchableOpacity style={profileImageStyle} onPress={this.handleSelectProfilePhoto}>
                {this.state.profile_image ? (
                  <Image style={profileImageStyle} source={{ uri: this.state.profile_image }} />
                ) : (
                  <Image style={[profileImageStyle,{borderRadius:0}]} resizeMode={'contain'} source={CAMERA_IMAGE} />
                )}
              </TouchableOpacity>
            </View>
            <Text allowFontScaling={FONT_SCALLING} style={USER_INPUTS_ERROR_TEXT_STYLE}>
              {this.state.error}
            </Text>
            <View style={[subContainer,{marginTop:0}]}>
              <CommonInput
                placeholder={`${strings.FIRST_NAME.toUpperCase()}*`}
                value={this.state.fname}
                onChangeText={fname => this.setState({ fname })}
                onFocus={() => this.setState({ error: '' })}
              />
            </View>
            <View style={subContainer}>
              <CommonInput
                placeholder={`${strings.LAST_NAME.toUpperCase()}*`}
                value={this.state.lname}
                onChangeText={lname => this.setState({ lname })}
                onFocus={() => this.setState({ error: '' })}
              />
            </View>
            <View style={radioButtonViewStyle}>
              <RadioForm formHorizontal animation labelHorizontal={false}>
                {this.state.gender_radio_props.map((obj, i) => (
                  <View style={[radioContainerStyle, {alignSelf:'flex-start' }]} key={i}>
                    <RadioForm animation={false}>
                      <RadioButton labelHorizontal key={i}>
                        {/*  You can set RadioButtonLabel before RadioButtonInput */}
                        <RadioButtonInput
                          obj={obj}
                          index={i}
                          isSelected={this.state.genderIndex === i}
                          onPress={value => {
                            this.setState({ genderIndex: value });
                          }}
                          borderWidth={this.state.genderIndex === i ? 1 : 2}
                          buttonInnerColor={APP_COLOR_WHITE}
                          buttonOuterColor={
                            this.state.genderIndex === i ? APP_COLOR_WHITE : APP_COLOR_WHITE
                          }
                          buttonSize={18.5}
                          buttonOuterSize={18.5}
                          buttonWrapStyle={{ marginLeft: 0, marginTop: 5 }}
                        />
                        <RadioButtonLabel
                          obj={obj}
                          index={i}
                          labelHorizontal
                          onPress={value => {
                            this.setState({ genderIndex: value });
                          }}
                          labelStyle={{
                            fontSize: 14,
                            color: APP_COLOR_WHITE,
                            fontFamily: DINENGSCHRIFT_REGULAR,
                            marginTop: 5
                          }}
                        />
                      </RadioButton>
                    </RadioForm>
                  </View>
                ))}
              </RadioForm>
            </View>
            <View style={[COMMON_INPUT_STYLE, subContainer,{marginTop:0}]}>
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
                <CommonInput
                  placeholder={`${strings.DATE.toUpperCase()}*`}
                  value={this.state.date}
                  onChangeText={date => this.setState({ date })}
                />
              </View>
              <TouchableOpacity
                onPress={() => this.setState({isDateTimePickerVisible: true})}
                style={{ position: 'absolute', left: 0, top: 4, marginLeft: 0, width: BUTTON_WIDTH, height: 40 }}/>
              <DateTimePicker
                isVisible={this.state.isDateTimePickerVisible}
                onConfirm={this._handleDatePicked}
                onCancel={this._hideDateTimePicker}
                mode='date'
                date={this.state.currentDate}
                maximumDate={new Date()}
                isDarkModeEnabled={isDarkMode}
              />
            </View>

            <View style={[radioButtonViewStyle, {width: '50%'}]}>
              <RadioForm formHorizontal={false} animation labelHorizontal={false}>
                {this.state.notifications_radio_props.map((obj, i) => (
                  <View style={[radioContainerStyle, {alignSelf:'flex-start' }]} key={i}>
                    <RadioForm animation={false}>
                      <RadioButton labelHorizontal key={i}>
                        {/*  You can set RadioButtonLabel before RadioButtonInput */}
                        <RadioButtonInput
                          obj={obj}
                          index={i}
                          isSelected={this.state.selectedPushnotionTypeArray.indexOf(i) >= 0}
                          onPress={value => {
                            this.radioButtonPressed(value);
                          }}
                          // onPress={(value) => {this.setState({notificationsIndex:value})}}
                          borderWidth={2}
                          buttonInnerColor={APP_COLOR_WHITE}
                          buttonOuterColor={
                            this.state.notificationsIndex === i ? APP_COLOR_WHITE : APP_COLOR_WHITE
                          }
                          buttonSize={18.5}
                          buttonOuterSize={18.5}
                          buttonWrapStyle={{ marginLeft: 0, marginTop: 5 }}
                        />
                        <RadioButtonLabel
                          obj={obj}
                          index={i}
                          labelHorizontal
                          onPress={value => {
                            this.radioButtonPressed(value);
                          }}
                          // onPress={(value) => {this.setState({notificationsIndex:value})}}
                          labelStyle={{
                            fontSize: 16,
                            color: APP_COLOR_WHITE,
                            fontFamily: HELVETICANEUE_LT_STD_CN,
                            marginTop: 5
                          }}
                        />
                      </RadioButton>
                    </RadioForm>
                  </View>
                ))}
              </RadioForm>
            </View>

            <View style={subContainer}>
              <Button
                disabled={!!this.props.loadingState}
                onPress={event => this.onPress(event, strings.SUBMIT)}
                style={[COMMON_BUTTON_STYLE,{height: scale(35)}]}>
                <Text
                  allowFontScaling={FONT_SCALLING}
                  style={[COMMON_BUTTON_TEXT_STYLE, { fontFamily: ROADSTER_REGULAR, fontSize: scale(15) }]}>
                  {strings.SUBMIT.toUpperCase()}
                </Text>
              </Button>
              <Text style={styles.isMandatoryStyle}>{strings.IS_MANDATORY}</Text>
            </View>
            <View style={[{ height: scale(40), position: 'absolute', bottom: 0 }]}>
              <TouchableOpacity
                onPress={event => this.onPress(event, strings.BACK)}
                style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  allowFontScaling={FONT_SCALLING}
                  style={[
                    COMMON_BOTTOM_CLICKABLE_TEXT_STYLE,
                    { fontFamily: HELVETICANEUE_LT_STD_CN }
                  ]}>
                  {strings.BACK}
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
  profileImageStyle: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(100) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioContainerStyle: {
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 1,
    marginLeft: 10
  },
  radioButtonViewStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: BUTTON_WIDTH + 60,
    alignItems:'center'
  },
  isMandatoryStyle: {
    color: 'white',
    marginTop: 10,
    marginBottom: 5,
    // textAlign: 'left',
    // alignSelf: 'flex-start'
  }
};
function mapStateToProps(state) {
  //console.log(':state', state);
  return {
    ACCESS_TOKEN: state.app.accessToken,
    loyaltyOlddata: state.register.loyaltyOlddata
  };
}
//
export default connect(
  mapStateToProps,
  actions
)(Join);
