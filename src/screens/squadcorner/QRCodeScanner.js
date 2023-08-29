'use strict';
import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { POPCROSS_IC } from '../../assets/images';
import { connect } from 'react-redux';
import { APP_COLOR_RED, APP_COLOR_WHITE, APP_COLOR_BLACK } from '../../config/colors';
import QRCodeScan from 'react-native-qrcode-scanner';

import {
  DINENGSCHRIFT_REGULAR,
  DINENGSCHRIFT_BOLD,
} from '../../assets/fonts';
import { FONT_SCALLING, IF_OS_IS_IOS, SCREEN_WIDTH } from '../../config/common_styles';
import strings from '../../config/strings/strings';
import { getUserObject, getUserPaymentMethods } from '../../helpers/UserHelper';
import CommonPopup from '../../components/Common/CommonPopup';
import { getThemeByLevel } from '../../config/common_styles/appthemes';
import TitleBar from '../../components/TitleBar';

const PROFILE_IMAGE_SIZE = 80;
const LEFT_RIGHT_MARGINS = 17;
const TITLE_CONTAINER_HEIGHT = 52;
const TITLE_FONT_SIZE = 30;

class QRCodeScanner extends Component {
  constructor(props) {
    super(props);

    this.state = {
      paymentMethodsOnSquadCorner: this.props.paymentMethods,
      showMsg: true,
      componentTheme: getThemeByLevel(this.props.userData.LevelName),
      showLoginWarning: false
    };
  }

  componentWillMount() {

  }

  componentDidMount() {
    if (!this.props.userData.CustomerId) this.setState({
      showLoginWarning: true
    })
  }

  onBarCodeRead = e => {
    Actions.qrcodescannedbill({
      paymentMethodsOnSquadCorner: this.props.paymentMethodsOnSquadCorner,
      QRCodeScannedString: e.data
    });
  };

  handleGoBack = () => {
    // go back
    Actions.pop();
  };

  hideMessage = () => {
    this.setState({ showMsg: !this.state.showMsg });
  };

  handleCloseLoginWarning = () => {
    this.setState({
      showLoginWarning: false
    }, () => Actions.pop())
  }

  render() {
    const { thirdColor, ARROW_LEFT_RED } = this.state.componentTheme;
    const { showLoginWarning } = this.state;
    return ([
      //{/* BACKBUTTON - TODO: Create a Component */}
      <TitleBar
        onPress={this.handleGoBack}
        color={thirdColor}
        backIcon={ARROW_LEFT_RED}
        titleText={strings.GO_BACK}
      />,
      <View key={'cameraContainer'} style={styles.container}>
        <View style={styles.cameraContainer}>
          <QRCodeScan
            onRead={this.onBarCodeRead}
            topViewStyle={{ width: '100%', backgroundColor: this.state.showMsg ? thirdColor : APP_COLOR_BLACK }}
            bottomViewStyle={styles.bottomContentStyle}
            cameraStyle={{ width: '100%' }}
            bottomContent={
              <Text style={[styles.tipTextStyle]}>{strings.SCAN_BILL_TIP.toUpperCase()}</Text>
            }
          />
        </View>
        <View
          style={[
            styles.qrCodeMessageViewStyle,
            { backgroundColor: this.state.componentTheme.thirdColor }
          ]}>
          {
            this.state.showMsg ?
              (
                <>
                  <Text allowFontScaling={FONT_SCALLING} style={styles.titleTextStyle}>
                    {(strings.SCAN_YOUR_BILL + "\n" + strings.TO_COLLECT).toUpperCase()}
                  </Text>
                  <Text allowFontScaling={FONT_SCALLING} style={styles.messageTextStyle}>
                    {strings.ONLY_ONE.toUpperCase()}
                  </Text>
                  <TouchableOpacity onPress={this.hideMessage} style={styles.crossImageTouchStyle}>
                    <Image style={styles.crossImageStyle} source={POPCROSS_IC} />
                  </TouchableOpacity>
                </>
              ) :
              (
                <Text allowFontScaling={FONT_SCALLING} style={styles.tipTextStyle}>
                  {strings.SCANNING}
                </Text>
              )
          }
        </View>
        <CommonPopup
          onClose={this.handleCloseLoginWarning}
          color={thirdColor}
          visibilty={showLoginWarning}
          heading={'UH-OH'}
          subbody={'YOU NEED TO BE LOGGED IN\n TO USE THE SCANNER.'}
        />
      </View>
    ]);
  }
}

const styles = StyleSheet.create({
  titleBar: {
    backgroundColor: APP_COLOR_WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: LEFT_RIGHT_MARGINS,
    paddingEnd: LEFT_RIGHT_MARGINS,
    width: SCREEN_WIDTH,
    height: TITLE_CONTAINER_HEIGHT
  },
  titleArrowImageStyle: {
    marginStart: 0,
    marginEnd: 5,
    marginBottom: IF_OS_IS_IOS ? 10 : 0,
    marginTop: 7
  },
  aboutTextStyle: {
    fontSize: TITLE_FONT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_RED,
    marginTop: 7
  },
  messageTextStyle: {
    color: APP_COLOR_WHITE,
    fontSize: 10,
    fontFamily: DINENGSCHRIFT_BOLD,
    alignSelf: 'center',
    textAlign: 'center'
  },
  qrCodeMessageViewStyle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    paddingTop: 15,
    paddingBottom: 13,
    height: "auto",
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    width: '100%'
  },
  cameraContainer: {
    flex: 1,
    padding: 0,
  },
  bottomContentStyle: {
    width: '100%',
    backgroundColor: APP_COLOR_RED,
    borderColor: APP_COLOR_BLACK,
    borderWidth: 10,
  },
  preview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: APP_COLOR_BLACK
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    color: '#000',
    padding: 10,
    margin: 40
  },
  profileImageStyle: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: PROFILE_IMAGE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  borderImage: {
    height: 200,
    width: 300,
    resizeMode: 'stretch'
  },
  titleTextStyle: {
    color: APP_COLOR_BLACK,
    fontSize: 22,
    fontFamily: DINENGSCHRIFT_BOLD,
    textAlign: "center",
    lineHeight: 27
  },
  tipTextStyle: {
    color: APP_COLOR_WHITE,
    fontSize: 12,
    fontFamily: DINENGSCHRIFT_BOLD
  },
  crossImageStyle: {
    width: 18,
    height: 18,
    resizeMode: 'contain'
  },
  crossImageTouchStyle: {
    width: 30,
    height: 30,
    right: 5,
    top: 15,
    position: 'absolute'
  }
});

function mapStateToProps(state) {
  const userData = getUserObject(state);
  const paymentMethods = getUserPaymentMethods(state);
  return { paymentMethods, userData };
}

export default connect(
  mapStateToProps,
  null
)(QRCodeScanner);
