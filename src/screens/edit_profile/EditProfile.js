import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  BackHandler,
  NativeModules,
} from 'react-native';
import { connect } from 'react-redux';
import { Button } from 'native-base';
import moment from 'moment';
import _ from 'lodash';

import { actions as squardcornerActions } from '../../ducks/squardcorner';
import { actions as registerActions } from '../../ducks/register';
import { Actions } from 'react-native-router-flux';
import { scale } from 'react-native-size-matters';
import DateTimePicker from 'react-native-modal-datetime-picker';
import ImagePicker from 'react-native-image-picker';
import { getUserObject } from '../../helpers/UserHelper';

import {
  APP_COLOR_WHITE,
  APP_COLOR_RED,
  APP_COLOR_BLACK,
  LOADER_BACKGROUND
} from '../../config/colors';
import { IF_OS_IS_IOS } from '../../config/common_styles';
import strings from '../../config/strings/strings';
import { ARROW_RIGHT_WHITE } from '../../assets/images';
import {
  DINENGSCHRIFT_REGULAR,
  HELVETICANEUE_LT_STD_CN,
  ROADSTER_REGULAR,
  DINENGSCHRIFT_BOLD, DINENGSCHRIFT_MEDIUM
} from '../../assets/fonts';
import {
  COMMON_BUTTON_STYLE,
  COMMON_BUTTON_TEXT_STYLE,
  FONT_SCALLING
} from '../../config/common_styles';
import { bindActionCreators } from 'redux';
import { COUNTRY_CODE } from '../../config/constants/network_constants';
import { validate } from '../../config/common_functions';
import CommonLoader from '../../components/CommonLoader';
import RadioButton from '../../components/RadioButton';
import { getThemeByLevel } from '../../config/common_styles/appthemes';
import TitleBar from '../../components/TitleBar';

const TITLE_FONT_SIZE = 30;
const LEFT_RIGHT_MARGINS = 20;
const PROFILE_IMAGE_CONTAINER_HEIGHT = 142.5;
const USER_LEVEL_TEXT_SIZE = 23;
const MOBILE_NO_TEXT_SIZE = 18;

const PROFILE_IMAGE_SIZE = 120;
const EDIT_PHOTO_TEXT_SIZE = 16;
const DESCRIPTION_FONT_SIZE = 18;
const BROUGHT_TO_YOU_FONT_SIZE = 15.5;
const RADIO_BUTTON_CONTAINER_HEIGHT = 99.5;

const BOTTOM_CONTAINER_HEIGHT = 72.5;
const LABEL_TEXT_SIZE = 18.5;
const EDIT_TEXT_SIZE = 18.5;

class EditProfile extends Component {
  constructor(props) {
    super(props);
    const {
      userData: {
        Photo,
        FirstName,
        LastName,
        LevelName,
        Email,
        BirthDate,
        Gender,
        PushNotification,
        BeaconNotification
      }
    } = this.props;

    this.state = {
      componentTheme: getThemeByLevel(LevelName),
      newPhoto: null,
      profile: {
        Photo,
        FirstName,
        LastName,
        Email,
        BirthDate,
        Gender,
        PushNotification: Boolean(Number(PushNotification)),
        BeaconNotification: Boolean(Number(BeaconNotification))
      },
      error: '',
      isDateTimePickerVisible: false
    };
  }
  componentDidMount() {
    this.setState({
      selectedPushnotionTypeArray: [
        this.props.userData.PushNotification,
        this.props.userData.BeaconNotification
      ]
    });
    //list for back button
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
  }
  componentWillUnmount() {
    //clean up
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }
  onBackPress() {
    // Actions.squadcorner();
    Actions.pop();
    return true;
  }
  onEditPhoto = () => {
    ImagePicker.showImagePicker({
      cameraType: 'front',
      quality: 0.8,
      maxWidth: 500,
      maxHeight: 500
    }, (response) => {
      const didDecline = response.didCancel || response.error;
      this.setState({ newPhoto: didDecline ? null : response.uri });
    });
  };
  onSaveProfile = () => {
    if (!this.validateUserInputs()) {
      this.updateProfileToServer();
    }
  };
  validateUserInputs() {
    let InputError = null;
    const {
      profile: {
        FirstName,
        LastName,
        Email,
        BirthDate,
        Gender,
        PushNotification,
        BeaconNotification
      }
    } = this.state;
    const validateFirstName = validate('string', FirstName.trim(), 'First Name');
    const validateLastName = validate('string', LastName.trim(), 'Last Name');
    const validateEmail = validate('email', Email.trim(), 'Email');
    const validateBirthDate = validate('string', BirthDate.trim(), 'Birth Date');
    const validateGender = validate('string', Gender.trim(), 'Gender');
    const validGender = Gender.match(/[fe]*male/i);

    if (validateFirstName) {
      InputError = validateFirstName;
    } else if (validateLastName) {
      InputError = validateLastName;
    } else if (validateEmail) {
      InputError = validateEmail;
    } else if (validateBirthDate) {
      InputError = validateBirthDate;
    } else if (validateGender) {
      InputError = validateGender;
    } else if (!validGender) {
      InputError = 'Invalid Gender';
    }

    this.setState({ error: InputError });

    return InputError;
  }

