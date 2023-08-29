import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  KeyboardAvoidingView,
} from 'react-native';
import {
  COMMON_BUTTON_TEXT_STYLE,
  COMMON_BUTTON_STYLE,
  IF_OS_IS_IOS,
  FONT_SCALLING,
  SCREEN_WIDTH
} from '../../config/common_styles';
import { Actions } from 'react-native-router-flux';
import { STAR_WHITE_IMAGE } from '../../assets/images';
import strings from '../../config/strings/strings';
import { APP_COLOR_WHITE, APP_COLOR_RED, APP_COLOR_BLACK } from '../../config/colors';
import {
  DINENGSCHRIFT_REGULAR,
  ROADSTER_REGULAR,
  DINENGSCHRIFT_BOLD
} from '../../assets/fonts';
import { Button } from 'native-base';
import YourCartListItem from './YourCartListItem';
import { connect } from 'react-redux';
import { numberWithCommas } from '../../config/common_functions';
import { actions } from '../../ducks/cart';
import { actions as vouchersActions } from '../../ducks/vouchers';
import { actions as squadActions } from '../../ducks/squardcorner';
import { bindActionCreators } from 'redux';
import CommonLoader from '../../components/CommonLoader';
import Common from '../../components/Common';
import { getUserObject, getUserAddresses } from '../../helpers/UserHelper';
import { validatePromo } from '../../helpers/CartHelper';
import { getThemeByLevel } from '../../config/common_styles/appthemes';
import TitleBar from '../../components/TitleBar';
import Recommended from '../recommended/Recommended';
import PromoCode from './PromoCode';
import {actions as deliveryDetailsAction} from "../../ducks/deliverydetails";
// import { BoostYourStartPopUp } from '../../components/BoostYourStartPopUp';

const TITLE_CONTAINER_HEIGHT = 52;
const TITLE_TEXT_SIZE = 30;
const ITEM_CELL_HEIGHT = 453.5;

const ITEMS_MARGIN = 5;
const ADD_ITEMS_TEXT_SIZE = 18;
const ADD_ITEMS_ARROW_WIDTH = 9;
const ADD_ITEMS_ARROW_HEIGHT = 16;
const ADD_ITEMS_ARROW_MARGIN_LEFT = 5;

class YourCart extends Component {
  constructor(props) {
    super(props);
    const { LevelName, hideRecommended } = props;
    this.state = {
      totalAmount: 0,
      componentTheme: getThemeByLevel(LevelName),
      subTotal: 0,
      cartDiscounts: {},
      freePopupVisibility: true,
      showBottomTotalAmount: true,
      showRecommended: !hideRecommended,
      appliedPromos: [],
      showNonApplicablePromo: false,
      alertMessage:'',
      itemPrice:[],
      itemDiscount:[],
      showMinimumPopUp:false,
      message:''
    };
  }

  componentWillUnmount() {

    //clean up
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  componentWillReceiveProps(nextProps) {
    //console.log('nextProps', nextProps);
    if (nextProps.starters !== this.props.starters) {
      this.setState({freePopupVisibility: true});
    }

    // this.calculateItemPromo();
  }

   componentDidMount() {
    //fetch user details
    this.props.getAddressTypes()
    const { CustomerId } = this.props;
    this.props.userDetails(CustomerId);
    //this.props.getVouchers();
    // this.props.getVouchersWithCapture(CAPTURE_DELIVERY);

    //list for back button
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);

    this.setTotalAmount();

    //get active promos
    // this.props.getCartPromos();

  }

