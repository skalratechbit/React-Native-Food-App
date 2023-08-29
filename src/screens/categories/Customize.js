import { Container, Button } from 'native-base';
import React, { Component } from 'react';
import { Actions } from 'react-native-router-flux';
import {
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  BackHandler
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { CachedImage } from 'react-native-img-cache';
import { numberWithCommas } from '../../config/common_functions';
import {
  TRANSPARENT_COLOR,
  APP_COLOR_RED,
  APP_COLOR_WHITE,
  APP_COLOR_BLACK
} from '../../config/colors';
import {
  DINENGSCHRIFT_REGULAR,
  HELVETICANEUE_LT_STD_CN,
  ROADSTER_REGULAR,
  PACIFICO,
  DINENGSCHRIFT_BOLD
} from '../../assets/fonts';
import {
  RIGHT_ARROW_LARGE_WHITE,
  FILLED_DROP_DOWN_ARROW,
  DOUBLE_STARS
} from '../../assets/images';
import {
  COMMON_BUTTON_RADIOUS,
  COMMON_BUTTON_TEXT_STYLE,
  COMMON_BUTTON_STYLE,
  IF_OS_IS_IOS,
  FONT_SCALLING
} from '../../config/common_styles';
import strings from '../../config/strings/strings';
import { connect } from 'react-redux';
import { actions as cartActions } from '../../ducks/cart';
import ModalSelector from 'react-native-modal-selector';
import { AppEventsLogger } from 'react-native-fbsdk';
import _ from 'lodash';
import ExtraPopUp from '../deliverydetails/ExtraPopUp';
import {scale} from "react-native-size-matters";

const TITLE_CONTAINER_HEIGHT = 52;
const TITLE_TEXT_SIZE = 23;
const REPLACE_SAUCE_TEXT_SIZE = 18;
const ADD_TO_ORDER_BUTTON_HEIGHT = 32;

class Customize extends Component {
  state = {
    selectedCategoriesValueArray: [],
    selectedSubCategoriesValueArray: [],
    ItemObject: {},
    componentTheme: {},
    extraPopupMessage: '',
    extraPopupVisible: false
  };
  componentDidMount() {
    this.addDefaultQuanityInModifiledItems();

    //list for back button
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
  }
  componentWillUnmount() {
    //clean up
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }
  componentWillMount() {
    this.setThemeOfComponent();
  }
  setThemeOfComponent() {
    const theme = AsyncStorage.getItem('theme').then(data =>
      this.setState({ componentTheme: JSON.parse(data) })
    );
  }
  onBackPress = () => {
    //TODO: Invetigate why this process freezes
    Actions.categories({
      categoryId: this.props.objectdata.CategoryId,
      tabIndex: this.props.tabIndex
    });
    return true;
  };
  addDefaultQuanityInModifiledItems() {
    var item = this.props.objectdata;
    if (item.Modifiers) {
      for (var i = 0; i < item.Modifiers.length; i++) {
        if (item.Modifiers[i].details.items) {
          for (var j = 0; j < item.Modifiers[i].details.items.length; j++) {
            var obj = item.Modifiers[i].details.items[j];
            if (!this.props.editing) {
              if (obj['IsDefault'] == '1' || obj['IsDefault'] == "yes") {
                obj['Selected'] = 1;
                obj['Quantity'] = 1;
              } else {
                obj['Selected'] = 0;
                obj['Quantity'] = 0;
              }
            } else {
              if (obj['Quantity'] && obj['Quantity'] >= 0) obj['Quantity'] = obj.Quantity;
              else obj['Quantity'] = 0;

              if (obj['Selected'] && obj['Selected'] >= 0) obj['Selected'] = obj.Selected;
              else obj['Selected'] = 0;
            }
          }
        }
      }
    }
    //console.log(item);
    this.setState({ ItemObject: item });

    //if (this.props.editing){
    this.checkCustomizedItmeExist(this.props.objectdata);
    //}
  }
  getItemsCountityView() {
    return this.state.ItemObject.Modifiers.map(function(value, i) {
      <TouchableOpacity
        key={i}
        onPress={Actions.pop()}
        style={{
          backgroundColor: APP_COLOR_RED,
          // height: 44,
          flexDirection: 'row',
          alignItems: 'center',
          paddingStart: 20
        }}>
        <Text
          allowFontScaling={FONT_SCALLING}
          numberOfLines={2}
          style={styles.replaceSauceTextStyle}>
          {strings.CUSTOMIZE.toUpperCase()}
        </Text>
        <View style={{ position: 'absolute', right: 20 }}>
          <Image
            style={[styles.arrowBottomImageStyle]}
            source={obj.details.items ? RIGHT_ARROW_LARGE_WHITE : ''}
          />
        </View>
      </TouchableOpacity>;
    });
  }

  onSelectQuantityOfItems(i, j, Quantity, obj) {
    const oldObject = _.cloneDeep(this.state.ItemObject);

    if (Quantity < oldObject.Modifiers[i].details.items[j].Quantity) {
      var ModifiedObj = this.state.ItemObject;
      var object = ModifiedObj.Modifiers[i].details.items[j];
      object['Quantity'] = Quantity;

      this.setState({ ItemObject: ModifiedObj });
      this.selectSubCategory({ i, j }, Quantity);
    } else {
      if (this.restrictUserToMaxQuantityOFModifierItems(oldObject, i, j, Quantity)) {
        var ModifiedObj = this.state.ItemObject;
        var object = ModifiedObj.Modifiers[i].details.items[j];
        object['Quantity'] = Quantity;
        this.setState({ ItemObject: ModifiedObj }, () => {
        });
        this.selectSubCategory({ i, j }, Quantity);
      }
    }
  }

  restrictUserToMaxQuantityOFModifierItemsONRadioClcik(ModObj, x, Quantity) {
    var quantity = 0;
    var itemObj;
    var index;
    const { MaxQuantity } = ModObj.Modifiers[x].details;
    for (var i = 0; i < ModObj.Modifiers[x].details.items.length; i++) {
      itemObj = ModObj.Modifiers[x].details.items[i];
      quantity = quantity + parseInt(itemObj.Quantity);
    }

    if (parseInt(MaxQuantity) == 0) {
      return true;
    }

    if (quantity + parseInt(Quantity) > parseInt(MaxQuantity)) {
      this.setState({
        extraPopupVisible: true,
        extraPopupMessage: `Whoops! You can’t select \nmore than ${MaxQuantity} item${
          MaxQuantity > 1 ? 's' : ''
        } here.`
      });
      return false;
    } else {
      return true;
    }
  }

  restrictMaxQuantityOfModifierItems(ModObj, x, Quantity) {
    let quantity = 0;
    for (var i = 0; i < ModObj.Modifiers[x].details.items.length; i++) {
      const modifierItem = ModObj.Modifiers[x].details.items[i];
      const itemQuantity = parseInt(itemObj.Quantity);
    }
    //console.log(quantity, Quantity, ModObj.Modifiers[x].details.MaxQuantity);
    const { MaxQuantity } = ModObj.Modifiers[x].details;
    if (parseInt(MaxQuantity) == 0) {
      return true;
    }

    if (quantity + parseInt(Quantity) > parseInt(MaxQuantity)) {
      this.setState({
        extraPopupVisible: true,
        extraPopupMessage: `Whoops! You can’t select \nmore than ${MaxQuantity} item${
          MaxQuantity > 1 ? 's' : ''
        } here.`
      });
      return false;
    } else {
      return true;
    }
  }

  restrictUserToMaxQuantityOFModifierItems(ModObj, x, y, Quantity) {
    var quantity = 0;
    var index;
    let itemObj;
    const { MaxQuantity } = ModObj.Modifiers[x].details;
    for (var i = 0; i < ModObj.Modifiers[x].details.items.length; i++) {
      itemObj = ModObj.Modifiers[x].details.items[i];
      quantity = quantity + parseInt(itemObj.Quantity);

      if (y == i) {
        quantity = quantity - parseInt(itemObj.Quantity);
      }
    }
    //console.log(quantity, Quantity, ModObj.Modifiers[x].details.MaxQuantity);

    if (parseInt(MaxQuantity) == 0) {
      return true;
    }
   
    if (quantity + parseInt(Quantity) > parseInt(MaxQuantity)) {
     
      this.setState({
        extraPopupVisible: true,
        extraPopupMessage: `Whoops! You can’t select \nmore than ${MaxQuantity} item${
          MaxQuantity > 1 ? 's' : ''
        } here.`
      });
      return false;
    } else {
      return true;
    }
  }

  getQuantityPickerDataArray(rowObj) {
    const quantityArray = [
      { key: 0, label: '0' },
      { key: 1, label: '1' },
      { key: 2, label: '2' },
      { key: 3, label: '3' },
      { key: 4, label: '4' },
      { key: 5, label: '5' },
      { key: 6, label: '6' },
      { key: 7, label: '7' },
      { key: 8, label: '8' },
      { key: 9, label: '9' },
      { key: 10, label: '10' }
    ];
    const quantityLength = quantityArray.length;
    const maxQuantity = parseInt(rowObj.MaxQuantity);
    const noLimit = maxQuantity == 0;
    return quantityArray.splice(0, noLimit ? quantityLength : maxQuantity + 1);
  }

  getItemQuantityRow({ i, j }, obj, rowObj) {
    return (
      <View
        style={{
          ...styles.itemQuanityRowStyle,
          marginVertical: scale(5)
        }}>
        <TouchableOpacity
          onPress={() => {
            this.selectSubCategory({ i, j });
          }}>
          <View style={styles.itemQuanityInnerLeftViewStyle}>
            {rowObj.Selected == 1 && <View style={[styles.dotStyale, styles.selectedDotColor]} />}
            {rowObj.Selected == 0 && <View style={[styles.dotStyale, styles.unslectedTopColor]} />}
            <Text
              allowFontScaling={FONT_SCALLING}
              numberOfLines={2}
              style={[styles.itemQuanityTextStyle, { width: 150 }]}>
              {/* {obj.details.CategoryPrefix && String(obj.details.CategoryPrefix)} */}
              {rowObj.ModifierName}
            </Text>
          </View>
        </TouchableOpacity>
        {obj.details.CategoryQuantityCheck !== '0' && obj.details.CategoryName !=='Remove'&& (
          <ModalSelector
            cancelText={'Cancel'}
            data={this.getQuantityPickerDataArray(rowObj)}
            onChange={option => {
              this.onSelectQuantityOfItems(i, j, option.label, obj);
            }}
            overlayStyle={{ justifyContent: 'flex-end' }}
            disabled={
              obj.details.CategoryQuantityCheck && obj.details.CategoryQuantityCheck == '0'
                ? true
                : false
            }>
            <View style={styles.itemQuanityInnerRightViewStyle}>
              {obj.details.CategoryQuantityCheck &&
                obj.details.CategoryQuantityCheck !== '0' && (
                  <Text allowFontScaling={FONT_SCALLING} style={styles.quuantityTextViewStyle}>
                    {rowObj.Quantity}
                  </Text>
                )}
              {obj.details.CategoryQuantityCheck &&
                obj.details.CategoryQuantityCheck !== '0' && (
                  <Image
                    style={styles.quuantityInnerDropImageStyle}
                    source={FILLED_DROP_DOWN_ARROW}
                  />
                )}
              {rowObj.Price !== '0.00'
                ? obj.details.CategoryQuantityCheck &&
                  obj.details.CategoryQuantityCheck !== '0' && (
                    <Text
                      allowFontScaling={FONT_SCALLING}
                      style={{
                        ...styles.priceTextStyle,
                        width: scale(85),
                        fontSize: scale(13),
                        textAlign: 'right'
                      }}>
                      {numberWithCommas(
                        this.getPriceOfItemWithMaxQuantity(rowObj),
                        this.props.currency
                      )}
                    </Text>
                  )
                : null}
            </View>
          </ModalSelector>
        )}
      </View>
    );
  }

  getPriceOfItemWithMaxQuantity(rowObj) {
    const price = rowObj.Price * rowObj.Quantity;
    if (rowObj.Quantity == 0 || rowObj.Quantity == 1) return rowObj.Price;
    else return price;
  }

  toggleExpandList(value) {
    if (this.state.selectedCategoriesValueArray.indexOf(value) >= 0) {
      var array = this.state.selectedCategoriesValueArray;
      var index = array.indexOf(value);
      array.splice(index, 1);
      this.setState({ selectedCategoriesValueArray: array });
    } else {
      var joined = this.state.selectedCategoriesValueArray.concat(value);
      this.setState({ selectedCategoriesValueArray: joined });
    }
  }
  getIndex(value) {
    for (var x = 0; x < this.state.selectedSubCategoriesValueArray.length; x++) {
      if (
        this.state.selectedSubCategoriesValueArray[x].i == value.i &&
        this.state.selectedSubCategoriesValueArray[x].j == value.j
      ) {
        return x;
      }
    }
    return -1;
  }

  checkCustomizedItmeExist(item) {
    var array = [];
    if (item.Modifiers) {
      for (var i = 0; i < item.Modifiers.length; i++) {
        const ModifierObject = item.Modifiers[i];

        if (ModifierObject.details.items) {
          for (var j = 0; j < ModifierObject.details.items.length; j++) {
            const itemObj = ModifierObject.details.items[j];

            if (itemObj.Selected == 1 && itemObj.Quantity > 0) {
              array.push({ i, j });
            }
          }
        }
      }
    }

    this.setState({ selectedSubCategoriesValueArray: array });

    //return false
  }

  onSelectRowSetDefaulQuantity(i, j, Quantity) {
    var ModifiedObj = this.state.ItemObject;
    var object = ModifiedObj.Modifiers[i].details.items[j];
    object['Quantity'] = Quantity;

    this.setState({ ItemObject: ModifiedObj });
  }

  selectSubCategory = (value, onQunatitySlection) => {
    if (onQunatitySlection == null) {
      if (this.getIndex(value) >= 0) {
        var array = this.state.selectedSubCategoriesValueArray;
        var index = this.getIndex(value);
        array.splice(index, 1);
        this.setState({ selectedSubCategoriesValueArray: array });
        this.setSelectedAndUnSlectedSubItemsInItemObject(0, value, onQunatitySlection);
      } else {
        const oldObject = _.cloneDeep(this.state.ItemObject);
        if (this.restrictUserToMaxQuantityOFModifierItemsONRadioClcik(oldObject, value.i, 1)) {
          var joined = this.state.selectedSubCategoriesValueArray.concat(value);
          this.setState({ selectedSubCategoriesValueArray: joined });
          this.setSelectedAndUnSlectedSubItemsInItemObject(1, value, onQunatitySlection);
        }
      }
    } else {
      // //console.log("onQunatitySlection",onQunatitySlection);
      if (onQunatitySlection == 0) {
        var array = this.state.selectedSubCategoriesValueArray;
        var index = this.getIndex(value);
        array.splice(index, 1);
        this.setState({ selectedSubCategoriesValueArray: array });
        this.setSelectedAndUnSlectedSubItemsInItemObject(0, value, onQunatitySlection);
      } else {
        var joined = this.state.selectedSubCategoriesValueArray.concat(value);
        this.setState({ selectedSubCategoriesValueArray: joined });
        this.setSelectedAndUnSlectedSubItemsInItemObject(1, value, onQunatitySlection);
      }
    }
  };
  setSelectedAndUnSlectedSubItemsInItemObject(selection, { i, j }, onQunatitySlection) {
    var ModifiedObj = this.state.ItemObject;
    var object = ModifiedObj.Modifiers[i].details.items[j];

    if (onQunatitySlection == null) {
      if (selection == 0) {
        object['Selected'] = 0;
        object['Quantity'] = 0;
      } else {
        object['Selected'] = selection;
        object['Quantity'] = 1;
      }
      this.setState({ ItemObject: ModifiedObj });
    } else {
      if (onQunatitySlection >= 1) {
        object['Selected'] = selection;
        object['Quantity'] = onQunatitySlection;

        //this.onSelectRowSetDefaulQuantity(i,j,object.Quantity)
      } else {
        object['Selected'] = 0;
        object['Quantity'] = 0;

        //this.onSelectRowSetDefaulQuantity(i,j,0)
      }
      this.setState({ ItemObject: ModifiedObj });
    }
  }
  onPress = (event, caption) => {
    switch (caption) {
      case strings.CUSTOMIZE:
        if (this.props.editing) Actions.yourcart({ hideRecommended: true });
        else
          Actions.categories({
            categoryId: this.props.objectdata.CategoryId,
            tabIndex: this.props.tabIndex
          });
        break;
      default:
    }
  };

  addItemToCart = event => {
    const { cartItemsArray } = this.props;
    const { ItemObject } = this.state;

    if (this.props.editing) {
      const index = cartItemsArray.indexOf(ItemObject);
      cartItemsArray[index] = ItemObject;
      this.props.additmeToCart(cartItemsArray);
      Actions.drawer({ type: 'reset' });
      Actions.yourcart({ hideRecommended: true });
    } else {
      const NewItemObject = Object.assign({}, ItemObject);
      // console.log('==========> NewItemObject', NewItemObject);
      cartItemsArray.push(NewItemObject);

      this.props.additmeToCart(cartItemsArray);
      //log fb event
      AppEventsLogger.logEvent(
        'fb_mobile_add_to_cart',
        {
          content: NewItemObject.ItemName,
          contentId: NewItemObject.ID,
          contentType: NewItemObject.CategoryName,
          currency: this.props.currency
        },
        NewItemObject.Price
      );
      // console.log('==========> cartItemsArray', cartItemsArray);
      Actions.categories({
        categoryId: this.props.objectdata.CategoryId,
        tabIndex: this.props.tabIndex
      });
    }
  };
  getCustomizeItemsPrice(item) {
    var price = 0;
    if (item.Modifiers) {
      for (var i = 0; i < item.Modifiers.length; i++) {
        const ModifierObject = item.Modifiers[i];
        if (ModifierObject.details.items) {
          for (var j = 0; j < ModifierObject.details.items.length; j++) {
            const itemObj = ModifierObject.details.items[j];
            if (itemObj.Selected == 1 && itemObj.Quantity > 0) {
              const singalCustomizedItmeTotalPrice = itemObj.Price * itemObj.Quantity;
              price = price + singalCustomizedItmeTotalPrice;
            }
          }
        }
      }
      return price + parseInt(item.DiscountedPrice || item.Price);
    } else return price;
  }

  onExtraCross = () => {
    this.setState({ extraPopupVisible: false })
  }

  onExtraAccept = () => {
    this.setState({ extraPopupVisible: false })
  };

  render() {
    const {
      subContainer,
      customizeTextStyle,
      arrowImageStyle,
      ImageViewStyle,
      backgroundImageStyle,
      listItemInnerContainerStyle,
      innerContentViewStyle,
      txtMexTextStyle,
      listItemTitleTextStyle,
      cateDetailTextStyle,
      itemRowStyle,
      addOrderButtonViewStyle,
      itemNameViewStyle,
      promoTags,
      doubleStarsTag,
      discountTag
    } = styles;
    const { ItemObject } = this.state;
    console.log('Item--->', ItemObject)
    return (
      <Container style={{ backgroundColor: APP_COLOR_BLACK }}>
        <ExtraPopUp
          onCrossPress={this.onExtraCross}
          modalVisibilty={this.state.extraPopupVisible}
          selectedHeading={'UH-OH!'}
          selectedSubHeading={this.state.extraPopupMessage}
          // selectedDetails={this.state.selectedDetails}
          appTheme={this.state.componentTheme}
          onAccept={this.onExtraAccept}
        />
        <View style={subContainer}>
          <TouchableOpacity
            onPress={event => this.onPress(event, strings.CUSTOMIZE)}
            style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{justifyContent:'center'}}><Image style={arrowImageStyle} source={this.state.componentTheme.ARROW_LEFT_RED} /></View>
             <View style={{justifyContent:'center'}}><Text
              allowFontScaling={FONT_SCALLING}
              style={[customizeTextStyle, { color: APP_COLOR_BLACK }]}>
              {strings.CUSTOMIZE.toLowerCase()}
            </Text></View>
          </TouchableOpacity>
          <View
            style={{
              width: '100%',
              height: 5,
              backgroundColor: this.state.componentTheme.thirdColor,
              bottom: 1,
              position: 'absolute'
            }}
          />
        </View>
        <ScrollView
          style={{ marginBottom: 70 + 40 }}
          ref={ref => (this.scrollView = ref)}
          onContentSizeChange={(contentWidth, contentHeight) => {
            this.scrollView.scrollToEnd({ animated: true });
          }}>
          <View style={listItemInnerContainerStyle}>
            <View style={ImageViewStyle}>
              <CachedImage
                resizeMode={'cover'}
                style={backgroundImageStyle}
                source={{ uri: `${this.state.ItemObject.DetailsImg}?location=customize` }}
              />
              <View style={promoTags}>
              {
                ItemObject.DiscountUrl
                ? (
                  <CachedImage
                    source={{ uri: ItemObject.DiscountUrl }}
                    resizeMode='contain'
                    style={discountTag} />
                )
                : null
              }
              {
                ItemObject.FeaturedStars
                ? (
                  <CachedImage
                    source={DOUBLE_STARS}
                    resizeMode='contain'
                    style={doubleStarsTag} />
                )
                : null
              }
              </View>
            </View>
            <View style={innerContentViewStyle}>
              <View style={itemNameViewStyle}>
                {this.state.ItemObject.ItemName && (
                  <Text
                    allowFontScaling={FONT_SCALLING}
                    style={[txtMexTextStyle, { color: APP_COLOR_WHITE }]}>
                    {this.state.ItemObject.ItemName.toUpperCase()}
                  </Text>
                )}
                <Text allowFontScaling={FONT_SCALLING} style={listItemTitleTextStyle}>
                  {' '}
                  {numberWithCommas(this.state.ItemObject.DiscountedPrice || this.state.ItemObject.Price, this.props.currency)}{' '}
                </Text>
              </View>
              <Text allowFontScaling={FONT_SCALLING} style={cateDetailTextStyle}>
                {this.state.ItemObject.Details}
              </Text>
            </View>

            {this.state.ItemObject.Modifiers &&
              this.state.ItemObject.Modifiers.map((obj, i) => (
                <View key={i}>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => this.toggleExpandList(i)}
                    style={{
                      backgroundColor: this.state.componentTheme.thirdColor,
                      height: obj.details.items ? 44 : 0,
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingStart: 20
                    }}>
                    <Text
                      allowFontScaling={FONT_SCALLING}
                      style={[
                        styles.replaceSauceTextStyle,
                        {
                          color: obj.details.items ? APP_COLOR_WHITE : TRANSPARENT_COLOR
                        }
                      ]}>
                      {obj.details.CategoryName}
                    </Text>

                    <View style={{ position: 'absolute', right: 20 }}>
                      <Image
                        style={
                          (styles.arrowBottomImageStyle,
                          {
                            transform: [
                              {
                                rotate:
                                  this.state.selectedCategoriesValueArray.indexOf(i) >= 0
                                    ? '90deg'
                                    : '0deg'
                              }
                            ]
                          })
                        }
                        source={obj.details.items ? RIGHT_ARROW_LARGE_WHITE : ''}
                      />
                    </View>
                  </TouchableOpacity>

                  {this.state.selectedCategoriesValueArray.indexOf(i) >= 0 && (
                    <View stye={{...itemRowStyle}}>
                      {obj.details.items &&
                        obj.details.items.map((rowObj, j) => (
                          <View key={j} >{this.getItemQuantityRow({ i, j }, obj, rowObj)}</View>
                        ))}
                    </View>
                  )}
                </View>
              ))}
          </View>
        </ScrollView>
        <View style={addOrderButtonViewStyle}>
          <View style={{ backgroundColor: APP_COLOR_WHITE, height: 1, width: '100%' }} />

          <View style={styles.totalAmountViewStyle}>
            <Text
              allowFontScaling={FONT_SCALLING}
              style={[styles.totalTextStyle, { marginTop: 5 }]}>
              {strings.YOUR_TOTAL_AMOUNT_IS.toUpperCase()}
              {numberWithCommas(
                this.getCustomizeItemsPrice(this.state.ItemObject),
                this.props.currency
              )}
            </Text>
          </View>

          <Button
            onPress={this.addItemToCart}
            style={[
              COMMON_BUTTON_STYLE,
              {
                alignSelf: 'center',
                marginTop: 10,
                backgroundColor: this.state.componentTheme.thirdColor,
                width: 205
              }
            ]}>
            <Text
              allowFontScaling={FONT_SCALLING}
              style={[
                COMMON_BUTTON_TEXT_STYLE,
                {
                  fontFamily: ROADSTER_REGULAR,
                  fontSize: scale(15)
                }
              ]}>
              {strings.ADD_TO_CART.toUpperCase()}
            </Text>
          </Button>
        </View>
      </Container>
    );
  }
}