  updateProfileToServer() {
    const {
      userData: { FullMobile },
      ACCESS_TOKEN
    } = this.props;
    const {
      newPhoto,
      profile: {
        FirstName,
        LastName,
        Email,
        BirthDate,
        Gender,
        PushNotification,
        BeaconNotification
      }
    } = this.state;
    const formdata = new FormData();

    formdata.append('token', ACCESS_TOKEN);
    formdata.append('CountryCode', COUNTRY_CODE);
    formdata.append('FirstName', FirstName);
    formdata.append('LastName', LastName);
    formdata.append('Gender', Gender);
    formdata.append('Birthday', BirthDate);
    formdata.append('Email', Email);
    formdata.append('MobileNumber', FullMobile);
    formdata.append('PushNotification', String(Number(PushNotification)));
    formdata.append('BeaconNotification', String(Number(BeaconNotification)));
    if (newPhoto) {
      formdata.append('Photo', {
        uri: newPhoto,
        type: 'image/png',
        name: 'image'
      });
    }

    this.props.editAcount(formdata);
  }

  clearError = () => {
    this.setState({ error: '' });
  };
  editFirstName = value => {
    const { profile } = this.state;
    profile.FirstName = value;
    this.setState({ profile });
  };
  editLastName = value => {
    const { profile } = this.state;
    profile.LastName = value;
    this.setState({ profile });
  };
  editEmail = value => {
    const { profile } = this.state;
    profile.Email = value;
    this.setState({ profile });
  };
  editBirthDate = value => {
    const { profile } = this.state;
    profile.BirthDate = value;
    this.setState({ profile });
  };
  editGender = value => {
    const { profile } = this.state;
    profile.Gender = value;
    this.setState({ profile });
  };

  handleBirthDateChange = BirthDate => {
    const { profile } = this.state;
    profile.BirthDate = BirthDate;
    this.setState({ profile });
  };

  handleFocusBirthDate = () => {
    this.setState({isDateTimePickerVisible: true});
    this.clearError();
  };

  togglePushNotification = () => {
    const {
      profile,
      profile: { PushNotification }
    } = this.state;
    profile.PushNotification = !PushNotification;
    this.setState({ profile });
  };

  toggleLocationNotification = () => {
    const {
      profile,
      profile: { BeaconNotification }
    } = this.state;
    profile.BeaconNotification = !BeaconNotification;
    this.setState({ profile });
  };

  toggleGender = () => {
    const {
      profile,
      profile: { Gender }
    } = this.state;
    profile.Gender = (Gender.match(/female/i) ? 'M' : 'Fem') + 'ale';
    this.setState({ profile });
  }

  setDatePickerRef = ref => {
    this.DatePicker = ref;
  };

  _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

  _handleDatePicked = date => {
    this.setState({
      date: moment(date).format('YYYY-MM-DD'),
      currentDate: date,
      isDateTimePickerVisible: false
    });
    this.editBirthDate(moment(date).format('YYYY-MM-DD'));
  };