  calculateGrandTotal = (amount) => {
    const { promoObject, cartPromos, currency, extraCharage } = this.props;
    const subTotal = amount;
    let totalAmount = amount;
    const cartDiscounts = {};
    const appliedPromos = [];

    // calculate cart promos discount
    const noneStarsPromo =
      cartPromos.filter(promo => {
        const { Categories = [], Items = [], PromoCode = '' } = promo;
        const isValid = promo.PromoCategory !== 'stars'
          && !PromoCode
          && !Categories.length
          && !Items.length;

        return isValid ? true : false;
      });
    noneStarsPromo.map(promo => {
      if (validatePromo(promo)) {
        //only if promo is valid
        const { DiscountType, Discount } = promo;
        const discountAmount = parseInt(Discount);
        appliedPromos.push(promo);
        switch (DiscountType) {
          case 'amount':
            totalAmount = totalAmount - discountAmount;
            cartDiscounts['DISCOUNT AMOUNT'] = `-${numberWithCommas(discountAmount, currency)}`;
            break;
          case 'percentage':
            const multiplier = 1 - (discountAmount / 100);
            totalAmount = totalAmount * multiplier;
            cartDiscounts['DISCOUNT PERCENTAGE'] = `-${discountAmount} %`;
            break;
        }
      }
    });

    // calculate promo code discount
    const { DiscountType, PromoTitle = '', DiscountValue = 0, Categories = [], Items = [], PromoLabel = '' } = promoObject;
    const PromoDisplay = PromoLabel.toUpperCase();
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
    // render item based promos
    if(items.length) {

      // discount per item price (percentage | amount)
      this.calculateItemPromos(amount);
      let discountAmount = 0;
      items.map( item => {
      if(item[0] && item[0].ID) {

            switch (DiscountType) {
              case 'amount':
               discountAmount += item.Price - promoDiscount;
               break;
             case 'percentage':
                const multiplier = promoDiscount / 100;
                discountAmount += item[0].discountAmount;
                cartDiscounts[PromoDisplay] = `-${promoDiscount} %`;
                break;
            }
      }
      });


      this.setState({
        subTotal:subTotal-discountAmount
      })
      console.log(discountAmount);

      totalAmount = totalAmount - discountAmount;
      cartDiscounts[PromoDisplay] = `-${numberWithCommas(discountAmount, currency)}`;
    } else if (!isItemPromo) {
      // discount the whole cart
      switch (DiscountType) {
        case 'amount':
          totalAmount = totalAmount - promoDiscount;
          cartDiscounts[PromoDisplay] = `-${numberWithCommas(promoDiscount, currency)}`;
          break;
        case 'percentage':
          const multiplier = 1 - (promoDiscount / 100);
          totalAmount = totalAmount * multiplier;
          cartDiscounts[PromoDisplay] = `-${promoDiscount} %`;
          break;
      }
      this.setState({subTotal:subTotal})
    } else if(!isItemPromo && items.length == 0) {
      // if items are blank but the promo is for items then clear it and warn
      // clear promo code
      // this.props.setPromoCode('');
      this.setState({
        showNonApplicablePromo: true,
        alertMessage: 'YOU DO NOT HAVE A QUALIFYING ITEM IN YOUR CART FOR THIS PROMOTION.'
      });
    }


    if (totalAmount < 0) totalAmount = 0;
    let deliveryCharge = this.props.extraCharage && this.props.extraCharage.DeliveryCharge || 0;
    // add delivery fee after
    totalAmount += Number(deliveryCharge);

    this.props.setTotalAmountOfCart(totalAmount);
    console.log(subTotal);


    this.setState({
      totalAmount,

      cartDiscounts,
      appliedPromos
    });
  };

  hasItemsForPromo (itemId) {

    const { cartItemsArray } = this.props;
    return cartItemsArray.filter( item => item.PLU == itemId  );
  }

  hasCategoryItemsForPromo(categoryId) {
    const { cartItemsArray } = this.props;
    return cartItemsArray.filter(item => item.CategoryId == categoryId);
  }

