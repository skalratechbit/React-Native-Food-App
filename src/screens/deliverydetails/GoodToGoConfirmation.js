import React, { Component } from 'react';
import { View, Modal, Text, ScrollView } from 'react-native';
import strings from '../../config/strings/strings';
import { scale } from 'react-native-size-matters';

import {
  APP_COLOR_WHITE,
  APP_COLOR_RED,
  APP_COLOR_BLACK
} from '../../config/colors';
import {
  ROADSTER_REGULAR,
  PACIFICO,
  DINENGSCHRIFT_BOLD,
} from '../../assets/fonts';
import { Button } from 'native-base';
import {
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  COMMON_BUTTON_TEXT_STYLE,
  COMMON_BUTTON_RADIOUS,
  FONT_SCALLING
} from '../../config/common_styles';
import {
  numberWithCommas
} from '../../config/common_functions';

class GoodToGoConfirmation extends Component {
  state = {
    modalVisibilty: false,
    apiname: '',
    itemsPrice:[],
  };
  componentWillReceiveProps(nextProps) {
    this.setState({ modalVisibilty: nextProps.modalVisibilty });
    this.calculateItemPromos(nextProps.promoObject)
  }
  hasItemsForPromo (itemId) {


    const {cartItemsArray}=this.props

    return cartItemsArray.filter( item => item.PLU == itemId  );
  }
  returnCartIndex(itemId){
    const { cartItemsArray } = this.props;
    return cartItemsArray.findIndex( item => item.ID == itemId  );

  }

  hasCategoryItemsForPromo (categoryId) {
    const {cartItemsArray } = this.props;

    return cartItemsArray.filter( item => item.CategoryId == categoryId );
  }
  calculateItemPromos(promo){
    const {promoObject}=this.props;
    const { DiscountValue = 0, Categories = [], Items = [] } = promoObject || promo ||[];
    const promoDiscount = parseInt(DiscountValue);
    const isItemPromo = Categories.length || Items.length;
    let items = [];

    if(isItemPromo) {
      if(Categories.length) items = this.hasCategoryItemsForPromo(Categories[0]['ItemId']);
      if(Items.length) {
        for(let k=0;k<Items.length;k++) {
          items.push(this.hasItemsForPromo(Items[k]['PLU']))
          items[k].DiscountType=Items[k]['DiscountType']
          items[k].DiscountValue=Items[k]['DiscountValue']

        }
      }

    }
    let discountAmount = 0;
    let promoItems=[]
    if(items.length) {
      // discount per item price (percentage | amount)

      items.map((item, index) => {
        console.log(item.DiscountType);

        if(item[0] && item[0].ID) {
          let itemAmount = parseInt(item[0] && item[0].Price);
          let loc = this.returnCartIndex(item[0].ID)
          switch (item.DiscountType) {
            case 'amount':
              discountAmount += item.Price - promoDiscount;
              break;
            case 'percentage':
              const multiplier = parseInt(item.DiscountValue) / 100;
              discountAmount += item[0].Price * multiplier;
              itemAmount = itemAmount - (item[0].Price*item[0].quantity) * multiplier


              Object.assign(item[0], {
                itemAmount: itemAmount,
                discountAmount:(item[0].Price*item[0].quantity) * multiplier
              })
              promoItems.splice(loc, 0, item[0]);

              break;
          }
        }
      });


      this.setState({itemPrice:promoItems})

    }
  }

  getPromoItems(items){
    const {itemPrice}=this.state;
    return itemPrice && itemPrice.length>0 && itemPrice.filter(item=>item.ID===items.ID)
  }
  renderItemPriceView(itemData,thirdColor,currency){
    const data=this.getPromoItems(itemData);
    const styles = buildStyles(thirdColor);
    console.log("Items Data",data);
    if(data && data.length>0 &&  data[0].ID){

      return(
          <View style={styles.rightColumn}><Text style={styles.orderItemTextR}>
            {numberWithCommas(Number((data[0].Price * data[0].quantity)-data[0].discountAmount),currency)}
          </Text>
          </View>
      )
    }
    else {
      return(
          <View style={styles.rightColumn}><Text style={styles.orderItemTextR}>
            {numberWithCommas(itemData.Price * itemData.quantity, currency)}
          </Text>
          </View>
      )
    }
  }
  handleRequestClose() {}

