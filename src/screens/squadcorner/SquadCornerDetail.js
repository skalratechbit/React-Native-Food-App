import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  StatusBar,
  BackHandler,
  SafeAreaView,
  Linking,
  Platform
} from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import Svg from 'react-native-svg';
import * as moment from 'moment';
import { numberWithCommas } from '../../config/common_functions';
import { scale, verticalScale } from 'react-native-size-matters';
import { connect } from 'react-redux';
import {
  IF_OS_IS_IOS,
  FONT_SCALLING,
  COMMON_BUTTON_TEXT_STYLE
} from '../../config/common_styles';
import { APP_COLOR_WHITE, APP_COLOR_RED, APP_COLOR_BLACK } from '../../config/colors';
import strings from '../../config/strings/strings';
import {
  WHITE_STAR
} from '../../assets/images';
import {
  DINENGSCHRIFT_BOLD,
  DINENGSCHRIFT_REGULAR,
  ROADSTER_REGULAR,
} from '../../assets/fonts';
import Moment from 'moment';
import { Button, Container } from 'native-base';
import Contacts from "react-native-contacts";
import AsyncStorage from '@react-native-community/async-storage';
import { bindActionCreators } from "redux";
import { VictoryPie } from 'victory-native';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { actions } from '../../ducks/squardcorner';
import CommonLoader from '../../components/CommonLoader';
import { Actions } from 'react-native-router-flux';
import ScreenModeInfoPopUp from './ScreenModeInfoPopUp';
import { getThemeByLevel } from '../../config/common_styles/appthemes';
import MonthsList from './MonthsList';
import { readUserContacts } from "../../helpers/UserHelper";
import ContactViewPopUp from "./ContactViewPopUp";
import { actions as appstateAction } from "../../ducks/setappstate";
import { KEY_USER_CONTACTS } from '../../config/constants/network_api_keys';
import { CHANNEL_ID, ORGANIZATION_ID } from '../../config/constants/network_constants';
import { getUserObject } from "../../helpers/UserHelper";
import { BoostYourStartPopUp } from "../../components";
import { parseMobileNumber } from "../../helpers/NumberHelper";

const TITLE_CONTAINER_HEIGHT = 62;
const LEFT_RIGHT_MARGINS = 5;
const TITLE_FONT_SIZE = 14;
const BACK_ARROW_WIDTH = 9.5;
const BACK_ARROW_HEIGHT = 15;
const MONTH_CIRCLE_SIZE = 70;
const STAR_LIST_WIDTH = 20;
const STAR_LIST_HEIGHT = 20;
const CIRCLE_LIST_TEXT_SIZE = 13;
const NO_DATA_STRING = 'Not Exist ...';

class SquadCornerDetail extends Component {
  state = {
    extraData: null,
    Height_Layout: '',
    Width_Layout: '',
    backgroundColor: {},
    userDetails: {},
    squadDetailArray: [],
    monthsList: [],
    totalStars: 0,
    componentTheme: getThemeByLevel(this.props.LevelName),
    userInfo: null,
    noData: false,
    index: this.props.tabIndex || 0,
    routes: [],
    showContactPopUp: false,
    showContactLoader: false,
    contacts: [],
    showInfoPopup: false,
    goHome: false,
    sendTitle: "",
    sendMessage: "",
    showSendMessagePopup: false,
    amount: 0
    };

  componentWillUnmount() {
    //clean up
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    // console.log('componentWillUnmount');
  }

  componentDidMount() {
    console.log('=====> SQUAD DETAILS: ', this.props);
    //fetch backend info
    this.props.getLoyaltyCorner();

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

    //list for back button
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
  }

