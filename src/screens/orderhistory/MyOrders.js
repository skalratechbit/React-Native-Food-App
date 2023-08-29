import React, { Component } from 'react';
import { Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Button } from 'native-base';
import { APP_COLOR_WHITE, APP_COLOR_RED, APP_COLOR_BLACK } from '../../config/colors';
import strings from '../../config/strings/strings';
import { ORGANIZATION_ID } from '../../config/constants/network_constants';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { numberWithCommas } from '../../config/common_functions';
import { Actions } from 'react-native-router-flux';
import { OrderStatusBar } from './OrderStatusBar';
import { getUserObject } from '../../helpers/UserHelper';
import { findItemInMenuBy, selectModifiers } from '../../helpers/MenuHelper';
import Common from '../../components/Common';
import CommonLoader from '../../components/CommonLoader';
import { getThemeByLevel } from '../../config/common_styles/appthemes';
import TitleBar from '../../components/TitleBar';
import * as Animatable from 'react-native-animatable';
import { actions as cartActions } from '../../ducks/cart';
import { actions as squadActions } from '../../ducks/squardcorner';
import { KEY_RECOMMENDED_SHOWING } from '../../config/constants/network_api_keys';

import moment from 'moment';

import {
  RIGHT_ARROW_LARGE_WHITE,
  ARROW_BOTTOM_WHITE,
  ABOUT_BACKGROUND_IMAGE,
  ARROW_BOTTOM_RED,
  RIGHT_ARROW_LARGE_RED
} from '../../assets/images';
import {
  DINENGSCHRIFT_REGULAR,
  DINENGSCHRIFT_BOLD,
  DINENGSCHRIFT_MEDIUM,
  HELVETICANEUE_LT_STD_CN,
  ROADSTER_REGULAR
} from '../../assets/fonts';
import {
  IF_OS_IS_IOS,
  COMMON_BUTTON_RADIOUS,
  COMMON_BUTTON_TEXT_STYLE,
  FONT_SCALLING,
} from '../../config/common_styles';
import _ from 'lodash';
import { actions as homeActions } from '../../ducks/home';
import { actions as appstateActions } from '../../ducks/setappstate';
import CommonPopup from "../../components/Common/CommonPopup";

const TITLE_CONTAINER_HEIGHT = 53.5;
const TITLE_FONT_SIZE = 18;
const LEFT_RIGHT_MARGINS = 20;
const BELL_ICON_WIDTH = 19;
const BELL_ICON_HEIGHT = 26;
const ITEM_CELL_HEIGHT = 'auto'; //90;
const ITEMS_MARGIN = 0;
const DESCRIPTION_TEXT_SIZE = 14;

const MARGIN_LEFT_RIGHT = 20;
const ITEM_TITLE_TEXT_SIZE = 19;

const GO_FOR_IT_BUTTON_WIDTH = 153;
const GO_FOR_IT_BUTTON_HEIGHT = 32;
const GO_FOR_IT_BUTTON_TEXT_SIZE = 17.5;

const DETAIL_CONTAINER_HEIGHT = 201.5;
const TOTAL_CONTAINER_HEIGHT = 142;
const TO_OPEN = 'to open';

const TRACK_ORDER_TEXT_SIZE = 16;
const TRACK_ORDER_SUBHEADING_TEXT_SIZE = 14;
const ORDER_STATUS_CONTAINER_HEIGHT = 156.5;
const LEFT_RIGHT_MARGIN = 20;
const TOTAL_FETCHED_ORDERS = 5;
const textScaling = {
  allowFontScaling: FONT_SCALLING
};

class MyOrders extends Component {

  cancellationCounter = null;

  state = {
    selectedOrder: {},
    componentTheme: getThemeByLevel(this.props.LevelName),
    masterCounter: 0,
    showAddedConfirmation: false,
    showOrderStatus: false,
    orderStatus: '',
    showLoginWarning: false
  };

  componentWillMount() {
    this.clearMasterCounterTicker();
  }

  componentDidMount() {
    if (this.props.customerId) {
      this.props.fetchUserOrdersCount({ offset: 0, limit: TOTAL_FETCHED_ORDERS });
      this.props.userDetails(this.props.customerId);
    } else {
      this.setState({ showLoginWarning: true });
    }
  }

  componentDidUpdate() {
    //keep counter going or start it if needed
    let doCounter = false;
    this.props.historyData.map((order, index) => {
      const currentTime = moment();
      const cancelTimeLimit = moment(order.AssignmentDate).add(60, 'seconds');
      const runTimer = currentTime < cancelTimeLimit;
      if (runTimer) doCounter = runTimer;
    });
    //tick the master counter to count down the cancellation times
    this.clearMasterCounterTicker();
    if (doCounter) this.cancellationCounter = setTimeout(this.incrementMasterCounter, 1e3);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.historyData !== undefined && nextProps.historyData.length) {
      this.setState({ loading: false }, () => {
        this.props.setLoadingState(false);
      });
    }

