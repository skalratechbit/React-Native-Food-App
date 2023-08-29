import React, { Component } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  Animated,
} from "react-native";
import AsyncStorage from '@react-native-community/async-storage';
import { Button } from "native-base";
import { connect } from "react-redux";
import { Logo } from "../../components/Logo";
import { BACKGROUND_IMAGE } from "../../assets/images";

import strings from "../../config/strings/strings";
import {
  APP_COLOR_WHITE,
  APP_COLOR_BLACK
} from "../../config/colors";
import {
  DINENGSCHRIFT_REGULAR,
  ROADSTER_REGULAR,
  PACIFICO,
  DINENGSCHRIFT_BOLD
} from "../../assets/fonts";
import {
  COMMON_BUTTON_STYLE,
  COMMON_BUTTON_TEXT_STYLE,
  COMMON_BOTTOM_CLICKABLE_TEXT_STYLE,
  COMMON_OVERLAY_VIEW_STYLE,
  COMMON_REGISTER_LOGIN_FLOW_TEXT_STYLE,
  COMMON_BOTTOM_UNDERLINED_TEXT_TOP_MARGIN,
  COMMON_MARGIN_BETWEEN_COMPONENTS,
  COMMON_BACKGROUND_IMAGE_CONTAINER_STYLE,
  FONT_SCALLING
} from "../../config/common_styles";
import { THEME_LEVEL_1 } from "../../config/common_styles/appthemes";
import { Actions } from "react-native-router-flux";
import { actions as homeActions } from "../../ducks/home";
import { actions as appstateAction } from "../../ducks/setappstate";
import { bindActionCreators } from "redux";

const EXPECTING_TEXT_SIZE = 30;
const SKIP_TEXT_SIZE = 21;

class Welcome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timesClicked: 0,
      spinValue: new Animated.Value(0),
      index: 0
    };
    this._onPressButton = this._onPressButton;
  }

  componentWillMount() {}
  onPress = (event, caption) => {
    switch (caption) {
      case strings.REGISTER:
        Actions.register();
        break;

      case strings.LOGIN:
        // this.props.setUserType('login');
        Actions.register();
        //this.props.setAppTheme({userLevel:3});
        break;

      case strings.SKIP:
        AsyncStorage.setItem("theme", JSON.stringify(THEME_LEVEL_1));
        this.props.setUserType("");
        //this.props.fetchMeals()
        Actions.drawer({ type: "reset" });
        break;

      default:
    }
  };

  _onChange = form => {};
  _onPressButton = () => {
    let timesClicked = this.state.timesClicked;
    timesClicked++;
    //console.log(timesClicked + ' Clicked ');
    this.setState({
      timesClicked: timesClicked
    });
  };

  render() {
    const { subContainer } = styles;

    const spin = this.state.spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "560deg"]
    });
    return (
      <ImageBackground style={COMMON_BACKGROUND_IMAGE_CONTAINER_STYLE} source={BACKGROUND_IMAGE} resizeMode="stretch">
        <View style={COMMON_OVERLAY_VIEW_STYLE} />
        <View style={subContainer}>
          <Logo />
        </View>
        <View style={subContainer}>
          <Text
            allowFontScaling={FONT_SCALLING}
            style={[COMMON_REGISTER_LOGIN_FLOW_TEXT_STYLE, { fontFamily: PACIFICO }]}
          >
            {strings.EXPECTING.toLowerCase()}
          </Text>
        </View>
        <View style={subContainer}>
          <Button
            onPress={event => this.onPress(event, strings.REGISTER)}
            style={[COMMON_BUTTON_STYLE, { backgroundColor: APP_COLOR_BLACK }]}
          >
            <Text
              allowFontScaling={FONT_SCALLING}
              style={[COMMON_BUTTON_TEXT_STYLE, { fontFamily: ROADSTER_REGULAR }]}
            >
              {strings.REGISTER.toUpperCase()}
            </Text>
          </Button>
        </View>
        <View style={subContainer}>
          <Button
            onPress={event => this.onPress(event, strings.LOGIN)}
            style={[COMMON_BUTTON_STYLE, { backgroundColor: APP_COLOR_BLACK }]}
          >
            <Text
              allowFontScaling={FONT_SCALLING}
              style={[COMMON_BUTTON_TEXT_STYLE, { fontFamily: ROADSTER_REGULAR }]}
            >
              {strings.LOGIN.toUpperCase()}
            </Text>
          </Button>
        </View>
        <TouchableOpacity
          onPress={event => this.onPress(event, strings.SKIP)}
          style={[subContainer, { marginTop: COMMON_BOTTOM_UNDERLINED_TEXT_TOP_MARGIN }]}
        >
          <Text
            allowFontScaling={FONT_SCALLING}
            style={[COMMON_BOTTOM_CLICKABLE_TEXT_STYLE, { fontFamily: DINENGSCHRIFT_BOLD }]}
          >
            {strings.SKIP.toUpperCase()}
          </Text>
        </TouchableOpacity>
      </ImageBackground>
    );
  }
}

const styles = {
  ontainer: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 30
  },
  webView: {
    backgroundColor: "#fff",
    height: 350
  },
  container: {
    flex: 1,
    // remove width and height to override fixed static size
    width: null,
    height: null,
    marginRight: -1,
    marginTop: -1,
    alignItems: "center",
    justifyContent: "center"
  },
  subContainer: {
    backgroundColor: "transparent",
    marginBottom: COMMON_MARGIN_BETWEEN_COMPONENTS,
    marginTop: COMMON_MARGIN_BETWEEN_COMPONENTS
  },
  expectingTextStyle: {
    alignSelf: "center",
    color: APP_COLOR_WHITE,
    fontSize: EXPECTING_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    textAlign: "center"
  },
  skipTextStyle: {
    alignSelf: "center",
    color: APP_COLOR_WHITE,
    fontSize: SKIP_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    textAlign: "center",
    textDecorationLine: "underline"
  }
};
function mapStateToProps({ apptheme }) {
  return { userLevelTheme: apptheme };
}

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      ...homeActions,
      ...appstateAction
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Welcome);

