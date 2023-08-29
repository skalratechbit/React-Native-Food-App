import React, { Component } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ScrollView
} from 'react-native';
import {CachedImage} from 'react-native-img-cache';
import { Button } from 'native-base';
import { bindActionCreators } from 'redux';
import { Actions } from 'react-native-router-flux';
import _ from 'lodash';
import { connect } from 'react-redux';
import { numberWithCommas } from '../../config/common_functions';
import {BURGER, CHIPS, DOUBLE_STARS, LOGO_BRAND_IMAGE} from '../../assets/images';
import { APP_COLOR_RED, APP_COLOR_WHITE, APP_COLOR_BLACK } from '../../config/colors';
import FavButton from '../../components/FavButton';
import Common from '../../components/Common';
import {
  DINENGSCHRIFT_REGULAR,
  ROADSTER_REGULAR,
  HELVETICANEUE_LT_STD_CN,
  DINENGSCHRIFT_LIGHT,
  DINENGSCHRIFT_BOLD
} from '../../assets/fonts';
import strings from '../../config/strings/strings';
import {
  COMMON_BUTTON_STYLE,
  COMMON_BUTTON_RADIOUS,
  COMMON_BUTTON_TEXT_STYLE,
  IF_OS_IS_IOS,
  FONT_SCALLING
} from '../../config/common_styles';
import { actions as categoriesActions } from '../../ducks/categories';
import { actions as cartActions } from '../../ducks/cart';
import { actions as homeActions } from '../../ducks/home';
import { getUserObject } from '../../helpers/UserHelper';
import { getThemeByLevel } from '../../config/common_styles/appthemes';

const ITEMS_MARGIN = 5;
// const IMAGE_CELL_HEIGHT = 177;
const IMAGE_CELL_HEIGHT = 167;
const TITLE_MARGIN = 13;
const ITEM_TITLE_TEXT_SIZE = 21;
const ITEM_TITLE_TEXT_MARGINS = 20;
const ITEM_TITLE_TEXT_WIDTH = 180;
const ADD_REMOVE_BUTTON_CELL_HEIGHT = 57.5;
const BOTTOM_BUTTON_CELL_HEIGHT = 57.5;

const ourMenuList = [
  {
    id: 0,
    title: 'Swiss Truffle',
    instructions: 'More Cheese, Remove Caramalized Onions, More Herb Sauce, Cut in Half.',
    extras: 'Sauteed Mushroom',
    price: '25,750',
    extras_price: '2,000',
    quantity: 2,
    cat: 'Starters',
    image: BURGER,
    total: '53,500'
  },
  {
    id: 1,
    title: 'Potato Dippers',
    instructions: 'More Cheese, Remove Caramalized Onions, More Herb Sauce, Cut in Half.',
    extras: '',
    price: '9,750',
    extras_price: 0,
    quantity: 2,
    cat: 'Starters',
    image: CHIPS,
    total: '9,750'
  }
];

class YourCartListItem extends Component {
  constructor(props) {
    super(props);
    const { LevelName } = props;
    this.state = {
      componentTheme: getThemeByLevel(LevelName),
      itemsArray: [],
      showAddToFavorite: false,
      favedItem: {},
      favAdded: false,
      itemPrice:[],
      itemDiscount:[],
    };
  }

  componentDidMount() {
    //favorites
    this.props.getFavorites();
    this.calculateItemPromo();
  }

  onPress = (event, caption, id, index) => {
    const {itemPrice}=this.state;


    switch (caption) {
      case strings.PLUS:
        var array = this.props.cartItemsArray.slice();
        var selectedObject = array[index];
        console.log(index);
        selectedObject['quantity'] = selectedObject['quantity'] + 1;

        if( itemPrice && itemPrice.length>0 && itemPrice[index] && (itemPrice[index].ID===array[index].ID))
        {
          itemPrice[index].itemAmount=itemPrice[index].Price*selectedObject['quantity']

        }
        else if(itemPrice && itemPrice.length>0 && itemPrice[index] && itemPrice[0].ID===array[index].ID){
          itemPrice[0].itemAmount=itemPrice[0].Price*selectedObject['quantity']
        }
        console.log(itemPrice);

        this.setState({itemPrice:itemPrice})
        this.props.additmeToCart(array);
        break;

      case strings.MINUS:
        var array = this.props.cartItemsArray.slice();
        var selectedObject = array[index];
        if (selectedObject['quantity'] - 1 == 0) {
          this.deleteCartItem(index);
        } else {
          selectedObject['quantity'] = selectedObject['quantity'] - 1;
          this.props.additmeToCart(array);
        }
        break;

      case strings.EDIT_ORDER:
        this.editOrder(index);
        break;

      case strings.DELETE:
        this.deleteCartItem(index);
        break;

      default:
    }
  };