    const { timestamp, status } = nextProps.cancelOrderData;
    const { timestamp: prevTimestamp } = this.props.cancelOrderData;
    console.log('timestamp > prevTimestamp', timestamp > prevTimestamp, timestamp, prevTimestamp);
    if (timestamp > prevTimestamp) {
      this.setState({
        showOrderStatus: true,
        orderStatus: status.message
      });
    }
  }

  incrementMasterCounter = () => {
    const { masterCounter } = this.state;
    this.setState({
      masterCounter: masterCounter + 1
    }, () => {
      // console.log('masterCounter', masterCounter);
    });
  }

  clearMasterCounterTicker() {
    if (this.cancellationCounter) {
      clearInterval(this.cancellationCounter);
      this.cancellationCounter = null;
    }
  }

  formatDateTime = (datetime, scheduled) => {
    if (datetime !== undefined) {
      var now = moment(datetime).format('DD/MM/YYYY');

      var now1 = moment(datetime).format('hh:mm A');

      if (scheduled) {
        return now1 + '  ' + now;
      } else {
        return now1;
      }
    }
    return ' ';
  };

  formatTime = datetime => {
    if (datetime !== undefined) {
      var now1 = moment(datetime).format('hh:mm A');

      return now1;
    }
    return ' ';
  };

  callOrderStatusBar = (status, StatusId) => {
    if (StatusId === '10') {
      return <OrderStatusBar orderStatus={1} appTheme={this.state.componentTheme} />;
    } else if (StatusId === '1') {
      return <OrderStatusBar orderStatus={2} appTheme={this.state.componentTheme} />;
    } else if (StatusId === '2') {
      return <OrderStatusBar orderStatus={3} appTheme={this.state.componentTheme} />;
    } else if (StatusId === '3') {
      return <OrderStatusBar orderStatus={4} appTheme={this.state.componentTheme} />;
    }
  };

  onPress = (event, caption, index, item) => {
    switch (caption) {
      case strings.CANCEL_ORDER:
        let formdata = new FormData();
        const { ACCESS_TOKEN } = this.props;
        formdata.append('token', ACCESS_TOKEN);
        formdata.append('organization_id', ORGANIZATION_ID);
        formdata.append('OrderId', item.OrderId);
        formdata.append('CustomerId', this.props.customerId);
        this.props.cancelOrder(formdata);
        break;

      case strings.MY_ORDERS:
        Actions.pop();
        break;

      case TO_OPEN:
        const { selectedOrder } = this.state;
        const { historyData } = this.props;
        const focusedOrder = historyData[index];
        let newSelectedOrder = {};
        if (focusedOrder) {
          const deselect = selectedOrder.OrderId == focusedOrder.OrderId;
          newSelectedOrder = deselect ? {} : historyData[index];
        }
        this.setState({ selectedOrder: _.cloneDeep(newSelectedOrder) });
        break;

      default:
    }
  };

  total = array => {
    let result = 0;
    if(array !== null && array !== undefined && array.length > 0){
      for (let i = 0; i < array.length; i++) {
        result += parseInt(array[i].PaymentAmount);
      }
    }
    return result;
  };

  showAddedToCartConfirmation() {
    this.setState({
      showAddedConfirmation: true
    });
  }

  handleLoadMore = () => {
    const { historyData } = this.props;
    const ordersLength = historyData.length;
    this.setState({
      loading: true
    });
    this.props.setLoadingState(true);
    this.props.fetchUserOrdersCount({ offset: ordersLength, limit: TOTAL_FETCHED_ORDERS, append: true });
  }

  handleOrderAgain = (order) => {
    const { cartItemsArray, allMenu } = this.props;
    const { Items } = order;
    if (Items && Items.length) {
      Items.map(item => {
        const fullItem = findItemInMenuBy('ID', item.ItemId.toString(), allMenu) || item;
        if (item.MenuType !== 3) {
          if (fullItem.Modifiers && item.Modifiers)
            fullItem.Modifiers = selectModifiers(fullItem.Modifiers, item.Modifiers);
          fullItem.quantity = parseInt(item.Quantity);
          fullItem.Price = parseInt(item.UnitPrice);
          cartItemsArray.push(fullItem);
        }
      });
      this.props.additmeToCart(cartItemsArray);
      this.showAddedToCartConfirmation();
    } else {
      this.setState({
        showOrderStatus: true,
        orderStatus: 'Uh Oh! There are no items in this order.'
      });
    }
  }

  backButtonPress = () => {
    Actions.pop();
    return true;
  }

  handleHideAddedConfirmation = () => {
    this.setState({
      showAddedConfirmation: false
    });
  }

  handleGoToCart = () => {
    const { cartItemsArray } = this.props;
    if (cartItemsArray.length)
      AsyncStorage.getItem(KEY_RECOMMENDED_SHOWING).then(data => {
        Actions.yourcart({
          hideRecommended: Boolean(JSON.parse(data))
        });
      });
    else {
      this.handleHideAddedConfirmation();
      this.setState({
        showOrderStatus: true,
        orderStatus: 'Uh Oh! No items in cart.'
      });
    }
  }

  handleHideOrderStatus = () => {
    this.setState({
      showOrderStatus: false,
      orderStatus: ''
    }, () => {
      Actions.drawer({ type: 'reset' });
    });
  }

  renderModifierPrice = (modifier, i) => {
    const { thirdColor, STAR_RED_IMAGE } = this.state;
    modifier.details.items.map(data => {
      const { ModifierDetails_en, Quantity, Price } = data;
      const ModifierLabel = String(ModifierDetails_en).trim().toUpperCase();
      const ModifierPrice = (parseInt(Price) * (Quantity || 1));
      const modifierTextStyle = [styles.modifierText];
      const modifierTextRightStyle = modifierTextStyle.concat([styles.modifierTextRight]);
      return (
        <View style={{ width: '100%', backgroundColor: '#fff', height: '10%' }} />
      );
    });

  }

  renderModifiers(item) {
    const { allMenu } = this.props;
    let Modifiers = [];
    const fullItem = findItemInMenuBy('ID', item.ItemId.toString(), allMenu) || item;
    if (fullItem.Modifiers && item.Modifiers)
      fullItem.Modifiers = selectModifiers(fullItem.Modifiers, item.Modifiers);
    Modifiers = fullItem.Modifiers || []
    console.log('renderModifiers', Modifiers);
  }

  renderListItemHistory(item, rowID) {
    const { selectedOrder } = this.state;
    const { banners } = this.props;
    const isOpen = selectedOrder.OrderId == item.OrderId;
    if (isOpen) item.opened = isOpen;

    return (
      <View style={styles.listItemContainer} key={rowID}>
        <TouchableOpacity
          onPress={event => this.onPress(event, TO_OPEN, rowID)}
          style={styles.orderRowStyle}>
          <View>
            <Text allowFontScaling={FONT_SCALLING} style={[styles.listItemTitleTextStyle, { width: '80%' }]}>
              {item.FullOrderDate ? item.FullOrderDate.toUpperCase() : 'Unspecified'}
            </Text>
            <Text allowFontScaling={FONT_SCALLING} style={styles.descriptionTextStyle}>
              {item.OrderType.toUpperCase()}
            </Text>
            {isOpen ? (
              <Image style={[styles.arrowDownImageStyle]} source={ARROW_BOTTOM_WHITE} />
            ) : (
                <Image style={styles.arrowImageStyle} source={RIGHT_ARROW_LARGE_WHITE} />
              )}
          </View>
        </TouchableOpacity>
        {isOpen && (
          <Animatable.View
            animation={isOpen ? 'fadeInUp' : 'fadeOutDown'}
            duration={600}
            easing="ease-out-expo"
            style={{
              width: '100%',
              opacity: 0.0,
              top: isOpen ? null : 80,
              position: isOpen ? 'relative' : 'absolute'
            }}>
            {item.Items !== undefined && item.Items !== null
              ? item.Items.map((data, i) => (
                <View key={i} style={[styles.orderDetailContainer, { paddingTop: data.MenuType === 3 ? 0 : 15, paddingBottom: data.MenuType === 3 ? 5 : 15 }]}>
                  {data.MenuType !== 3 && <View style={styles.detailRowStyle}>
                    <View style={{ width: '60%' }}>
                      <Text allowFontScaling={FONT_SCALLING} style={[styles.DetailsTextStyle, { fontWeight: 'bold' }]}>
                        {data.ItemName !== null
                          ? data.ItemName.toUpperCase() + ':'
                          : 'undefined' + ':'}
                      </Text>
                    </View>
                    <View style={{ width: '40%', alignItems: 'flex-end' }}>
                      <Text allowFontScaling={FONT_SCALLING} style={[styles.DetailsTextStyle, { color: APP_COLOR_RED, fontWeight: 'bold' }]}>
                        {data.GrossPrice !== null
                          ? numberWithCommas(String(data.GrossPrice).toUpperCase(), this.props.currency)
                          : 'undefined'}
                      </Text>
                    </View>
                  </View>}
                  {data.MenuType === 3 && <View style={[styles.detailRowStyle]}>
                    <View style={{ width: '60%' }}>
                      <Text style={[styles.DetailsTextStyle, { fontWeight: '500', fontSize: 12 }]}>
                        {data.ItemName !== null
                          ? data.ItemName.toUpperCase() + ':'
                          : 'undefined' + ':'}
                      </Text>
                    </View>
                    <View style={{ width: '40%', alignItems: 'flex-end' }}>
                      <Text style={[styles.DetailsTextStyle, { color: APP_COLOR_RED, fontWeight: '500', fontSize: 12 }]}>
                        {data.GrossPrice !== null
                          ? numberWithCommas(String(data.GrossPrice).toUpperCase(), this.props.currency)
                          : 'undefined'}
                      </Text>
                    </View>
                  </View>}
                </View>
              ))
              : null}
            {item.Items !== undefined && item.Items !== null ? (
              <View
                style={[
                  styles.innerViewStyle,
                  {
                    paddingBottom: 10,
                    paddingTop: 10,
                    backgroundColor: APP_COLOR_WHITE,
                    flexDirection: 'column',
                    borderBottomWidth: 1
                  }
                ]}>
                <View style={styles.trackOrderRowContainer}>
                  <View style={styles.trackOrderRowContainerLeftStyle}>
                    <Text
                      allowFontScaling={FONT_SCALLING}
                      style={[
                        styles.trackOrderTextStyle,
                        { fontSize: TRACK_ORDER_SUBHEADING_TEXT_SIZE }
                      ]}>
                      {strings.TIME_ORDERED.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.trackOrderRowContainerRightStyle}>

                    <Text allowFontScaling={FONT_SCALLING} style={styles.trackOrderRightTextStyle}>
                      {this.formatTime(item.AssignmentDate)}
                    </Text>
                  </View>
                </View>
                <View style={styles.trackOrderRowContainer}>
                  <View style={styles.trackOrderRowContainerLeftStyle}>
                    <Text
                      allowFontScaling={FONT_SCALLING}
                      style={[
                        styles.trackOrderTextStyle,
                        { fontSize: TRACK_ORDER_SUBHEADING_TEXT_SIZE }
                      ]}>
                      {item.ScheduleTime === '0000-00-00 00:00:00' ? strings.DELIVERY.toUpperCase() : strings.SCHEDULED.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.trackOrderRowContainerRightStyle}>
                    <Text allowFontScaling={FONT_SCALLING} style={[styles.trackOrderRightTextStyle, { textAlign: 'right' }]}>
                      {item.ScheduleTime !== '0000-00-00 00:00:00'
                        ? item.ScheduleTime !== undefined
                          ? // 'in ' + this.calculateDuration( this.state.trackOrderInfo.ScheduleTime ) + ' Minutes'
                          this.formatDateTime(item.ScheduleTime, true)
                          : null
                        : item.DeliveryTime !== undefined
                          ? // 'in ' + this.calculateDuration( this.state.trackOrderInfo.DeliveryTime ) + ' Minutes'
                          this.formatDateTime(item.DeliveryTime !== '0000-00-00 00:00:00' ? item.DeliveryTime : item.AssignmentDate, true)
                          : null}
                    </Text>
                  </View>
                </View>
                <View style={styles.trackOrderRowContainer}>
                  <View style={styles.trackOrderRowContainerLeftStyle}>
                    <Text
                      allowFontScaling={FONT_SCALLING}
                      style={[
                        styles.trackOrderTextStyle,
                        { fontSize: TRACK_ORDER_SUBHEADING_TEXT_SIZE }
                      ]}>
                      {strings.ADDRESS.toUpperCase()}{':'}
                    </Text>
                  </View>
                  <View style={styles.trackOrderRowContainerRightStyle}>
                    {item.AddressTypeLabel !== undefined ? (
                      <Text
                        allowFontScaling={FONT_SCALLING}
                        style={styles.trackOrderRightTextStyle}>
                        {item.AddressTypeLabel}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <View style={styles.trackOrderRowContainer}>
                  <View style={styles.trackOrderRowContainerLeftStyle}>
                    <Text
                      allowFontScaling={FONT_SCALLING}
                      style={[
                        styles.trackOrderTextStyle,
                        { fontSize: TRACK_ORDER_SUBHEADING_TEXT_SIZE }
                      ]}>
                      {strings.PAYMENT_METHOD.toUpperCase()}{':'}
                    </Text>
                  </View>
                  <View style={styles.trackOrderRowContainerRightStyle}>
                    {item.Payments && item.Payments !== undefined && item.Payments.length > 0
                      ? item.Payments.map((data, i) => {
                        return (
                          <Text
                            key={i}
                            allowFontScaling={FONT_SCALLING}
                            style={styles.trackOrderRightTextStyle}>
                            {data.PaymentName === null ? ' ' : data.PaymentName.toUpperCase()}
                          </Text>
                        );
                      })
                      : null}

                  </View>
                </View>
                <View style={styles.trackOrderRowContainer}>
                  {item.Promo && item.Promo.length > 0 && 
                  <View style={styles.trackOrderRowContainerLeftStyle}>
                    <Text
                      allowFontScaling={FONT_SCALLING}
                      style={[
                        styles.trackOrderTextStyle,
                        { fontSize: TRACK_ORDER_SUBHEADING_TEXT_SIZE }
                      ]}>
                      {strings.VOUCHERS_PROMOS_USED.toUpperCase()}
                    </Text>
                  </View>}
                  <View style={styles.trackOrderRowContainerRightStyle}>
                    {item.Promo && item.Promo.length > 0
                      && item.Promo.map((data, i) => {
                        return (
                          <Text
                            key={i}
                            allowFontScaling={FONT_SCALLING}
                            style={[styles.trackOrderRightTextStyle, { textAlign: 'right' }]}>
                            {data.Title}
                          </Text>
                        );
                      })
                    }
                  </View>
                </View>
                <View style={{ width: '100%', height: 1 }} />
              </View>
            ) : null}
            {item.Items !== undefined && item.Items !== null ? (
              <View
                style={[
                  styles.innerViewStyle,
                  {
                    backgroundColor: APP_COLOR_WHITE,
                    flexDirection: 'column'
                  }
                ]}>
                <View style={styles.detailRowStyle}>
                  <View style={{ width: '60%' }}>
                    <Text
                      allowFontScaling={FONT_SCALLING}
                      style={[
                        styles.totalAmountTextStyle,
                        // { color: this.state.componentTheme.thirdColor }
                      ]}>
                      {strings.TOTAL_AMOUNT.toUpperCase() + ':'}
                    </Text>
                  </View>
                  <View style={{ width: '40%', alignItems: 'flex-end' }}>
                    <Text
                      allowFontScaling={FONT_SCALLING}
                      style={[
                        styles.totalAmountTextStyle,
                        { fontWeight: '500' }
                        // { color: this.state.componentTheme.thirdColor }
                      ]}>
                      {
                        numberWithCommas(this.total(item.Payments), this.props.currency)
                      }
                      {/* { "70,000" + " " + strings.LBP } */}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailRowStyle}>
                  <View style={{ width: '50%' }}>
                    <Text
                      allowFontScaling={FONT_SCALLING}
                      style={[
                        styles.replicateTextStyle,
                        { color: this.state.componentTheme.thirdColor }
                      ]}>
                      {strings.NET_AMOUNT.toUpperCase() + ':'}
                    </Text>
                  </View>
                  <View style={{ width: '50%', justifyContent: 'flex-end' }}>
                    <Text
                      allowFontScaling={FONT_SCALLING}
                      style={[
                        styles.replicateTextStyle,
                        { textAlign: 'right' },
                        { color: this.state.componentTheme.thirdColor }
                      ]}>
                      {numberWithCommas(item.NetAmount, this.props.currency)}
                    </Text>
                  </View>
                </View>

                {banners?.DeliveryLoyalty !== '0' &&  item?.Amounts !== '0.00' &&
                  <View style={styles.detailRowStyle}>
                    <View style={{ width: '50%' }}>
                      <Text
                        allowFontScaling={FONT_SCALLING}
                        style={[
                          styles.replicateTextStyle,
                          { color: this.state.componentTheme.thirdColor }
                        ]}>
                        {strings.AMOUNT_EARNED.toUpperCase() + ':'}
                      </Text>
                    </View>
                    <View style={{ width: '50%', justifyContent: 'flex-end' }}>
                      <Text
                        allowFontScaling={FONT_SCALLING}
                        style={[
                          styles.replicateTextStyle,
                          { textAlign: 'right' },
                          { color: this.state.componentTheme.thirdColor }
                        ]}>
                        {numberWithCommas(item.Amounts, this.props.currency)}
                      </Text>
                    </View>
                  </View>
                }

                {banners?.DeliveryLoyalty !== '0' &&  item?.Stars !== '0' &&
                  <View style={styles.detailRowStyle}>
                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <Text
                          allowFontScaling={FONT_SCALLING}
                          style={[
                            styles.totalStarsTextStyle,
                            { color: this.state.componentTheme.thirdColor }
                          ]}>
                          {item.Stars + ' ' + strings.STARS}
                        </Text>
                        <Image
                          style={[styles.starImageStyle]}
                          source={this.state.componentTheme.STAR_RED_IMAGE}
                        />
                      </View>
                    </View>
                  </View>
                }

                <View style={[styles.detailRowStyle, { height: 35, marginTop: 15 }]}>
                  <View style={{ width: '50%', justifyContent: 'center' }}>
                    <Text allowFontScaling={FONT_SCALLING}
                      style={[styles.replicateTextStyle, { color: this.state.componentTheme.thirdColor }]}>
                      {strings.REPLICATE_ORDER.toUpperCase() + ":"}
                    </Text>
                  </View>
                  <View style={{ width: '50%' }}>

                    <Button onPress={() => this.handleOrderAgain(item)}
                      style={[styles.goForItButtonStyle]}>
                      <Text allowFontScaling={FONT_SCALLING}
                        style={[COMMON_BUTTON_TEXT_STYLE, { fontFamily: ROADSTER_REGULAR, fontSize: GO_FOR_IT_BUTTON_TEXT_SIZE }]}>
                        {strings.GO_FOR_IT.toUpperCase()}
                      </Text>
                    </Button>
                  </View>
                </View>
              </View>
            ) : null}
          </Animatable.View>
        )}
      </View>
    );
  }

  renderListItemProgress(item, rowID) {
    const { selectedOrder } = this.state;
    const { banners } = this.props;
    const isOpen = selectedOrder.OrderId == item.OrderId;
    const currentTime = moment();
    const cancelTimeLimit = moment(item.AssignmentDate).add(59, 'seconds');
    const showCancelButton = currentTime < cancelTimeLimit;
    const cancellationTime = Math.round((cancelTimeLimit - currentTime) / 1e3);

    // flag item as being openned previously
    if (isOpen) item.opened = isOpen;

    return (
      <View style={styles.listItemContainer} key={rowID}>
        <TouchableOpacity
          onPress={event => this.onPress(event, TO_OPEN, rowID)}
          style={[styles.orderRowStyle, { backgroundColor: APP_COLOR_BLACK }]}>
          <View>
            <Text allowFontScaling={FONT_SCALLING} style={[styles.listItemProgressTitleTextStyle, { width: cancellationTime > 0 ? '40%' : '85%' }]}>
              {item.FullOrderDate ? item.FullOrderDate.toUpperCase() : 'Unspecified'}
            </Text>
            <Text allowFontScaling={FONT_SCALLING} style={[styles.descriptionTextStyle, { color: APP_COLOR_RED }]}>
              {item.StatusDescription && `${item.StatusDescription}...`}
            </Text>

            {showCancelButton && (
              <Button
                onPress={event => this.onPress(event, strings.CANCEL_ORDER, null, item)}
                style={[
                  styles.cancelButtonStyle,
                  { backgroundColor: this.state.componentTheme.thirdColor },
                  cancellationTime < 0 && { height: 32 }
                ]}>
                <Text
                  allowFontScaling={FONT_SCALLING}
                  style={styles.cancelButtonText}>
                  {strings.CANCEL_ORDER.toUpperCase()}
                </Text>
                { cancellationTime > 0 ? <Text style={styles.cancelTime}>{cancellationTime}s</Text> : null}
              </Button>
            )}
            {isOpen ? (
              <Image style={[styles.arrowDownImageProgressStyle]} source={ARROW_BOTTOM_RED} />
            ) : (
                <Image style={styles.arrowImageProgressStyle} source={RIGHT_ARROW_LARGE_RED} />
              )}
          </View>
        </TouchableOpacity>
        {isOpen && (
          <Animatable.View
            animation={isOpen ? 'fadeInUp' : 'fadeOutDown'}
            duration={600}
            easing="ease-out-expo"
            style={{
              width: '100%',
              opacity: 0.0,
              top: isOpen ? null : 80,
              position: isOpen ? 'relative' : 'absolute'
            }}>
            {item.Items !== undefined && item.Items !== null && item.Items.length > 0 
              ? item.Items.map((data, i) => (
                <View key={i} style={[styles.orderDetailContainer, { paddingTop: data.MenuType === 3 ? 0 : 15, paddingBottom: data.MenuType === 3 ? 5 : 15 }]}>
                  {data.MenuType !== 3 && <View style={styles.detailRowStyle}>
                    <View style={{ width: '60%' }}>
                      <Text allowFontScaling={FONT_SCALLING} style={[styles.DetailsTextStyle, { fontWeight: 'bold' }]}>
                        {data.ItemName !== null
                          ? data.ItemName.toUpperCase() + ':'
                          : 'undefined' + ':'}
                      </Text>
                    </View>
                    <View style={{ width: '40%', alignItems: 'flex-end' }}>
                      <Text allowFontScaling={FONT_SCALLING} style={[styles.DetailsTextStyle, { color: APP_COLOR_RED, fontWeight: 'bold' }]}>
                        {data.GrossPrice !== null
                          ? numberWithCommas(String(data.GrossPrice).toUpperCase(), this.props.currency)
                          : 'undefined'}
                      </Text>
                    </View>
                  </View>}
                  {data.MenuType === 3 && <View style={[styles.detailRowStyle]}>
                    <View style={{ width: '60%' }}>
                      <Text style={[styles.DetailsTextStyle, { fontWeight: '500', fontSize: 12 }]}>
                        {data.ItemName !== null
                          ? data.ItemName.toUpperCase() + ':'
                          : 'undefined' + ':'}
                      </Text>
                    </View>
                    <View style={{ width: '40%', alignItems: 'flex-end' }}>
                      <Text style={[styles.DetailsTextStyle, { color: APP_COLOR_RED, fontWeight: '500', fontSize: 12 }]}>
                        {data.GrossPrice !== null
                          ? numberWithCommas(String(data.GrossPrice).toUpperCase(), this.props.currency)
                          : 'undefined'}
                      </Text>
                    </View>
                  </View>}
                </View>
              ))
              : null}
            {item.Items !== undefined && item.Items !== null && item.Status !== 'settled' ? (
              <View
                style={[
                  styles.subContainer,
                  {
                    height: 80,
                    backgroundColor: APP_COLOR_WHITE,
                    paddingStart: LEFT_RIGHT_MARGIN,
                    paddingEnd: LEFT_RIGHT_MARGIN,
                    borderBottomWidth: 1,
                    flexDirection: 'column'
                  }
                ]}
                source={ABOUT_BACKGROUND_IMAGE}>
                {item.Status !== undefined
                  ? this.callOrderStatusBar(item.StatusLabel, item.StatusId)
                  : null}

              </View>
            ) : null}
            {item.Items !== undefined && item.Items !== null ? (
              <View
                style={[
                  styles.innerViewStyle,
                  {
                    paddingBottom: 10,
                    paddingTop: 10,
                    backgroundColor: APP_COLOR_WHITE,
                    flexDirection: 'column',
                    borderBottomWidth: 1
                  }
                ]}>
                <View style={styles.trackOrderRowContainer}>
                  <View style={styles.trackOrderRowContainerLeftStyle}>
                    <Text
                      allowFontScaling={FONT_SCALLING}
                      style={[
                        styles.trackOrderTextStyle,
                        { fontSize: TRACK_ORDER_SUBHEADING_TEXT_SIZE }
                      ]}>
                      {strings.TIME_ORDERED.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.trackOrderRowContainerRightStyle}>
                    <Text allowFontScaling={FONT_SCALLING} style={styles.trackOrderRightTextStyle}>
                      {this.formatTime(item.AssignmentDate)}
                    </Text>
                  </View>
                </View>
                <View style={styles.trackOrderRowContainer}>
                  <View style={styles.trackOrderRowContainerLeftStyle}>
                    <Text
                      allowFontScaling={FONT_SCALLING}
                      style={[
                        styles.trackOrderTextStyle,
                        { fontSize: TRACK_ORDER_SUBHEADING_TEXT_SIZE }
                      ]}>
                      {item.ScheduleTime === '0000-00-00 00:00:00' ? strings.DELIVERY.toUpperCase() : strings.SCHEDULED.toUpperCase()}
                    </Text>
                  </View>
                  <View style={[styles.trackOrderRowContainerRightStyle]}>
                    <Text allowFontScaling={FONT_SCALLING} style={[styles.trackOrderRightTextStyle]}>
                      {item.ScheduleTime !== '0000-00-00 00:00:00'
                        ? item.ScheduleTime !== undefined
                          ? // 'in ' + this.calculateDuration( this.state.trackOrderInfo.ScheduleTime ) + ' Minutes'
                          this.formatDateTime(item.ScheduleTime, true)
                          : null
                        : item.DeliveryTime !== undefined
                          ? // 'in ' + this.calculateDuration( this.state.trackOrderInfo.DeliveryTime ) + ' Minutes'
                          this.formatDateTime(item.DeliveryTime !== '0000-00-00 00:00:00' ? item.DeliveryTime : item.AssignmentDate, true)
                          : null}
                    </Text>
                  </View>
                </View>
                <View style={styles.trackOrderRowContainer}>
                  <View style={styles.trackOrderRowContainerLeftStyle}>
                    <Text
                      allowFontScaling={FONT_SCALLING}
                      style={[
                        styles.trackOrderTextStyle,
                        { fontSize: TRACK_ORDER_SUBHEADING_TEXT_SIZE }
                      ]}>
                      {strings.ADDRESS.toUpperCase()}{':'}
                    </Text>
                  </View>
                  <View style={styles.trackOrderRowContainerRightStyle}>
                    {item.AddressTypeLabel !== undefined ? (
                      <Text
                        allowFontScaling={FONT_SCALLING}
                        style={styles.trackOrderRightTextStyle}>
                        {item.AddressTypeLabel}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <View style={styles.trackOrderRowContainer}>
                  <View style={styles.trackOrderRowContainerLeftStyle}>
                    <Text
                      allowFontScaling={FONT_SCALLING}
                      style={[
                        styles.trackOrderTextStyle,
                        { fontSize: TRACK_ORDER_SUBHEADING_TEXT_SIZE }
                      ]}>
                      {strings.PAYMENT_METHOD.toUpperCase()}{':'}
                    </Text>
                  </View>
                  <View style={styles.trackOrderRowContainerRightStyle}>
                    {item.Payments && item.Payments !== null && item.Payments !== undefined && item.Payments.length > 0
                      ? item.Payments.map((data, i) => {
                        return (
                          <Text
                            key={i}
                            allowFontScaling={FONT_SCALLING}
                            style={styles.trackOrderRightTextStyle}>
                            {data.PaymentName === null ? ' ' : data.PaymentName.toUpperCase()}
                          </Text>
                        );
                      })
                      : null}

                  </View>
                </View>
                <View style={styles.trackOrderRowContainer}>
                  {item.Promo && item.Promo.length > 0 && 
                  <View style={[styles.trackOrderRowContainerLeftStyle]}>
                    <Text
                      allowFontScaling={FONT_SCALLING}
                      style={[
                        styles.trackOrderTextStyle,
                        { fontSize: TRACK_ORDER_SUBHEADING_TEXT_SIZE }
                      ]}>
                      {strings.VOUCHERS_PROMOS_USED.toUpperCase()}
                    </Text>
                  </View>}
                  <View style={styles.trackOrderRowContainerRightStyle}>
                    {item.Promo && item.Promo.length > 0
                      ? item.Promo.map((data, i) => {
                        return (
                          <Text
                            key={i}
                            allowFontScaling={FONT_SCALLING}
                            style={[styles.trackOrderRightTextStyle, { textAlign: 'right' }]}>
                            {data.Title}
                          </Text>
                        );
                      })
                      : null}
                  </View>
                </View>
              </View>
            ) : null}
            {item.Items !== undefined && item.Items !== null ? (
              <View
                style={[
                  styles.innerViewStyle,
                  {
                    // height: TOTAL_CONTAINER_HEIGHT,
                    backgroundColor: APP_COLOR_WHITE,
                    flexDirection: 'column'
                  }
                ]}>
                <View style={styles.detailRowStyle}>
                  <View style={{ width: '60%' }}>
                    <Text
                      allowFontScaling={FONT_SCALLING}
                      style={[
                        styles.totalAmountTextStyle,
                        // { color: this.state.componentTheme.thirdColor }
                      ]}>
                      {strings.TOTAL_AMOUNT.toUpperCase() + ':'}
                    </Text>
                  </View>
                  <View style={{ width: '40%', alignItems: 'flex-end' }}>
                    <Text
                      allowFontScaling={FONT_SCALLING}
                      style={[
                        styles.totalAmountTextStyle,
                        { fontWeight: '500' }
                        // { color: this.state.componentTheme.thirdColor }
                      ]}>
                      {
                        numberWithCommas(this.total(item.Payments), this.props.currency)
                      }
                      {/* { "70,000" + " " + strings.LBP } */}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailRowStyle}>
                  <View style={{ width: '50%' }}>
                    <Text
                      allowFontScaling={FONT_SCALLING}
                      style={[
                        styles.replicateTextStyle,
                        { color: this.state.componentTheme.thirdColor }
                      ]}>
                      {strings.NET_AMOUNT.toUpperCase() + ':'}
                    </Text>
                  </View>
                  <View style={{ width: '50%', justifyContent: 'flex-end' }}>
                    <Text
                      allowFontScaling={FONT_SCALLING}
                      style={[
                        styles.replicateTextStyle,
                        { textAlign: 'right' },
                        { color: this.state.componentTheme.thirdColor }
                      ]}>
                      {numberWithCommas(item.NetAmount, this.props.currency)}
                    </Text>
                  </View>
                </View>

                {banners?.DeliveryLoyalty !== '0' && item?.Amounts !== '0.00' &&
                  <View style={styles.detailRowStyle}>
                    <View style={{ width: '50%' }}>
                      <Text
                        allowFontScaling={FONT_SCALLING}
                        style={[
                          styles.replicateTextStyle,
                          { color: this.state.componentTheme.thirdColor }
                        ]}>
                        {strings.AMOUNT_EARNED.toUpperCase() + ':'}
                      </Text>
                    </View>
                    <View style={{ width: '50%', justifyContent: 'flex-end' }}>
                      <Text
                        allowFontScaling={FONT_SCALLING}
                        style={[
                          styles.replicateTextStyle,
                          { textAlign: 'right' },
                          { color: this.state.componentTheme.thirdColor }
                        ]}>
                        {numberWithCommas(item.Amounts, this.props.currency)}
                      </Text>
                    </View>
                  </View>
                }

                {banners?.DeliveryLoyalty !== '0' && item?.Stars !== '0' &&
                  <View style={styles.detailRowStyle}>
                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <Text
                          allowFontScaling={FONT_SCALLING}
                          style={[
                            styles.totalStarsTextStyle,
                            { color: this.state.componentTheme.thirdColor }
                          ]}>
                          {item.Stars + ' ' + strings.STARS}
                        </Text>
                        <Image
                          style={[styles.starImageStyle]}
                          source={this.state.componentTheme.STAR_RED_IMAGE}
                        />
                      </View>
                    </View>
                  </View>
                }

                {item.Status === 'settled' && <View style={[styles.detailRowStyle, { height: 35, marginTop: 15 }]}>
                  <View style={{ width: '50%', justifyContent: 'center' }}>
                    <Text allowFontScaling={FONT_SCALLING}
                      style={[styles.replicateTextStyle, { color: this.state.componentTheme.thirdColor }]}>
                      {strings.REPLICATE_ORDER.toUpperCase() + ":"}
                    </Text>
                  </View>
                  <View style={{ width: '50%' }}>

                    <Button onPress={() => this.handleOrderAgain(item)}
                      style={[styles.goForItButtonStyle]}>
                      <Text allowFontScaling={FONT_SCALLING}
                        style={[COMMON_BUTTON_TEXT_STYLE, { fontFamily: ROADSTER_REGULAR, fontSize: GO_FOR_IT_BUTTON_TEXT_SIZE }]}>
                        {strings.GO_FOR_IT.toUpperCase()}
                      </Text>
                    </Button>
                  </View>
                </View>}
              </View>
            ) : null}
          </Animatable.View>
        )}
      </View>
    );
  }

  renderOrderRow = (item, index) => {
    const fromHistory = item.StatusCode == 4;
    return this[fromHistory ? 'renderListItemHistory' : 'renderListItemProgress'](item, index);
  };

  renderLoadMoreButton() {
    const { totalOrders, historyData } = this.props;
    const { loading } = this.state;
    const ordersLength = historyData.length;
    const shouldRender = totalOrders > ordersLength;
    return shouldRender ? (
      <View style={styles.loadMoreContainer}>
        <TouchableOpacity style={styles.loadMoreButton} onPress={this.handleLoadMore}>
          <Text style={styles.loadMoreText}>{loading ? 'LOADING...' : 'LOAD MORE'}</Text>
        </TouchableOpacity>
      </View>
    ) : null;
  }

  renderNoOrders() {
    const noOrders = this.props.historyData.length == 0;
    return noOrders && !this.props.loading ? (
      <View style={styles.noOrders}>
        <Text style={styles.noOrdersText}>{strings.NO_ORDERS.toUpperCase()}</Text>
      </View>
    ) : null;
  }

  renderAddedConfirmation() {
    const {
      componentTheme: { thirdColor },
      showAddedConfirmation
    } = this.state;
    return (
      <View styles={styles.confirmationContainer}>
        <Common.Button onPress={this.handleGoToCart}
          color={thirdColor}
          style={[styles.bigButton, styles.shortButton]}>
          <Common.Text style={styles.bigButtonText}>
            {strings.GO_TO_CART}
          </Common.Text>
        </Common.Button>
      </View>
    );
  }
  handleCloseLoginWarning = () => {
    this.setState({
      showLoginWarning: false
    }, () => Actions.pop());
  }

  render() {
    const {
      container,
      listContainer,
    } = styles;

    const {
      showLoginWarning,
      componentTheme: { thirdColor, IC_MYORDERS_RED, ARROW_LEFT_RED },
      showAddedConfirmation,
      showOrderStatus,
      orderStatus
    } = this.state;
    const { title } = this.props
    return (
      <View style={[container, { backgroundColor: thirdColor }]}>
        <CommonLoader />
        <CommonPopup
          onClose={this.handleCloseLoginWarning}
          color={thirdColor}
          visibilty={showLoginWarning}
          heading={'UH-OH'}
          subbody={"YOU NEED TO BE LOGGED IN\n TO VIEW NOTIFICATIONS."}
        />
        <Common.Popup
          onClose={this.handleHideAddedConfirmation}
          color={thirdColor}
          visibilty={showAddedConfirmation}
          heading={strings.ITEMS_ADDED_TO_CART}
          customBody={this.renderAddedConfirmation()}
        />
        <Common.Popup
          onClose={this.handleHideOrderStatus}
          color={thirdColor}
          visibilty={showOrderStatus}
          heading={orderStatus}
        // customBody
        />
        <TitleBar
          onPress={this.backButtonPress}
          color={thirdColor}
          backIcon={ARROW_LEFT_RED}
          titleText={title || strings.MY_ORDERS}
        />
        <View style={[listContainer, { backgroundColor: thirdColor }]}>
          <ScrollView
            style={styles.ordersList}
            bounces={false}>
            {
              this.props.historyData.map(this.renderOrderRow)
            }
            {this.renderNoOrders()}
          </ScrollView>
        </View>
        { this.renderLoadMoreButton()}
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
  subContainer: {
    backgroundColor: APP_COLOR_WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: LEFT_RIGHT_MARGINS,
    paddingEnd: LEFT_RIGHT_MARGINS,
    width: '100%'
  },
  ordersList: {
    flex: 1,
    height: '100%'
  },
  titleBarStyle: { flexDirection: 'row', alignItems: 'center' },
  titleBarIcon: { alignSelf: 'center', marginStart: 10, width: 23, height: 34 },
  trackOrderRowContainerRightStyle: {
    flex: 1,
    alignItems: 'flex-end',
  },
  titleBarText: {
    fontSize: TITLE_FONT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_RED,
    alignSelf: 'center',
    marginTop: IF_OS_IS_IOS ? 8 : 0
  },
  noOrders: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 125,
    height: 'auto'
  },
  noOrdersText: {
    fontSize: 21,
    fontFamily: DINENGSCHRIFT_BOLD,
    color: APP_COLOR_WHITE,
  },
  trackOrderRowContainerLeftStyle: {
    flex: 1
  },
  loadMoreContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadMoreButton: {
    padding: 10,
    paddingBottom: 5,
    width: '100%',
    backgroundColor: APP_COLOR_BLACK,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadMoreText: {
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_WHITE,
    fontSize: 24
  },
  statusTextStyle: {
    fontSize: TITLE_FONT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    marginEnd: 10,
    color: APP_COLOR_RED
  },
  aboutIconStyle: {
    height: BELL_ICON_HEIGHT,
    width: BELL_ICON_WIDTH,
    marginStart: 10
  },
  trackOrderRightTextStyle: {
    color: APP_COLOR_RED,
    fontSize: TRACK_ORDER_SUBHEADING_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    fontWeight: 'bold'
  },
  listContainer: {
    flex: 1,
    backgroundColor: APP_COLOR_RED,
    width: '100%',
    height: '100%'
  },
  listItemContainer: {
    // height: ITEM_CELL_HEIGHT + DETAIL_CONTAINER_HEIGHT,
    alignItems: 'center',
    flexDirection: 'column',
    marginLeft: 0,
    paddingLeft: 0,
    paddingRight: 0,
    marginRight: 0,
    marginTop: 0,
    paddingTop: 0,
    paddingBottom: IF_OS_IS_IOS ? 0 : 0,
    justifyContent: 'flex-start',
    marginBottom: ITEMS_MARGIN,
    borderBottomWidth: 0.5,
    borderBottomColor: APP_COLOR_WHITE
  },
  orderRowStyle: {
    flex: 1,
    width: '100%',
    // height: ITEM_CELL_HEIGHT,
    // alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 15,
    paddingBottom: 10
  },
  cancelButtonStyle: {
    width: 132,
    // height: 32,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 5,
    // paddingBottom: IF_OS_IS_IOS ? 9 : 5,
    justifyContent: 'center',
    // top: IF_OS_IS_IOS ? 25 : 25,
    end: IF_OS_IS_IOS ? 50 : 50,
    position: 'absolute',
    borderRadius: COMMON_BUTTON_RADIOUS
  },
  listItemProgressContainer: {
    height: ITEM_CELL_HEIGHT,
    width: '100%'
  },
  listItemTitleTextStyle: {
    color: APP_COLOR_WHITE,
    marginStart: MARGIN_LEFT_RIGHT,
    fontSize: ITEM_TITLE_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_BOLD
  },
  listItemProgressTitleTextStyle: {
    color: APP_COLOR_WHITE,
    marginStart: MARGIN_LEFT_RIGHT,
    // marginEND: MARGIN_LEFT_RIGHT,
    fontSize: 17,
    fontFamily: DINENGSCHRIFT_REGULAR,
    fontWeight: '500'
  },
  descriptionTextStyle: {
    color: APP_COLOR_WHITE,
    fontSize: DESCRIPTION_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_MEDIUM,
    marginStart: MARGIN_LEFT_RIGHT
  },
  arrowImageStyle: {
    width: 11,
    height: 18,
    marginTop: IF_OS_IS_IOS ? 15 : 15,
    position: 'absolute',
    right: MARGIN_LEFT_RIGHT
  },
  trackOrderTextStyle: {
    color: APP_COLOR_BLACK,
    fontSize: 14,
    fontFamily: DINENGSCHRIFT_REGULAR,
    fontWeight: 'bold'
  },
  arrowImageProgressStyle: {
    width: 11,
    height: 18,
    marginTop: IF_OS_IS_IOS ? 10 : 10,
    position: 'absolute',
    right: MARGIN_LEFT_RIGHT
  },
  arrowDownImageStyle: {
    width: 18.5,
    height: 10.5,
    marginTop: IF_OS_IS_IOS ? 10 : 10,
    position: 'absolute',
    right: MARGIN_LEFT_RIGHT
  },
  arrowDownImageProgressStyle: {
    width: 18.5,
    height: 10.5,
    marginTop: IF_OS_IS_IOS ? 10 : 10,
    position: 'absolute',
    right: MARGIN_LEFT_RIGHT
  },
  titleArrowImageStyle: {
    marginStart: 0,
    marginEnd: 5,
    marginBottom: IF_OS_IS_IOS ? 10 : 0
  },
  innerViewStyle: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    paddingStart: LEFT_RIGHT_MARGINS,
    paddingEnd: LEFT_RIGHT_MARGINS,
    width: '100%',
    // height: DETAIL_CONTAINER_HEIGHT,
    backgroundColor: APP_COLOR_BLACK,
    justifyContent: 'center',
    flexDirection: 'column'
  },
  DetailsTextStyle: {
    fontSize: 16,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_WHITE
  },
  totalAmountTextStyle: {
    fontSize: 16,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_BLACK,
    fontWeight: 'bold'
  },
  starsTextStyle: {
    textAlign: 'right',
    color: APP_COLOR_WHITE,
    fontSize: 15.5,
    fontFamily: DINENGSCHRIFT_REGULAR
  },
  totalStarsTextStyle: {
    textAlign: 'right',
    color: APP_COLOR_RED,
    fontSize: 15,
    fontFamily: DINENGSCHRIFT_REGULAR
  },
  starImageStyle: {
    alignSelf: 'center',
    marginStart: 3,
    width: 16,
    height: 16,
    marginTop: IF_OS_IS_IOS ? -5 : 0
  },
  detailRowStyle: {
    width: '100%',
    flexDirection: 'row',
    //marginBottom: 10,
    marginTop: 5
  },
  trackOrderRowContainer: {
    marginTop: 10,
    flexDirection: 'row'
  },
  replicateTextStyle: {
    fontSize: 14,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_RED,
    fontWeight: 'bold'
  },
  modifierText: {
    fontSize: 14,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    color: APP_COLOR_WHITE
  },
  modifierTextRight: { textAlign: 'right' },
  goForItButtonStyle: {
    backgroundColor: APP_COLOR_BLACK,
    width: GO_FOR_IT_BUTTON_WIDTH,
    height: GO_FOR_IT_BUTTON_HEIGHT,
    alignItems: 'center',
    position: 'absolute',
    paddingBottom: IF_OS_IS_IOS ? 9 : 7,
    justifyContent: 'center',
    alignSelf: 'flex-end',
    borderRadius: COMMON_BUTTON_RADIOUS
  },
  cancelTime: {
    fontSize: 13,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    color: APP_COLOR_WHITE,
    alignSelf: 'center',
    paddingTop: 0,
    paddingLeft: 5,
    marginRight: -5
  },
  cancelButtonText: {
    ...COMMON_BUTTON_TEXT_STYLE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    fontSize: 12,
    color: APP_COLOR_WHITE,
    // marginTop: IF_OS_IS_IOS ? 3 : 0
  },
  orderDetailContainer: {
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: APP_COLOR_BLACK,
    paddingStart: MARGIN_LEFT_RIGHT,
    paddingEnd: MARGIN_LEFT_RIGHT
  },
  orderAgainContainer: {
    flex: 1,
    paddingTop: 10
  },
  bigButton: {
    height: 40,
    width: 200
  },
  littleButton: {
    minWidth: 0,
    width: 80
  },
  shortButton: {
    minWidth: 0,
    width: 'auto',
    marginTop: 15,
    marginBottom: 15,
    paddingLeft: 15,
    paddingRight: 15
  },
  bigButtonText: {
    ...COMMON_BUTTON_TEXT_STYLE,
    fontFamily: ROADSTER_REGULAR,
    fontSize: 22,
    lineHeight: 22
  },
  confirmationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 900
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'red'
  },
  wideWidth: { width: '50%' },
  wideWidthRight: { justifyContent: 'flex-end' },

};

function mapStateToProps(state) {
  const { CustomerId, LevelName } = getUserObject(state);
  const {
    category: { allMenu },
    cart: { cartItemsArray },
    app: { loading, accessToken, currency },
    home: { userOrdersCount, cancelOrderData, banners }
  } = state;
  return {
    allMenu,
    banners,
    cartItemsArray,
    loading,
    ACCESS_TOKEN: accessToken,
    customerId: CustomerId,
    LevelName,
    historyData: userOrdersCount ? userOrdersCount.data : [],
    totalOrders: userOrdersCount ? userOrdersCount.total : 0,
    currency,
    cancelOrderData
  };
}

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      ...homeActions,
      ...cartActions,
      ...squadActions,
      ...appstateActions
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MyOrders);
// export default MyOrders;