  getCustomizeItemsPrice(item) {
    var price = 0;
    if (item.Modifiers) {
      for (var i = 0; i < item.Modifiers.length; i++) {
        const ModifierObject = item.Modifiers[i];
        if (ModifierObject?.details?.items) {
          for (var j = 0; j < ModifierObject?.details?.items.length; j++) {
            const itemObj = ModifierObject?.details?.items[j];
            if (itemObj.Selected == 1 && itemObj.Quantity > 0) {
              const singalCustomizedItmeTotalPrice = itemObj.Price * itemObj.Quantity;
              price = price + singalCustomizedItmeTotalPrice;
            }
          }
        }
      }
      return price;
    } else return price;
  }

  getSingalItemTotalPirce_Inluding_CustomizedItems(item) {
    const {itemPrice}=this.state;
    return (

    (parseInt(item.DiscountedPrice || item.Price) +
      this.getCustomizeItemsPrice(item)) * parseInt(item.quantity)
    );
  }

  getFreeItemsArray(item) {
    const freeItemAarray = [];
    let itemDetail = {};
    if (item.Modifiers) {
      for (let i = 0; i < item.Modifiers.length; i++) {
        const object = item.Modifiers[i];
        if (object.details) itemDetail = object.details;
        if (object?.details?.items) {
          for (let j = 0; j < object.details.items.length; j++) {
            if (
              object.details.items[j].Selected == 1 &&
              object.details.items[j].Quantity > 0 &&
              object.details.items[j].Price == 0
            ) {
              object.details.items[j]['CategoryName'] = itemDetail.CategoryName_en;
              object.details.items[j]['CategoryPrefix'] = itemDetail.CategoryPrefix;
              freeItemAarray.push(object.details.items[j]);
            }
          }
        }
      }
    }
    return freeItemAarray;
  }

