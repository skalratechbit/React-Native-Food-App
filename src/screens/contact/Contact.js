import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView
} from 'react-native';
import { connect } from 'react-redux';
import { Button } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { bindActionCreators } from 'redux';
import { actions as registerActions } from '../../ducks/register';
import { ORGANIZATION_ID, CHANNEL_ID } from '../../config/constants/network_constants';
import { BoostYourStartPopUp } from '../../components';
import { getUserObject } from '../../helpers/UserHelper';
import { getThemeByLevel } from '../../config/common_styles/appthemes';
import TitleBar from '../../components/TitleBar';

import { APP_COLOR_WHITE, TEXT_INPUT_PLACEHOLDER_COLOR, APP_COLOR_BLACK } from '../../config/colors';
import {
  COMMON_BUTTON_TEXT_STYLE,
  COMMON_BUTTON_STYLE,
  IF_OS_IS_IOS,
  FONT_SCALLING,
  SCREEN_WIDTH
} from '../../config/common_styles';
import strings from '../../config/strings/strings';
import {
  DINENGSCHRIFT_REGULAR,
  HELVETICANEUE_LT_STD_CN,
  ROADSTER_REGULAR
} from '../../assets/fonts';
import Common from '../../components/Common';
import { moderateScale } from 'react-native-size-matters';

const LEFT_RIGHT_MARGINS = moderateScale(20);

