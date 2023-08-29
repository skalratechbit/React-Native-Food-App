import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  ImageBackground,
  TouchableOpacity,
  Platform,
  ScrollView,
  Linking,
  BackHandler
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Actions } from 'react-native-router-flux';
import { APP_COLOR_WHITE, APP_COLOR_RED, APP_COLOR_BLACK } from '../../config/colors';
import { IF_OS_IS_IOS, FONT_SCALLING } from '../../config/common_styles';
import strings from '../../config/strings/strings';
import {
  PHONE_ICON_IMAGE,
  ADDRESS_PIN,
  TIME_ICON_IMAGE
} from '../../assets/images';
import { DINENGSCHRIFT_REGULAR, HELVETICANEUE_LT_STD_CN, DINENGSCHRIFT_BOLD } from '../../assets/fonts';
import TitleBar from '../../components/TitleBar';

const TITLE_FONT_SIZE = 21;
const LEFT_RIGHT_MARGINS = 20;

const IMAGE_CONTAINER_HEIGHT = 250.5;
const DESCRIPTION_FONT_SIZE = 18;
const BROUGHT_TO_YOU_FONT_SIZE = 15.5;

const BOTTOM_TITLE_CONTAINER_HEIGHT = 89;

//Note: This can be kept as an external function
const callNumber = url => {
  Linking.canOpenURL(url)
    .then(supported => {
      if (!supported) {
        //console.log("Can't handle url: " + url);
      } else {
        return Linking.openURL(url);
      }
    })
    .catch(err => console.error('An error occurred', err));
};

class AtDetail extends Component {
  state = {
    componentTheme: {}
  };
  componentWillMount() {
    //console.log(this.props.addressObject);
    this.setThemeOfComponent();
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
  }

  componentWillUnmount() {
    //clean up
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  onBackPress() {
    Actions.weareat();
    return true;
  }

  setThemeOfComponent() {
    const theme = AsyncStorage.getItem('theme').then(data =>
      this.setState({ componentTheme: JSON.parse(data) })
    );
  }

  handleNumberPress(event) {
    const { tel } = this;
    callNumber(tel);
  }

  openGps(x, y) {
    let url = `comgooglemaps://?q=${x},${y}&z=21`;
    let googleMapWebUrl = `https://maps.google.com/?q=${x},${y}&z=21`;
    Linking.canOpenURL(url).then(supported => {
      if (!supported) {
        Linking.openURL(googleMapWebUrl);
      } else {
        Linking.openURL(url);
      }
    }).catch((error) => {
      Linking.openURL(googleMapWebUrl);
    });
  }

  openExternalApp(url) {
    //console.log('url', url);
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        alert("Don't know how to open URI: " + url);
      }
    });
  }

  render() {
    const {
      container,
      subContainer,
      titleTextStyle,
      detailsImageStyle,
      detailsTextStyle
    } = styles;

    const { componentTheme: { thirdColor, ARROW_LEFT_RED} } = this.state;
    const { addressObject: { ImgUrl, Name, Phones, OpeningHours, XLocation, YLocation } } = this.props;
    return (
      <ScrollView>
        <View style={container}>
          <TitleBar
            onPress={this.onBackPress}
            color={thirdColor}
            backIcon={ARROW_LEFT_RED}
            titleText={strings.BACK}
            />
          {ImgUrl && ImgUrl.match(/\.jp(e)*g|\.png/i) && (
            <ImageBackground
              style={[subContainer, { height: IMAGE_CONTAINER_HEIGHT }]}
              source={{
                uri: ImgUrl
              }}
            />
          )}

          <View
            style={[
              subContainer,
              {
                height: BOTTOM_TITLE_CONTAINER_HEIGHT,
                backgroundColor: APP_COLOR_BLACK
              }
            ]}>
            <Text allowFontScaling={FONT_SCALLING} style={titleTextStyle}>
              {Name}
            </Text>
          </View>
          <View
            style={[
              subContainer,
              {
                backgroundColor: thirdColor,
                flexDirection: 'column',
                padding: 20
              }
            ]}>
            <TouchableOpacity
              tel={`tel:${Phones}`}
              onPress={this.handleNumberPress}
              style={styles.rowstyle}>
              <Image style={detailsImageStyle} source={PHONE_ICON_IMAGE} />
              <Text allowFontScaling={FONT_SCALLING} style={detailsTextStyle}>
                {Phones}
              </Text>
            </TouchableOpacity>
            <View style={styles.rowstyle}>
              <Image style={detailsImageStyle} source={TIME_ICON_IMAGE} />
              <Text allowFontScaling={FONT_SCALLING} style={detailsTextStyle}>
                {OpeningHours}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                this.openGps(XLocation, YLocation)
              }
              style={styles.rowstyle}>
              <Image style={detailsImageStyle} source={ADDRESS_PIN} />
              <Text allowFontScaling={FONT_SCALLING} style={detailsTextStyle}>
                {strings.LOCATION}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }
}
const styles = {
  rowstyle: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
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
    color: APP_COLOR_RED
  },
  titleTextStyle: {
    fontSize: TITLE_FONT_SIZE,
    fontFamily: DINENGSCHRIFT_BOLD,
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
    marginEnd: 5,
    marginBottom: IF_OS_IS_IOS ? 8 : 0
  },
  detailsImageStyle: {
    marginEnd: 10,
    width: 25,
    marginTop: 5,
    marginBottom: IF_OS_IS_IOS ? 10 : 0,
    resizeMode: 'contain'
  },
  detailsTextStyle: {
    fontSize: 21,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_WHITE,
    marginTop: 2
  }
};
export default AtDetail;
