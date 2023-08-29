import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  ImageBackground,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {
  APP_COLOR_WHITE,
  APP_COLOR_RED,
  APP_COLOR_BLACK,
} from '../../config/colors';
import { IF_OS_IS_IOS, FONT_SCALLING } from '../../config/common_styles';
import strings from '../../config/strings/strings';
import {
  ARROW_RIGHT_WHITE,
  ABOUT_BACKGROUND_IMAGE,
  TRACK_ORDER_BOTTOM_VIEW_IMAGE
} from '../../assets/images';
import { DINENGSCHRIFT_REGULAR, HELVETICANEUE_LT_STD_CN } from '../../assets/fonts';
import { numberWithCommas } from '../../config/common_functions';
import { OrderStatusBar } from './OrderStatusBar';
import { connect } from 'react-redux';
import { actions } from '../../ducks/deliverydetails';
import CommonLoader from '../../components/CommonLoader';
import { Actions } from 'react-native-router-flux';
import moment from 'moment';
import { BoostYourStartPopUp } from '../../components';
import { getUserObject } from '../../helpers/UserHelper';

const TITLE_CONTAINER_HEIGHT = 260;
const LEFT_RIGHT_MARGIN = 20;
const TRACK_ORDER_SUBHEADING_TEXT_SIZE = 23;
const TRACK_ORDER_TEXT_SIZE = 30;
const TRACK_ORDER_SMALL_TEXT_SIZE = 15.5;
const ORDER_STATUS_CIRCLE_SIZE = 18;
const ORDER_STATUS_SMALL_TEXT_SIZE = 18;

const TITLE_FONT_SIZE = 30;
const ABOUT_ICON_SIZE = 25.5;

const IMAGE_CONTAINER_HEIGHT = 249.5;
const ORDER_STATUS_CONTAINER_HEIGHT = 156.5;
const DESCRIPTION_FONT_SIZE = 18;
const BOTTOM_VIEW_TITLE_FONT_SIZE = 25;
const BOTTOM_VIEW_FONT_SIZE = 19;

const BOTTOM_CONTAINER_HEIGHT = 174;

const trackOrderData = [
  {
    OrderId: '25',
    DeliveryTime: '2017-10-16 00:30:00',
    Status: 'delivered',
    OrderType: 'delivery',
    AssignmentDate: null,
    ReturnDate: null,
    SettlementDate: null,
    FirstName: 'John',
    LastName: 'Smith',
    Mobile: '0096103123456',
    Line1: 'Beirut Hamra x1',
    Line2: 'Beirut h1',
    City: null,
    Province: null,
    Apartment: '0',
    AddressType: '2',
    items: [
      {
        ID: '5475393',
        PLU: '1001',
        Quantity: '1',
        UnitPrice: '13500.00',
        GrossPrice: '13500.00',
        ItemName: 'HUMMUS & CRACKERS'
      },
      {
        ID: '5475394',
        PLU: '1002',
        Quantity: '1',
        UnitPrice: '13500.00',
        GrossPrice: '13500.00',
        ItemName: 'GOLDEN WEDGES'
      },
      {
        ID: '5475397',
        PLU: '1003',
        Quantity: '1',
        UnitPrice: '13500.00',
        GrossPrice: '13500.00',
        ItemName: 'HALLOUMI STICKS'
      },
      {
        ID: '5475397',
        PLU: '1003',
        Quantity: '1',
        UnitPrice: '13500.00',
        GrossPrice: '13500.00',
        ItemName: ' Chicken Strips '
      }
    ],
    promotions: [],
    payment: [
      {
        DOPId: '84',
        TotalAmount: '50000.00',
        PaymentStatus: 'pending'
      }
    ],
    paymentParts: [
      {
        Settlement: '30000.00',
        Currency: 'LBP',
        Category: 'Cash'
      },
      {
        Settlement: '20000.00',
        Currency: 'LBP',
        Category: 'Wallet'
      }
    ]
  }
];

const orderStatusList = [
  {
    id: 1,
    title: 'Started',
    description: "We're starting up your meal right now"
  },
  {
    id: 2,
    title: 'In Progress',
    description: "We're cooking up your meal as we speak! It should be good to go in just bit."
  },
  {
    id: 3,
    title: 'On the Way',
    description: 'Your meal is on the way.'
  },
  {
    id: 4,
    title: "It's Here!",
    description: 'Your Meal is Here.'
  }
];

class TrackOrder extends Component {
  noOrderYetIndex = 0;
  state = {
    orderStatus: 2,
    trackOrderInfo: [],
    componentTheme: {},
    historyPopupVisibilty: false
  };
  componentWillUnmount() {}