  totalBoostedStars = 0
  setTotalAmount = (itemsArray) => {
    let total = 0;
    this.totalBoostedStars = 0;
    if (!itemsArray) itemsArray = this.props.cartItemsArray;
    for (let i = 0; i < itemsArray.length; i++) {
      const { FeaturedStars, DiscountedPrice, Price, quantity } = itemsArray[i];
      const ItemQuantity = parseInt(quantity);
      const ItemPrice = parseInt(DiscountedPrice || Price);
      const TotalModdedPrice =
        (parseInt(ItemPrice) +
          this.getCustomizeItemsPrice(itemsArray[i])) * ItemQuantity;
      if (FeaturedStars > 0) {
        this.totalBoostedStars += Math.round((FeaturedStars) / 1000) * ItemQuantity;
      }
      total = total + TotalModdedPrice;
    }
    // set total

    this.calculateGrandTotal(total);
  }

  getCustomizeItemsPrice(item) {
    let price = 0;
    if (item.Modifiers) {
      for (let i = 0; i < item.Modifiers.length; i++) {
        const ModifierObject = item.Modifiers[i];
        if (ModifierObject.details.items) {
          for (let j = 0; j < ModifierObject.details.items.length; j++) {
            const itemObj = ModifierObject.details.items[j];
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

  onBackPress() {
    Actions.drawer({ type: 'reset' });
    Actions.ourmenu();
    return true;
  }

  addFreeItemsToCart = (event, freeItemsArray) => {
    this.setState({ freePopupVisibility: false });

    const array = this.props.cartItemsArray.slice();

    for (let i = 0; i < freeItemsArray.length; i++) {
      if (freeItemsArray[i].Selection == 1) {
        freeItemsArray[i]['quantity'] = 1;
        array.push(freeItemsArray[i]);
      }
    }
    this.props.additmeToCart(array);
  };
  setTotalAmount(amount) {
    this.setState({ totalAmount: amount });
  }
  onCrossPress = () => {
    this.setState({ freePopupVisibility: false });
  };
  checkFreeItemIsAddedInCart() {
    const { starters = [], cartItemsArray } = this.props;
    if (starters && starters[0] && starters[0].Items) {
      let filteredArray = [];
      for (let i = 0; i < starters[0].Items.length; i++) {
        filteredArray = cartItemsArray.filter(
          obj => obj.ID == starters[0].Items[i].ID
        );

        if (filteredArray.length > 0) {
          return true;
        }
      }
      return false;
    }
  }
  onPress = (event, caption, color) => {
    switch (caption) {
      case strings.CONTINUE:
        const {totalAmount, subTotal, cartDiscounts, appliedPromos } = this.state;
        const {minimumAmount,currency}=this.props
        if(parseInt(totalAmount)<parseInt(minimumAmount)){
       
          this.setState({
            showMinimumPopUp:true,
            message:'MINIMUM ORDER AMOUNT IS',
          })
        }
       else  if (this.props.userType == 'login' || this.props.userType == 'register') {
          Actions.drawer({ type: 'reset' });
          console.log(totalAmount, minimumAmount);

          Actions.deliverydetails({ vouchers: this.props.vouchers, subTotal,totalAmount, cartDiscounts, appliedPromos });
        }
        break;
      case strings.YOUR_CART:

        Actions.pop();
        break;

      case strings.ADD_ITEMS:
        Actions.drawer({ type: 'reset' });
        Actions.ourmenu();
        break;

      default:
    }
  };

  handleGoBack = () => {
    Actions.ourmenu();
  };

  handleCloseRecommended = () => {
    this.setState({
      showRecommended: false
    });
  };

  handleScrollToEnd = () => {
    if (this.ScrollView) {
      if (IF_OS_IS_IOS) {
        setTimeout(() => {
          this.ScrollView.scrollToEnd();
        }, 600);
      } else {
        this.ScrollView.scrollToEnd();
        setTimeout(() => this.setState({
          showBottomTotalAmount: false
        }), 4);
      }
    }
  }

  handleScrollViewRef = (ref) => this.ScrollView = ref;

  handleHidePromoWarning = () => this.setState({ showNonApplicablePromo: false });
  handleHideMinimumWarning = () => this.setState({ showMinimumPopUp: false });

  isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  renderRecommended(showRecommended) {
    return !showRecommended ? null : (
      <Recommended visible={true} onClose={this.handleCloseRecommended} />
    );
  }

  renderPromoCodeFeature() {
    return <PromoCode onFocus={this.handleScrollToEnd} setTotalAmount={this.setTotalAmount} />;
  }
  calculateItemPromos(amount){
    const {promoObject}=this.props;
    const {itemPrice,subtotal,totalAmount}=this.state;

    const { DiscountType, PromoTitle = '', DiscountValue = 0, Categories = [], Items = [],PromoLabel='' } = promoObject;
    const PromoDisplay = PromoLabel.toUpperCase();
    let sub_total=subtotal
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
             discountAmount += (item[0].Price*item[0].quantity) * multiplier;
             itemAmount = itemAmount - (item[0].Price*item[0].quantity) * multiplier

             Object.assign(item[0], {
               itemAmount: itemAmount,
               discountAmount: (item[0].Price*item[0].quantity) * multiplier,
               qty:(item[0].quantity)
             })
             promoItems.splice(loc, 0, item[0]);
             break;
         }
       }
      });
      this.setState({itemPrice:promoItems,subtotal:sub_total})

    }
  }
  returnCartIndex(itemId){
    const { cartItemsArray } = this.props;
    return cartItemsArray.findIndex( item => item.ID == itemId  );

  }
  renderStarsCalculation () {
    const { totalBoostedStars } = this;
    const { totalAmount } = this.state;
    let stars = Math.round(totalAmount / 1000);

    if (totalBoostedStars) {
      // add multiplied stars to stars calculation
      stars = Math.round((totalAmount < 0 ? 0 : totalAmount) / 1000) + totalBoostedStars;
    }
    const { cartPromos } = this.props;
    const starsPromos =
      cartPromos.filter(promo => promo.PromoCategory === 'stars');
    let totalStars = stars;
    starsPromos.map(promo => {
      if (validatePromo(promo)) {
        //only if promo is valid
        const { DiscountType, Discount } = promo;
        const discountAmount = parseInt(Discount);
        switch (DiscountType) {
          case 'amount':
            totalStars = totalStars + discountAmount;
            break;
          case 'percentage':
            const multiplier = (discountAmount / 100) + 1;
            totalStars = totalStars * multiplier;
            break;
        }
      }
    });
    return Math.round(totalStars);
  }