  componentWillReceiveProps(nextProps) {
    console.log('nextprops', nextProps);
    if (nextProps.userInfo[0] !== undefined) {
      this.setState({ userDetails: { ...nextProps.userInfo[0].customer, ...nextProps.userInfo[0].loyalty } || {} });
    }

    const noDataExists = nextProps.squadDetailArray === NO_DATA_STRING;
    const state = {};

    const { sendAmountData } = nextProps;
    const { sendAmountTimestamp } = this.state;

    // update noData state always
    state.noData = noDataExists;

    if (noDataExists) {
      // no data is currently available
      // add additional no data logic here
    } else {
      // data does exists
      if (nextProps.squadDetailArray !== this.props.squadDetailArray) {
        state.monthsList = this.setPreviousMonthsDetail(nextProps.squadDetailArray);
        let monthsArray=[];
        Object.keys(nextProps.squadDetailArray).forEach((index) => {
          let squadDetailObj = nextProps.squadDetailArray[index];
          squadDetailObj.index= Number(index);
          squadDetailObj.key= Number(index);
          monthsArray.push(squadDetailObj);
        });
        this.setState({squadDetailArray: monthsArray, routes: monthsArray, index: monthsArray.length > 0 ? monthsArray.length - 1 : 0});
      }
      if (nextProps.extra != this.props.extra) {
        state.extraData = nextProps.extra;
      }
      if (nextProps.userInfo != this.props.userInfo) {
        state.userInfo = nextProps.userInfo;
      }
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
       // goHome: wasSuccessful,
        showSendMessagePopup: true,
      });
    }

    this.setState(state);
  }

  handleOnBackPress = () => {
    this.onBackPress();
    return 0;
  }

  onBackPress() {
    Actions.drawer({ type: 'reset' });
    Actions.squadcorner();
    return true;
  }

  getTotalStars() {
    let count = 0;
    for (let i = 0; i < this.props.squadDetailArray.length; i++) {
      count += parseInt(this.props.squadDetailArray[i].MonthlyTier);
    }
    return count;
  }

  setPreviousMonthsDetail(array) {
    if (array === NO_DATA_STRING) {
      return [];
    }
    const parts = this.props.StartDate.split(' ');
    const dateParts = parts[0].split('-');
    const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

    const monthsArray = Object.keys(array).map(i => array[i]);
    return this.setYearsInMonthArray(monthsArray, date);
  }

  setYearsInMonthArray(dataArray, date) {
    const startMonth = date.getMonth() + 1;
    const startYear = date
      .getFullYear()
      .toString()
      .substr(-2);
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date()
      .getFullYear()
      .toString()
      .substr(-2);
    for (let i = 0; i < dataArray.length; i++) {
      const { Year, MonthIndex, MonthlyTier } = dataArray[i];
      const MonthItem = MonthsList[MonthIndex - 1]
      const before = `${MonthIndex}-${Year}`;
      const after = Moment().format('MM-YYYY')
      const beforeInMoment = moment.utc(before, 'MM-YYYY');
      const afterInMoment = moment.utc(after, 'MM-YYYY');

      const isMonthPassed = beforeInMoment.isBefore(afterInMoment);

      dataArray[i] = {
        ...dataArray[i],
        index: i,
        id: MonthIndex,
        month: MonthItem.month,
        year: Year,
        won: isMonthPassed,
        stars: MonthlyTier
      }
    }
    return dataArray;
  }

  onNoDataDismissal = () => {
    Actions.pop();
  };

  onPress = (event, caption) => {
    switch (caption) {
      case strings.BACK:
        Actions.drawer({ type: 'reset' });
        Actions.squadcorner();
        break;
      case strings.BOOST:
        Actions.boost_your_stars();
        break;  
      default:
    }
  };

  renderMonthColumn = ({ item, index, separators }) => {
    const { componentTheme: { thirdColor } } = this.state;
    const { monthCellContainer, wonListItemContainerStyle,
      monthCell, monthCircleStyle, starListImageStyle,
      wonMonthCircleStyle, numberOfStarsTextStyle, circleListTextStyle, wonCircleListTextStyle
    } = styles;
    const didWin = item.won;
    const monthTextStyle = [
      circleListTextStyle,
      { color: thirdColor },
      didWin ? wonCircleListTextStyle : {}
    ];

    const cellComp = (
      <View
        key={item.index}
        // hideHorizontalScrollIndicator
        style={[
          monthCellContainer,
          didWin ? { ...wonListItemContainerStyle, backgroundColor: '#ea6852' } : {},
        ]}>
        <View style={monthCell}>
          <View style={{ flex: 1 }}>
            <View style={[monthCircleStyle, didWin ? wonMonthCircleStyle : {}]}>
              <Text allowFontScaling={FONT_SCALLING} style={monthTextStyle}>
                {item.month.toUpperCase()}
              </Text>
              <Text allowFontScaling={FONT_SCALLING} style={[monthTextStyle, { marginTop: -5 }]}>
                {item.year}
              </Text>
            </View>
          </View>
          {item.stars > 0 &&
            <View style={{ alignSelf: 'center', flex: 1 }}>
              <Text allowFontScaling={FONT_SCALLING} style={numberOfStarsTextStyle} key="amount">
                {numberWithCommas(item.stars, this.props.currency, false)}
              </Text>
              <Image style={starListImageStyle} source={WHITE_STAR} key="stars" />
            </View>
          }
        </View>
      </View>
    );
    const renders = [cellComp];
    return renders;
  }

  expireDateText = (expiryData, index, array) => {
    const { ExpiryDate, ExpiryAmount } = expiryData;
    const { currency } = this.props;
    return (
      <Text allowFontScaling={FONT_SCALLING} style={[styles.rowRightText, { color: APP_COLOR_WHITE }]} key={index}>
        { numberWithCommas(ExpiryAmount, currency, false)} ON { Moment(ExpiryDate).format('D MMM').toUpperCase()}
      </Text>
    )
  }

    setTabViewRef = (ref) => {
      this.TabView = ref
    }

    _renderLabel = (props) => {
      const {
        route: { MonthShortName, index }
      } = props;
      const isSelected = index === this.state.index;
      return (
        <View 
        style={[
          styles.label,
          isSelected ? 
          {backgroundColor: APP_COLOR_RED, width: 50, height: 50, borderRadius: 50/2} 
          : {backgroundColor: APP_COLOR_WHITE, width: 50, height: 50, borderRadius: 50/2}
        ]}
         key={index}>
          <Text
            allowFontScaling={FONT_SCALLING}
            style={[
              styles.labelText,
              isSelected ? {
                color: APP_COLOR_WHITE,
                fontSize: 12,
              }: 
              {
                color: APP_COLOR_RED,
                fontSize: 12,
              }
            ]}>
            {MonthShortName.toUpperCase()}
          </Text>
        </View>
      );
    };
    getOrgsAndColors = (organizationData, themeArray) => {
      let colors = [];
      let data = organizationData && organizationData.length > 0 ? 
        organizationData.map((item) => {
          const color = themeArray.find((obj) => obj.orgId == item.orgId).Color;
          colors.push(color);
          return {
            x: numberWithCommas(item.MonthlyTier, null, false) + ' ' + item.orgName,
            y: item.MonthlyTier,
            fill: color,
            labelColor: color,
            cornerRadius:5
          }
        }) : [{y: 300, fill: APP_COLOR_RED}];

        if (organizationData.length > 0) {
          colors.push(APP_COLOR_RED);
          data.push({
            x: 'White Portion',
            y: "300.00",
            labelColor: APP_COLOR_WHITE,
            fill: APP_COLOR_RED, 
            hidden: true
          })
        };

      return {data, colors};
    }
    _renderScene = (state) => {
      const {themeArray, nextLevelData, TotalPoints} = this.props;
      const organizationData = state.route.orgData;
      const {data, colors} = this.getOrgsAndColors(organizationData, themeArray);
      const currentLevel = nextLevelData?.LevelName?.toUpperCase();
      return (
        <View style={[styles.rowsContainer,
        {marginTop: IF_OS_IS_IOS ? 8 : 15, alignItems: 'center',justifyContent: 'center' }]}>
           <Svg 
           width={verticalScale(260)} 
           height={IF_OS_IS_IOS ? verticalScale(210) : verticalScale(240) }>
              <VictoryPie
                standalone={false}
                width={verticalScale(260)}
                height={IF_OS_IS_IOS ? verticalScale(210) : verticalScale(240)}
                innerRadius={IF_OS_IS_IOS ? verticalScale(50) : verticalScale(57)}
                data={data}
                colorScale={colors}
                style={{
                  data: {
                    fill: ({datum}) => datum.fill,
                  },
                  labels: {
                    fontFamily: DINENGSCHRIFT_BOLD,
                    fill: ({datum}) => datum.labelColor,
                    padding: IF_OS_IS_IOS ? verticalScale(10) : verticalScale(13)
                  },
                }}
              />
                <View style={{ alignItems: 'center', paddingTop: IF_OS_IS_IOS ? verticalScale(90) : verticalScale(95) }}>
                   <View>
                      <Text style={{ fontSize: verticalScale(16), fontFamily: DINENGSCHRIFT_BOLD, color: APP_COLOR_BLACK }}>
                      {state?.route?.MonthName.toUpperCase()}
                      </Text>
                   </View>
                   <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontSize: verticalScale(16), fontFamily: DINENGSCHRIFT_BOLD, color: APP_COLOR_BLACK }}>
                      {numberWithCommas(state?.route?.TotalMonthlyTier, null, false)}
                    </Text>
                    <Image style={[styles.starImageStyle, {tintColor: 'black'}]} source={WHITE_STAR} resizeMode="contain" />
                   </View>
                </View>
            </Svg>
        </View> 
      );
    };

    _renderTabBar = (props) => (
      <TabBar
        {...props}
        scrollEnabled
        pressColor={APP_COLOR_RED}
        onTabPress={this._handleTabItemPress}
        renderLabel={this._renderLabel}
        indicatorStyle={{ backgroundColor: "#F4C2B9" }}
        tabStyle={styles.tab}
        style={styles.tabbar}
      />
      )

    _handleIndexChange = index => {
      const { squadDetailArray } = this.state;
      const monthlyEarnPoints = squadDetailArray[index].TotalMonthlyTier;
      this.setState({ index: Number(index), monthlyEarnPoints });
    };
  
    _handleTabItemPress = (props) => {
      const { squadDetailArray } = this.state;
      const monthlyEarnPoints = squadDetailArray[props.route.index].TotalMonthlyTier;
      this.setState({ index: Number(props.route.index), monthlyEarnPoints });
    };

    onPressContatcDropDown() {
      if (this.state.contacts.length == 0) {
        setTimeout(() => this.parseContacts(), 20);
      } else {
        this.setState({ showContactPopUp: true });
      }
      this.setState({ showContactLoader: true });
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

    setSelectedObject = (event, object) => {
      this.setState({ selectedOption: object, showContactPopUp: false },
        () => {
            if (this.validateAmount()) {
              this.props.sendAmount(this.getUserInputsData());
            }
        });
    };

    onCrossPressOnContatcPopup = () => {
      this.setState({ showContactPopUp: false });
    };

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

    validateAmount() {
      const {
        amount,
        selectedOption: { displayName = '', number = '' }
      } = this.state;
      const {loyalty: {TotalAmounts}} = this.props.userInfo[0];
      const recipientMobile = parseMobileNumber(number);
      if (parseInt(amount)) {
        if (parseInt(amount) > TotalAmounts) {
          this.setState({
            sendTitle: 'UH-OH!',
            sendMessage: 'Your balance is ' + TotalAmounts,
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

    hideShowInfoPopup = () => {
      this.setState({
        showInfoPopup: false,
        goHome: false,
        sendTitle: "",
        sendMessage: ""
      });
    };

    hideSendMessagePopup = () => {
      const willGoHome = this.state.goHome == true;
      this.setState({
        showSendMessagePopup: false,
        goHome: false,
        sendTitle: "",
        sendMessage: "",
        amount: 0
      });
    };

  render() {
    const {
      noData,
      squadDetailArray,
      index
    } = this.state;
    const {
      mainContanerStyle,
    } = styles;

    const { TotalAmounts } = this.props.userInfo[0]?.loyalty;
    const { nextLevelData, TotalPoints } = this.props
    const {FirstName} = this.props.userInfo[0]?.customer
    const {
      extra: { FirstSoonExpiry }
    } = this.props;
    const currentLevel = nextLevelData?.LevelName?.toUpperCase();
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.rootContainer}>
          {noData ? (
            <ScreenModeInfoPopUp
              noData={noData}
              onCrossPress={this.onNoDataDismissal}
              modalVisibilty={noData}
              selectedHeading={'heqaing'}
              selectedSubHeading={'subheading'}
              appTheme={this.state.componentTheme}
            />
          ) : null}
          <View style={mainContanerStyle}>
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
            <View style={styles.userNameViewStyles}>
               <Text style={styles.userNameTextStyles}>
                 {FirstName}
               </Text>
            </View>
          <Container>
            <TabView
              ref={this.setTabViewRef}
              style={[
                styles.container,
                { backgroundColor: APP_COLOR_WHITE }
              ]}
              navigationState={this.state}
              renderScene={this._renderScene}
              renderTabBar={this._renderTabBar}
              onIndexChange={this._handleIndexChange}
            />
          </Container>
       <View style={styles.footerRoot}> 
        <View style={[styles.footerSubViewStyle, {marginBottom: 14}]}>
         <View style={styles.levelAndOrgPointsViewStyle}>
          <View 
            style={styles.currentLevelViewStyle}>
            <View>
              <Text style={styles.pointsAndLevelStyle}>
              {currentLevel}
              </Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text style={[styles.pointsAndLevelStyle, {fontSize: 16}]}>
                 {numberWithCommas(TotalPoints || 0, null, false)}
              </Text>
              <Image style={styles.starImageStyle} source={WHITE_STAR} resizeMode="contain" />
            </View>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 5}}>
              {squadDetailArray && squadDetailArray.length > 0 && 
                squadDetailArray[index]?.orgData?.map((item, i) => {
                  return (
                    <View key={i} style={{width: '50%',alignItems: "center"}}>
                        <Text style={styles.monthAndOrgTextStyle}>
                          {numberWithCommas(item.MonthlyTier || 0, null, false)} {item.orgName}
                        </Text>
                    </View>
                    )
                  })
              }
            </View>
          </View>
          </View>
          <View style={styles.existingRedeemableRootViewStyle}>
            <View style={styles.existingRedeemableViewStyle}>
              <View>
               <Text style={styles.existingRedeemableStyle}>
                 {strings.EXISTING_REDEEMABLE_AMOUNT.toUpperCase()}
               </Text>
              </View>
              <View>
               <Text style={styles.existingRedeemableValueStyle}>
                 {numberWithCommas(TotalAmounts || 0, this.props.currency)}
               </Text>
              </View>
            </View> 
          </View>
        </View>

        <View style={styles.footerSubViewStyle}>
            <View style={styles.nextLevelViewStyle}>
              <View>
                <Text style={styles.starsNeedForNextLevelText
                }>
                  {numberWithCommas(nextLevelData?.NextLevel?.PointsNeeded, '', false)} {strings.STARS.toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.nextLevelTextStyle}>
                  {strings.LEFT_TO.toUpperCase()} {nextLevelData?.NextLevel?.LevelName?.toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.pointsNeedByDateTextStyle}>
                  {strings.NEEDED_BY} {Moment(nextLevelData?.NextLevel?.UpgradeDate).format('MMMM D, YYYY').toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.needToExpireViewStyle}>  
              <View style={styles.nearToExpireRedeemableView}>
                <View>
                  <Text style={styles.nearToExpireAmountText}>
                    {strings.NEAR_TO_EXPIRE_REDEEMABLE_AMOUNTS.toUpperCase()}
                  </Text>
                </View>  
                <View style={styles.expiryInfo}>
                  {FirstSoonExpiry && FirstSoonExpiry.map(this.expireDateText)}
                </View>
              </View>
            </View>
          </View>
         <View 
           style={styles.boostStars}>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <Text style={styles.collectMoreStarsText}>
              {strings.COLLECT_MORE_STARS.toUpperCase()}
            </Text>
          </View>
          <View style={{flex: 1, alignItems: 'center', alignSelf: 'center'}}>
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
     </View>
    <CommonLoader />
    </View>
        <ContactViewPopUp
            modalVisibilty={this.state.showContactPopUp}
            contacts={this.state.contacts}
            appTheme={this.state.componentTheme}
            setSelectedObject={this.setSelectedObject}
            onCrossPress={this.onCrossPressOnContatcPopup}
          />
      </SafeAreaView>
    );
  }
}

const styles = {
  screen: {
    flex: 1
  },
  rootContainer: {
    flex: 1
  },
  container: {
    flex: 1
  },
  rowsContainer: {
    flex: 1,
    width: '100%',
    marginTop: 15
  },
  completesContainer: {
    height: '70%'
  },
  expiryInfo: {
    flex: 1,
    //flexWrap: 'wrap'
  },
  mainContanerStyle: {
    backgroundColor: APP_COLOR_WHITE,
    flex: 1,
  },
  userLevelTextStyle: {
    fontSize: IF_OS_IS_IOS ? 11 : 10,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_RED,
    alignSelf: 'center',
    paddingTop: IF_OS_IS_IOS ? null : 5,
    flexWrap: "nowrap",
    marginBottom: 1
  },
  levelIndicatorBase: {
    backgroundColor: APP_COLOR_WHITE,
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 1,
    height: 20,
    width: 100,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  userLevelArrow: {
    position: 'absolute',
    top: IF_OS_IS_IOS ? 20 : 19.4,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 50,
    borderRightWidth: 50,
    borderTopWidth: IF_OS_IS_IOS ? 35 : 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: APP_COLOR_WHITE
  },
  starImageStyle: {
    width: 20,
    height: 20,
    marginLeft: 7
  },
  starImageMinStyle: {
    width: 18,
    height: 18
  },
  starImageTwoAndThreeStyle: {
    width: 20,
    height: 20,
    marginBottom: 4
  },
  becomeHeadeTitleTextStyle: {
    fontSize: 12,
    fontFamily: DINENGSCHRIFT_BOLD,
    color: APP_COLOR_RED,
  },
  rowLeftText: {
    fontSize: 14,
    fontFamily: DINENGSCHRIFT_BOLD,
    color: APP_COLOR_RED,
    textAlign: 'left',
    marginTop: IF_OS_IS_IOS ? 5 : 0,
  },
  parentContainerStyle: {
    backgroundColor: APP_COLOR_BLACK,
    paddingTop: ifIphoneX(0, StatusBar.currentHeight || 22),
    paddingRight: ifIphoneX(20, 0),
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'flex-end',
    justifyContent: 'flex-end'
  },
  headerContanerStyle: {
    height: TITLE_CONTAINER_HEIGHT,
    flexDirection: 'row',
    backgroundColor: APP_COLOR_WHITE,
  },
  titleBarContainer: {
    width: '100%',
    backgroundColor: APP_COLOR_WHITE,
    flexDirection: 'row',
    height: verticalScale(52)
  },
  backButtonContainer: {
    flex: 1
  },
  titleContainer: {
    alignItems: 'flex-end',
    flex: 1,
    paddingRight: 16
  },
  startRowStyle: {
    backgroundColor: APP_COLOR_WHITE,
    paddingHorizontal: 5,
    paddingVertical: 10,
    paddingEnd: 15,
    flex: 1,
    flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'space-between',
  },
  rowLeftContainer: {
    // flex: 1,
    width: '40%',
    justifyContent: 'center'
  },
  rowRightContainer: {
    // flex: 1,
    width: '60%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  subContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: LEFT_RIGHT_MARGINS,
    paddingEnd: LEFT_RIGHT_MARGINS,
    height: TITLE_CONTAINER_HEIGHT
  },
  monthsContainer: {
    flex: 1,
    // flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'center',
    backgroundColor: '#f3b3a8'

  },
  titleTextStyle: {
    fontSize: TITLE_FONT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_RED
  },
  backContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: 10,
    marginEnd: 15,
    justifyContent: 'flex-end',
    flex: 1
  },
  starsSubviewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  backTextStyle: {
    textAlign: 'right',
    color: APP_COLOR_RED,
    fontSize: 12,
    fontFamily: DINENGSCHRIFT_REGULAR
  },
  rowRightText: {
    textAlign: 'left',
    color: APP_COLOR_RED,
    fontSize: 13,
    fontFamily: DINENGSCHRIFT_REGULAR,
    paddingStart: 2,
    marginTop: 0
  },
  neededByDate: {
    fontSize: 10
  },
  altTextStyle: {
    textAlign: 'right',
    color: APP_COLOR_RED,
    fontFamily: DINENGSCHRIFT_REGULAR,
    alignItems: 'center',
    fontSize: 18,
    marginTop: IF_OS_IS_IOS ? 7 : 0,
    marginStart: 6
  },
  arrowImageStyle: {
    marginLeft: 5,
    marginRight: 5,
    width: BACK_ARROW_WIDTH,
    height: BACK_ARROW_HEIGHT,
    // marginBottom: IF_OS_IS_IOS ? 7 : 0
  },
  listItemContainerStyle: {
    width: '100%',
    overflow: "visible",
    height: '100%',
    flexDirection: 'column',
    // borderColor: 'purple',
    borderWidth: 0,
    // alignItems: 'center',
    // justifyContent: 'center',
    margin: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingTop: 0,
    paddingRight: 5,
    paddingBottom: 0,
    paddingLeft: 5
  },
  monthCellContainer: {
    flex: 1,
    // width: MONTH_CELL_WIDTH,
    width: '100%',
    height: '100%',
    // flexDirection: 'row',
    // borderColor: 'purple',
    borderWidth: 0,
    // alignItems: 'center',
    justifyContent: 'flex-start',
    borderWidth: 0,
    margin: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 10,
    paddingStart: 15,
    // paddingEnd: 15
    // flexDirection: 'row'
  },
  wonListItemContainerStyle: {
    backgroundColor: APP_COLOR_RED,
    //width: 'auto',
    // paddingRight: 0,
    // paddingLeft: 0
  },
  monthCell: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 8,
    paddingLeft: 10,
    paddingRight: 0,
    justifyContent: 'space-between'
    // alignSelf: 'center',
    // alignItems: 'center',
    // justifyContent: 'center'
  },
  quantityTextStyle: {
    fontSize: 16,
    alignItems: "center",
    justifyContent: "center",
    fontFamily: DINENGSCHRIFT_BOLD,
    color: APP_COLOR_BLACK,
    paddingVertical: 0,
    paddingHorizontal: 10,
    borderRadius: 10,
    //backgroundColor: "#ee9e90",
    //borderColor: REDEEMABLE_AMOUNT_GRAY_TEXT_COLOR,
    //borderWidth: 1,
    paddingTop: IF_OS_IS_IOS ? 5 : 0,
    width: "100%",
    minWidth: 50,
    height: 32
  },
  monthCircleStyle: {
    width: MONTH_CIRCLE_SIZE,
    height: MONTH_CIRCLE_SIZE,
    backgroundColor: APP_COLOR_WHITE,
    alignItems: 'center',
    borderColor: 'green',
    borderWidth: 0,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    borderRadius: MONTH_CIRCLE_SIZE / 2,
    paddingTop: IF_OS_IS_IOS ? 6 : 0,
  },
  wonMonthCircleStyle: {
    backgroundColor: APP_COLOR_BLACK,
    // marginRight: 10,
    // marginLeft: 10,
    // marginTop: 40
  },
  starListImageStyle: {
    alignSelf: 'center',
    // marginTop: -3,
    width: STAR_LIST_WIDTH,
    height: STAR_LIST_HEIGHT
  },
  circleListTextStyle: {
    textAlign: 'center',
    color: APP_COLOR_RED,
    fontSize: CIRCLE_LIST_TEXT_SIZE,
    fontFamily: ROADSTER_REGULAR,
    lineHeight: 21
  },
  wonCircleListTextStyle: {
    color: APP_COLOR_WHITE,
  },
  numberOfStarsTextStyle: {
    flexWrap: 'nowrap',
    textAlign: 'center',
    color: APP_COLOR_WHITE,
    fontSize: 14,
    fontFamily: DINENGSCHRIFT_BOLD,
    // marginTop: 3
  },
  cellLine: {
    position: 'absolute',
    right: -1,
    top: 0,
    height: '120%',
    width: 2,
    backgroundColor: APP_COLOR_WHITE,
    zIndex: 8
  },
  arrowUp: {
    position: 'absolute',
    bottom: -1,
    right: -9,
    width: 0,
    height: 0,
    zIndex: 8,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: IF_OS_IS_IOS ? 28 : 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: APP_COLOR_WHITE
  },
  cellLineAfter: {
    left: -1,
  },
  arrowUpAfter: {
    left: IF_OS_IS_IOS ? -10 : -9,
  },
  listScroller: { height: '100%' },
  lightButtonText: {
    ...COMMON_BUTTON_TEXT_STYLE,
    fontFamily: DINENGSCHRIFT_BOLD,
    fontSize: 13,
    margin: IF_OS_IS_IOS ? 0 : 0
  },
  blackButtonStyle: {
    backgroundColor: APP_COLOR_BLACK,
    width: 152,
    height: 32,
    alignItems: "center",
    paddingBottom: IF_OS_IS_IOS ? 7 : 5,
    marginBottom: 10,
    justifyContent: "center",
    borderRadius: 10
  },
  label:{
    height: 45,
    justifyContent: 'center'
   // marginTop: -5,
  },
  labelText: {
    fontFamily: DINENGSCHRIFT_BOLD,
    textAlign: 'center',
    fontSize: 15
  },
  tabbar: {
    backgroundColor: "#F4C2B9",
    height: 65,
  },
  tab: {
    // padding: 0,
    //paddingHorizontal: 10,
    //marginHorizontal: 7,
    //marginStart: 3,
    //margin: 0,
    //opacity: 1,
    backgroundColor: "#F4C2B9",
    borderWidth: 0,
    width: 65,
    height: 50,
    marginTop: 7
    // borderColor: 'yellow',
  },
  userNameViewStyles: {
    height: 60,
    borderBottomWidth: 1, 
    borderColor: APP_COLOR_WHITE
  },
  userNameTextStyles: {
    marginStart: 20,
    color: APP_COLOR_RED,
    marginTop: 15,
    fontSize: 25
  },
  boostStars: {
    flex: 1,
    justifyContent: 'center'
  },
  collectMoreStarsText:{
    color: APP_COLOR_BLACK,
    fontFamily: DINENGSCHRIFT_BOLD,
    textAlign: 'center'
  },
  footerRoot: {
    backgroundColor: APP_COLOR_RED,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    height: IF_OS_IS_IOS ? "45%" : "47%",
    padding: 15
  },
  footerSubViewStyle: { 
   flex: 1,
   flexDirection: 'row',
   justifyContent: 'space-between',
   
  },
  levelAndOrgPointsViewStyle: {
    flex: 1,
    borderRightColor: APP_COLOR_WHITE,
    borderRightWidth: 0.5
  },
  nextLevelViewStyle: {
    flex: 1, 
    textAlign: 'center', 
    alignItems: 'center', 
    //justifyContent: 'center',
    marginTop: 5
  },
  nextLevelTextStyle: {
    color: APP_COLOR_BLACK, 
    fontFamily: DINENGSCHRIFT_BOLD, 
    fontSize: 16
  },
  pointsNeedByDateTextStyle:{
    color: APP_COLOR_WHITE, 
    fontSize: 9, 
    fontFamily: DINENGSCHRIFT_BOLD
  },
  needToExpireViewStyle: {
    flex: 1, 
    borderLeftColor: APP_COLOR_WHITE, 
    borderLeftWidth: 0.5
  },
  currentLevelViewStyle: {
    flex: 1,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomColor: APP_COLOR_WHITE,
    borderBottomWidth: 0.5,
    marginHorizontal: 7,
    marginBottom: -7
  },
  pointsAndLevelStyle: { 
    fontSize: 20,
    fontFamily: DINENGSCHRIFT_BOLD,
    color: APP_COLOR_WHITE
  },
  monthAndOrgTextStyle: {
    color: APP_COLOR_BLACK,
    fontFamily: DINENGSCHRIFT_BOLD,
    fontSize: 17
  },
  existingRedeemableRootViewStyle: {
    flex: 1,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },
  existingRedeemableViewStyle: {
    flex: 1,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomColor: APP_COLOR_WHITE,
    borderBottomWidth: 0.5,
    marginHorizontal: 7,
    marginBottom: -7,
    minWidth: '92%'
  },
  existingRedeemableStyle: {
    fontSize: 13,
    fontFamily: DINENGSCHRIFT_BOLD,
    color: APP_COLOR_BLACK,
    textAlign: 'center'
  },
  existingRedeemableValueStyle: {
    fontFamily: DINENGSCHRIFT_BOLD,
    color: APP_COLOR_WHITE,
    fontSize: 18
  },
  nearToExpireRedeemableView: {
    flex: 1,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5
  },
  redeemableAmountText: {
    fontSize: 23,
    color: APP_COLOR_WHITE,
    fontFamily: DINENGSCHRIFT_REGULAR
  },
  nearToExpireAmountText: {
    fontSize: 13,
    color: APP_COLOR_BLACK,
    fontFamily: DINENGSCHRIFT_BOLD,
    textAlign: 'center'
  },
  amountContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  amountColonText: {
    fontSize: 20,
    color: APP_COLOR_WHITE,
    fontFamily: DINENGSCHRIFT_REGULAR
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
  panelRow: {
    flexDirection: "row",
    paddingBottom: 10
  },
  panelLast: {
    paddingBottom: 0
  },
  needHelpTextStyle: {
    fontSize: 15,
    color: APP_COLOR_WHITE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    textDecorationLine: 'underline'
  },
  starsNeedForNextLevelText: {
    color: APP_COLOR_WHITE, 
    fontSize: 18, 
    fontFamily: DINENGSCHRIFT_BOLD
  },
  starsGainedThisMonthText: {
    color: APP_COLOR_BLACK, 
    fontSize: 14, 
    fontFamily: DINENGSCHRIFT_REGULAR
  },
  textInputView: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  textInputCurrencyView: {
    color: APP_COLOR_BLACK, 
    fontFamily: DINENGSCHRIFT_BOLD, 
    fontSize: 16
  }
};

function mapStateToProps(state) {
  console.log('squad corner details is loading....', state);
  const { CustomerId: CustomerID, FullMobile: MobileNumber } = getUserObject(state);
  const {
    app: {
      userContact: contactList,
    },
    squardcorner: {
      userDetails: userInfo,
      sendAmount: sendAmountData,
      sendToFriend: sendToFriendData,
      squadCorner: { Level, TotalPoints, LoyaltyHelp }
    },
    deliverydetails: {
      walletData: { RedeemableAmountBalance },
  }
} = state;

  return {
    squadDetailArray: state.squardcorner.squadDetail?.data,
    themeArray: state.squardcorner.squadDetail?.Themes,
    extra: state.squardcorner.squadCorner || {},
    // squadsDetailsExtrasArray: state.squardcorner.squadDetail.extra,
    currency: state.app.currency,
    userInfo: userInfo,
    LevelName: userInfo[0]?.loyalty?.LevelName,
    LoyaltyId: userInfo[0]?.loyalty?.LoyaltyId,
    StartDate: userInfo[0]?.loyalty?.StartDate,
    RedeemableAmountBalance,
    contactList,
    sendAmountData,
    sendToFriendData,
    CustomerID,
    MobileNumber,
    nextLevelData: Level,
    TotalPoints,
    LoyaltyHelp
  };
}

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      ...actions,
      ...appstateAction
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SquadCornerDetail);
