import React, { Component } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator
} from "react-native";
import AsyncStorage from '@react-native-community/async-storage';
import { Actions } from "react-native-router-flux";
import { ORGANIZATION_ID, CHANNEL_ID } from "../../config/constants/network_constants";
import {
  APP_COLOR_WHITE,
  APP_COLOR_RED,
  APP_COLOR_BLACK,
  SEARCH_BACKGROUND_COLOR,
  REDEEMABLE_AMOUNT_GRAY_TEXT_COLOR,
  LOADER_BACKGROUND,
  TRANSPARENT_COLOR,
} from "../../config/colors";
import {
  IF_OS_IS_IOS,
  COMMON_BUTTON_TEXT_STYLE,
  COMMON_BUTTON_RADIOUS,
  COMMON_BUTTON_STYLE,
  FONT_SCALLING,
  SCREEN_WIDTH,
  SCREEN_HEIGHT
} from "../../config/common_styles";
import strings from "../../config/strings/strings";
import { connect } from "react-redux";
import {
  numberWithCommas,
  showKeyBoardEventHandler,
  hideKeyBoardEventHandler
} from "../../config/common_functions";
import { parseMobileNumber } from "../../helpers/NumberHelper";
import { getUserObject, getUserPaymentMethods } from "../../helpers/UserHelper";
import { KEY_USER_CONTACTS } from "../../config/constants/network_api_keys";
import Contacts from "react-native-contacts";
import { readUserContacts } from "../../helpers/UserHelper";

import {
  STAR_WHITE_IMAGE,
  ARROW_RED_BOTTOM, 
  ARROW_BLACK_RIGHT 
} from "../../assets/images";
import _ from "lodash";
import {
  DINENGSCHRIFT_REGULAR,
  ROADSTER_REGULAR,
  DINENGSCHRIFT_BOLD
} from "../../assets/fonts";
import {Button } from "native-base";
import { actions } from "../../ducks/squardcorner";
import { actions as vouchersActions } from '../../ducks/vouchers';
import { actions as appstateAction } from "../../ducks/setappstate";
import { bindActionCreators } from "redux";
import CommonLoader from "../../components/CommonLoader";
import VouchersSelector from "./VouchersSelector";
import { BoostYourStartPopUp } from "../../components";
import ContactViewPopUp from "./ContactViewPopUp";

const TITLE_CONTAINER_HEIGHT = 52;
const TITLE_FONT_SIZE = 30;
const LEFT_RIGHT_MARGINS = 20;
const ABOUT_ICON_SIZE = 25.5;
const DESCRIPTION_CONTAINER_HEIGHT = 155;
const DESCRIPTION_FONT_SIZE = 18;
const BROUGHT_TO_YOU_FONT_SIZE = 15.5;
const BOTTOM_CONTAINER_HEIGHT = 134;

const GOTO_MENU_TEXT_SIZE = 22.5;
const GOTO_MENU_CONTAINER_PADDING = 5;
const GOTO_MENU_ARROW_WIDTH = 9;
const GOTO_MENU_ARROW_HEIGHT = 15;
const GOTO_MENU_ARROW_MARGIN_LEFT = 4;
// const HORIZONTAL_LIST_HEIGHT = 259.5;
const HORIZONTAL_LIST_HEIGHT = 224.5;
const HORIZONTAL_LIST_ITEM_WIDTH = 333;
const HORIZONTAL_LIST_ITEM_TITLE_TEXT_SIZE = 25.5;
const HORIZONTAL_LIST_ITEM_IMAGE_CONTAINER_HEIGHT = 136;
const HORIZONTAL_LIST_ITEM_LARGE_IMAGE_WIDTH = 166.5;
const HORIZONTAL_LIST_ITEM_LARGE_IMAGE_HEIGHT = 136;
const HORIZONTAL_LIST_ITEM_LARGE_IMAGE_WIDTH_2 = 146.5;
const HORIZONTAL_LIST_ITEM_SMALL_IMAGE_WIDTH = 81.5;
const HORIZONTAL_LIST_ITEM_SMALL_IMAGE_WIDTH_2 = 72;
const HORIZONTAL_LIST_ITEM_SMALL_IMAGE_HEIGHT = 67.5;
const HORIZONTAL_LIST_ITEM_IMAGES_MARGIN = 1.5;
const DETAIL_TEXT_SIZE = 18;
const GO_FOR_IT_BUTTON_WIDTH = 108;
const GO_FOR_IT_BUTTON_HEIGHT = 32;
const GO_FOR_IT_BUTTON_TEXT_SIZE = 17.5;
const GO_FOR_IT_BUTTON_TOP_MARGIN = 10;
const EDIT_ORDER_TEXT_SIZE = 15.56;
const SQUADS_CORNER_MARGIN_BOTTOM = 10;
const SQUADS_CORNER_LEFT_RIGHT_MARGIN = 20;
const SQUADS_CORNER_TOP_BOTTOM_MARGIN = 5;
const SQUADS_CORNER_TEXT_SIZE = 30;
const SQUADS_CORNER_SUBHEADING_TEXT_SIZE = 18;
const CHECK_STATUS_TEXT_SIZE = 15.5;
const SCAN_YOUR_BILL_BUTTON_WIDTH = 152.5;
const SCAN_YOUR_BILL_BUTTON_HEIGHT = 32;
const SCAN_YOUR_BILL_BUTTON_TEXT_SIZE = 13.75;
const DINE_IN_ONLY_TEXT_SIZE = 13;
const NAVBAR_HEIGHT = IF_OS_IS_IOS ? 76 : 76;
const TOTAL_STARS_CONTAINER_HEIGHT = 181;