  renderCartPromo(color) {
    const { cartPromos, currency } = this.props;
    const promos = [];
    // calculate cart promos discount
    const noneStarsPromo = cartPromos.filter(promo => promo.PromoCategory !== 'stars');
    let renderCurrency = true;
    noneStarsPromo.map((promo, key) => {
      if (validatePromo(promo)) {
        //only if promo is valid
        const {
          PromoTitle,
          DiscountType,
          Discount = 0,
          Categories = [],
          PromoCode = '',
          Items = []
        } = promo;
        const isCategoryPromo = Categories.length;
        const isItemPromo = Items.length;
        const isCodePromo = PromoCode.length > 0;
        let discountAmount = parseInt(Discount);
        switch (DiscountType) {
          case 'amount':
            break;
          case 'percentage':
            renderCurrency = false;
            break;
        }
        if (!isCategoryPromo && !isItemPromo && !isCodePromo) {
          //only cart based promos
          promos.push(
            <View key={key} style={[styles.detailRowContainerStyle, { backgroundColor: color }]}>
              <View style={styles.instructionsContainerStyle}>
                <Text allowFontScaling={FONT_SCALLING} style={styles.deliveryFeeTextStyle}>
                  {(PromoTitle || strings.DISCOUNT_PROMO).toUpperCase() + ':'}
                </Text>
              </View>
              <View style={[styles.priceContainerStyle, { backgroundColor: color }]}>
                <Text allowFontScaling={FONT_SCALLING} style={styles.deliveryFeeTextStyle}>
                  -{numberWithCommas(discountAmount, renderCurrency ? currency : '%')}
                </Text>
              </View>
            </View>
          );
        }

      }
    });
    return promos;
  }