  checkCustomizedItmeExist(item) {
    if (item.Modifiers) {
      for (var i = 0; i < item.Modifiers.length; i++) {
        const ModifierObject = item.Modifiers[i];

        if (ModifierObject?.details.items) {
          for (var j = 0; j < ModifierObject?.details.items.length; j++) {
            const itemObj = ModifierObject?.details.items[j];

            if (itemObj.Selected == 1 && itemObj.Quantity > 0) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  getFreeItems(item, price, quantity, currency) {
    const styles = buildStyles();

    const array = this.getFreeItemsArray(item) || [];
    return (
      <View style={{ flexDirection: 'row', marginEnd: 0, flexWrap: 'wrap',marginLeft: 10,alignItems:'flex-start' }}>
        <View style={{width: '60%'}}>
          {array.map((object, i) => {
            const notLast = i < array.length - 1;
            return (
              <View key={i}>
                <Text allowFontScaling={FONT_SCALLING} style={[styles.orderItemText, { fontSize: 12,}]}>
                  {`${object.CategoryPrefix && object.CategoryPrefix} `}
                  {object.ModifierName.replace(/ *$/, '') + (notLast ? ', ' : '')}
                </Text>
              </View>
            );
          })}
        </View>
        <View style={[styles.rightColumn, {alignItems:'flex-end',justifyContent:'center' }]}><Text style={[styles.orderItemTextR, { fontSize: 13 }]}>{numberWithCommas(price, currency)}</Text></View>
      </View>
    );
  }

  getExtraTextView(item) {
    const styles = buildStyles();

    if (this.checkCustomizedItmeExist(item)) {
      return (
        <View style={{ marginLeft: 10, marginTop: 5 }}>
          <Text allowFontScaling={FONT_SCALLING} style={[styles.orderItemText, { fontSize: 13 }]}>
            {strings.EXTRAS.toUpperCase()}
          </Text>
        </View>
      );
    }
  }

  getCustomizeItems(item, currency) {
    var showExtraTextView = 0;
    const styles = buildStyles();
    return (
      <View style={{ marginLeft: 10, marginTop: 5 }}>
        {item.Modifiers &&
          item.Modifiers.map(
            (object, i) =>
              object.details.items &&
              object.details.items.map((obj, j) => (
                <View key={j} >
                  {obj.Selected == 1 &&
                    obj.Quantity > 0 &&
                    obj.Price > 0 && (
                      <View>
                        <View
                          style={[
                            // styles.detailRowContainerStyle,
                            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }
                          ]}>
                          <View style={{ flexDirection: 'row' }}>
                            <Text
                              allowFontScaling={FONT_SCALLING}
                              style={[styles.orderItemText, { fontSize: 12 }]}>
                              {object.details.CategoryPrefix &&
                              object.details.CategoryPrefix == 'No'
                                ? object.details.CategoryPrefix + ' ' + obj.ModifierName
                                : obj.ModifierName}
                            </Text>
                            <Text
                              allowFontScaling={FONT_SCALLING}
                              style={[styles.orderItemText, { fontSize: 12 }]}>
                              ({obj.Quantity})
                            </Text>
                          </View>

                          <View>
                            <Text
                              allowFontScaling={FONT_SCALLING}
                              style={[styles.orderItemText, { fontSize: 13 }]}>
                              {numberWithCommas(obj.Price * obj.Quantity, currency)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                </View>
              ))
          )}
      </View>
    );
  }

  render() {
    const { appTheme: { thirdColor },
      onCrossPress,
      selectedHeading,
      onPressGrabIt,
      confirmationData: {
        FullName,
        currency,
        cartItemsArray,

        deliveryAddress,
        paymentCache = {},
        cartDiscounts,

      },
      scheduledOrderTime,
      isScheduled,
      deliveryCharges,
      subTotal,
        totalAmount,
    } = this.props;
    const { modalVisibilty } = this.state;
    let subTotalAmount = totalAmount;
    let Address = '';
    let City = '';
    if(deliveryAddress) {
      const { CityName, Line1, Line2, AptNumber } = deliveryAddress;
      const addressArray = [];
      if(Line2) addressArray.push(Line2);
      if(Line1) addressArray.push(Line1);
      if(AptNumber) addressArray.push(AptNumber);
      if(CityName) City = CityName;
      Address = addressArray.join(', ');
    }
    const styles = buildStyles(thirdColor);
    return (
      <Modal
        transparent={true}

        visible={modalVisibilty}
        onRequestClose={this.handleRequestClose}>
        <View style={styles.modalBackground}>
          <View style={styles.popUpContainerView}>
            <View
              style={styles.headingViewStyle}>
              <Text allowFontScaling={FONT_SCALLING} style={styles.headingTextStyle}>
                {selectedHeading}
              </Text>
            </View>
            <View style={styles.popupBody}>
              {isScheduled && <Text style={styles.arriveTime}>{scheduledOrderTime}</Text>}
              <Text style={styles.subTitle}>{strings.ADDRESS.toUpperCase()}:</Text>
              <Text style={styles.nameInfo}>{String(City || FullName).toUpperCase()}</Text>
              <Text style={styles.addressInfo}>{String(Address).toUpperCase()}</Text>

              <Text style={styles.subTitle}>{strings.ORDER_SUMMARY}:</Text>
              <ScrollView style={styles.itemsList}>
                {
                  cartItemsArray && cartItemsArray.map((item, i) => {
                    const { ItemName, DiscountedPrice, Price, quantity } = item;

                    const ItemDesription = (quantity > 1 ? `${quantity}X ` : '') + ItemName;
                    return (
                      <View>
                        <View key={i} style={styles.row2column}>
                          <View style={styles.leftColumn}><Text style={styles.orderItemText}>{String(ItemDesription).toUpperCase()}</Text></View>
                          {this.renderItemPriceView(item,thirdColor,currency)}
                        </View>
                        {this.checkCustomizedItmeExist(item) && this.getFreeItems(item, DiscountedPrice || Price, quantity || 1, currency)}
                        {this.getExtraTextView(item)}
                        {this.getCustomizeItems(item, currency)}
                      </View>
                    )
                  })
                }
              </ScrollView>
              <View style={styles.divider}></View>
              <View style={styles.subTotalRow}>
                <View style={styles.leftColumn}><Text style={styles.orderTotal}>{strings.SUBTOTAL.toUpperCase()}</Text></View>
                <View style={styles.totalRightColumn}><Text style={styles.orderTotalR}>{numberWithCommas(subTotal, currency)}</Text></View>
              </View>
              {cartDiscounts &&
                Object.keys(cartDiscounts).map((key, i) => {
                  return (
                    <View key={i} style={styles.subTotalRow}>
                      <View style={styles.leftColumn}><Text style={styles.orderTotal}>{key}</Text></View>
                      <View style={styles.rightColumn}><Text style={styles.orderTotalR}>{cartDiscounts[key]}</Text></View>
                    </View>
                  )
                })
              }
              <View style={styles.subTotalRow}>
                <View style={styles.leftColumn}><Text style={styles.orderTotal}>{strings.DELIVERY_CHARGE}</Text></View>
                <View style={styles.rightColumn}><Text style={styles.orderTotalR}>{numberWithCommas(deliveryCharges, currency)}</Text></View>
              </View>
              {
                Object.keys(paymentCache).map((key, i) => {
                  subTotalAmount -= paymentCache[key];
                  //subtotal will be $0 if payment exceeds total bill
                  if(subTotalAmount < 0) subTotalAmount = 0;
                  return (
                    <View style={styles.subTotalRow} key={i}>
                      <View style={styles.leftColumn}><Text style={styles.orderTotal}>{String(key).replace('_', ' ')}</Text></View>
                      <View style={styles.totalRightColumn}><Text style={styles.orderTotalR}>-{numberWithCommas(paymentCache[key], currency)}</Text></View>
                    </View>
                  )
                })
              }
              <View style={[styles.divider, { marginTop: 0 }]}></View>
              <View style={styles.totalRow}>
                <View style={styles.leftColumn}><Text style={styles.orderTotal}>{strings.TOTAL_DUE}</Text></View>
                <View style={styles.totalRightColumn}><Text style={styles.orderTotalR}>{numberWithCommas(subTotalAmount, currency)}</Text></View>
              </View>
            </View>
            <View style={styles.activityIndicatorWrapper}>
              <View style={styles.popupFooter}>
                <Button
                  onPress={onPressGrabIt}
                  style={styles.goForItButtonStyle}>
                  <Text
                    allowFontScaling={FONT_SCALLING}
                    style={styles.popupButtonText}>
                    {strings.PLACE_ORDER}
                  </Text>
                </Button>

                <Button
                  onPress={onCrossPress}
                  style={[styles.goForItButtonStyle, styles.backButtonStyle]}>
                  <Text
                    allowFontScaling={FONT_SCALLING}
                    style={styles.popupButtonText}>
                    {strings.BACK.toUpperCase()}
                  </Text>
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

function buildStyles(color) {

  const textBaseStyle = {
    fontFamily: DINENGSCHRIFT_BOLD
  }
  const orderItemText = {
    ...textBaseStyle,
    fontSize: 16,
  }
  const orderTotalText = {
    ...textBaseStyle,
    fontSize: 16,
    color: color,
  }

  return {
    orderTotal: {
      ...orderTotalText
    },
    orderTotalR: {
      ...orderTotalText,
      textAlign: 'right'
    },
    orderItemText: {
      ...orderItemText
    },
    orderItemTextR: {
      ...orderItemText,
      textAlign: 'right'
    },
    nameInfo: {
      ...textBaseStyle,
      fontSize: 16,
    },
    addressInfo: {
      ...textBaseStyle,
      fontSize: 15,
      marginBottom: 15
    },
    arriveTime: {
      ...textBaseStyle,
      fontSize: 16,
      marginBottom: 15
    },
    subTitle: {
      color: color,
      ...textBaseStyle,
      fontSize: 16,
      marginBottom: 0
    },
    divider: {
      width: '100%',
      height: 8,
      marginTop: 8,
      borderTopWidth: 1,
      borderTopColor: APP_COLOR_BLACK
    },
    totalRow: {
      flexDirection: 'row',
      marginTop: 0,
      marginBottom: 10,
      marginRight: 10,
      paddingTop: 0,
    },
    subTotalRow: {
      flexDirection: 'row',
      marginTop: 0,
      marginBottom: 0,
      paddingBottom: 0,
      marginRight: 10,
      paddingTop: 0
    },
    row2column: {
      flexDirection: 'row',
    },
    leftColumn: {
      flex: 2,
      justifyContent: 'flex-end'
    },
    rightColumn: {
      flex: 1.25,
      justifyContent: 'flex-start'
    },
    totalRightColumn: {
      flex: 1.4,
      justifyContent: 'flex-start'
    },
    itemsList: {
      height: 'auto',
      maxHeight: 150,
      paddingRight: 10
    },
    popupBody: {
      maxHeight: SCREEN_HEIGHT < 570 ? 370 : 400,
      height: 'auto',
      paddingTop: 13,
      paddingLeft: 20,
      paddingRight: 10,
      paddingBottom: 0,
      backgroundColor: APP_COLOR_WHITE
    },
    popupButtonText: {
      ...COMMON_BUTTON_TEXT_STYLE,
      fontFamily: ROADSTER_REGULAR,
      fontSize: 18
    },
    modalBackground: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#00000099'
    },
    activityIndicatorWrapper: {
      backgroundColor: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around'
    },
    headingViewStyle: {
      backgroundColor: color,
      padding: 10,
      paddingBottom: 0
    },
    popUpContainerView: {
      height: 'auto',
      maxHeight: SCREEN_HEIGHT * .9,
      borderRadius: 10,
      borderWidth: 0,
      maxWidth: SCREEN_WIDTH * .9,
      width: '100%',
      overflow: 'hidden'
    },
    headingTextStyle: {
      fontSize: scale(25),
      fontFamily: PACIFICO,
      alignSelf: 'center',
      color: APP_COLOR_WHITE,
      marginTop: 10,
      textAlign: 'center',
      marginBottom: 10
    },
    subHeadingStyle: {
      fontSize: 16,
      fontFamily: DINENGSCHRIFT_BOLD,
      alignSelf: 'center',
      color: APP_COLOR_RED,
      marginTop: 15
    },
    crossImageStyle: {
      width: 18,
      height: 18,
      resizeMode: 'contain'
    },
    crossImageTouchStyle: {
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      right: 8,
      top: 5
    },
    goForItButtonStyle: {
      backgroundColor: color,
      flex: 2.31,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: COMMON_BUTTON_RADIOUS,
      paddingRight: 0,
      paddingLeft: 0,
      marginLeft: 20,
      marginBottom: 20
    },
    backButtonStyle: {
      flex: 1,
      paddingRight: 8,
      paddingLeft: 8,
    },
    popupFooter: {
      paddingRight: 20,
      flexDirection: 'row'
    },
  };
}

export default GoodToGoConfirmation;