  render() {
    const {
      mainContainer,
      container,
      subContainer,
      labelTextStyle,
      radioContainerStyle,
      editTextStyle,
      profileImageStyle,
      radioLabelStyle,
      radioButtonStyle,
      radiosParentStyle,
      footerStyle
    } = styles;

    const {
      componentTheme: { thirdColor, ARROW_LEFT_RED },
      newPhoto,
      profile: {
        Photo,
        FirstName,
        LastName,
        Email,
        BirthDate,
        Gender,
        PushNotification,
        BeaconNotification
      }
    } = this.state;

    const {
      userData: { FullMobile, LevelName },
      banners:{ DeliveryLoyalty },
      sideMenu,
      title
    } = this.props;

    const isFemale = Gender.match(/female/i);
    const isDarkMode = NativeModules.RNDarkMode.initialMode === 'dark';

    const profileIndex = _.findIndex(sideMenu, { url: 'profile' });
    const headerTitle = profileIndex > -1  && sideMenu[profileIndex].title ? 
      sideMenu[profileIndex].title : title;

    return (
      <View style={mainContainer}>
        <ScrollView style={{ marginBottom: 0 }}>
          <View style={container}>
            <CommonLoader noAutoOff={true} />
            <TitleBar
              onPress={this.onBackPress}
              color={thirdColor}
              backIcon={ARROW_LEFT_RED}
              titleText={' ' + headerTitle}
              />
            <View
              style={[
                subContainer,
                {
                  height: PROFILE_IMAGE_CONTAINER_HEIGHT,
                  backgroundColor: thirdColor
                }
              ]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image style={profileImageStyle} source={{ uri: newPhoto || Photo }} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.userLevelViewStyle, { marginTop: 0 }]}>
                  {DeliveryLoyalty !== '0' && <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                    <Text
                      allowFontScaling={FONT_SCALLING}
                      style={[styles.challengerTextStyle, { marginBottom: -8 }]}>
                      {LevelName.toUpperCase()}
                    </Text>
                  </View>}
                  <View style={{ borderWidth: 0 }}>
                    <View style={{ flexDirection: 'row', marginTop: 15 }}>
                      <Text
                        allowFontScaling={FONT_SCALLING}
                        style={[styles.mobileNoTextStyle, { marginBottom: -8 }]}>
                        {strings.EDIT_PROFILE_MOBILE.toUpperCase() + ' '}
                      </Text>
                      <Text
                        allowFontScaling={FONT_SCALLING}
                        style={[styles.mobileNoTextStyle, { marginBottom: -8 }]}>
                        {FullMobile}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.EditPhotoTextTouchStyle}
                      onPress={this.onEditPhoto}>
                      <Text allowFontScaling={FONT_SCALLING} style={styles.editPhotoTextStyle}>
                        {strings.EDIT_PHOTO}
                      </Text>
                      <Image style={styles.rightArrowImageStyle} source={ARROW_RIGHT_WHITE} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            <View
              style={[
                subContainer,
                styles.sectionViewStyle,
                {
                  backgroundColor: APP_COLOR_WHITE,
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  marginTop: 0,
                }
              ]}>
              <View style={{ marginTop: 25 }}>
                <Text allowFontScaling={FONT_SCALLING} style={labelTextStyle}>
                  {strings.FIRST_NAME.toUpperCase()}
                </Text>
                <TextInput
                  style={[editTextStyle, { color: thirdColor }]}
                  secureTextEntry={false}
                  placeholder={''}
                  autoCorrect={false}
                  value={FirstName}
                  onChangeText={this.editFirstName}
                  underlineColorAndroid="transparent"
                  onFocus={this.clearError}
                />
              </View>

              <View style={styles.sectionViewStyle}>
                <Text allowFontScaling={FONT_SCALLING} style={labelTextStyle}>
                  {strings.LAST_NAME.toUpperCase()}
                </Text>
                <TextInput
                  style={[editTextStyle, { color: thirdColor }]}
                  secureTextEntry={false}
                  placeholder={''}
                  autoCorrect={false}
                  value={LastName}
                  onChangeText={this.editLastName}
                  underlineColorAndroid="transparent"
                  onFocus={this.clearError}
                />
              </View>

              <View style={styles.sectionViewStyle}>
                <Text allowFontScaling={FONT_SCALLING} style={labelTextStyle}>
                  {strings.EMAIL.toUpperCase()}
                </Text>
                <TextInput
                  style={[editTextStyle, { color: thirdColor }]}
                  secureTextEntry={false}
                  placeholder={''}
                  autoCorrect={false}
                  value={Email}
                  onChangeText={this.editEmail}
                  underlineColorAndroid="transparent"
                  onFocus={this.clearError}
                />
              </View>