  componentWillReceiveProps(nextProps) {

    if(this.props.promoObject!==null && nextProps.promoObject!==this.props.promoObject){
      this.setState({itemPrice:[]})
    }
    var cartArray = [];
    cartArray = _.cloneDeep(nextProps.cartItemsArray);
    this.calculateItemPromo(nextProps.promoObject);
    this.setRowIndexOfCartItems(cartArray);
    this.props.setTotalAmount(cartArray);

    //favorites
    const { showAddToFavorite } = this.state;
    const {
      favorites,
      favoriteDeleted: oldFavoriteDeleted,
      favoriteSaved: oldFavoriteSaved
    } = this.props;
    const { favoriteDeleted, favoriteSaved } = nextProps;
    const deletedSuccess = this.props.favoriteDeleted !== favoriteDeleted && favoriteDeleted;
    const deletedError =
      this.props.favoriteDeleted !== favoriteDeleted && favoriteDeleted === false;
    const savedSuccess = this.props.favoriteSaved !== favoriteSaved && favoriteSaved;
    const savedError = this.props.favoriteSaved !== favoriteSaved && favoriteSaved === false;
    if (savedSuccess && favorites.length < nextProps.favorites.length) {
      this.setState({
        favAdded: true,
        showAddToFavorite: true
      });
    }
  }
  calculateItemPromo(promoObj){

    const {promoObject}=this.props;
    const {itemPrice}=this.state;
    const { DiscountType, PromoTitle = '', DiscountValue = 0, Categories = [], Items = [],PromoLabel='' } = promoObj || [];
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
    else {
  this.props.setPromoCode('')
      }
    }
    if(items.length) {
      // discount per item price (percentage | amount)
      let discountAmount = 0;
      let promoItems=[]
      items.map((item, index) => {
        console.log(item.DiscountType);
      if(item[0] && item[0].ID) {
           let itemAmount = parseInt(item[0].Price);
            let loc = this.returnCartIndex(item[0].ID)
           switch (item.DiscountType) {
             case 'amount':
                discountAmount += item.Price - promoDiscount;
                break;
            case 'percentage':
              const multiplier = parseInt(item.DiscountValue) / 100;
              discountAmount += item[0].Price * multiplier;
              itemAmount = itemAmount - discountAmount
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
  hasItemsForPromo (itemId) {

    const { cartItemsArray } = this.props;
    return cartItemsArray.filter( item => item.PLU == itemId  );
  }
  getPromoItems(items){
    const {itemPrice}=this.state;
    return itemPrice && itemPrice.length>0 && itemPrice.filter(item=>item.ID===items.ID)
  }
  returnCartIndex(itemId){
    const { cartItemsArray } = this.props;
    return cartItemsArray.findIndex( item => item.ID == itemId  );

  }
  hasCategoryItemsForPromo (categoryId) {
    const { cartItemsArray } = this.props;
    return cartItemsArray.filter( item => item.CategoryId == categoryId );
  }
  setRowIndexOfCartItems(items) {
    for (var i = 0; i < items.length; i++) {
      items[i]['rowIndex'] = i;
    }
    this.setState({ itemsArray: items });
  }
  componentWillMount() {
    this.setRowIndexOfCartItems(this.props.cartItemsArray);
  }
  renderDiscountView(itemData){
    const data=this.getPromoItems(itemData);
   console.log("Items Data",data);
    if(data && data.length>0 &&  data[0].ID){
      return(
          <Text style={styles.priceTextStyle}>
        {"-"+ numberWithCommas((data[0].discountAmount), this.props.currency)}
      </Text>
      )
    }
}
  checkCustomizedItmeExist(item) {
    if (item.Modifiers) {
      for (var i = 0; i < item.Modifiers.length; i++) {
        const ModifierObject = item.Modifiers[i];

        if (ModifierObject.details.items) {
          for (var j = 0; j < ModifierObject.details.items.length; j++) {
            const itemObj = ModifierObject.details.items[j];

            if (itemObj.Selected == 1 && itemObj.Quantity > 0) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  checkModifiersExsist(item) {
    if (item.Modifiers.length>0) {
      return true;
    } else return false;
  }

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
  getExtraTextView(item) {
    if (this.checkCustomizedItmeExist(item)) {
      return (
        <View style={styles.detailRowContainerStyle}>
          <View style={styles.instructionsContainerStyle}>
            <Text allowFontScaling={FONT_SCALLING} style={styles.extrasHeadingTextStyle}>
              {strings.EXTRAS.toUpperCase()}
            </Text>
          </View>
        </View>
      );
    }
  }
  getFreeItemsArray(item) {
    const freeItemAarray = [];
    let itemDetail = {};
    if (item.Modifiers) {
      for (let i = 0; i < item.Modifiers.length; i++) {
        const object = item.Modifiers[i];
        if (object.details) itemDetail = object.details;
        if (object?.details?.items) {
          for (let j = 0; j < object?.details?.items.length; j++) {
            if (
              object.details.items[j].Selected == 1 &&
              object.details.items[j].Quantity > 0 &&
              object.details.items[j].Price == 0
            ) {
              object.details.items[j]['CategoryName'] = itemDetail.CategoryName;
              object.details.items[j]['CategoryPrefix'] = itemDetail.CategoryPrefix;
              freeItemAarray.push(object.details.items[j]);
            }
          }
        }
      }
    }

    return freeItemAarray;
  }
  getFreeItems(item) {
    var array = this.getFreeItemsArray(item);
    return (
      <View style={{ flexDirection: 'row', marginEnd: 0, flexWrap: 'wrap' }}>
        {array.map((object, i) => {
          const notLast = i < array.length - 1;
          return (
            <View key={i}>
              <Text allowFontScaling={FONT_SCALLING} style={[styles.instructionsTextStyle]}>
                {`${object.CategoryPrefix && object.CategoryPrefix} `}
                {object.ModifierName.replace(/ *$/, '') + (notLast ? ', ' : '')}
              </Text>
            </View>
          );
        })}
      </View>
    );
  }
  getCustomizeItems(item) {
    // object.items&&
    // item.Modifiers

    var showExtraTextView = 0;
    return (
      <View style={{ flex: 1 }}>
        {item.Modifiers &&
          item.Modifiers.map(
            (object, i) =>
              object.details.items &&
              object.details.items.map((obj, j) => (
                <View key={j} style={{ flex: 1 }}>
                  {obj.Selected == 1 &&
                    obj.Quantity > 0 &&
                    obj.Price > 0 && (
                      <View>
                        <View
                          style={[
                            styles.detailRowContainerStyle,
                            { justifyContent: 'center', alignItems: 'center', marginBottom: 0 }
                          ]}>
                          <View
                            style={[styles.instructionsContainerStyle, { flexDirection: 'row' }]}>
                            <Text
                              allowFontScaling={FONT_SCALLING}
                              style={styles.instructionsTextStyle}>
                              {object.details.CategoryPrefix &&
                              object.details.CategoryPrefix == 'No'
                                ? object.details.CategoryPrefix + ' ' + obj.ModifierName
                                : obj.ModifierName}
                            </Text>
                            <Text
                              allowFontScaling={FONT_SCALLING}
                              style={[styles.instructionsTextStyle, { marginStart: 10 }]}>
                              ({obj.Quantity})
                            </Text>
                          </View>

                          <View style={[styles.priceContainerStyle]}>
                            <Text
                              allowFontScaling={FONT_SCALLING}
                              style={[styles.priceTextStyle, { height: 20 }]}>
                              {numberWithCommas(obj.Price * obj.Quantity, this.props.currency)}
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

  getSingalItemTotalPirce_Inluding_CustomizedItems(item) {

    return (
      (parseInt(item.DiscountedPrice || item.Price) +
      this.getCustomizeItemsPrice(item)) * parseInt(item.quantity)
    );
  }

  deleteCartItem(rowId) {
    var array = this.state.itemsArray.slice();
    var filteredArray = array.filter(obj => obj.rowIndex != rowId);

    this.props.additmeToCart(filteredArray);
    if (filteredArray.length == 0) {
      if (this.props.userType == 'login') {
        this.props.fetchUserOrdersCount();
      } else {
        this.props.fetchMeals();
      }
      // Reset promo code status
      this.props.setPromoCode('');

      Actions.drawer({ type: 'reset' });
      Actions.ourmenu();
    }
  }

  editOrder(rowId) {
    this.props.setSelectedObjectOfToCartViewIn(this.props.cartItemsArray[rowId]);
    Actions.customize({ editing: true });
  }

  findItemById(id) {
    const faves = {};
    const { favorites } = this.props;
    for (let i = 0; i < favorites.length; i++) {
      faves[favorites[i].ID] = favorites[i];
    }
    return faves[id];
  }

  //handlers
  handleAddToFavorites = item => {
    this.showAddToFavorite(item);
  };

  handleCloseAddToFavorite = () => {
    const { favedItem } = this.state;
    const { favorites } = this.props;
    this.setState({
      favedItem: {},
      showAddToFavorite: false
    });
  };

  showAddToFavorite = item => {
    const { favorites } = this.props;
    const state = {};
    const hasFavorite = this.findItemById(item.ID);
    if (!hasFavorite) {
      state.favedItem = { ...item };
      state.favedItem.favoriteName = item.ItemName.toUpperCase();
      state.showAddToFavorite = true;
    } else {
      this.props.deleteFavorite(hasFavorite?.ID);
    }
    this.setState(state);
  };

  handleFavedNameChange = favoriteName => {
    const { favedItem } = this.state;
    favedItem.favoriteName = favoriteName;
    this.setState({
      favedItem
    });
  };

  handleSetFavName = () => {
    const { favedItem } = this.state;
    const { favorites } = this.props;
    if (favedItem.favoriteName.trim().length) {
      this.setState(
        {
          showAddToFavorite: false
        },
        () => {
          this.props.saveFavorite({
            item_id: favedItem.ID,
            item_data: JSON.stringify(favedItem)
          });
        }
      );
    }
  };

  handleFavAddedConfirmation = () => {
    this.setState({
      showAddToFavorite: false,
      favAdded: false,
      favedItem: {}
    });
  };

  // renderers
  renderFavoriteNameInput() {
    const { linedInput, addToFavButton, addToFavButtonText, addToFavContainer } = styles;
    const {
      componentTheme: { thirdColor },
      favedItem: { favoriteName = '' }
    } = this.state;
    const textStyle = { color: thirdColor, borderBottomColor: thirdColor };
    const themedBackground = { backgroundColor: thirdColor };
    return (
      <View style={addToFavContainer}>
        <Common.SlimInput
          style={[linedInput, textStyle]}
          value={favoriteName}
          textAlign="center"
          onChangeText={this.handleFavedNameChange}
          placeholder={strings.ENTER_FAVORITE_NAME}
        />
        <Common.Button
          style={[addToFavButton, themedBackground]}
          onPress={this.handleSetFavName}
          color={thirdColor}>
          <Text style={addToFavButtonText} allowFontScaling={FONT_SCALLING}>
            {strings.ADD_FAVORITE.toUpperCase()}
          </Text>
        </Common.Button>
      </View>
    );
  }

  renderFavoriteAdded() {
    const { addToFavButton, addToFavButtonText, addToFavContainer } = styles;
    const {
      componentTheme: { thirdColor }
    } = this.state;
    const themedBackground = { backgroundColor: thirdColor };
    return (
      <View style={addToFavContainer}>
        <Common.Button
          style={[addToFavButton, themedBackground]}
          onPress={this.handleFavAddedConfirmation}
          color={thirdColor}>
          <Text style={addToFavButtonText} allowFontScaling={FONT_SCALLING}>
            {strings.OK.toUpperCase()}
          </Text>
        </Common.Button>
      </View>
    );
  }

  //renderers
  renderTotalAmountView() {}

  renderCartItem = (item, index) => {
    const {
      listItemContainer,
      backgroundImageStyle,
      listItemTitleTextStyle,
      bottomContainerStyle,
      detailRowContainerStyle,
      priceContainerStyle,
      priceTextStyle,
      totalContainerStyle,
      plusTextStyle,
      quantityTextStyle,
      totalAmountTextStyle,
      itemBottomButtonStyle,
      minusViewStyle,
      cartItemsButtonContainerStyle,
      priceViewStyle,
      cartItemTopViewStyle,
      favoriteButton,
      promoTags,
      doubleStarsTag,
      discountTag
    } = styles;
    const {
      componentTheme,
      componentTheme: { thirdColor },
      itemPrice,
        itemDiscount
    } = this.state;

    const { favorites, } = this.props;
    const isActive = this.findItemById(item.ID);
    const isFree = item.Free === 1
    const renderFav = !isFree
    return (
      <View style={listItemContainer} key={index}>
        <View style={[cartItemTopViewStyle, { backgroundColor: thirdColor }]} />
        { renderFav ? (
          <FavButton
            item={item}
            theme={componentTheme}
            active={isActive}
            style={favoriteButton}
            onPress={this.handleAddToFavorites}
          />
      ) : null}
        {item.DetailsImg!==null ? <CachedImage
          resizeMode={'cover'}
          style={backgroundImageStyle}
          source={{ uri: item.DetailsImg ||''}}
        />:
            <CachedImage style={{ width:item.ItemName.length>20?"30%" :"40%",
              height: IMAGE_CELL_HEIGHT,
              alignSelf:'center',
              marginTop:item.ItemName.length>20?30:15
           }} source={LOGO_BRAND_IMAGE}  resizeMode='contain' />
        }
        <Text allowFontScaling={FONT_SCALLING} style={listItemTitleTextStyle}>
          {(item.ItemName || '').toUpperCase()}
        </Text>
        <View style={promoTags}>
        {
          item.DiscountUrl
          ? (
            <CachedImage
              source={{ uri: item.DiscountUrl }}
              resizeMode='contain'
              style={discountTag} />
          )
          : null
        }
        {
          item.FeaturedStars
          ? <CachedImage
              source={DOUBLE_STARS}
              resizeMode='contain'
              style={doubleStarsTag} />
          : null
        }
        </View>
        <View style={bottomContainerStyle}>
          <View style={detailRowContainerStyle}>
            <View style={{ flexWrap: 'wrap', width: '76%' }}>
              {this.getFreeItems(item)}
            </View>
            <View style={[priceContainerStyle]}>
              <Text allowFontScaling={FONT_SCALLING} style={priceTextStyle}>
                 {numberWithCommas((item.DiscountedPrice*item.quantity) || (item.Price*item.quantity), this.props.currency)}
              </Text>
              {this.renderDiscountView(item)}
            </View>
          </View>
          {this.getExtraTextView(item)}
          {this.getCustomizeItems(item)}
        </View>
        <View style={totalContainerStyle}>
          <View
            style={[
              detailRowContainerStyle,
              {
                alignItems: 'center',
                marginStart: -10,
                marginTop: 10,
                marginBottom: 10
              }
            ]}>
            {item.Free && item.Free == 1 ? (
              <View style={{ width: '50%', flexDirection: 'row', justifyContent: 'flex-start' }}>
                <TouchableOpacity
                  style={{
                    width: 40,
                    height: 32,
                    borderRadius: 10,
                    alignItems: 'flex-end',
                    marginRight: 4,
                    justifyContent: 'center'
                  }}
                />
              </View>
            ) : (
              <View style={{ width: '50%', flexDirection: 'row', justifyContent: 'flex-start' }}>
                <TouchableOpacity
                  style={{
                    width: 40,
                    height: 32,
                    borderRadius: 10,
                    alignItems: 'flex-end',
                    marginRight: 4,
                    justifyContent: 'center'
                  }}
                  onPress={event => this.onPress(event, strings.MINUS, item.ID, item.rowIndex)}>
                  <View style={minusViewStyle} />
                </TouchableOpacity>
                <View style={priceViewStyle}>
                  <Text allowFontScaling={FONT_SCALLING} style={quantityTextStyle}>
                    {item.quantity}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={event => this.onPress(event, strings.PLUS, item.ID, item.rowIndex)}
                  style={{
                    width: 40,
                    height: 32,
                    alignItems: 'flex-start',
                    justifyContent: 'center'
                  }}>
                  <Text allowFontScaling={FONT_SCALLING} style={plusTextStyle}>
                    {strings.PLUS}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={[priceContainerStyle, { width: '50%', alignSelf: 'center' }]}>
              <Text allowFontScaling={FONT_SCALLING} style={totalAmountTextStyle}>
                {numberWithCommas(
                  this.getSingalItemTotalPirce_Inluding_CustomizedItems(item),
                  this.props.currency
                )}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ width: '100%', height: 0.5, backgroundColor: APP_COLOR_RED }} />
        <View style={cartItemsButtonContainerStyle}>
          <Button
            onPress={event => this.onPress(event, strings.DELETE, item.ID, index)}
            style={[itemBottomButtonStyle, { backgroundColor: thirdColor }]}>
            <Text
              allowFontScaling={FONT_SCALLING}
              style={[
                COMMON_BUTTON_TEXT_STYLE,
                {
                  fontFamily: DINENGSCHRIFT_BOLD,
                  fontSize: 15,
                  // marginTop: IF_OS_IS_IOS ? 3 : 0
                }
              ]}>
              {strings.DELETE.toUpperCase()}
            </Text>
          </Button>
          {this.checkModifiersExsist(item) && (
            <Button
              onPress={event => this.onPress(event, strings.EDIT_ORDER, item.ID, index)}
              style={[itemBottomButtonStyle, { backgroundColor: thirdColor }]}>
              <Text
                allowFontScaling={FONT_SCALLING}
                style={[
                  COMMON_BUTTON_TEXT_STYLE,
                  {
                    fontFamily: DINENGSCHRIFT_BOLD,
                    fontSize: 15,
                    // marginTop: IF_OS_IS_IOS ? 3 : 0
                  }
                ]}>
                {strings.CUSTOMIZE_ITEM.toUpperCase()}
              </Text>
            </Button>
          )}
        </View>
      </View>
    );
  };

  render() {
    const { container } = styles;
    const {
      componentTheme: { thirdColor },
      itemsArray,
      showAddToFavorite,
      favAdded
    } = this.state;
    const favPopUpTitle = strings['FAVORITE_' + (favAdded ? 'ADDED' : 'NAME')];
    const favPopUpBody = this[favAdded ? 'renderFavoriteAdded' : 'renderFavoriteNameInput']();

    return (
      <ScrollView style={[container, { backgroundColor: thirdColor }]} bounces={false}>
        {/* FAVORITES POPUP */}
        <Common.Popup
          onClose={this.handleCloseAddToFavorite}
          color={thirdColor}
          visibilty={showAddToFavorite}
          hideCross={favAdded}
          heading={favPopUpTitle.toUpperCase()}
          customBody={favPopUpBody}
        />
        {itemsArray.map(this.renderCartItem)}
      </ScrollView>
    );
  }
}

const styles = {
  container: { flex: 1 },
  cartItemTopViewStyle: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 4,
    backgroundColor: APP_COLOR_RED,
    zIndex: 1
  },
  priceViewStyle: {
    width: 41.5,
    height: 35,
    backgroundColor: APP_COLOR_WHITE,
    borderRadius: 10,
    marginLeft: 5,
    marginRight: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cartItemsButtonContainerStyle: {
    height: 'auto',
    width: '100%',
    backgroundColor: APP_COLOR_BLACK,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 15,
    paddingBottom: 15,
    justifyContent: 'space-between'
  },
  listItemContainer: {
    flexDirection: 'column',
    marginLeft: 0,
    paddingLeft: 0,
    paddingRight: 0,
    marginRight: 0,
    marginTop: 0,
    paddingTop: 0,
    marginBottom: -1
  },
  backgroundImageStyle: {
    width: '100%',
    height: IMAGE_CELL_HEIGHT
    //resizeMode: 'contain'
  },
  listItemTitleTextStyle: {
    alignSelf: 'flex-start',
    position: 'absolute',
    color: APP_COLOR_WHITE,
    marginLeft: 20,
    marginTop: ITEM_TITLE_TEXT_MARGINS,
    width: ITEM_TITLE_TEXT_WIDTH,
    fontSize: ITEM_TITLE_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_BOLD
  },
  bottomContainerStyle: {
    backgroundColor: APP_COLOR_BLACK,
    width: '100%',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20
  },
  detailRowContainerStyle: {
    flexDirection: 'row',
    marginBottom: 6,
    marginTop: 0
  },
  instructionsContainerStyle: {
    width: '75%'
  },
  instructionsTextStyle: {
    fontSize: 14,
    fontFamily: DINENGSCHRIFT_LIGHT,
    color: APP_COLOR_WHITE
  },
  priceContainerStyle: {
    backgroundColor: APP_COLOR_BLACK,
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '25%'
  },
  priceTextStyle: {
    fontSize: 14,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_WHITE
  },
  extrasHeadingTextStyle: {
    fontSize: 18,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_WHITE
  },
  totalContainerStyle: {
    backgroundColor: APP_COLOR_BLACK,
    height: ADD_REMOVE_BUTTON_CELL_HEIGHT,
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 0,
    width: '100%'
  },
  plusTextStyle: {
    fontSize: 18,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    color: APP_COLOR_WHITE,
    fontWeight: '400',
    paddingTop: IF_OS_IS_IOS ? 5 : 0,
    marginLeft: 2,
    marginBottom: IF_OS_IS_IOS ? 0 : 6
  },
  minusViewStyle: {
    backgroundColor: APP_COLOR_WHITE,
    width: 10,
    height: 1.5,
    marginStart: 3
  },
  quantityTextStyle: {
    fontSize: 16,
    alignSelf: 'center',
    fontFamily: HELVETICANEUE_LT_STD_CN,
    color: APP_COLOR_BLACK,
    paddingTop: IF_OS_IS_IOS ? 5 : 0
  },
  totalAmountTextStyle: {
    fontSize: 20,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_WHITE
  },
  itemBottomButtonStyle: {
    backgroundColor: APP_COLOR_RED,
    alignSelf: 'center',
    width: 152,
    height: 32,
    alignItems: 'center',
    paddingBottom: 8,
    justifyContent: 'center',
    borderRadius: COMMON_BUTTON_RADIOUS
  },
  favoriteButton: {
    right: 23
  },
  linedInput: {
    borderBottomWidth: 1,
    borderBottomColor: APP_COLOR_RED,
    color: APP_COLOR_RED,
    fontFamily: DINENGSCHRIFT_REGULAR,
    fontSize: 16,
    fontWeight: 'bold'
  },
  addToFavButton: {
    ...COMMON_BUTTON_STYLE,
    paddingTop: 5,
    marginTop: 20
  },
  addToFavButtonText: {
    ...COMMON_BUTTON_TEXT_STYLE,
    fontFamily: ROADSTER_REGULAR,
    fontSize: 18
  },
  addToFavContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 30
  },
  promoTags: {
    flexDirection: 'row',
    position: 'absolute',
    zIndex: 8,
    left: 15,
    top: 90,
    justifyContent: 'space-between'
  },
  doubleStarsTag: {
    width: 60,
    height: 60
  },
  discountTag: {
    width: 60,
    height: 60
  }
};

function mapStateToProps(state) {
  const { LevelName } = getUserObject(state);
  const {
    app: { userType, currency },
    cart: { cartItemsArray, favorites, favoriteDeleted, favoriteSaved,promoObject }
  } = state;

  return {
    favoriteDeleted,
    favoriteSaved,
    favorites,
    LevelName,
    cartItemsArray,
    userType,
    currency,
    promoObject
  };
}
const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      ...cartActions,
      ...categoriesActions,
      ...homeActions
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(YourCartListItem);