  renderNonApplicablePromo(color) {
    const { showNonApplicablePromo, alertMessage } = this.state;
    return (
      <Common.Popup
        onClose={this.handleHidePromoWarning}
        color={color}
        visibilty={showNonApplicablePromo}
        heading={alertMessage}
      />
    );
  }
  renderMinimumTotalPopup(color) {
    const { showMinimumPopUp,message } = this.state;
    const {minimumAmount,currency}=this.props
    return (
        <Common.Popup
            onClose={this.handleHideMinimumWarning}
            color={color}
            visibilty={showMinimumPopUp}
            heading={message}
            subbody={numberWithCommas(minimumAmount,currency)}
        />
    );
  }
  render() {
    const {
      scrollStyle,
      container,
      subContainer,
      yourCartTextStyle,
      addItemsTextStyle,
      addItemsContainerStyle,
      detailRowContainerStyle,
      priceContainerStyle,
      listContainer,
      titleArrowImageStyle,
      totalTextStyle,
      deliveryFeeTextStyle,
      totalAmountTextStyle,
      arrowImageStyle,
      starsTextStyle,
      listItemContainer,
      totalAmountViewStyle,
      instructionsContainerStyle,
      starImageStyle
    } = styles;
    const { hasFreeStarter, banners: {DeliveryLoyalty}, extraCharage,promoObject } = this.props;

    const {
      componentTheme: { thirdColor, ARROW_LEFT_RED, ARROW_RIGHT_RED },
      showRecommended
    } = this.state;
    const renderFreeStarters = !this.checkFreeItemIsAddedInCart() && hasFreeStarter === 1;
    console.log('renderFreeStarters', renderFreeStarters);
    return (
      <KeyboardAvoidingView
        enabled
        behavior={IF_OS_IS_IOS ? 'padding' : null}
        keyboardVerticalOffset={20}
        style={[container, { backgroundColor: thirdColor }]}>
        {this.renderRecommended(showRecommended)}
        {this.renderNonApplicablePromo(thirdColor)}
        {this.renderMinimumTotalPopup(thirdColor)}
        <CommonLoader />

        <ScrollView
          ref={this.handleScrollViewRef}
          style={{ flex: 1, width: '100%' }}
          bounces={false}
          onScroll={({ nativeEvent }) => {
            if (this.isCloseToBottom(nativeEvent)) {
              this.setState({ showBottomTotalAmount: false });
            } else {
              this.setState({ showBottomTotalAmount: true });
            }
          }}
          scrollEventThrottle={400}>
          <TitleBar
            onPress={this.handleGoBack}
            color={thirdColor}
            backIcon={ARROW_LEFT_RED}
            titleText={strings.YOUR_CART}
            titleRightComponent={
              <TouchableOpacity
                style={addItemsContainerStyle}
                onPress={event => this.onPress(event, strings.ADD_ITEMS)}>
                <Text
                  allowFontScaling={FONT_SCALLING}
                  style={[addItemsTextStyle, { color: thirdColor }]}>
                  {strings.ADD_ITEMS.toUpperCase()}
                </Text>
                <Image style={arrowImageStyle} source={ARROW_RIGHT_RED} resizeMode="contain" />
              </TouchableOpacity>
            }
          />
          <View style={listContainer}>
            <YourCartListItem
                promoObject={promoObject}
              setTotalAmount={this.setTotalAmount}
              appTheme={this.state.componentTheme}
              vouchers={this.props.vouchers}
              showAddToFavorite={this.showAddToFavorite}
            />
          </View>
          <View style={{ width: '100%', alignSelf: 'flex-end' }}>
            <View style={styles.subsection}>
              <View
                style={[
                  detailRowContainerStyle,
                  {
                    backgroundColor: thirdColor,
                    marginTop: -5,
                    marginBottom: 0
                  }
                ]}>
                <View style={[instructionsContainerStyle, { width: '50%' }]}>
                  <Text allowFontScaling={FONT_SCALLING} style={totalAmountTextStyle}>
                    {strings.SUB_TOTAL.toUpperCase() + ':'}
                  </Text>
                </View>
                <View style={[priceContainerStyle, { backgroundColor: thirdColor, width: '50%' }]}>
                  <Text allowFontScaling={FONT_SCALLING} style={totalAmountTextStyle}>
                    {numberWithCommas(this.state.subTotal, this.props.currency)}
                  </Text>
                </View>
              </View>
              <View style={{marginVertical:10}}>
              {this.renderCartPromo(thirdColor)}
              {this.renderPromoCodeFeature()}
              </View>
              <View style={[detailRowContainerStyle, { backgroundColor: thirdColor }]}>
                <View style={instructionsContainerStyle}>
                  <Text allowFontScaling={FONT_SCALLING} style={deliveryFeeTextStyle}>
                    {strings.DELIVERY_FEE.toUpperCase() + ':'}
                  </Text>
                </View>
                <View style={[priceContainerStyle, { backgroundColor: thirdColor }]}>
                  <Text allowFontScaling={FONT_SCALLING} style={[deliveryFeeTextStyle, { fontSize: 14 }]}>
                    {numberWithCommas(extraCharage && extraCharage.DeliveryCharge, this.props.currency)}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  detailRowContainerStyle,
                  {
                    backgroundColor: thirdColor,
                    marginTop: 10,
                    marginBottom: 0
                  }
                ]}>
                <View style={[instructionsContainerStyle, { width: '50%' }]}>
                  <Text allowFontScaling={FONT_SCALLING} style={totalAmountTextStyle}>
                    {strings.TOTAL_AMOUNT.toUpperCase() + ':'}
                  </Text>
                </View>
                <View style={[priceContainerStyle, { backgroundColor: thirdColor, width: '50%' }]}>
                  <Text allowFontScaling={FONT_SCALLING} style={totalAmountTextStyle}>
                    {/* { "67,250" + " " + strings.LBP } */}
                    {numberWithCommas(this.state.totalAmount, this.props.currency)}
                  </Text>
                </View>
              </View>