              <View style={styles.sectionViewStyle}>
                <Text allowFontScaling={FONT_SCALLING} style={labelTextStyle}>
                  {strings.DATE_OF_BIRTH.toUpperCase()}
                </Text>
                <TextInput
                  style={[editTextStyle, { color: thirdColor }]}
                  secureTextEntry={false}
                  placeholder={'DD-MM-YYYY'}
                  autoCorrect={false}
                  value={moment(BirthDate).format('MMMM DD, YYYY')}
                  // onChangeText={this.editBirthDate}
                  underlineColorAndroid="transparent"
                  onFocus={this.handleFocusBirthDate}
                />
                <TouchableOpacity
                  onPress={() => this.setState({isDateTimePickerVisible: true})}
                  style={{ position: 'absolute', left: 0, top: 4, marginLeft: 0, width: 227, height: 40 }}/>
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
              <View style={styles.sectionViewStyle}>
                <Text allowFontScaling={FONT_SCALLING} style={labelTextStyle}>
                  {strings.GENDER.toUpperCase()}
                </Text>
                <View style={styles.genderRadiosStyle}>
                  <TouchableOpacity onPress={this.toggleGender} style={radioContainerStyle}>
                    <RadioButton color={thirdColor} size={15} isActive={!isFemale} style={radioButtonStyle}/>
                    <Text style={[radioLabelStyle, {fontFamily: DINENGSCHRIFT_REGULAR, textTransform: 'capitalize'}]}>MALE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={this.toggleGender} style={radioContainerStyle}>
                    <RadioButton color={thirdColor} size={15} isActive={isFemale} style={radioButtonStyle}/>
                    <Text style={[radioLabelStyle, {fontFamily: DINENGSCHRIFT_REGULAR, textTransform: 'capitalize'}]}>FEMALE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={[subContainer, radiosParentStyle]}>
              <TouchableOpacity onPress={this.togglePushNotification} style={radioContainerStyle}>
                <RadioButton
                  color={thirdColor}
                  size={15}
                  isActive={PushNotification}
                  style={radioButtonStyle}
                />
                <Text style={[radioLabelStyle, { textTransform: 'capitalize' }]}>{strings.ALLOW_PUSH_NOTIFICATIONS.toUpperCase()}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={this.toggleLocationNotification}
                style={radioContainerStyle}>
                <RadioButton
                  style={radioButtonStyle}
                  color={thirdColor}
                  size={15}
                  isActive={BeaconNotification}
                />
                <Text style={[radioLabelStyle, { textTransform: 'capitalize' }]}>{strings.ALLOW_LOCATION_NOTIFICATIONS.toUpperCase()}</Text>
              </TouchableOpacity>
            </View>
            <View style={[subContainer, footerStyle]}>
              <Text style={{ color: 'red', fontSize: 14 }}>{this.state.error}</Text>
              <Button
                disabled={this.props.loadingState ? true : false}
                onPress={this.onSaveProfile}
                style={[COMMON_BUTTON_STYLE, { alignSelf: 'center', backgroundColor: thirdColor }]}>
                <Text
                  allowFontScaling={FONT_SCALLING}
                  style={[COMMON_BUTTON_TEXT_STYLE, { fontFamily: ROADSTER_REGULAR }]}>
                  {strings.SAVE.toUpperCase()}
                </Text>
              </Button>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}
