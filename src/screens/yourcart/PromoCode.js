import React, { Component } from 'react';
import {View, StyleSheet} from 'react-native';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import { connect } from 'react-redux';
import { numberWithCommas } from '../../config/common_functions';
import { APP_COLOR_RED, APP_COLOR_WHITE, APP_COLOR_BLACK } from '../../config/colors';
import Common from '../../components/Common';
import {
  DINENGSCHRIFT_REGULAR,
  ROADSTER_REGULAR,
} from '../../assets/fonts';
import strings from '../../config/strings/strings';
import {
  COMMON_BUTTON_TEXT_STYLE,
  IF_OS_IS_IOS,
  SCREEN_WIDTH
} from '../../config/common_styles';
import { actions as cartActions } from '../../ducks/cart';
import { getUserObject } from '../../helpers/UserHelper';
import { getThemeByLevel } from '../../config/common_styles/appthemes';

const { Button, Text, SlimInput } = Common;

class PromoCode extends Component {
  constructor(props) {
    super(props);
    const { LevelName } = props;
    this.state = {
      componentTheme: getThemeByLevel(LevelName),
      promoInput: '',
      clearable: false,
      showNonApplicablePromo:false,
      isValid:true
    };
  }

  componentDidMount () {}

  componentWillReceiveProps (nextProps) {
    const { promoValidated, promoObject } = nextProps;
    const { prevPromoValidated } = this.props;
    const {promoInput}=this.state
    const promoInvalidated =
      prevPromoValidated !== promoValidated && promoValidated === false;
    const promoDidValidate =
      prevPromoValidated !== promoValidated && promoValidated === true;
    if (promoInvalidated && promoInput!=='') {
      this.setState({
        showNonApplicablePromo: true,
        promoInput: '',
        clearable: true
      });
    }
    if(promoDidValidate) {
      this.props.setTotalAmount();
    }
  }

  // handlers
  handleApplyPress = () => {

    const { promoInput } = this.state;
    const {cartItemsArray,totalAmount} = this.props;
    let formData = new FormData();
    formData.append('Coupons',promoInput);
    formData.append('TotalAmount',totalAmount);
    cartItemsArray.map((data,modIndex)=>{
      formData.append('Items[' + (modIndex) + '][PLU]', data.PLU);
      formData.append('Items[' + (modIndex) + '][Category]', data.CategoryId);
      formData.append('Items[' + (modIndex) + '][Price]', data.Price);
    });

    this.props.validatePromo(formData);
  }

  handlePromoChange = promoInput => {
    this.setState({
      promoInput
    });
  }

  handleInputFocus = () => {
    const { clearable } = this.state;
    const { onFocus } = this.props;

    if(clearable) {
      this.setState({ promoInput: '', clearable: false });
    }

    if(onFocus) { onFocus(); }
  }

  hasItemsForPromo (itemId) {

    const { cartItemsArray } = this.props;
    return cartItemsArray.filter( item => item.PLU == itemId  );
  }

  hasCategoryItemsForPromo (categoryId) {
    const { cartItemsArray } = this.props;
    return cartItemsArray.filter( item => item.CategoryId == categoryId );
  }

  // renderers
  renderCodeInput() {
    const {
      promoInput,
      componentTheme: { thirdColor }
    } = this.state;
    return (
      <View style={styles.inputContainer}>
        <SlimInput
          value={promoInput}
          onChangeText={this.handlePromoChange}
          style={styles.input}
          onFocus={this.handleInputFocus}
          placeholder={strings.PROMO_CODE}
        />
        <Button
          color={thirdColor}
          style={styles.button}
          placeholder={strings.PROMO_CODE}
          onPress={this.handleApplyPress}>
          <Text style={styles.applyText}>{strings.APPLY}</Text>
        </Button>
      </View>
    );
  }
  handleHidePromoWarning = () => this.setState({ showNonApplicablePromo: false,isValid:false });