              <View
                style={[detailRowContainerStyle, { backgroundColor: thirdColor, marginTop: -5 }]}>
                <View style={[instructionsContainerStyle, { width: '70%' }]}>
                  <Text allowFontScaling={FONT_SCALLING} style={deliveryFeeTextStyle} />
                </View>
                {DeliveryLoyalty !== '0' && <View
                  style={[
                    priceContainerStyle,
                    {
                      backgroundColor: thirdColor,
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      flexDirection: 'row',
                      width: '30%'
                    }
                  ]}>
                  <Text allowFontScaling={FONT_SCALLING} style={starsTextStyle}>
                    {this.renderStarsCalculation() + ' ' + strings.STARS}
                  </Text>
                  <Image style={starImageStyle} source={STAR_WHITE_IMAGE} resizeMode="contain" />
                </View>}
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {this.state.showBottomTotalAmount ? (
            <View style={totalAmountViewStyle}>
              <Text allowFontScaling={FONT_SCALLING} style={totalTextStyle}>
                {strings.YOUR_TOTAL_AMOUNT_IS.toUpperCase() +
                  ' ' +
                  numberWithCommas(this.state.totalAmount, this.props.currency)}
              </Text>
            </View>
          ) : null}

          <View style={[totalAmountViewStyle, { height: 79.5 }]}>
            <Button
              onPress={event => this.onPress(event, strings.CONTINUE)}
              style={[COMMON_BUTTON_STYLE, { alignSelf: 'center', backgroundColor: thirdColor }]}>
              <Text
                allowFontScaling={FONT_SCALLING}
                style={[COMMON_BUTTON_TEXT_STYLE, { fontFamily: ROADSTER_REGULAR }]}>
                {strings.CONTINUE.toUpperCase()}
              </Text>
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = {
  scrollStyle: {
    flex: 1
  },
  container: {
    flex: 1,
    width: null,
    height: null,
    alignItems: 'center',
    backgroundColor: APP_COLOR_RED
  },
  subContainer: {
    height: TITLE_CONTAINER_HEIGHT,
    backgroundColor: APP_COLOR_WHITE,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: IF_OS_IS_IOS ? 7 : 0
  },
  yourCartTextStyle: {
    color: APP_COLOR_RED,
    fontSize: TITLE_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: 5
  },
  listContainer: {
    flex: 1,
    backgroundColor: APP_COLOR_BLACK,
    width: '100%'
  },
  listItemContainer: {
    flexDirection: 'column',
    marginLeft: 0,
    paddingLeft: 0,
    paddingRight: 0,
    marginRight: 0,
    marginTop: 0,
    paddingTop: ITEMS_MARGIN,
    paddingBottom: 0,
    marginBottom: -1
  },

  addItemsContainerStyle: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addItemsTextStyle: {
    textAlign: 'right',
    color: APP_COLOR_RED,
    fontSize: 14,
    fontFamily: DINENGSCHRIFT_BOLD
  },
  starsTextStyle: {
    textAlign: 'right',
    color: APP_COLOR_WHITE,
    fontSize: 16,
    fontFamily: DINENGSCHRIFT_REGULAR
  },
  arrowImageStyle: {
    marginLeft: ADD_ITEMS_ARROW_MARGIN_LEFT,
    marginRight: ADD_ITEMS_ARROW_MARGIN_LEFT,
    width: ADD_ITEMS_ARROW_WIDTH,
    height: ADD_ITEMS_ARROW_HEIGHT,
    marginBottom: IF_OS_IS_IOS ? 2 : 0
  },
  detailRowContainerStyle: {
    flexDirection: 'row',
    marginBottom: 6,
    marginTop: 0
  },
  instructionsContainerStyle: {
    width: '75%'
  },

  deliveryFeeTextStyle: {
    fontSize: 16,
    fontFamily: DINENGSCHRIFT_BOLD,
    color: APP_COLOR_WHITE
  },
  totalAmountTextStyle: {
    fontSize: 21,
    fontFamily: DINENGSCHRIFT_BOLD,
    color: APP_COLOR_WHITE
  },
  priceContainerStyle: {
    backgroundColor: APP_COLOR_BLACK,
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '25%'
  },
  starImageStyle: {
    alignSelf: 'center',
    marginStart: 3,
    width: 20,
    height: 20,
    marginBottom: IF_OS_IS_IOS ? 8 : 0
  },
  totalAmountViewStyle: {
    height: 40,
    backgroundColor: APP_COLOR_WHITE,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 0.5
  },
  totalTextStyle: {
    fontFamily: DINENGSCHRIFT_BOLD,
    color: APP_COLOR_BLACK,
    fontSize: 16
  },
  subsection: {
    padding: 20,
    paddingBottom: 5
  },
  footer: { backgroundColor: APP_COLOR_WHITE, width: SCREEN_WIDTH }
};

function mapStateToProps(state) {
  const { LevelName, CustomerId } = getUserObject(state);
  const addresses = getUserAddresses(state);
  const { userType, currency, hasFreeStarter = 0 } = state.app;
  const { cartItemsArray, promoObject, cartPromos = [] } = state.cart;
  const {banners, extraCharage}= state.home;
 const {
   deliverydetails: {
     minimumAmount: minimumAmount,
   }
 }=state
  return {
    CustomerId,
    LevelName,
    addresses,
    userType,
    currency,
    cartPromos,
    promoObject,
    cartItemsArray,
    loadingState: state.app.loading,
    vouchers: state.vouchers.vouchersDelivery,
    hasFreeStarter,
    starters: state.cart.startersItems,
    banners,
    extraCharage,
    minimumAmount
  };
}
const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      ...actions,
      ...squadActions,
      ...vouchersActions,
      ...deliveryDetailsAction
    },
    dispatch
  )
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(YourCart);