const styles = {
  mainContainer: { flex: 1, backgroundColor: APP_COLOR_WHITE },
  sectionViewStyle: {
    marginTop: 10,
    width: '100%'
  },
  container: {
    flex: 1,
    width: null,
    height: null,
    alignItems: 'center',
    backgroundColor: APP_COLOR_BLACK
  },
  subContainer: {
    backgroundColor: APP_COLOR_WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: LEFT_RIGHT_MARGINS,
    paddingEnd: LEFT_RIGHT_MARGINS,
    width: '100%'
  },
  backTextStyle: {
    fontSize: TITLE_FONT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_RED,
    marginStart: 10
  },
  titleTextStyle: {
    fontSize: TITLE_FONT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_WHITE
  },
  aboutDescriptionTextStyle: {
    fontSize: DESCRIPTION_FONT_SIZE,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    color: APP_COLOR_WHITE,
    textAlign: 'center'
  },
  broughtToYouTextStyle: {
    fontSize: BROUGHT_TO_YOU_FONT_SIZE,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    color: APP_COLOR_BLACK,
    textAlign: 'center'
  },
  aboutDescriptionUnderlinedTextStyle: {
    fontSize: DESCRIPTION_FONT_SIZE,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    color: APP_COLOR_WHITE,
    textAlign: 'center',
    textDecorationLine: 'underline'
  },
  arrowImageStyle: {
    marginTop: 2,
    marginStart: 2,
    alignSelf: 'center',
    marginBottom: IF_OS_IS_IOS ? 10 : 0
  },
  rightArrowImageStyle: {
    marginTop: 2,
    marginStart: 2,
    alignSelf: 'center',
    marginBottom: IF_OS_IS_IOS ? 6 : 0
  },
  detailsImageStyle: {
    marginEnd: 10,
    marginBottom: IF_OS_IS_IOS ? 10 : 0
  },
  profileImageStyle: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: PROFILE_IMAGE_SIZE / 2,
    marginEnd: 10,
    marginTop: IF_OS_IS_IOS ? 10 : 0,
    marginBottom: IF_OS_IS_IOS ? 10 : 0
  },
  detailsTextStyle: {
    fontSize: 25,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_WHITE
  },
  editPhotoTextStyle: {
    color: APP_COLOR_WHITE,
    fontSize: EDIT_PHOTO_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    // fontSize: EDIT_PHOTO_TEXT_SIZE,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    marginStart: 0,
    marginTop: 0,
  },
  whitecrownImageViewStyle: {
    width: 15,
    height: 25,
    resizeMode: 'contain',
    marginEnd: 5,
    alignSelf: 'flex-start'
  },
  challengerTextStyle: {
    color: APP_COLOR_BLACK,
    fontSize: USER_LEVEL_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_BOLD
  },
  mobileNoTextStyle: {
    color: APP_COLOR_WHITE,
    fontSize: MOBILE_NO_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR
  },
  EditPhotoTextTouchStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  labelTextStyle: {
    fontSize: LABEL_TEXT_SIZE,
    flexDirection: 'row',
    // color: REDEEMABLE_AMOUNT_GRAY_TEXT_COLOR,
    color: APP_COLOR_BLACK,
    fontFamily: DINENGSCHRIFT_REGULAR,
    //lineHeight: 20,
    marginStart: 4,
    alignItems: 'center'
  },
  editTextStyle: {
    fontSize: scale(EDIT_TEXT_SIZE * (IF_OS_IS_IOS ? 1 : 1.1)),
    flexDirection: 'row',
    alignItems: 'flex-start',
    lineHeight: scale(20),
    fontFamily: DINENGSCHRIFT_REGULAR,
    borderWidth: 0,
    marginStart: IF_OS_IS_IOS ? 5 : 0,
    marginBottom: IF_OS_IS_IOS ? 10 : 0
  },
  genderRadiosStyle: {
    flexDirection: 'row',
    paddingBottom: 20,
    // paddingStart: 4
  },
  radioButtonStyle: {
    marginRight: 8
  },
  radioLabelStyle: {
    fontSize: scale(15 * (IF_OS_IS_IOS ? 1 : 1.15)),
    color: APP_COLOR_BLACK,
    // color: APP_COLOR_WHITE,
    fontFamily: DINENGSCHRIFT_MEDIUM,
    marginTop: IF_OS_IS_IOS ? 8 : 0,
    lineHeight: 30
  },
  radiosParentStyle: {
    height: RADIO_BUTTON_CONTAINER_HEIGHT,
    backgroundColor: APP_COLOR_WHITE,
    // backgroundColor: APP_COLOR_BLACK,
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexDirection: 'column',
    borderColor: LOADER_BACKGROUND,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  radioContainerStyle: {
    flexDirection: 'row',
    elevation: 1,
    // marginTop: IF_OS_IS_IOS ? 0 : 10,
    marginLeft: 0,
    marginRight: 20,
    paddingStart: 4
  },
  footerStyle: {
    height: BOTTOM_CONTAINER_HEIGHT,
    // backgroundColor: APP_COLOR_BLACK,
    backgroundColor: APP_COLOR_WHITE,
    justifyContent: 'center',
    paddingBottom: 15,
    alignItems: 'center',
    flexDirection: 'column'
  }
};
function mapStateToProps(state) {
  const {
    app: { sideMenu },
    squardcorner: { userDetails = [{ loyalty: null }] },
    home: { banners}
  } = state;
  const userData = {...userDetails[0].loyalty, ...userDetails[0].customer} || getUserObject(state);
  const ACCESS_TOKEN = state.app.accessToken;
  return {
    ACCESS_TOKEN,
    userData,
    banners,
    sideMenu
  };
}
const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      ...squardcornerActions,
      ...registerActions
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditProfile);