  renderNonApplicablePromo(color) {
    const { showNonApplicablePromo,isValid } = this.state;
    return (
        <Common.Popup
            onClose={this.handleHidePromoWarning}
            color={color}
            visibilty={showNonApplicablePromo && isValid}
            heading='WHOOPS!'
            subbody='INVALID PROMO CODE'
        />
    );
  }
  renderPromoCodeView() {
    const { promoValidated, currency, promoObject } = this.props;
    const { PromoTitle, DiscountType, Discount, PromoCode, Categories = [], Items = [],PromoLabel,DiscountValue,DiscountedItemPrice } = promoObject;
    const isCategoryPromo = Categories.length;
    const isItemPromo = Items.length;

    const promoDiscount = parseInt(DiscountValue||0);
    const isPercentage = DiscountType === 'percentage';
    const promoText = (PromoLabel || `${PromoLabel||''}`).toUpperCase();
    const renderItemPromo = isCategoryPromo || isItemPromo;
    const renderCartPromo = !renderItemPromo;
    let items = [];
    if(renderItemPromo) {
      if(isCategoryPromo) items = this.hasCategoryItemsForPromo(Categories[0]['ItemId']);
      if(isItemPromo) {
        for (let k = 0; k < Items.length; k++) {
          // items = this.hasItemsForPromo(Items[k]['PLU']);
          items.push(this.hasItemsForPromo(Items[k] && Items[k]['PLU']))
          items[k].DiscountType = Items[k]['DiscountType']
          items[k].DiscountValue = Items[k]['DiscountValue']

        }
      }
    }

    // no valid promo

    if(!promoValidated || (renderItemPromo && !items.length)) return this.renderCodeInput();
    if(items.length && items[0][0]===undefined){

      return this.renderCodeInput();
    }
    // render item based promos
    let discountAmount = 0;
    let itemDiscount=0;
    if(items.length) {

      items.map(item => {


          if (isPercentage) {
            const multiplier = promoDiscount / 100;
            discountAmount += (item[0] && item[0].Price * item[0].quantity) * multiplier;
            itemDiscount += (item[0] && (item[0].Price * item[0].quantity) * multiplier);

          } else {
            discountAmount += item.Price - promoDiscount;
            itemDiscount=itemDiscount
          }

      });
      if(isNaN(itemDiscount) || itemDiscount==='NaN' || itemDiscount===0){
        return this.renderCodeInput();
      }

      return (
        <View style={styles.promoContainer}>
          <Text style={styles.promoCode}>{promoText}:</Text>
          <Text style={styles.promoDiscount}>-{itemDiscount===0 ? numberWithCommas(DiscountedItemPrice, currency):numberWithCommas(itemDiscount, currency)}</Text>
        </View>
      );
    }

    // render cart based promos
    return (
      <View style={styles.promoContainer}>
        <Text style={styles.promoCode}>{promoText}:</Text>
        <Text style={styles.promoDiscount}>-{numberWithCommas(promoDiscount, isPercentage ? '%' : currency)}</Text>
      </View>
    );
  }

  render() {
    const {
      componentTheme: { thirdColor }
    } = this.state;
    styles = getStyles(thirdColor);

    return (
      <View style={styles.container}>
        {this.renderPromoCodeView()}
        {this.renderNonApplicablePromo(thirdColor)}
      </View>
    );
  }
}
const baseText = {
  fontSize: 20,
  fontFamily: DINENGSCHRIFT_REGULAR
};
let styles;
function getStyles(color = APP_COLOR_RED) {
  return StyleSheet.create({
    container: {
      width: '100%',
      flexDirection: 'column'
    },
    inputContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 10,
      alignItems: 'center'
    },
    input: {
      color: color,
      width: SCREEN_WIDTH - 100 - 60,
      height: 28,
      borderRadius: 7,
      fontFamily: DINENGSCHRIFT_REGULAR,
      lineHeight: IF_OS_IS_IOS ? 18 : null
    },
    button: {
      backgroundColor: APP_COLOR_BLACK,
      padding: 5,
      paddingTop: 3,
      paddingLeft: 10,
      paddingRight: 10,
      width: 100,
      height: 30,
      justifyContent: IF_OS_IS_IOS ? 'flex-start' : 'center',
      alignItems: 'center'
    },
    applyText: {
      ...COMMON_BUTTON_TEXT_STYLE,
      fontFamily: ROADSTER_REGULAR,
      color: APP_COLOR_WHITE,
      fontSize: 20,
      lineHeight: IF_OS_IS_IOS ? 20 : 23
    },
    promoContainer: {
      marginTop: -6,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 0
    },
    promoCode: {
      ...baseText,
      width:"70%"
    },
    promoDiscount: {
      ...baseText,
    }
  });
}

function mapStateToProps(state) {
  const { LevelName } = getUserObject(state);
  const {
    app: { userType, currency },
    cart: { promoValidated, promoObject, cartItemsArray,totalAmount },
  } = state;

  return {
    cartItemsArray,
    promoObject,
    promoValidated,
    LevelName,
    userType,
    currency,
    totalAmount
  };
}
const mapDispatchToProps = dispatch => ({
  ...bindActionCreators({ ...cartActions }, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PromoCode);
