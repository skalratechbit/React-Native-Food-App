import React, { Component } from 'react';
import {
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { APP_COLOR_WHITE, APP_COLOR_RED, APP_COLOR_BLACK } from '../../config/colors';
import { IF_OS_IS_IOS, FONT_SCALLING } from '../../config/common_styles';
import { APP_STORE_ID } from '../../config/constants/network_constants';
import strings from '../../config/strings/strings';
import { ABOUT_BACKGROUND_IMAGE, TOP_BACKGROUND } from '../../assets/images';
import { DINENGSCHRIFT_REGULAR } from '../../assets/fonts';
import { Actions } from 'react-native-router-flux';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import VersionNumber from 'react-native-version-number';
import TitleBar from '../../components/TitleBar';
import { getAppstoreAppVersion } from 'react-native-appstore-version-checker';
import { openInStore } from 'react-native-app-link';
import { bindActionCreators } from 'redux';
import { actions as registerActions } from '../../ducks/register';
import { connect } from 'react-redux';
import DeviceInfo from "react-native-device-info";
import Common from '../../components/Common';
const TITLE_FONT_SIZE = moderateScale(30);
const LEFT_RIGHT_MARGINS = moderateScale(20);
const ABOUT_ICON_SIZE = scale(25.5);

const IMAGE_CONTAINER_HEIGHT = verticalScale(249.5);
const DESCRIPTION_CONTAINER_HEIGHT = verticalScale(165);
const DESCRIPTION_FONT_SIZE = scale(14);
const BROUGHT_TO_YOU_FONT_SIZE = scale(14);

const BOTTOM_CONTAINER_HEIGHT = verticalScale(138);

class About extends Component {
  constructor(props) {
    super(props);
    this. state = {
      componentTheme: {},
      currentVersion: VersionNumber.appVersion,
      storeVersion: VersionNumber.appVersion,
      alertVisibilty: false,
      alertTitle: '',
    };
  }


  componentWillMount() {
    this.props.getAboutInfo();

    this.setThemeOfComponent();

    //get app store version
    getAppstoreAppVersion(IF_OS_IS_IOS ? APP_STORE_ID : VersionNumber.bundleIdentifier)
      .then((storeVersion) => {
        if(parseInt(storeVersion))
          this.setState({
            storeVersion
          });
      })
      .catch((err) => {
        console.log('error fetching store version', err);
      });

  }
  setThemeOfComponent() {
    const theme = AsyncStorage.getItem('theme').then(data =>
      this.setState({ componentTheme: JSON.parse(data) })
    );
  }
  renderPopup = () => {
    const {
      componentTheme: {thirdColor}, alertVisibilty,
      alertTitle,
    } = this.state;
    return (
        <Common.Popup
            onClose={() => {
              this.setState({
                alertVisibilty: false,
                alertTitle: ''
              });
            }}
            visibilty={alertVisibilty}
            heading={alertTitle}
            // subbody={alertMessage}
        />
    );
  }
  onPress = (event, caption) => {
    switch (caption) {
      case strings.BACK:
        Actions.pop();
        break;

      case strings.CONTINUE:
        this.setState({
          alertVisibilty: true,
          alertTitle: strings.CONTINUE,
        });
        break;

      case strings.ADD_ITEMS:
        this.setState({
          alertVisibilty: true,
          alertTitle: strings.ADD_ITEMS,
        });
        break;

      default:
    }
  };

  handleGoToAboutWebsite() {
    Linking.openURL('http://' + strings.ABOUT_WEBSITE);
  }

  handleOpenEMail() {
    Linking.openURL('mailto:wecare@bar-tartine.com?subject=&body=');
  }

  handleGoToTermsAndConditions() {
    Linking.openURL('http://www.bar-tartine.com/BARTARTINE_MOBILE_APP_TERMS.pdf');
  }

  backButtonPress() {
    Actions.pop();
  }

  handleOpenInStore() {
    openInStore({
      appName: 'Bar Tartine',
      appStoreId: APP_STORE_ID,
      appStoreLocale: 'us',
      playStoreId: VersionNumber.bundleIdentifier
    });
  }

  render() {
    const {
      container,
      subContainer,
      broughtToYouTextStyle,
      aboutDescriptionTextStyle,
    } = styles;
    const { currentVersion, storeVersion } = this.state;
    const { componentTheme: { thirdColor, ARROW_LEFT_RED} } = this.state;
    const newVersionReady = currentVersion < storeVersion;
    const {title} =this.props;
    const detailsInfo = this.props.aboutInfo && this.props.aboutInfo.Details.split("<br>")
    return (
      <ScrollView style={{ backgroundColor: APP_COLOR_BLACK }}>
        {this.renderPopup()}
        <View style={container}>
          <TitleBar
            onPress={this.backButtonPress}
            color={thirdColor}
            titleText={title}
            backIcon={ARROW_LEFT_RED}
            titleIconSize={{ width: ABOUT_ICON_SIZE, height: 24 }}
            />
           <ImageBackground
             style={[subContainer, { height: IMAGE_CONTAINER_HEIGHT }]}
             source={TOP_BACKGROUND}
             resizeMode="cover"
           />
          <View
            style={[
              subContainer,
              {
                height: DESCRIPTION_CONTAINER_HEIGHT,
                backgroundColor: this.state.componentTheme.thirdColor,
                paddingTop: 10
              }
            ]}
            source={ABOUT_BACKGROUND_IMAGE}>
            <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <Text allowFontScaling={FONT_SCALLING} style={aboutDescriptionTextStyle}>
                {this.props.aboutInfo && this.props.aboutInfo.Title}
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <Text allowFontScaling={FONT_SCALLING} style={aboutDescriptionTextStyle}>
                {detailsInfo && detailsInfo[0]}
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }} >
                <Text allowFontScaling={FONT_SCALLING} style={aboutDescriptionTextStyle}
                onPress={() => this.handleGoToAboutWebsite()}>
                {detailsInfo && detailsInfo[1]}
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }} >
                <Text allowFontScaling={FONT_SCALLING} style={aboutDescriptionTextStyle}
                onPress={() => this.handleOpenEMail()}>
                {detailsInfo && detailsInfo[2]}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={[
              subContainer,
              {
                height: BOTTOM_CONTAINER_HEIGHT,
                backgroundColor: APP_COLOR_BLACK,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }
            ]}>
            <View style={{ flexDirection: 'row' }}>
              <Text
                allowFontScaling={FONT_SCALLING}
                style={[broughtToYouTextStyle, { color: APP_COLOR_WHITE }]}>
                {strings.VERSION}
              </Text>
              <Text
                allowFontScaling={FONT_SCALLING}
                style={[broughtToYouTextStyle, { color: APP_COLOR_WHITE }]}>
                {  DeviceInfo.getVersion()
                }
              </Text>
            </View>
        
            <TouchableOpacity onPress={this.handleGoToTermsAndConditions}>
              <Text
                allowFontScaling={FONT_SCALLING}
                style={[
                  broughtToYouTextStyle,
                  {
                    color: APP_COLOR_WHITE,
                    textDecorationLine: 'underline',
                    marginTop: moderateScale(30)
                  }
                ]}>
                {strings.TERMS_AND_CONDITIONS}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  subContainer: {
    backgroundColor: APP_COLOR_WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: LEFT_RIGHT_MARGINS,
    paddingEnd: LEFT_RIGHT_MARGINS,
    width: '100%'
  },
  titleArrowImageStyle: {
    marginStart: moderateScale(10),
    marginBottom: IF_OS_IS_IOS ? 4 : 0
  },
  aboutTextStyle: {
    fontSize: TITLE_FONT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_RED
  },
  aboutDescriptionTextStyle: {
    fontSize: DESCRIPTION_FONT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_WHITE,
    textAlign: 'center'
  },
  broughtToYouTextStyle: {
    fontSize: BROUGHT_TO_YOU_FONT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_BLACK,
    textAlign: 'center'
  },
  aboutDescriptionUnderlinedTextStyle: {
    fontSize: DESCRIPTION_FONT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_WHITE,
    textAlign: 'center',
    textDecorationLine: 'underline'
  },
  aboutIconStyle: {
    height: ABOUT_ICON_SIZE,
    width: ABOUT_ICON_SIZE,
    marginStart: moderateScale(10),
    marginBottom: IF_OS_IS_IOS ? 10 : 0
  },
  creditContainer: { flexDirection: 'row', marginTop: moderateScale(10), paddingBottom: 15 }
};

function mapStateToProps(state) {
  //console.log('state', state);
  const {
    register: { aboutInfo }
  } = state;
  return {
    aboutInfo
  };
}
const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      ...registerActions
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(About);
