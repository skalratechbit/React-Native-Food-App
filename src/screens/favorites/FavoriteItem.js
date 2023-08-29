import React, { Component } from 'react';
import { APP_COLOR_WHITE, APP_COLOR_BLACK } from '../../config/colors';
import { View,} from 'react-native';
import { CachedImage } from 'react-native-img-cache';
import FavButton from '../../components/FavButton';
import Common from '../../components/Common';
import { DINENGSCHRIFT_REGULAR, HELVETICANEUE_LT_STD_CN, DINENGSCHRIFT_LIGHT } from '../../assets/fonts';
import { numberWithCommas } from '../../config/common_functions';
import strings from '../../config/strings/strings';
import { SCREEN_WIDTH, FONT_SCALLING } from '../../config/common_styles';

const { Text, Button } = Common;

export default class Favorites extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // methods
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

  getFreeItems(item) {
    const array = this.getFreeItemsArray(item) || [];
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
    return (
      <View style={{ width: '100%'}}>
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
                            styles.detailRowContainerStyle,
                            { justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }
                          ]}>
                          <View
                            style={[{ flexDirection: 'row', width: '50%'}]}>
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

                          <View style={{
                            backgroundColor: APP_COLOR_BLACK,
                            width: '50%',
                            alignItems: 'flex-end',
                            justifyContent: 'center'}}>
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

  // handlers
  handleRemoveFromFavorites = () => {
    const { item, onRemove } = this.props;
    onRemove(item);
  };

  handleAddFavoriteToOrder = () => {
    const { item, onAddToOrder } = this.props;
    const favoriteData = item?.FavoriteData !== undefined && JSON.parse(item?.FavoriteData);
    onAddToOrder(favoriteData);
  };

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
    return (
      parseInt(item.DiscountedPrice || item.Price) * parseInt(item.quantity) +
      this.getCustomizeItemsPrice(item)
    );
  }

  renderFavInfo(item) {
    const favInfo1 = this.getFreeItems(item);
    const favInfo2 = this.getCustomizeItems(item);
    const favoriteInfo =
      (String(favInfo1).match(/[a-z]/i) ? favInfo1 + ' ' : '') +
      (String(favInfo2).match(/[a-z]/i) ? favInfo2 + '.' : '');
    return favoriteInfo ? (
      <View style={styles.favoriteInfo}>
        <View style={styles.detailRowContainerStyle}>
          <View style={{ flexWrap: 'wrap', width: '76%' }}>
            {this.getFreeItems(item)}
          </View>
          {this.checkCustomizedItmeExist(item) && <View style={[styles.priceContainerStyle]}>
            <Text allowFontScaling={FONT_SCALLING} style={styles.priceTextStyle}>
              {/* { item.Price + " " + strings.LBP } */}
              {numberWithCommas(item.DiscountedPrice || item.Price, this.props.currency)}
            </Text>
          </View>}
        </View>
        {this.getExtraTextView(item)}
        {this.getCustomizeItems(item)}
        {this.checkCustomizedItmeExist(item) && <View style={styles.headingContainer}>
            <Text style={styles.headingName} numberOfLines={2}>
              {'Customized price'}
            </Text>
            <Text style={styles.headingPrice}>{numberWithCommas(
              this.getSingalItemTotalPirce_Inluding_CustomizedItems(item),
              this.props.currency
            )}</Text>
        </View>}
      </View>
    ) : null;
  }

  render() {
    const { item, appTheme, currency } = this.props;
    const { thirdColor } = appTheme;
    const favoriteData = item?.FavoriteData !== undefined && JSON.parse(item?.FavoriteData);
    const { Price, ItemName, favoriteName, DetailsImg } = favoriteData || item;

    console.log('Item--->', item)

    getStyles(thirdColor);

    return (
      <View style={styles.container}>
        <FavButton
          item={item}
          theme={appTheme}
          active={true}
          style={styles.favoriteButton}
          onPress={this.handleRemoveFromFavorites}
        />
        <CachedImage resizeMode={'cover'} style={styles.imageCover} source={{ uri: DetailsImg }} />
        <View style={styles.infoContainer}>
          <View style={styles.headingContainer}>
            <Text style={styles.headingName} numberOfLines={2}>
              {(favoriteName || ItemName).toUpperCase()}
            </Text>
            <Text style={styles.headingPrice}>{numberWithCommas(Price, currency)}</Text>
          </View>
          {this.renderFavInfo(favoriteData)}
          <View style={styles.buttonContainer}>
            <Button
              onPress={this.handleRemoveFromFavorites}
              color={thirdColor}
              buttonText={strings.REMOVE.toUpperCase()}
            />
            <Button
              onPress={this.handleAddFavoriteToOrder}
              color={thirdColor}
              buttonText={strings.ADD_TO_ORDER.toUpperCase()}
            />
          </View>
        </View>
      </View>
    );
  }
}

let styles;
const getStyles = color => {
  const headingText = {
    color: APP_COLOR_WHITE,
    fontSize: 16
  };
  return (styles = {
    container: {
      borderTopColor: color,
      borderTopWidth: 5,
      backgroundColor: APP_COLOR_BLACK
    },
    imageCover: {
      width: '100%',
      minHeight: 195,
      height: 195
    },
    favoriteButton: {
      right: 23,
      top: -3
    },
    infoContainer: {
      padding: 20,
      alignItems: 'flex-start'
    },
    headingContainer: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between'
    },
    headingName: {
      ...headingText,
      maxWidth: SCREEN_WIDTH - 130,
      flexWrap: 'wrap'
    },
    headingPrice: {
      ...headingText,
      fontSize: 16,
      paddingTop: 2,
      justifyContent: 'flex-end'
    },
    simpleText: {
      fontFamily: HELVETICANEUE_LT_STD_CN,
      fontSize: 16
    },
    favoriteInfo: { width: '100%' },
    buttonContainer: {
      paddingTop: 12,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between'
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
    totalAmountTextStyle: {
      fontSize: 16,
      fontFamily: DINENGSCHRIFT_REGULAR,
      color: APP_COLOR_WHITE
    },
  });
};