const styles = {
  itemNameViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginStart: 18,
    marginEnd: 18,
    marginRight:18,
    marginTop: 15
  },
  addOrderButtonViewStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: APP_COLOR_BLACK,
    height: 70 + 40
  },
  itemRowStyle: {
    borderColor: 'red',
    borderWidth: 10,
    backgroundColor: 'blue',
    marginTop: 10,
    marginBottom: 10
  },
  selectedDotColor: {
    backgroundColor: APP_COLOR_WHITE,
    borderRadius: 8,
    width: 16,
    height: 16,
    marginTop: IF_OS_IS_IOS ? 1 : 2
  },
  unslectedTopColor: {
    borderRadius: 8,
    width: 16,
    height: 16,
    backgroundColor: TRANSPARENT_COLOR,
    borderWidth: 2,
    borderColor: APP_COLOR_WHITE,
    marginTop: IF_OS_IS_IOS ? 1 : 2
  },

  itemQuanityRowStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 0,
    alignItems: 'center',
    backgroundColor: APP_COLOR_BLACK,
    flex: 1
  },
  itemQuanityTextStyle: {
    color: APP_COLOR_WHITE,
    fontSize: 16,
    marginTop: 0,
    marginStart: 8,
    fontFamily: DINENGSCHRIFT_REGULAR,
    paddingTop: IF_OS_IS_IOS ? 2 : 0
  },
  itemQuanityInnerLeftViewStyle: {
    flexDirection: 'row',
    flex: 1,
    marginStart: 25
  },
  itemQuanityInnerRightViewStyle: {
    borderWidth: 0,
    borderColor: APP_COLOR_WHITE,
    marginEnd: 21,
    marginTop: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  quuantityTextViewStyle: {
    color: 'white',
    borderRadius: 7,
    borderWidth: 1,
    width: 36,
    height: 28,
    borderColor: APP_COLOR_WHITE,
    textAlign: 'center',
    marginEnd: 8,
    marginBottom: 3,
    // paddingTop: IF_OS_IS_IOS ? 5 : 2,
    fontSize: 20,
    fontFamily: HELVETICANEUE_LT_STD_CN
  },
  priceTextStyle: {
    color: APP_COLOR_WHITE,
    fontFamily: DINENGSCHRIFT_REGULAR
  },
  quuantityInnerDropImageStyle: {
    width: 15,
    height: 8,
    marginEnd: 5
  },
  container: {
    marginTop: 30,
    marginLeft: 0,
    marginRight: 0
  },
  subContainer: {
    height: TITLE_CONTAINER_HEIGHT,
    backgroundColor: APP_COLOR_WHITE,
    flexDirection: 'row',
    alignItems: 'center'
  },
  customizeTextStyle: {
    color: APP_COLOR_BLACK,
    fontSize: TITLE_TEXT_SIZE+3,
    fontFamily: PACIFICO,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: 5,
    marginTop:-5
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
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_BLACK,
    fontSize: 16
  },
  replaceSauceTextStyle: {
    color: APP_COLOR_WHITE,
    fontSize: REPLACE_SAUCE_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: 5,
    alignSelf: 'center',
    marginTop: 5
  },
  arrowBottomImageStyle: {
    padding: 10,
    width: 18,
    height: 11,
    resizeMode: 'contain'
  },
  arrowImageStyle: {
    marginStart: 20,
    // marginBottom: IF_OS_IS_IOS ? 4 : 0,
    width: 15,
    height: 20
  },
  ImageViewStyle: {
    marginLeft: 0,
    marginRight: 0,
    height: 180
  },
  backgroundImageStyle: {
    width: '100%',
    height: 182
  },
  listItemInnerContainerStyle: {
    flex: 1
  },
  innerContentViewStyle: {
    marginBottom: 30,
    backgroundColor: APP_COLOR_BLACK
  },
  txtMexTextStyle: {
    color: APP_COLOR_RED,
    fontSize: 21,
    width:'68%',
    fontFamily: DINENGSCHRIFT_BOLD,
  },
  listItemTitleTextStyle: {
    color: APP_COLOR_WHITE,
    fontSize: 18,
    fontFamily: DINENGSCHRIFT_REGULAR,
    marginRight:10
  },
  cateDetailTextStyle: {
    color: APP_COLOR_WHITE,
    fontSize: 14,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 5
  },
  promoTags: {
    flexDirection: 'row',
    position: 'absolute',
    zIndex: 8,
    left: 15,
    top: 100,
    justifyContent: 'space-between'
  },
  doubleStarsTag: {
    width: 60,
    height: 60,
    marginRight: 10
  },
  discountTag: {
    width: 60,
    height: 60
  }
};

function mapStateToProps(state) {
  return {
    itemCount: state.category.count,
    objectdata: state.category.selectedItemObject,
    cartItemsArray: state.cart.cartItemsArray,
    currency: state.app.currency
  };
}

export default connect(
  mapStateToProps,
  cartActions
)(Customize);