  componentWillMount() {
    this.setThemeOfComponent();
    this.setOrderStatus();
  }
  setThemeOfComponent() {
    const theme = AsyncStorage.getItem('theme').then(data =>
      this.setState({ componentTheme: JSON.parse(data) })
    );
  }
  setOrderStatus() {
    const { status, message } = this.props;
    //console.log('TESTING STATUS AND MESSAGES', status, message, this.props);
    this.setState({
      orderConfirmationVisibility: status == 200 || message == 'Order Inserted'
    });
  }
  componentDidMount() {
    if (this.props.CustomerId !== undefined) {
      this.props.getTrackOrders(this.props.CustomerId);
      // this.props.getTrackOrders('131626');
    }
    // this.props.getTrackOrders(131514);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.trackOrderInfo !== this.props.trackOrderInfo) {
      this.noOrderYetIndex++;
      nextProps.trackOrderInfo.sort(function(a, b) {
        return parseInt(a.OrderId) - parseInt(b.OrderId);
      });

      if (nextProps.trackOrderInfo.length > 0) {
        this.setState(
          {
            trackOrderInfo: nextProps.trackOrderInfo[nextProps.trackOrderInfo.length - 1]
          },
          () => {}
        );
      } else {
        this.setState({ historyPopupVisibilty: true });
      }
    }
  }

  onPress = (event, caption, orderId) => {
    switch (caption) {
      case strings.CHECK_ORDER:
        // Actions.orderhistory(orderId);
        break;

      default:
    }
  };

  callOrderStatusBar = status => {
    if (this.state.trackOrderInfo.StatusId === '10') {
      return <OrderStatusBar orderStatus={1} appTheme={this.state.componentTheme} />;
    } else if (this.state.trackOrderInfo.StatusId === '1') {
      return <OrderStatusBar orderStatus={2} appTheme={this.state.componentTheme} />;
    } else if (this.state.trackOrderInfo.StatusId === '2') {
      return <OrderStatusBar orderStatus={3} appTheme={this.state.componentTheme} />;
    } else if (this.state.trackOrderInfo.StatusId === '3') {
      return <OrderStatusBar orderStatus={4} appTheme={this.state.componentTheme} />;
    }
  };
  calculateItems = items => {
    var total = 0;
    for (var i = 0; i < items.length; i++) {
      total = total + parseInt(items[i].Quantity, 10);
    }
    return total;
  };
  calculateDuration = datetime => {
    if (datetime !== undefined) {
      var currentDate = new Date();
      var now = moment(currentDate).format('YYYY/MM/DD HH:mm:ss');
      var then = datetime; /*"2018-03-23 14:50:00";*/
      var ms = moment(then, 'YYYY/MM/DD HH:mm:ss').diff(moment(now, 'YYYY/MM/DD HH:mm:ss'));
      var d = moment.duration(ms);
      var result = Math.floor(d.minutes());

      return parseInt(result, 10);
    }
  };

  formatDateTime = (datetime, scheduled) => {
    if (datetime !== undefined) {
      // var date = new Date(datetime);
      var now = moment(datetime).format('DD/MM/YYYY');

      var now1 = moment(datetime).format('hh:mm A');

      if (scheduled) {
        return now + ' AT ' + now1;
      } else {
        return ' AT ' + now1;
      }
    }
    return ' ';
  };

  numberToEnglish = n => {
    var string = n.toString(),
      units,
      tens,
      scales,
      start,
      end,
      chunks,
      chunksLen,
      chunk,
      ints,
      i,
      word,
      words,
      and = 'and';

    /* Is number zero? */
    if (parseInt(string) === 0) {
      return 'zero';
    }

    /* Array of units as words */
    units = [
      '',
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'nine',
      'ten',
      'eleven',
      'twelve',
      'thirteen',
      'fourteen',
      'fifteen',
      'sixteen',
      'seventeen',
      'eighteen',
      'nineteen'
    ];

    /* Array of tens as words */
    tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    /* Array of scales as words */
    scales = [
      '',
      'thousand',
      'million',
      'billion',
      'trillion',
      'quadrillion',
      'quintillion',
      'sextillion',
      'septillion',
      'octillion',
      'nonillion',
      'decillion',
      'undecillion',
      'duodecillion',
      'tredecillion',
      'quatttuor-decillion',
      'quindecillion',
      'sexdecillion',
      'septen-decillion',
      'octodecillion',
      'novemdecillion',
      'vigintillion',
      'centillion'
    ];

    /* Split user arguemnt into 3 digit chunks from right to left */
    start = string.length;
    chunks = [];
    while (start > 0) {
      end = start;
      chunks.push(string.slice((start = Math.max(0, start - 3)), end));
    }

    /* Check if function has enough scale words to be able to stringify the user argument */
    chunksLen = chunks.length;
    if (chunksLen > scales.length) {
      return '';
    }

    /* Stringify each integer in each chunk */
    words = [];
    for (i = 0; i < chunksLen; i++) {
      chunk = parseInt(chunks[i]);

      if (chunk) {
        /* Split chunk into array of individual integers */
        ints = chunks[i]
          .split('')
          .reverse()
          .map(parseFloat);

        /* If tens integer is 1, i.e. 10, then add 10 to units integer */
        if (ints[1] === 1) {
          ints[0] += 10;
        }

        /* Add scale word if chunk is not zero and array item exists */
        if ((word = scales[i])) {
          words.push(word);
        }

        /* Add unit word if array item exists */
        if ((word = units[ints[0]])) {
          words.push(word);
        }

        /* Add tens word if array item exists */
        if ((word = tens[ints[1]])) {
          words.push(word);
        }

        /* Add 'and' string after units or tens integer if: */
        if (ints[0] || ints[1]) {
          /* Chunk has a hundreds integer or chunk is the first of multiple chunks */
          if (ints[2] || (!i && chunksLen)) {
            /* words.push( and );*/
          }
        }

        /* Add hundreds word if array item exists */
        if ((word = units[ints[2]])) {
          words.push(word + ' hundred');
        }
      }
    }

    return words.reverse().join(' ');
  };

  onCrossPress = () => {
    this.setState({ historyPopupVisibilty: false });
    Actions.drawer({ type: 'reset' });
    Actions.home({ drawerMenu: true });
  };

  onOrderConfirmationPress = () => {
    this.setState({
      orderConfirmationVisibility: false
    });
  };

  render() {
    const {
      container,
      subContainer,
      statusTextStyle,
      bottomViewTextStyle,
      bottomViewTitleTextStyle,
      trackOrderRowContainer,
      trackOrderRowContainerLeftStyle,
      trackOrderTextStyle,
      trackOrderRightTextStyle,
      trackOrderRowContainerRightStyle,
    } = styles;
  
    return (
      <ScrollView>
        <BoostYourStartPopUp
          onCrossPress={this.onCrossPress}
          modalVisibilty={this.state.historyPopupVisibilty}
          selectedHeading={'UH-OH!'}
          selectedSubHeading={'NO ORDERS YET'}
          appTheme={this.state.componentTheme}
        />
        <BoostYourStartPopUp
          onCrossPress={this.onOrderConfirmationPress}
          modalVisibilty={this.state.orderConfirmationVisibility}
          selectedHeading={'ALL DONE!'}
          selectedSubHeading={'THANKS FOR SETTLING'}
          appTheme={this.state.componentTheme}
        />

        <View style={container}>
          <CommonLoader />
          <View
            style={[
              subContainer,
              {
                height: TITLE_CONTAINER_HEIGHT,
                backgroundColor: this.state.componentTheme.thirdColor
              }
            ]}>
            <View style={[trackOrderRowContainer, { marginTop: 10 }]}>
              <View style={trackOrderRowContainerLeftStyle}>
                <Text allowFontScaling={FONT_SCALLING} style={trackOrderTextStyle}>
                  {strings.TRACK_ORDER.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={trackOrderRowContainer}>
              <View style={trackOrderRowContainerLeftStyle}>
                <Text
                  allowFontScaling={FONT_SCALLING}
                  style={[trackOrderTextStyle, { fontSize: TRACK_ORDER_SUBHEADING_TEXT_SIZE }]}>
                  {strings.YOUR_ORDER.toUpperCase()}
                </Text>
              </View>
              <View style={trackOrderRowContainerRightStyle}>
                <Text
                  allowFontScaling={FONT_SCALLING}
                  style={[trackOrderRightTextStyle, { flexDirection: 'row' }]}>
                  {/* { 'TWO ITEMS' } */}
                  {this.state.trackOrderInfo.items !== undefined
                    ? this.calculateItems(this.state.trackOrderInfo.items) > 1
                      ? this.numberToEnglish(
                          this.calculateItems(this.state.trackOrderInfo.items)
                        ).toUpperCase() +
                        ' ' +
                        strings.ITEMS.toUpperCase()
                      : this.numberToEnglish(
                          this.calculateItems(this.state.trackOrderInfo.items)
                        ).toUpperCase() +
                        ' ' +
                        strings.ITEM.toUpperCase()
                    : null}
                </Text>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={event =>
                    this.onPress(event, strings.CHECK_ORDER, this.state.trackOrderInfo.OrderId)
                  }>
                  <Text allowFontScaling={FONT_SCALLING} style={styles.checkStatusTextStyle}>
                    {strings.CHECK_ORDER}
                  </Text>
                  <Image
                    style={[styles.editOrderArrowImageStyle, { marginTop: IF_OS_IS_IOS ? -7 : 0 }]}
                    source={ARROW_RIGHT_WHITE}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={trackOrderRowContainer}>
              <View style={trackOrderRowContainerLeftStyle}>
                <Text
                  allowFontScaling={FONT_SCALLING}
                  style={[trackOrderTextStyle, { fontSize: TRACK_ORDER_SUBHEADING_TEXT_SIZE }]}>
                  {strings.DELIVERY.toUpperCase()}
                </Text>
              </View>
              <View style={trackOrderRowContainerRightStyle}>
                <Text allowFontScaling={FONT_SCALLING} style={trackOrderRightTextStyle}>
                  {this.state.trackOrderInfo.AddressName !== undefined
                    ? this.state.trackOrderInfo.AddressName.toUpperCase()
                    : null}
                  {/* { totalStars + ' ' + strings.STARS.toUpperCase() } */}
                  {/* "10-5-2018 AT 4:30 pm"  "4:30 PM"  */}
                </Text>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={event => this.onPress(event, strings.EARN_MORE)}>
                  <Text allowFontScaling={FONT_SCALLING} style={styles.checkStatusTextStyle}>
                    {this.state.trackOrderInfo.ScheduleTime !== '0000-00-00 00:00:00'
                      ? this.state.trackOrderInfo.ScheduleTime !== undefined
                        ? // 'in ' + this.calculateDuration( this.state.trackOrderInfo.ScheduleTime ) + ' Minutes'
                          this.formatDateTime(this.state.trackOrderInfo.ScheduleTime, true)
                        : null
                      : this.state.trackOrderInfo.DeliveryTime !== undefined
                        ? // 'in ' + this.calculateDuration( this.state.trackOrderInfo.DeliveryTime ) + ' Minutes'
                          this.formatDateTime(this.state.trackOrderInfo.DeliveryTime, false)
                        : null}
                  </Text>
                </View>
              </View>
            </View>
            <View style={trackOrderRowContainer}>
              <View style={trackOrderRowContainerLeftStyle}>
                <Text
                  allowFontScaling={FONT_SCALLING}
                  style={[trackOrderTextStyle, { fontSize: TRACK_ORDER_SUBHEADING_TEXT_SIZE }]}>
                  {strings.PAYMENT_METHOD.toUpperCase()}
                </Text>
              </View>
              <View style={trackOrderRowContainerRightStyle}>
                {this.state.trackOrderInfo.paymentParts !== undefined
                  ? this.state.trackOrderInfo.paymentParts.map((data, i) => {
                      return (
                        <Text
                          key={i}
                          allowFontScaling={FONT_SCALLING}
                          style={trackOrderRightTextStyle}>
                          {data.Category === null ? ' ' : data.Category.toUpperCase()}
                        </Text>
                      );
                    })
                  : null}
              </View>
            </View>

            <View style={[trackOrderRowContainer, { marginTop: 20 }]}>
              <View style={trackOrderRowContainerLeftStyle}>
                <Text
                  allowFontScaling={FONT_SCALLING}
                  style={[trackOrderTextStyle, { fontSize: TRACK_ORDER_SUBHEADING_TEXT_SIZE }]}>
                  {strings.TOTAL_AMOUNT.toUpperCase()}
                </Text>
              </View>
              <View style={trackOrderRowContainerRightStyle}>
                {this.state.trackOrderInfo.payment !== undefined ? (
                  <Text allowFontScaling={FONT_SCALLING} style={trackOrderRightTextStyle}>
                    {this.state.trackOrderInfo.payment[0].TotalAmount === null
                      ? ' '
                      : numberWithCommas(
                          this.state.trackOrderInfo.payment[0].TotalAmount,
                          this.props.currency
                        )}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          <View
            style={[
              subContainer,
              {
                height: ORDER_STATUS_CONTAINER_HEIGHT,
                backgroundColor: APP_COLOR_WHITE,
                paddingStart: LEFT_RIGHT_MARGIN,
                paddingEnd: LEFT_RIGHT_MARGIN
              }
            ]}
            source={ABOUT_BACKGROUND_IMAGE}>
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                flexDirection: 'row',
                marginTop: 10
              }}>
              <Text
                allowFontScaling={FONT_SCALLING}
                style={[
                  statusTextStyle,
                  { color: this.state.componentTheme.thirdColor, marginTop: 10 }
                ]}>
                {strings.ORDER_STATUS.toUpperCase()}
              </Text>
              <Image source={this.state.componentTheme.ORDER_STATUS_IMAGE} />
            </View>
            {this.state.trackOrderInfo.StatusLabel !== undefined
              ? this.callOrderStatusBar(this.state.trackOrderInfo.StatusLabel)
              : null}

          </View>
          <ImageBackground
            style={[
              subContainer,
              {
                height: BOTTOM_CONTAINER_HEIGHT,
                backgroundColor: APP_COLOR_BLACK,
                flexDirection: 'column',
                alignItems: 'flex-start'
              }
            ]}
            source={TRACK_ORDER_BOTTOM_VIEW_IMAGE}>
            {this.state.trackOrderInfo.StatusLabel !== undefined ? (
              <View>
                <Text allowFontScaling={FONT_SCALLING} style={bottomViewTitleTextStyle}>
                  {this.state.trackOrderInfo.StatusLabel.toUpperCase()}
                </Text>
                <Text allowFontScaling={FONT_SCALLING} style={bottomViewTextStyle}>
                  {this.state.trackOrderInfo.StatusDescription}
                </Text>
              </View>
            ) : null}
          </ImageBackground>
        </View>
      </ScrollView>
    );
  }
}
const styles = {
  noOrderStyle: {
    fontSize: 50,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_BLACK,
    alignSelf: 'center',
    textAlign: 'center'
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
    flexDirection: 'column',
    alignItems: 'center',
    paddingStart: LEFT_RIGHT_MARGIN,
    width: '100%'
  },
  statusTextStyle: {
    fontSize: TITLE_FONT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    marginEnd: 10,
    color: APP_COLOR_RED
  },
  orderStatusTextStyle: {
    fontSize: ORDER_STATUS_SMALL_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_RED
  },
  aboutDescriptionTextStyle: {
    fontSize: DESCRIPTION_FONT_SIZE,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    color: APP_COLOR_WHITE,
    textAlign: 'center'
  },
  bottomViewTitleTextStyle: {
    fontSize: BOTTOM_VIEW_TITLE_FONT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_WHITE,
    marginTop: 20
  },
  bottomViewTextStyle: {
    marginTop: 20,
    fontSize: BOTTOM_VIEW_FONT_SIZE,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    color: APP_COLOR_WHITE,
    width: 300
  },
  aboutDescriptionUnderlinedTextStyle: {
    fontSize: DESCRIPTION_FONT_SIZE,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    color: APP_COLOR_WHITE,
    textAlign: 'center',
    textDecorationLine: 'underline'
  },
  aboutIconStyle: {
    height: ABOUT_ICON_SIZE,
    width: ABOUT_ICON_SIZE,
    marginStart: 10
  },
  trackOrderRowContainer: {
    marginTop: 10,
    flexDirection: 'row'
  },
  trackOrderRowContainerLeftStyle: {
    flex: 1
  },
  trackOrderTextStyle: {
    color: APP_COLOR_WHITE,
    fontSize: TRACK_ORDER_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR
  },
  trackOrderRowContainerRightStyle: {
    flex: 1,
    alignItems: 'flex-end',
    paddingEnd: 40
  },
  trackOrderRightTextStyle: {
    color: APP_COLOR_BLACK,
    fontSize: TRACK_ORDER_SUBHEADING_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR
  },
  checkStatusTextStyle: {
    color: APP_COLOR_WHITE,
    fontSize: TRACK_ORDER_SMALL_TEXT_SIZE,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    marginTop: -3
  },
  progressLineViewStyle: {
    height: 4,
    backgroundColor: APP_COLOR_RED,
    flex: 1,
    marginTop: 7
  }
};

function mapStateToProps(state) {

  const { CustomerId } = getUserObject(state);
  const {
    register: { loggedinUserInfo },
    app: { loading, currency },
    deliverydetails: { trackOrders }
  } = state;

  return {
    currency,
    CustomerId,
    customerData: loggedinUserInfo,
    loadingState: loading,
    trackOrderInfo: trackOrders
  };
}

export default connect(
  mapStateToProps,
  actions
)(TrackOrder);