class Contact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Subject: '',
      Message: '',
      error: '',
      showConfirmation: false,
      confirmationMessage: '',
      confirmationTitle: '',
      contactUsProcessing: false
    }
  }

  componentWillMount() {
    this.props.getContactInfo();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.contactUsData) {
      const { contactUsData: { timestamp } } = nextProps;
      const { confirmationTime, contactUsProcessing } = this.state;

      if (nextProps.contactUsData?.timestamp !== 0 && nextProps.contactUsData?.error) {
        this.handleContactUsError(nextProps.contactUsData?.error, nextProps.contactUsData?.message)
      } else if (nextProps.contactUsData?.timestamp !== 0 && !nextProps.contactUsData?.error) {
        this.handleContactUsSuccess(nextProps.contactUsData?.message);
      }
    }
  }

  //handlers
  handleContactUsError(error, message) {
    this.setState({
      showConfirmation: true,
      confirmationMessage: strings.THERE_WAS_A_PROBLEM_SENDING_YOUR_MESSAGE,
      confirmationTitle: 'UH-OH',
      contactUsProcessing: false
    });
  }

  handleContactUsSuccess(message) {
    this.setState({
      showConfirmation: true,
      confirmationMessage: message || '',
      confirmationTitle: 'SUCCESS!',
      contactUsProcessing: false
    });
  }

  handleHideConfirmation = () => {
    this.props.setContactDataDefault();
    this.setState(
      {
        showConfirmation: false,
        confirmationMessage: '',
        confirmationTitle: ''
      },
      () => {
        Actions.pop();
      }
    );
  };

  handleMessageChange = (Message) => {
    this.setState({
      Message
    })
  }

  handleSubjectChange = (Subject) => {
    this.setState({
      Subject
    })
  }

  //methods
  sendContactMessage = () => {
    if (this.validateUserInputs()) {
      this.sendContactUs();
    }
  }

  backButtonPress() {
    Actions.pop();
  }

  validateUserInputs = () => {
    const { Subject, Message } = this.state;
    let errorMessage = '';
    const SubjectEmpty = Subject.trim() == '';
    const MessageEmpty = Message.trim() == '';

    if (SubjectEmpty) errorMessage = 'Your Subject cannot be empty.';
    else if (MessageEmpty) errorMessage = 'Your Message cannot be empty.';

    this.setState({ error: errorMessage });

    return errorMessage == '';
  }

  sendContactUs() {
    let formdata = new FormData();
    const { ACCESS_TOKEN, Email, LastName, FirstName, FullMobile } = this.props;
    const { Subject, Message } = this.state;

    formdata.append('token', ACCESS_TOKEN);
    formdata.append('OrgId', ORGANIZATION_ID);
    formdata.append('ChannelId', CHANNEL_ID);
    formdata.append('Email', Email);
    formdata.append('FirstName', FirstName);
    formdata.append('LastName', LastName);
    formdata.append('Mobile', FullMobile);
    formdata.append('Subject', Subject);
    formdata.append('Message', Message);
    formdata.append('CopyEmail', Email);

    this.setState({
      contactUsProcessing: true
    },
      () => {
        this.props.contactUs(formdata);
      }
    );
  }

  clearError = () => {
    this.setState({ error: '' });
  };

  render() {
    const {
      componentTheme,
      componentTheme: { thirdColor, ARROW_LEFT_RED },
      contactUsInfo,
      title
    } = this.props;
    const {
      showConfirmation,
      confirmationTitle,
      confirmationMessage,
      Subject,
      Message
    } = this.state;
    const { EmailAddress, Hotline } = contactUsInfo || {};

    styles = renderStyles(thirdColor);

    return (
      <KeyboardAvoidingView style={styles.container}
        behavior={IF_OS_IS_IOS ? "padding" : null}
        keyboardVerticalOffset={IF_OS_IS_IOS ? 40 : 1}
        enabled
      >
        <TitleBar
          onPress={this.backButtonPress}
          color={thirdColor}
          titleText={title}
          // titleIcon={CONTACT_RED_IMAGE}
          titleIconSize={{ width: 35 }}
          backIcon={ARROW_LEFT_RED}
        />
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} bounces={false}>
          <View style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} style={styles.formContainer}>
              <View style={styles.subContainer}>
                <View style={[styles.inputRow, styles.SubjectContainer]}>
                  <View style={styles.inputLabelColumn}>
                    <Text allowFontScaling={FONT_SCALLING} style={styles.label}>
                      {strings.SUBJECT.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.inputColumn}>
                    <Common.SlimInput
                      style={styles.textInput}
                      value={Subject}
                      onFocus={this.clearError}
                      onChangeText={this.handleSubjectChange}
                      placeholder={'Food'}
                      placeholderTextColor={TEXT_INPUT_PLACEHOLDER_COLOR}
                      maxLength={50}
                    />
                  </View>
                </View>
                <View style={[styles.inputRow, styles.bodyContainer]}>
                  <Common.SlimInput
                    style={styles.bodyInput}
                    value={Message}
                    onFocus={this.clearError}
                    onChangeText={this.handleMessageChange}
                    placeholder={"What's on your mind?"}
                    multiline={true}
                    maxLength={500}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
            <View style={styles.footerContainer}>
              {this.state.error ? <Text style={styles.errorText}>Error: {this.state.error}</Text> : null}
              <Button
                onPress={this.sendContactMessage}
                style={styles.sendButton}>
                <Text
                  allowFontScaling={FONT_SCALLING}
                  style={styles.sendButtonText}>
                  {strings.SEND.toUpperCase()}
                </Text>
              </Button>
              <View style={styles.footerNotes}>
                <Text allowFontScaling={FONT_SCALLING} style={styles.footerNote}>
                  {strings.BOTTOM_MESSAGE(EmailAddress)}
                </Text>
                <Text allowFontScaling={FONT_SCALLING} style={styles.footerNote}>
                  {strings.BOTTOM_MESSAGE_2(Hotline)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
        <BoostYourStartPopUp
          onCrossPress={this.handleHideConfirmation}
          modalVisibilty={showConfirmation}
          selectedHeading={confirmationTitle}
          selectedSubHeading={confirmationMessage}
          appTheme={componentTheme}
        />
      </KeyboardAvoidingView>
    );
  }
}
let styles = {};
function renderStyles(color) {
  return StyleSheet.create({
    scrollContainer: { flex: 1, backgroundColor: APP_COLOR_WHITE, zIndex: 999, minHeight: 400 },
    scrollContent: {
      flex: 1,
      height: 'auto',
      paddingBottom: 10,
    },
    container: {
      height: '100%',
      width: SCREEN_WIDTH,
      backgroundColor: APP_COLOR_WHITE
    },
    subContainer: {
      flex: 1,
      backgroundColor: color,
      flexDirection: 'column',
      alignItems: 'center',
      paddingStart: LEFT_RIGHT_MARGINS,
      paddingEnd: LEFT_RIGHT_MARGINS,
    },
    formContainer: {
      flex: 1
    },
    SubjectContainer: {
      paddingBottom: 20,
      paddingTop: 20,
    },
    bodyContainer: {
      flex: 1,
      justifyContent: 'flex-start',
      paddingBottom: 20
    },
    inputRow: {
      flexDirection: 'row',
    },
    inputLabelColumn: {
      flex: 1
    },
    inputColumn: {
      flex: 1.8
    },
    textInput: {
      width: '100%',
      color: APP_COLOR_BLACK
    },
    bodyInput: {
      flex: 1,
      width: SCREEN_WIDTH - 40,
      paddingTop: IF_OS_IS_IOS ? 15 : 10,
      paddingBottom: 15,
      paddingRight: 15,
      paddingLeft: 15,
      height: '100%',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      textAlignVertical: 'top'
    },
    footerContainer: {
      width: SCREEN_WIDTH,
      backgroundColor: APP_COLOR_WHITE,
      padding: 20,
      paddingTop: 10,
      alignItems: 'center',
      justifyContent: 'flex-start',
      flexDirection: 'column'
    },
    footerNotes: {
      paddingTop: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    footerNote: {
      fontFamily: HELVETICANEUE_LT_STD_CN,
      fontWeight: "200",
      fontSize: 15
    },
    errorText: {
      color: 'red',
      fontSize: moderateScale(14),
    },
    label: {
      fontSize: moderateScale(20),
      fontFamily: DINENGSCHRIFT_REGULAR,
      color: APP_COLOR_WHITE,
      marginTop: moderateScale(6)
    },
    sendButton: {
      ...COMMON_BUTTON_STYLE,
      marginTop: 10,
      backgroundColor: color,
      marginBottom: 10,
      alignSelf: 'center'
    },
    sendButtonText: {
      ...COMMON_BUTTON_TEXT_STYLE,
      fontFamily: ROADSTER_REGULAR
    }
  })
}

function mapStateToProps(state) {
  //console.log('state', state);
  const {
    register: { contactUsData, contactUsInfo }
  } = state;
  const userData = getUserObject(state);
  const { CustomerId, LevelName, FirstName, LastName, Email, FullMobile } = userData;
  return {
    componentTheme: getThemeByLevel(LevelName),
    FirstName,
    LastName,
    Email,
    FullMobile,
    CustomerId,
    contactUsData,
    ACCESS_TOKEN: state.app.accessToken,
    contactUsInfo
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
)(Contact);