class SquadCorner extends Component {
  contatcIndex = 0;
  state = {
    userDetails: {},
    amount: "",
    selectedOption: { key: -1, displayName: "Select", firstName: "Select" },
    componentTheme: {},
    contacts: [],
    historyPopupVisibilty: false,
    sendToFriendOptionsArray: [
      { selection: 1, optionName: "VOUCHERS" },
      { selection: 0, optionName: "REDEEMABLE AMOUNT" }
    ],
    voucherArray: [],
    selectedVoucher: null,
    showContactPopUp: false,
    showContactLoader: false,
    loadingState: false,
    sendTitle: "",
    sendMessage: "",
    showSendMessagePopup: false,
    showInfoPopup: false
  };
  constructor(props) {
    super(props);
  }

  keyboardDidHide = () => {
    hideKeyBoardEventHandler(this.refs.scrollView);
  };

  keyboardDidShow = () => {
    showKeyBoardEventHandler(this.refs.scrollView);
  };

  componentWillMount() {
    this.setThemeOfComponent();
  }

  setThemeOfComponent() {
    const theme = AsyncStorage.getItem("theme").then(data =>
      this.setState({ componentTheme: JSON.parse(data) })
    );
  }
  componentDidMount() {
    this.props.userDetails(this.props.CustomerID);
    this.props.getVouchers()
    // read contacts
    readUserContacts({
      callback: () => {
        // fetch contacts
        Contacts.getAll((err, contacts) => {
          if (err !== "denied") {
            // update only if the number is different
            this.props.setUserContact(contacts || []);
            AsyncStorage.setItem(KEY_USER_CONTACTS, JSON.stringify(contacts));
          }
        });
      }
    });
  }
  parseContacts() {
    var array = [];
    // console.log('this.props.contactList',this.props.contactList);

    if (this.props.contactList) {
      if (this.props.contactList.length > 0) {
        var key = 0;
        for (var i = 0; i < this.props.contactList.length; i++) {
          if (this.props.contactList[i].phoneNumbers.length == 1) {
            const { givenName, familyName, phoneNumbers } = this.props.contactList[i];
            const phoneNumber = phoneNumbers[0].number;
            array.push({
              key: key,
              displayName:
                (givenName || familyName
                  ? givenName + (familyName ? (givenName ? " " : "") + familyName : "") + " - "
                  : "") + phoneNumber,
              firstName: givenName,
              lastName: familyName,
              number: phoneNumber
            });
            key++;
          } else {
            for (var idx = 0; idx < this.props.contactList[i].phoneNumbers.length; idx++) {
              const { givenName, familyName, phoneNumbers } = this.props.contactList[i];
              const phoneNumber = phoneNumbers[idx].number;
              array.push({
                key: key,
                displayName:
                  (givenName || familyName
                    ? givenName + (familyName ? (givenName ? " " : "") + familyName : "") + " - "
                    : "") + phoneNumber,
                firstName: givenName,
                lastName: familyName,
                number: phoneNumber
              });
              key++;
            }
          }
        }
      }
    }

    const uniqueArray = array.filter(function (item, pos, self) {
      const { displayName: itemDisplayName = "" } = item;
      const { displayName: selfDisplayName = "" } = self;
      for (let i = 0; i < pos; i++) {
        if (itemDisplayName.replace(/\s/g, "") === selfDisplayName.replace(/\s/g, "")) {
          return false;
        }
      }
      return true;
    });

    // sort array
    uniqueArray.sort(function (a, b) {
      var textA = a.displayName.toUpperCase();
      var textB = b.displayName.toUpperCase();
      return textA < textB ? -1 : textA > textB ? 1 : 0;
    });

    this.setState({
      contacts: uniqueArray,
      showContactPopUp: true,
      showContactLoader: false
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.userInfo[0] !== undefined) {
      this.setState({ userDetails: { ...nextProps.userInfo[0].customer, ...nextProps.userInfo[0].loyalty } || {} });
    }

    if (nextProps.vouchers !== this.props.vouchers) {
      this.setState({ voucherArray: nextProps.vouchers.vouchers.earned });
    }

    if (this.contatcIndex == 0) {
      this.contatcIndex++;
    }

    // for sending vouchers or amounts
    const { sendToFriendData, sendAmountData } = nextProps;
    const { sendToFriendTimestamp, sendAmountTimestamp } = this.state;

    if (
      sendToFriendData &&
      sendToFriendData.timestamp &&
      sendToFriendData.timestamp != sendToFriendTimestamp &&
      sendToFriendData.timestamp != this.props.sendToFriendData.timestamp
    ) {
      // process sendToFriend response data
      const wasSuccessful = sendToFriendData.status === true;
      this.setState({
        sendToFriendTimestamp: sendToFriendData.timestamp,
        sendTitle: wasSuccessful ? "SUCCESS!" : "UH-OH!",
        sendMessage:
          sendToFriendData.message === "success" ? "Voucher Sent!" : sendToFriendData.message,
        goHome: wasSuccessful,
        showSendMessagePopup: true
      });
    }
    if (
      sendAmountData &&
      sendAmountData.timestamp &&
      sendAmountData.timestamp != sendAmountTimestamp &&
      sendAmountData.timestamp != this.props.sendAmountData.timestamp
    ) {
      // process sendAmount response data
      const wasSuccessful = sendAmountData.status == 200;
      this.setState({
        sendAmountTimestamp: sendAmountData.timestamp,
        sendTitle: wasSuccessful ? "SUCCESS!" : "UH-OH!",
        sendMessage:
          sendAmountData.message === "success" ? "Redeemable Amount Sent!" : sendAmountData.message,
        goHome: wasSuccessful,
        showSendMessagePopup: true
      });
    }
  }

  hideSendMessagePopup = () => {
    const willGoHome = this.state.goHome == true;
    this.setState({
      showSendMessagePopup: false,
      goHome: false,
      sendTitle: "",
      sendMessage: ""
    });
    if (willGoHome) {
      Actions.drawer({ type: "reset" });
      Actions.home({ drawerMenu: true });
    }
  };

  hideShowInfoPopup = () => {
    this.setState({
      showInfoPopup: false,
      goHome: false,
      sendTitle: "",
      sendMessage: ""
    });
  };

  validateAmount() {
    const {
      amount,
      userDetails,
      selectedOption: { displayName = '', number = '' }
    } = this.state;
    const recipientMobile = parseMobileNumber(number);

    if (parseInt(amount)) {
      if (parseInt(amount) > userDetails.TotalAmounts) {
        this.setState({
          sendTitle: 'UH-OH!',
          sendMessage: 'Your balance is ' + userDetails.TotalAmounts,
          showInfoPopup: true
        });
        return false;
      }

      if (displayName == "Select" || displayName.trim() == "") {
        this.setState({
          sendTitle: 'UH-OH!',
          sendMessage: 'Select recipient',
          showInfoPopup: true
        });
        return false;
      }
      if (number == "" || !recipientMobile.match(/[0-9]{8}/)) {
        this.setState({
          sendTitle: 'UH-OH!',
          sendMessage: 'This contact does not have a mobile number.',
          showInfoPopup: true
        });
        return false;
      }
    } else {
      this.setState({
        sendTitle: 'UH-OH!',
        sendMessage: 'Enter Valid Amount',
        showInfoPopup: true
      });
      return false;
    }
    return true;
  }

  getUserInputsData() {
    const {
      amount,
      userDetails,
      selectedOption: { number = "" }
    } = this.state;
    const recipientMobile = parseMobileNumber(number);
    const formdata = new FormData();

    formdata.append("OrgId", ORGANIZATION_ID);
    formdata.append("ChannelId", CHANNEL_ID);
    formdata.append("LoyaltyId", userDetails.LoyaltyId);
    formdata.append("SenderMobile", this.props.MobileNumber);
    formdata.append("ReceiverMobile", recipientMobile);
    formdata.append("Amount", amount);
    return formdata;
  }

  onPress = (event, caption) => {
    switch (caption) {
      case strings.BACK:
        Actions.pop();
        break;

      case strings.SEND:
        const {
          sendToFriendOptionsArray,
          selectedVoucher,
          userDetails,
          selectedOption: { displayName, number = "", firstName = '', lastName = '' }
        } = this.state;

        if (sendToFriendOptionsArray[1].selection == 1) {
          if (this.validateAmount()) {
            this.props.sendAmount(this.getUserInputsData());
          }
        } 
        if (sendToFriendOptionsArray[0].selection == 1) {
          if (!selectedVoucher) {
            this.setState({
              sendTitle: 'UH-OH!',
              sendMessage: 'Please select voucher',
              showInfoPopup: true
            });
            return;
          
          }

          if (displayName == "Select") {
            this.setState({
              sendTitle: 'UH-OH!',
              sendMessage: 'Select recipient',
              showInfoPopup: true
            });
            return;
          }

          const recipientMobile = parseMobileNumber(number);

          if (number == "" || !recipientMobile.match(/[0-9]{8}/)) {
            this.setState({
              sendTitle: 'UH-OH!',
              sendMessage: 'This contact does not have a mobile number.',
              showInfoPopup: true
            });
            return false;
          }

          if (this.state.selectedVoucher.shareVoucherStatus !== 'Normal') {
            this.setState({
              sendTitle: 'UH-OH!',
              sendMessage: 'Voucher already shared.',
              showInfoPopup: true
            });
            return false;
          }
          const formdata = new FormData();

          formdata.append("OrgId", ORGANIZATION_ID);
          formdata.append("ChannelId", CHANNEL_ID);
          formdata.append("LoyaltyId", userDetails.LoyaltyId);
          formdata.append("SenderMobile", this.props.MobileNumber);
          formdata.append("ReceiverMobile", recipientMobile);
          formdata.append("ReceiverName", `${firstName} ${lastName}`);
          formdata.append("VoucherCode", this.state.selectedVoucher.voucherNo);
          formdata.append("VoucherValue", this.state.selectedVoucher.value);
          this.props.sendToFriend(formdata);
        }
        break;

      case strings.EDIT_PROFILE:
        Actions.edit_profile();
        // Actions.qrcodescannedbill( {paymentMethodsOnSquadCorner:this.props.paymentMethodsOnSquadCorner.slice() });
        break;

      case strings.SCAN_YOUR_BILL:
        Actions.drawer({ type: "reset" });
        Actions.qrcodescanner({
          paymentMethodsOnSquadCorner: this.props.paymentMethodsOnSquadCorner
        });
        // Actions.qrcodescannedbill( {paymentMethodsOnSquadCorner:this.props.paymentMethodsOnSquadCorner.slice() });
        break;

      case strings.BOOST:
        Actions.boost_your_stars();
        break;
      case strings.ORDER_HISTORY:
        if (this.props.userType == "login" || this.props.userType == "register") {
          if (IF_OS_IS_IOS) {
            Actions.drawer({ type: "reset" });
            Actions.myorders();
          } else {
            Actions.myorders();
          }
        } else {
          this.setState({
            sendTitle: 'UH-OH!',
            sendMessage: 'Login to Track Order',
            showInfoPopup: true
          });          
        }

        break;
      case strings.LOYALTY_CORNER_DETAILS:
        const {
          props: { userInfo = [], currency, CustomerID },
          state: {
            userDetails: { TotalPoints }
          }
        } = this;
        if (CustomerID && userInfo[0]) {
          const {
            loyalty: { StartDate, EndDate, LoyaltyId }
          } = userInfo[0];
          Actions.squadcorner_details({
            startDate: StartDate,
            endtDate: EndDate,
            loyaltyId: LoyaltyId,
            totalStars: numberWithCommas(TotalPoints, currency, false)
          });
        } else {
          this.setState({
            sendTitle: 'UH-OH!',
            sendMessage: 'No details yet',
            showInfoPopup: true
          });
          return false;
        }
        break;

      default:
    }
  };

  onSelectCity(option) {
    this.setState({ selectedOption: option });
  }
  onPressContatcDropDown() {
    if (this.state.contacts.length == 0) {
      setTimeout(() => this.parseContacts(), 20);
    } else {
      this.setState({ showContactPopUp: true });
    }
    // });
    this.setState({ showContactLoader: true });
  }
  renderDropDown() {
    return (
      <TouchableOpacity onPress={() => this.onPressContatcDropDown()} style={styles.selectorContainer}>
        <View style={[styles.itemQuanityInnerRightViewStyle]}>
          <Text allowFontScaling={FONT_SCALLING} style={[styles.priceTextStyle]}>
            {this.state.selectedOption.firstName.toUpperCase()}
          </Text>
          <Image style={styles.quuantityInnerDropImageStyle} source={ARROW_RED_BOTTOM} />
        </View>
      </TouchableOpacity>
    );
  }

  onCrossPress = () => {
    this.setState({ historyPopupVisibilty: false });
  };

  selectWalletOptins(x) {
    var array = [];
    array = this.state.sendToFriendOptionsArray;
    for (var i = 0; i < array.length; i++) {
      array[i].selection = 0;
    }
    array[x].selection = 1;

    this.setState({
      selectedVoucher: null,
      amount: '',
      sendToFriendOptionsArray: array
    });
  }

  getWalletView() {
    return (
      <View style={[styles.topPanel, { flex: 1, paddingHorizontal: 0, }, styles.panelLast]}>
        <View style={[styles.panelRow, styles.panelBorder, {flex: 1, borderBottomWidth: 0}]}>
          <View style={{ flex: 1, flexDirection: 'row', paddingTop: 0, paddingHorizontal: 15, paddingBottom: 15 }}>
            <View style={{ alignItems: 'flex-start', paddingEnd: 20 }}>
              <TouchableOpacity
                onPress={() => this.selectWalletOptins(0)}
                style={{ flexDirection: "row", justifyContent: 'flex-start', alignItems: "center" }}
              >
                <View
                  style={
                    this.state.sendToFriendOptionsArray[0].selection == 0
                      ? [styles.unslectedTopColor]
                      : [styles.selectedDotColor]
                  }
                />
                <Text
                  allowFontScaling={FONT_SCALLING}
                  style={[styles.itemQuanityTextStyle, { marginBottom: IF_OS_IS_IOS ? 0 : 4 }]}
                >
                  {this.state.sendToFriendOptionsArray[0].optionName}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ alignItems: 'flex-start' }}>
              <TouchableOpacity
                onPress={() => this.selectWalletOptins(1)}
                style={{ flexDirection: "row", justifyContent: 'flex-start', alignItems: "center" }}
              >
                <View
                  style={
                    this.state.sendToFriendOptionsArray[1].selection == 0
                      ? [styles.unslectedTopColor]
                      : [styles.selectedDotColor]
                  }
                />
                <Text
                  allowFontScaling={FONT_SCALLING}
                  style={[styles.itemQuanityTextStyle, { marginBottom: IF_OS_IS_IOS ? 0 : 4 }]}
                >
                  {this.state.sendToFriendOptionsArray[1].optionName}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  setSelectedVoucherArray = (event, array) => {
    const voucherFilterArray = array.filter(obj => obj.selection == 1);
    this.setState({ selectedVoucher: voucherFilterArray[0], voucherArray: array });
  };

  setSelectedObject = (event, object) => {
    this.setState({ selectedOption: object, showContactPopUp: false });
  };

  onCrossPressOnContatcPopup = () => {
    this.setState({ showContactPopUp: false });
  };

  editUserProfile() {
    Actions.edit_profile();
  }

  onPressBack() {
    Actions.pop();
  }

  render() {
    const {
      componentTheme: { thirdColor, ARROW_LEFT_RED },
      userDetails = { Photo: null, TotalAmounts: 0 }
    } = this.state;
    const {
      banners: { DeliveryLoyalty, DineInScan }
    } = this.props;
    let shouldDisabled = DineInScan == '0' ? true : false;

    return (
      <KeyboardAvoidingView
        style={{ flex: 1, width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
        contentContainerStyle={styles.mainContanerStyle}
        behavior={IF_OS_IS_IOS ? "padding" : null}
        keyboardVerticalOffset={50}
        enabled
      >
        <View style={styles.mainContanerStyle}>
          <CommonLoader />
          <ScrollView ref="scrollView" style={{ flex: 1 }}>
            <BoostYourStartPopUp
              onCrossPress={this.hideSendMessagePopup}
              modalVisibilty={this.state.showSendMessagePopup}
              selectedHeading={this.state.sendTitle}
              selectedSubHeading={this.state.sendMessage}
              appTheme={this.state.componentTheme}
            />
            <BoostYourStartPopUp
              onCrossPress={this.hideShowInfoPopup}
              modalVisibilty={this.state.showInfoPopup}
              selectedHeading={this.state.sendTitle}
              selectedSubHeading={this.state.sendMessage}
              appTheme={this.state.componentTheme}
            />
            <BoostYourStartPopUp
              onCrossPress={this.onCrossPress}
              modalVisibilty={this.state.historyPopupVisibilty}
              selectedHeading={"UH-OH!"}
              selectedSubHeading={"NO ORDERS YET"}
              // selectedDetails={this.state.selectedDetails}
              appTheme={this.state.componentTheme}
            />

            <View style={styles.container}>
              <View
                style={[styles.userImageViewBackStyle, { paddingVertical: 10 }]}
              >
                <View style={[styles.userViewStyle]}>
                  <TouchableOpacity  style={styles.editProfileStyle}>
                    <Image style={styles.userImageViewStyle} source={{ uri: userDetails.Photo }} />
                  </TouchableOpacity>
                  <Text
                    allowFontScaling={FONT_SCALLING}
                    style={[
                      styles.squadsCornerTextStyle,
                      {
                        fontSize: 22,
                        marginTop: 3,
                        alignSelf: 'center'
                      }
                    ]}
                  >
                    {userDetails.FirstName + "\n" + userDetails.LastName}
                  </Text>
                  <Text 
                   style={{color: APP_COLOR_BLACK, textDecorationLine: 'underline', alignSelf: 'center'}}
                   onPress={this.editUserProfile}>
                    {strings.EDIT_PROFILE}
                  </Text>
                </View>
                <View style={[styles.userLevelOuterViewStyle, { flexDirection: 'column', flex: 1.2 }]}>
                  <View style={styles.levelSection}>
                    <View style={[styles.userLevelViewStyle]}>
                      <Text
                        allowFontScaling={FONT_SCALLING}
                        style={[styles.challengerTextStyle]}
                      >
                        {userDetails.LevelName ? userDetails.LevelName.toUpperCase() : ''}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      borderWidth: 0,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <TouchableOpacity
                      style={styles.squardCornerDetailsTextTouchStyle}
                      onPress={event => this.onPress(event, strings.LOYALTY_CORNER_DETAILS)}
                    >
                      <Text
                        allowFontScaling={FONT_SCALLING}
                        style={[styles.dineInOnlyTextStyle, styles.loyaltyCorderDetails]}
                      >
                        {strings.LOYALTY_CORNER_DETAILS}
                      </Text>
                    </TouchableOpacity>
                    <Image style={styles.arrowImageStyle} source={ARROW_BLACK_RIGHT} />
                  </View>
                </View>
              </View>
              <View style={[styles.topPanel, { backgroundColor: thirdColor }]}>
                <View style={styles.panelRow}>
                  <View style={styles.leftColumn}>
                    <Text allowFontScaling={FONT_SCALLING} style={styles.whiteText}>
                      {strings.TOTAL_STARS.toUpperCase()}
                    </Text>
                  </View>
                  <View style={[styles.rightColumn, styles.rightColumnRow]}>
                    <Text allowFontScaling={FONT_SCALLING} style={styles.whiteText}>
                      {numberWithCommas(userDetails.TotalPoints || 0, this.props.currency, false) +
                        " " +
                        strings.STARS.toUpperCase()}
                    </Text>
                    <Image style={styles.starImageStyle} source={STAR_WHITE_IMAGE} resizeMode="contain" />
                  </View>
                </View>
                <View style={styles.panelRow}>
                  <View style={styles.leftColumn}>
                    <Text allowFontScaling={FONT_SCALLING} style={styles.whiteText}>
                      {strings.DONT_FORGET_TO.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.rightColumn}>
                    <Button
                      onPress={event => this.onPress(event, strings.SCAN_YOUR_BILL)}
                      style={styles.blackButtonStyle}
                      style={shouldDisabled ? [styles.blackButtonStyle, { opacity: 0.5 }]
                        : styles.blackButtonStyle}
                      disabled={shouldDisabled}
                    >
                      <Text allowFontScaling={FONT_SCALLING} style={styles.lightButtonText}>
                        {strings.SCAN_YOUR_BILL.toUpperCase()}
                      </Text>
                    </Button>
                  </View>
                </View>
                <View style={[styles.panelRow, styles.panelLast]}>
                  <View style={styles.leftColumn}>
                    <Text allowFontScaling={FONT_SCALLING} style={styles.whiteText}>
                      {strings.GET_STARS.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.rightColumn}>
                    <Button
                      onPress={event => this.onPress(event, strings.BOOST)}
                      style={styles.blackButtonStyle}
                    >
                      <Text allowFontScaling={FONT_SCALLING} style={styles.lightButtonText}>
                        {strings.BOOST.toUpperCase()}
                      </Text>
                    </Button>
                  </View>
                </View>
              </View>

              <View style={[styles.topPanel, { paddingHorizontal: 0 }, styles.panelLast]}>
                <View style={[styles.panelRow, styles.panelBorder, {width: '90%', alignSelf: 'center'}]}>
                  <View style={{ flex: 1, flexDirection: 'row', paddingVertical: 5 }}>
                    <View style={styles.leftColumn}>
                      <Text
                        allowFontScaling={FONT_SCALLING}
                        style={[styles.whiteText, { color: thirdColor, fontSize: 16 }]}
                      >
                        {strings.REDEEMABLE_AMOUNT.toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.rightColumn}>
                      <Text
                        allowFontScaling={FONT_SCALLING}
                        style={[styles.whiteText, { color: thirdColor, fontSize: 16 }]}
                      >
                        {numberWithCommas(userDetails.TotalAmounts || 0, this.props.currency)}
                      </Text>
                      <TouchableOpacity
                        onPress={event => this.onPress(event, strings.ORDER_HISTORY)}
                        style={styles.transparentButton}
                      >
                        <Text
                          allowFontScaling={FONT_SCALLING}
                          style={[styles.dineInOnlyTextStyle, {paddingRight: 10}]}
                        >
                          {strings.LOYALTY_CORNER_MY_ORDERS}
                        </Text>
                        <Image
                          style={styles.arrowRedImageStyle}
                          source={ARROW_BLACK_RIGHT}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={[styles.panelRow, { paddingHorizontal: 0 }, styles.panelLast]}>
                  <View style={{ flex: 1, flexDirection: 'row', padding: 15, paddingBottom: 0, paddingTop: 10 }}>
                    <View style={styles.leftColumn}>
                      <Text allowFontScaling={FONT_SCALLING} style={[styles.blackText, { fontSize: 16, color: APP_COLOR_BLACK }]}>
                        {strings.SEND_TO_FRIEND.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.rightColumn} />
                  </View>
                </View>
                {this.getWalletView()}
                {/* VOUCHERS */}
                {this.state.sendToFriendOptionsArray[0].selection == 1 && (
                  <View style={[styles.vouchersCountViewStyle, styles.panelBorder, {borderBottomWidth: 0}]}>
                    <View style={styles.panelRow}>
                      <VouchersSelector
                        vouchers={_.cloneDeep(this.state.voucherArray)}
                        fromDelivery={false}
                        fromsquard
                        setSelectedVoucherArray={this.setSelectedVoucherArray}
                      />
                    </View>
                    <View style={styles.panelRow}>
                      <View style={[styles.leftColumn, styles.leftCenter]}>
                        <Text
                          allowFontScaling={FONT_SCALLING}
                          style={[styles.voucherQuanityTextStyle, { color: APP_COLOR_RED, fontSize: 16 }]}
                        >
                          {strings.TO_COLON}
                        </Text>
                      </View>
                      <View style={styles.rightColumn}>
                        {this.state.showContactLoader == true &&
                          this.state.contacts.length == 0 &&
                          this.props.contactList &&
                          this.props.contactList.length > 0 ? (
                            <View style={{ marginRight: 80 }}>
                              <ActivityIndicator size="large" color={APP_COLOR_BLACK} animating />
                            </View>
                          ) : (
                            <View style={styles.redeemViewStyle}>{this.renderDropDown()}</View>
                          )}
                      </View>
                    </View>
                  </View>
                )}
                {this.state.sendToFriendOptionsArray[1].selection == 1 && (
                  <View style={[styles.vouchersCountViewStyle, styles.panelBorder, {borderBottomWidth: 0}]}>
                    <View style={styles.panelRow}>
                      <View style={styles.leftColumn}>
                        <Text
                          allowFontScaling={FONT_SCALLING}
                          style={[styles.voucherTextStyle, { color: APP_COLOR_RED, fontSize: 16 }]}
                        >
                          {strings.AMOUNT_COLON}
                        </Text>
                      </View>
                      <View style={styles.leftColumn}>
                        <Text style={[styles.voucherTextStyle, { color: APP_COLOR_RED, fontSize: 16 }]}>
                          {numberWithCommas(userDetails.TotalAmounts || 0, this.props.currency)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.panelRow}>
                      <View style={[styles.leftColumn, styles.leftCenter]}>
                        <Text
                          allowFontScaling={FONT_SCALLING}
                          style={[styles.voucherTextStyle, { color: APP_COLOR_RED, fontSize: 16 }]}
                        >
                          {strings.REDEEMABLE_AMOUNT.toUpperCase() + ":"}
                        </Text>
                      </View>
                      <View style={styles.rightColumn}>
                        <TextInput
                          style={styles.quantityTextStyle}
                          placeholder={strings.ENTER_AMOUNT.toUpperCase()}
                          placeholderTextColor={REDEEMABLE_AMOUNT_GRAY_TEXT_COLOR}
                          autoCorrect={false}
                          value={this.state.direction}
                          underlineColorAndroid="transparent"
                          onChangeText={amount => this.setState({ amount })}
                          returnKeyType="done"
                          keyboardType="phone-pad"
                        />
                      </View>
                    </View>
                    <View style={styles.panelRow}>
                      <View style={[styles.leftColumn, styles.leftCenter]}>
                        <Text
                          allowFontScaling={FONT_SCALLING}
                          style={[styles.voucherQuanityTextStyle, { color: APP_COLOR_RED, fontSize: 16 }]}
                        >
                          {strings.TO_COLON}
                        </Text>
                      </View>
                      <View style={styles.rightColumn}>
                        {this.state.showContactLoader == true &&
                          this.state.contacts.length == 0 &&
                          this.props.contactList &&
                          this.props.contactList.length > 0 ? (
                            <View style={{ marginRight: 80 }}>
                              <ActivityIndicator size="large" color={APP_COLOR_BLACK} animating />
                            </View>
                          ) : (
                            <View style={styles.redeemViewStyle}>{this.renderDropDown()}</View>
                          )}
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          <View style={styles.addOrderButtonViewStyle}>
            <Button
              onPress={event => this.onPress(event, strings.SEND)}
              style={[
                COMMON_BUTTON_STYLE,
                {
                  alignSelf: "center",
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                  backgroundColor: APP_COLOR_BLACK,
                  width: 160,
                  borderRadius: 8
                }
              ]}
            >
              <Text
                allowFontScaling={FONT_SCALLING}
                style={[
                  COMMON_BUTTON_TEXT_STYLE,
                  {
                    fontFamily: ROADSTER_REGULAR,
                    fontSize: 20,
                    marginTop: 5,
                    color: APP_COLOR_WHITE
                  }
                ]}
              >
                {strings.SEND.toUpperCase()}
              </Text>
            </Button>
          </View>
        </View>

        <ContactViewPopUp
          modalVisibilty={this.state.showContactPopUp}
          contacts={this.state.contacts}
          appTheme={this.state.componentTheme}
          setSelectedObject={this.setSelectedObject}
          onCrossPress={this.onCrossPressOnContatcPopup}
        />
      </KeyboardAvoidingView>
    );
  }
}
const styles = {
  itemQuanityTextStyle: {
    fontSize: 14,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_RED,
    marginStart: 10,
    marginTop: 6
  },
  selectedDotColor: {
    backgroundColor: APP_COLOR_RED,
    borderRadius: 8,
    width: 16,
    height: 16,
    marginTop: 1
  },
  unslectedTopColor: {
    borderRadius: 8,
    width: 16,
    height: 16,
    backgroundColor: TRANSPARENT_COLOR,
    borderWidth: 2,
    borderColor: APP_COLOR_RED,
    marginTop: 1
  },
  squardCornerDetailsTextTouchStyle: {
    flexDirection: "row",
    alignItems: "center"
  },
  mainContanerStyle: {
    flex: 1,
    backgroundColor: APP_COLOR_WHITE
  },
  priceTextStyle: {
    paddingTop: 3,
    color: REDEEMABLE_AMOUNT_GRAY_TEXT_COLOR,
    fontSize: 16,
    fontFamily: DINENGSCHRIFT_REGULAR,
    textAlign: "center",
    marginLeft: 5
  },
  selectorContainer: {
    flex: 1
  },
  itemQuanityInnerRightViewStyle: {
    width: '100%',
    marginTop: 0,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    borderWidth: 0,
    paddingEnd: 8,
    borderColor: SEARCH_BACKGROUND_COLOR,
    paddingTop: 4,
    borderRadius: 10,
    overflow: "hidden"
  },
  quuantityInnerDropImageStyle: {
    width: 12,
    height: 6
  },
  voucherListItemStyle: {
    alignSelf: "center",
    width: 50,
    height: 55,
    marginLeft: 5
  },
  voucherImageStyle: {
    width: 50,
    height: 50,
    resizeMode: "contain"
  },
  redeemViewStyle: {
    width: "100%",
    height: 35,
    borderColor: REDEEMABLE_AMOUNT_GRAY_TEXT_COLOR,
    backgroundColor: "#ee9e90",
    borderRadius: 10,
    alignItems: "flex-start",
    paddingLeft: 5,
    justifyContent: "center",
    //borderWidth: 1
  },
  userViewStyle: {
    flex: 0.8,
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: 10,
    marginStart: 15
  },
  arrowImageStyle: {
    marginTop: IF_OS_IS_IOS ? 3 : 3,
    marginBottom: IF_OS_IS_IOS ? 6 : 0,
    alignSelf: "center",
    marginRight: 5,
    width: 5.5,
    height: 9,
  },
  arrowRedImageStyle: {
    width: 5.5,
    height: 9,
    marginStart: 2,
    marginBottom: IF_OS_IS_IOS ? 4 : -2
  },
  starImageStyle: {
    marginStart: 5,
    marginTop: IF_OS_IS_IOS ? -10 : -2,
    width: 20,
    height: 20,
    // alignSelf: 'center'
    // marginBottom: IF_OS_IS_IOS ? 7 : 7,
  },
  editProfileStyle: {
    alignItems: "flex-start",
    alignSelf: "center"
  },
  userLevelOuterViewStyle: {
    // marginTop: IF_OS_IS_IOS ? 0 : 9,
    marginEnd: 0,
    flexDirection: "row",
    // alignItems: "center",
    // alignSelf: "flex-start"
    alignSelf: 'center',
    marginTop: -25
  },
  userLevelViewStyle: {
    marginEnd: 0
  },
  levelSection: {
    flexDirection: "row",
    paddingTop: 3,
    justifyContent: 'center',
    alignItems: 'center'
  },
  whitecrownImageViewStyle: {
    width: 24,
    height: 32,
    resizeMode: "contain",
    marginTop: 0,
    marginEnd: 3,
    alignSelf: "flex-start",
    marginTop: 5
  },
  userImageViewBackStyle: {
    flex: 1,
    width: "100%",
    // height: 83.5,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: APP_COLOR_WHITE
  },
  userImageViewStyle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    // borderWidth:0.5,
    // borderColor:"#fff"
    // resizeMode: 'contain',
  },
  editImageViewStyle: {
    width: 14,
    height: 25,
    resizeMode: "contain",
    position: "absolute",
    bottom: 5,
    right: 5
  },
  quantityTextStyle: {
    fontSize: 16,
    alignItems: "center",
    justifyContent: "center",
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: REDEEMABLE_AMOUNT_GRAY_TEXT_COLOR,
    paddingVertical: 0,
    paddingLeft: 10,
    borderRadius: 10,
    backgroundColor: "#ee9e90",
    //borderColor: REDEEMABLE_AMOUNT_GRAY_TEXT_COLOR,
    // borderWidth: 1,
    paddingTop: IF_OS_IS_IOS ? 5 : 0,
    width: "100%",
    height: 32
  },
  voucherQuanityTextStyle: {
    fontSize: 16,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_BLACK
  },
  vouchersCountViewStyle: {
    backgroundColor: APP_COLOR_WHITE,
    flex: 1,
    width: "100%",
    padding: 15,
    paddingVertical: 5
  },
  addOrderButtonViewStyle: {
    paddingTop: 10,
    backgroundColor: APP_COLOR_WHITE
  },
  voucherTextStyle: {
    fontSize: 16,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_WHITE
  },
  blackButtonStyle: {
    backgroundColor: APP_COLOR_BLACK,
    width: SCAN_YOUR_BILL_BUTTON_WIDTH,
    height: SCAN_YOUR_BILL_BUTTON_HEIGHT,
    alignItems: "center",
    paddingBottom: IF_OS_IS_IOS ? 7 : 5,
    justifyContent: "center",
    borderRadius: COMMON_BUTTON_RADIOUS,
    alignSelf: "flex-end"
  },
  loyaltyCorderDetails: {
    marginStart: 0,
    marginTop: 2,
    fontSize: 13,
    // paddingTop: 3,
    paddingBottom: 3,
    paddingRight: 10
  },
  dineInOnlyTextStyle: {
    color: APP_COLOR_BLACK,
    fontSize: DINE_IN_ONLY_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    textDecorationLine: 'underline'
  },
  squadsCornerTextStyle: {
    color: APP_COLOR_RED,
    fontSize: SQUADS_CORNER_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_BOLD
  },
  challengerTextStyle: {
    color: APP_COLOR_RED,
    fontSize: 23,
    fontFamily: DINENGSCHRIFT_BOLD,
    alignItems: 'center'
    // paddingLeft: 2
  },
  container: {
    backgroundColor: APP_COLOR_BLACK
  },
  lightButtonText: {
    ...COMMON_BUTTON_TEXT_STYLE,
    fontFamily: DINENGSCHRIFT_BOLD,
    fontSize: SCAN_YOUR_BILL_BUTTON_TEXT_SIZE,
    marginTop: IF_OS_IS_IOS ? 0 : 0
  },
  whiteText: {
    color: APP_COLOR_WHITE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    fontSize: SQUADS_CORNER_SUBHEADING_TEXT_SIZE
  },
  blackText: {
    color: APP_COLOR_BLACK,
    fontFamily: DINENGSCHRIFT_REGULAR,
    fontSize: SQUADS_CORNER_SUBHEADING_TEXT_SIZE
  },
  transparentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  topPanel: {
    backgroundColor: APP_COLOR_WHITE,
    width: "100%",
    height: "auto",
    padding: 15
  },
  panelRow: {
    flexDirection: "row",
    paddingBottom: 10
  },
  panelLast: {
    paddingBottom: 0
  },
  panelBorder: {
    borderBottomColor: LOADER_BACKGROUND,
    marginBottom: 10,
    borderBottomWidth: 1
  },
  leftColumn: {
    flex: 1,
    alignItems: "flex-start"
  },
  leftCenter: {
    paddingTop: 7,
    justifyContent: "center"
  },
  rightColumn: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "flex-start"
  },
  rightColumnLeft: {
    alignItems: "flex-start"
  },
  rightColumnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end"
  }
};

function mapStateToProps(state) {
  const { CustomerId: CustomerID, FullMobile: MobileNumber } = getUserObject(state);
  const {
    register: { registerUserInfo, loggedinUserInfo },
    app: {
      loading: loadingState,
      userType,
      accessToken: ACCESS_TOKEN,
      userContact: contactList,
      currency
    },
    squardcorner: {
      userDetails: userInfo,
      sendAmount: sendAmountData,
      sendToFriend: sendToFriendData
    },
    home: { userOrdersCount = { data: [], total: 0 }, banners },
    vouchers: { vouchers }
  } = state;


  const paymentMethodsOnSquadCorner = getUserPaymentMethods(state);

  return {
    userType,
    CustomerID,
    ACCESS_TOKEN,
    MobileNumber,
    contactList,
    userInfo,
    loadingState,
    paymentMethodsOnSquadCorner,
    currency,
    vouchers,
    sendToFriendData,
    sendAmountData,
    historyData: userOrdersCount,
    banners
  };
}

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      ...actions,
      ...vouchersActions,
      ...appstateAction
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SquadCorner);
