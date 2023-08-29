import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ImageBackground,
  Share,
  BackHandler,
} from 'react-native';
import { BoostYourStartPopUp } from '../../components';
import { List, ListItem } from 'native-base';
import {
  APP_COLOR_WHITE,
  APP_COLOR_RED,
  APP_COLOR_BLACK
} from '../../config/colors';
import strings from '../../config/strings/strings';
import { actions as appstateAction } from '../../ducks/setappstate';
import { CHANNEL_ID, ORGANIZATION_ID } from '../../config/constants/network_constants';
import { connect } from 'react-redux';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import CommonLoader from '../../components/CommonLoader';
import CommonPopup from '../../components/Common/CommonPopup';
import { actions as branchesActions } from '../../ducks/branches';
import { bindActionCreators } from 'redux';
import {
  STAR_WHITE_IMAGE,
} from '../../assets/images';
import { Actions } from 'react-native-router-flux';
import {
  DINENGSCHRIFT_BOLD,
  HELVETICANEUE_LT_STD_CN,
} from '../../assets/fonts';
import {
  IF_OS_IS_IOS,
  COMMON_BUTTON_RADIOUS,
  FONT_SCALLING
} from '../../config/common_styles';
import _ from 'lodash';
import ContactsWrapper from 'react-native-contacts-wrapper';
import {
  getUserObject,
  readUserContacts
} from '../../helpers/UserHelper';
import { parseMobileNumber } from '../../helpers/NumberHelper';
import { findUUIDInBranches } from '../../helpers/BranchHelper';
import {
  detectBeaconProximity,
  checkBluetoothStatus,
  sortBeaconsFromBranches
} from '../../helpers/BeaconHelper';
import { getThemeByLevel } from '../../config/common_styles/appthemes';
import TitleBar from '../../components/TitleBar';

const FBSDK = require('react-native-fbsdk');
const {
  LoginManager,
  GraphRequest,
  GraphRequestManager
} = FBSDK;

const TITLE_FONT_SIZE = scale(30);
const LEFT_RIGHT_MARGINS = moderateScale(20);
const BELL_ICON_WIDTH = moderateScale(19);
const BELL_ICON_HEIGHT = verticalScale(26);
const ITEM_CELL_HEIGHT = verticalScale(180);
const ITEMS_MARGIN = moderateScale(5);
const DESCRIPTION_TEXT_SIZE = scale(18);

const MARGIN_LEFT_RIGHT = moderateScale(10);
const ITEM_TITLE_TEXT_SIZE = scale(18);
const ITEM_DETAIL_TEXT_SIZE = scale(16);

const GO_FOR_IT_BUTTON_WIDTH = moderateScale(153);
const GO_FOR_IT_BUTTON_HEIGHT = verticalScale(32);

const DETAIL_CONTAINER_HEIGHT = verticalScale(201.5);

class BoostYourStars extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visibilty: false,
      selectedHeading: '',
      selectedSubHeading: '',
      selectedDetails: '',
      componentTheme: getThemeByLevel(this.props.LevelName),
      gamesData: [],
      fbConnectData: null,
      spreadTheWordData: {},
      fbPopUpVisibilty: false,
      popupvisibilty: true,
      bluetoothPopupVisibilty: false,
      beaconPopupVisibilty: false,
      historyPopupVisibilty: false,
      spreadTheWordIntro: false,
      spreadTheWordIntroText: '',
      spreadTheWordIntroTitle: '',
      spreadTheWordStatusTitle: '',
      spreadTheWordStatusMsg: '',
      spreadTheWordStatus: false,
      spreadTheWordCode: '',
      spreadTheWordURL: '',
      branchesForbranches: [],
      forceHideShowLoader: false, // infinite loading override (for experimentation)
      spreadTheWordProcessing: false
    };
  }

  componentWillUnmount() {
    // clean up
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  componentDidMount() {
    // listener for back button
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    this.props.getGames();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.gamesData !== this.props.gamesData) {
      this.setState({
        gamesData: nextProps.gamesData
      })
    }

    if (nextProps.fbConnectData !== this.props.fbConnectData) {
      this.setState({ fbConnectData: nextProps.fbConnectData }, () => {
        this.setState({ fbPopUpVisibilty: true });
      });
    }

    console.log("spreadTheWordData",nextProps.spreadTheWordData);
    // set spread the word data
    const { timestamp: spreadTheWordTime } = nextProps.spreadTheWordData;
    const { spreadTheWordProcessing } = this.state;
    if (
      spreadTheWordTime &&
      this.state.spreadTheWordTime !== spreadTheWordTime &&
      spreadTheWordProcessing
    ) {
      const {
        message,
        status
      } = nextProps.spreadTheWordData;

      if (status) {
        const {
          data: { url, Code },
        } = nextProps.spreadTheWordData;

        this.setState(
          {
            spreadTheWordTime: spreadTheWordTime,
            spreadTheWordCode: Code,
            spreadTheWordURL: url,
            forceHideShowLoader: true
          },
          async () => await this.handleShareReferralLink(url, Code)
        );
      } else {
        this.handleSpreadTheWordError(message);
      }
    }

    if (nextProps.branches !== this.props.branches) {
      this.setState({ branchesForbranches: nextProps.branches });

      if (nextProps.branches.length > 0) {
        const beacons = sortBeaconsFromBranches(nextProps.branches);
        if (beacons.length > 0) {
          detectBeaconProximity(
            beacons,
            this.handleDetectSuccess,
            this.handleDetectStopped
          );
        }
      }
    }
  }

  handleDetectSuccess = beaconFilter => {
    this.props.setLoadingState(false);
    const { branches = [] } = this.props;
    const foundBranch = findUUIDInBranches(beaconFilter[0].UUID, branches);
    Actions.wheel_game({ branch: foundBranch });
  };

  handleDetectStopped = () => {
    this.props.setLoadingState(false);
    this.setState({ beaconPopupVisibilty: true });
  };

  onBackPress() {
    Actions.drawer({ type: 'reset' });
    Actions.pop();
    return true;
  }

  _fbAuth = () => {
    LoginManager.logInWithPermissions([
      'public_profile',
      'email'
    ]).then(
      result => {
        if (result.isCancelled) {
        } else {
          const responseInfoCallback = (error, result) => {
            if (error) {
              alert(
                'Error fetching data: ' + (error.errorMessage || error.message)
              );
            } else {
              this.connnectToFaceBook(result);
            }
          };
          const infoRequest = new GraphRequest(
            '/me',
            {
              parameters: {
                fields: {
                  string: 'email,first_name,last_name,picture,name' // + ',user_friends,user_location,user_gender'
                }
              }
            },
            responseInfoCallback
          );
          new GraphRequestManager().addRequest(infoRequest).start();
        }
      },
      error => {
        alert('Login fail with error: ' + error);
      }
    );
  };

  connnectToFaceBook(result) {
    let formdata = new FormData();
    formdata.append('OrgId', ORGANIZATION_ID);
    formdata.append('ChannelId', CHANNEL_ID);
    formdata.append('LoyaltyId', this.props.LoyaltyId);
    formdata.append('FaceBookId', result.id);
    formdata.append('FaceBookEmail', result.email);
    formdata.append('FaceBookFirstName', result.first_name);
    formdata.append('FaceBookLastName', result.last_name);

    this.props.fbConnect(formdata);
  }

  onPressBack() {
    Actions.pop();
  }

  handleConnectFacebookTouch = () => {
    this._fbAuth();
  };

  handleCheckInTouch = () => {
    this.props.setLoadingState(true);
    Actions.wheel_game();
  };

  handleContactsSuccess = contact => {
    setTimeout(() =>
      this.handleSubmitContactToServer(contact), 2e3
    );
  };

  handleSubmitContactToServer(contactData) {
    const { LoyaltyId } = this.props;
    const { email, name, phone } = contactData;
    const formData = new FormData();

    formData.append('ChannelId', CHANNEL_ID);
    formData.append('OrgId', ORGANIZATION_ID);
    formData.append('LoyaltyId', LoyaltyId);
    formData.append('FriendMobile', parseMobileNumber(phone));
    this.setState({
      spreadTheWordReferral: name
    });
    this.props.spreadTheWord({ formData });
  }

  handleSpreadTheWordError = (message) => {
    this.setState({
      spreadTheWordProcessing: false,
      spreadTheWordStatus: true,
      spreadTheWordStatusTitle: 'UH-OH',
      spreadTheWordStatusMsg:
        message ? message : strings.BOOST_REFERRAL_PROCESSING_ERROR
    });
  };

  handleExceededError() {
    // console.log('handleExceededError ');
    this.setState({
      spreadTheWordProcessing: false,
      spreadTheWordStatus: true,
      spreadTheWordStatusTitle: 'UH-OH',
      spreadTheWordStatusMsg:
        strings.BOOST_REFERRAL_MAX_EXCEEDED_ERROR
    });
  }

  hideSpreadTheWordError = () => {
    // console.log('hideSpreadTheWordError ');
    this.setState({
      spreadTheWordStatus: false,
      spreadTheWordStatusTitle: '',
      spreadTheWordStatusMsg: ''
    });
  };

  handleShareReferralLink = async (spreadTheWordURL, spreadTheWordCode) => {
    setTimeout(() => {
      Share.share({
        title: 'Download bartartine',
        message: `Hey! Thought you might want to check out the all new bartartine app: ${spreadTheWordURL}\nCode: ${spreadTheWordCode}`
      }).then(event => {
        // console.log('shared success', event);
        const { spreadTheWordReferral } = this.state;
        const { action, activityType } = event;
        let successMessage = `Your referral link has been shared\nwith ${spreadTheWordReferral}.`;

        if (
          typeof activityType === 'string' &&
          activityType.toLowerCase().search('copy') > -1
        ) {
          successMessage = `You have copied your referral link.\nRemember to share it with ${spreadTheWordReferral}.`;
        }

        // console.log('success message', successMessage);

        if (event.action == 'sharedAction') {
          this.setState({
            spreadTheWordProcessing: false,
            forceHideShowLoader: false,
            spreadTheWordStatus: false,
            spreadTheWordStatusTitle: 'AWESOME!',
            spreadTheWordStatusMsg: successMessage
          });
        }
      }).catch(event => {
        this.setState({
          spreadTheWordProcessing: false,
          forceHideShowLoader: false
        });
      });
    }, 1e3)
  }

  handleSpreadTheWordIntro = (title, info) => {
    this.setState({ spreadTheWordIntroTitle: title, spreadTheWordIntroText: info, spreadTheWordIntro: true });
  };

  handleSpreadTheWordContinue = () => {
    this.setState(
      { spreadTheWordProcessing: true, spreadTheWordIntro: false },
      () => readUserContacts({ callback: this.handleSelectContact })
    );
  };

  handleSelectContact = () => {
    setTimeout(
      () =>
        ContactsWrapper.getContact()
          .then(this.handleContactsSuccess)
          .catch((err) => { }),
      1e3
    );
  };

  handleSpreadTheWordIntroClose = () => {
    this.setState({ spreadTheWordIntro: false });
  };

  checkBluetoothAndOnBeacon = () => {
    checkBluetoothStatus(
      () => this.props.getBranchesForBeacon(),
      () => this.setState({ bluetoothPopupVisibilty: true })
    );
  };

  onCrossPress = () => {
    this.setState({
      visibilty: false,
      fbPopUpVisibilty: false,
      bluetoothPopupVisibilty: false,
      beaconPopupVisibilty: false,
      historyPopupVisibilty: false
    });
  };

  renderSpreadTheWordIntro() {
    const {
      stwIntroContainer,
      stwIntroBody,
      stwIntroButton,
      stwIntroButtonText
    } = styles;
    const {
      componentTheme: { thirdColor },
      spreadTheWordIntroText
    } = this.state;
    stwIntroButton.backgroundColor = thirdColor;
    const bodyContent = spreadTheWordIntroText !== '' && spreadTheWordIntroText.split('\n');

    return (
      <View style={stwIntroContainer}>
        {bodyContent && bodyContent.length > 0 && 
          bodyContent.map((content, index) => (
          <View key={index} style={styles.stwIntroStyle}>
           <Text allowFontScaling={FONT_SCALLING} style={stwIntroBody}>
              {content}
            </Text>
          </View>
          ))
        }
        <TouchableOpacity
          onPress={this.handleSpreadTheWordContinue}
          style={stwIntroButton}
        >
          <Text style={stwIntroButtonText}>
            {strings.GOOD_TO_G0.toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  onPress = ({ MoreInfo, Title, Type }) => {
    switch (Type) {
      case strings.SPREAD_THE_WORD:
        this.handleSpreadTheWordIntro(Title, MoreInfo);
        break;

      case strings.SPIN_THE_WHEEL:
        this.handleCheckInTouch();
        break;

      case strings.FACEBOOK_CONNECT:
        this.handleConnectFacebookTouch();
        break;

      default:
    }
  };

  render() {
    const {
      container,
      listContainer,
      iconImageStyle,
      starImageStyle,
      listItemTitleTextStyle,
      listItemDetailTextStyle,
      descriptionTextStyle,
      listItemContainer,
    } = styles;

    const {
      componentTheme: { thirdColor, STAR_RED_IMAGE, ARROW_LEFT_RED },
      gamesData,
      spreadTheWordIntro,
      spreadTheWordIntroTitle,
    } = this.state;
    const { title } = this.props;

    return (
      <View style={[container, { backgroundColor: thirdColor }]}>
        {this.state.forceHideShowLoader ? null : <CommonLoader />}
        <BoostYourStartPopUp
          onCrossPress={this.onCrossPress}
          modalVisibilty={this.state.bluetoothPopupVisibilty}
          selectedHeading={'UH-OH!'}
          selectedSubHeading={'Turn on your Bluetooth \n to check in'}
          // selectedDetails={this.state.selectedDetails}
          appTheme={this.state.componentTheme}
        />
        <BoostYourStartPopUp
          onCrossPress={this.onCrossPress}
          modalVisibilty={this.state.beaconPopupVisibilty}
          selectedHeading={'UH-OH!'}
          selectedSubHeading={
            "We were unable to check you in. It seems you're out of range."
          }
          // selectedDetails={this.state.selectedDetails}
          appTheme={this.state.componentTheme}
        />
        <BoostYourStartPopUp
          onCrossPress={this.onCrossPress}
          modalVisibilty={this.state.visibilty}
          selectedHeading={this.state.selectedHeading}
          selectedSubHeading={this.state.selectedSubHeading}
          selectedDetails={this.state.selectedDetails}
          appTheme={this.state.componentTheme}
        />

        {/* SPREAD THE WORD ERROR */}
        <BoostYourStartPopUp
          onCrossPress={this.hideSpreadTheWordError}
          modalVisibilty={this.state.spreadTheWordStatus}
          selectedHeading={this.state.spreadTheWordStatusTitle}
          selectedSubHeading={this.state.spreadTheWordStatusMsg}
          appTheme={this.state.componentTheme}
        />
        {this.state.fbConnectData && (
          <BoostYourStartPopUp
            onCrossPress={this.onCrossPress}
            modalVisibilty={this.state.fbPopUpVisibilty}
            selectedHeading={this.state.fbConnectData.status ? 'SUCCESS!' : 'UH-OH!' }
            selectedSubHeading={this.state.fbConnectData.message}
            appTheme={this.state.componentTheme}
          />
        )}

        <CommonPopup
          onClose={this.handleSpreadTheWordIntroClose}
          color={APP_COLOR_BLACK}
          visibilty={spreadTheWordIntro}
          heading={spreadTheWordIntroTitle}
          customBody={this.renderSpreadTheWordIntro()}
        />

        <TitleBar
          onPress={this.onPressBack}
          color={thirdColor}
          titleText={title || strings.BOOST_YOUR_STARS}
          titleIcon={STAR_RED_IMAGE}
          backIcon={ARROW_LEFT_RED}
          titleIconSize={{ width: 25, height: 25, marginTop: -5 }}
        />
        <View style={[listContainer, { backgroundColor: APP_COLOR_WHITE }]}>
          <List
            bounces={false}
            horizontal={false}
            dataArray={gamesData}
            keyExtractor={(item) => item.Id.toString()}
            style={{ flex: 1 }}
            renderRow={(item, sectionID, rowID, highlightRow) => (
              <ListItem
                style={[
                  listItemContainer,
                  { backgroundColor: this.state.componentTheme.thirdColor }
                ]}
              >
                <ImageBackground
                  source={{ uri: item.Url }}
                  style={{
                    flex: 1,
                    width: '100%',
                    height: ITEM_CELL_HEIGHT,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row'
                  }}
                >
                  <TouchableOpacity
                    onPress={() => this.onPress(item)}
                    style={{
                      flex: 1,
                      width: '100%',
                      height: ITEM_CELL_HEIGHT,
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row'
                    }}
                  >
                    <View style={{ width: '90%' }}>
                      <View
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                      >
                        {item.Icon && <Image style={iconImageStyle} source={item.Icon} />}
                        <Text
                          allowFontScaling={FONT_SCALLING}
                          style={listItemTitleTextStyle}
                        >
                          {item.Title.toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.verticalHeightStyle} />
                      <Text
                        allowFontScaling={FONT_SCALLING}
                        style={descriptionTextStyle}
                      >
                        {/* { item.Details } */}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text
                          allowFontScaling={FONT_SCALLING}
                          style={[listItemDetailTextStyle, { marginTop: 1 }]}
                        >
                          {item.SubTitle.toUpperCase()}
                        </Text>
                        <Image
                          style={starImageStyle}
                          source={STAR_WHITE_IMAGE}
                          resizeMode="contain"
                        />
                      </View>
                    </View>
                    <View style={{ width: '10%', justifyContent: 'center' }}>
                    </View>
                  </TouchableOpacity>
                </ImageBackground>
              </ListItem>
            )}
          />
        </View>
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    width: null,
    height: null,
    alignItems: 'center',
    backgroundColor: APP_COLOR_BLACK
  },
  listContainer: {
    flex: 1,
    backgroundColor: APP_COLOR_RED,
    width: '100%'
  },
  listItemContainer: {
    // height: ITEM_CELL_HEIGHT + DETAIL_CONTAINER_HEIGHT,
    flexDirection: 'column',
    marginLeft: 0,
    paddingLeft: 0,
    paddingRight: 0,
    marginRight: 0,
    marginTop: 0,
    paddingTop: 0,
    paddingBottom: IF_OS_IS_IOS ? 0 : 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: ITEMS_MARGIN
  },
  listItemTitleTextStyle: {
    color: APP_COLOR_WHITE,
    marginStart: moderateScale(10),
    fontSize: ITEM_TITLE_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_BOLD,
    marginTop: IF_OS_IS_IOS ? 10 : 5
  },
  listItemDetailTextStyle: {
    color: APP_COLOR_WHITE,
    marginStart: MARGIN_LEFT_RIGHT,
    fontSize: ITEM_DETAIL_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_BOLD
  },
  descriptionTextStyle: {
    color: APP_COLOR_WHITE,
    fontSize: DESCRIPTION_TEXT_SIZE,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    marginStart: MARGIN_LEFT_RIGHT,
    marginEnd: MARGIN_LEFT_RIGHT,
    marginTop: MARGIN_LEFT_RIGHT,
    marginBottom: MARGIN_LEFT_RIGHT
  },
  iconImageStyle: {
    marginStart: MARGIN_LEFT_RIGHT,
    alignSelf: 'center'
  },
  starImageStyle: {
    alignSelf: 'center',
    marginStart: moderateScale(3),
    width: scale(20),
    height: verticalScale(20),
    marginBottom: IF_OS_IS_IOS ? moderateScale(8) : moderateScale(0)
  },
  stwIntroContainer: {
    padding: 10,
    paddingTop: 15,
    paddingBottom: 15
  },
  stwIntroBody: {
    textAlign: 'center'
  },
  stwIntroButton: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: COMMON_BUTTON_RADIOUS,
    margin: 15,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: IF_OS_IS_IOS ? 8 : 0,
    width: GO_FOR_IT_BUTTON_WIDTH,
    height: 40
  },
  stwIntroButtonText: {
    textAlign: 'center',
    color: APP_COLOR_WHITE,
    fontSize: scale(15),
    fontFamily: DINENGSCHRIFT_BOLD
  },
  verticalHeightStyle: {
    height: IF_OS_IS_IOS ? verticalScale(90) : verticalScale(60)
  }
};

function mapStateToProps(state) {
  const { gamesData, fbConnectData, spreadTheWordData, accessToken } = state.app;
  const userData = getUserObject(state);
  return {
    accessToken,
    gamesData,
    fbConnectData: fbConnectData,
    spreadTheWordData: spreadTheWordData,
    userData: userData,
    LevelName: userData.LevelName,
    LoyaltyId: userData.LoyaltyId,
    LoyaltyLevelId: userData.LevelId,
    userType: state.app.userType,
    CustomerId: userData.CustomerId || 0,
    branches: state.branches.branches
  };
}

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      ...branchesActions,
      ...appstateAction
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BoostYourStars);
