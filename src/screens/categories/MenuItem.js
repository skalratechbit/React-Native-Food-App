import { Button } from 'native-base';
import { CustomCachedImage, CachedImage } from 'react-native-img-cache';
import Image from 'react-native-image-progress';
import React, { Component } from 'react';
import { scale } from 'react-native-size-matters';
import { Text, View } from 'react-native';
import { APP_COLOR_WHITE, APP_COLOR_BLACK } from '../../config/colors';
import { NEW_TAG } from '../../assets/images';
import strings from '../../config/strings/strings';
import {
  DINENGSCHRIFT_REGULAR,
  DINENGSCHRIFT_BOLD, DINENGSCHRIFT_LIGHT
} from '../../assets/fonts';
import { actions as categoriesActions } from '../../ducks/categories';
import { actions as cartActions } from '../../ducks/cart';
import { numberWithCommas } from '../../config/common_functions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  COMMON_BUTTON_RADIOUS,
  COMMON_BUTTON_TEXT_STYLE,
  FONT_SCALLING,
  IF_OS_IS_IOS,
  SCREEN_WIDTH
} from '../../config/common_styles';
import { getThemeByLevel } from '../../config/common_styles/appthemes';
import { getUserObject } from '../../helpers/UserHelper';
import ItemOverlay from './ItemOverlay';


const ADD_TO_ORDER_BUTTON_HEIGHT = 32;

class MenuItem extends Component {
  constructor (props) {
    super(props);
    const { LevelName } = this.props;
    this.state = {
      componentTheme: getThemeByLevel(LevelName)
    };
  }

  setSelectedObjectToCartView (index) {
    const filterArray = this.props.categoriesItemArray.filter(
      obj => obj.ID === index
    );
    const sobj = Object.assign({}, filterArray[0]);
    this.props.setSelectedObjectOfToCartViewIn(sobj);
  }

  handleAddToOrder = () => {
    const {
      item: { ID },
      addToOrderPress
    } = this.props;
    console.log('ADD TO ORDER PRESS', ID);
    addToOrderPress(ID);
  };

  renderCuisineIcon ({ IconLabel, IconUrl }) {
    return (
      <View style={styles.cuisinesInnerViewStyle} key={IconLabel}>
        <CachedImage
          resizeMode={'cover'}
          style={styles.cuisinesImageStyle}
          source={{ uri: IconUrl }}
        />
       </View>
    );
  }

  renderCuisinesView (item) {
    const {
      icons: { iconNames, iconObjects }
    } = this.props;
    const selectedCuisines = iconNames.filter(
      iconName => item[iconName] == '1'
    );
    return (
      <View style={styles.cuisineWrapper}>
        {selectedCuisines.map(iconName =>
          this.renderCuisineIcon(iconObjects[iconName])
        )}
      </View>
    );
  }

  renderNewTag = item => {
    const { newMenuItemTag, newTagContainer } = styles;
    return parseInt(item.NewItem) ? (
      <View style={newTagContainer}>
        <CachedImage
          style={newMenuItemTag}
          resizeMode='contain'
          source={NEW_TAG}
        />
      </View>
    ) : null;
  };

  renderImageError = () => {
    const {
      item: { LargeImg }
    } = this.props;
    return <CachedImage source={{ uri: LargeImg }} />;
  };

  render () {
    const {
      componentTheme: { thirdColor }
    } = this.state;
    const { item, Currency } = this.props;
    styles = getStyles(thirdColor);
    // console.log('rendering menu item', item)
    return (
      <View style={styles.container}>
        <View style={styles.listItemInnerContainerStyle}>
          <View style={styles.ImageViewStyle}>
            <ItemOverlay
              icon={item.OverlayIcon}
              visible={item.Overlay}
              titleSize={item.OverlayTitleFontSize}
              title={item.OverlayTitle}
              detailsSize={item.OverlayDetailsFontSize}
              details={item.OverlayDetails}
              color={thirdColor}
            />
            <CustomCachedImage
              component={Image}
              renderError={this.renderImageError}
              resizeMode={'cover'}
              style={styles.backgroundImageStyle}
              source={{ uri: item.LargeImg }}
            />
            <View
              style={[
                styles.promoTags,
                parseInt(item.Overlay) ? styles.promoTagsRight : {}
              ]}>
              {item.CompetitionTag ? (
                <CachedImage
                  source={{ uri: item.CompetitionTag }}
                  resizeMode='contain'
                  style={styles.competitionTag}
                />
              ) : null}
              {item.Promo && item.Promo[0].FeaturedStars ? (
                <CachedImage
                  source={{ uri: item.Promo[0].DiscountUrl }}
                  resizeMode='contain'
                  style={styles.discountTag}
                />
              ) : null}
            </View>
          </View>

          <View style={styles.innerContentViewStyle}>
            <View style={styles.titleContainer}>
              <View style={styles.titleTextRow}>
                <Text
                  allowFontScaling={FONT_SCALLING}
                  style={styles.itemNameText}>
                  {item.ItemName.toUpperCase()}
                </Text>
              </View>
              <View style={styles.priceContainer}>
                <Text
                  numberOfLines={1}
                  allowFontScaling={FONT_SCALLING}
                  style={styles.priceText}>
                  {numberWithCommas(
                    item.DiscountedPrice || item.Price,
                    Currency
                  )}
                </Text>
              </View>
            </View>
            <Text
              allowFontScaling={FONT_SCALLING}
              style={styles.cateDetailTextStyle}>
              {item.Details}
            </Text>
            <View style={styles.bottomButtonViewStyle}>
              <View style={styles.cuisinesContainerStyle}>
                {this.renderCuisinesView(item)}
              </View>
              <View style={styles.orderButtonContainer}>
                <Button
                  onPress={this.handleAddToOrder}
                  style={styles.addToOrderButtonStyle}>
                  <Text
                    allowFontScaling={FONT_SCALLING}
                    style={styles.addToOrderText}>
                    {strings.ADD_TO_ORDER.toUpperCase()}
                  </Text>
                </Button>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

let styles = {};
const getStyles = color => {
  return {
    container: {
      marginLeft: 0,
      paddingLeft: 0,
      paddingRight: 0,
      marginRight: 0,
      marginTop: 0,
      paddingTop: 4,
      paddingBottom: 0,
      backgroundColor: color
    },
    cuisinesContainerStyle: {
      flex: SCREEN_WIDTH < 375 ? 1.5 : 1,
      flexWrap: 'wrap',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingLeft: 20
    },
    orderButtonContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingRight: 20
    },
    addToOrderText: {
      ...COMMON_BUTTON_TEXT_STYLE,
      fontFamily: DINENGSCHRIFT_BOLD,
      fontSize: 15,
      // marginTop: IF_OS_IS_IOS ? 2 : 3
    },
    cuisinesInnerViewStyle: {
      alignItems: 'flex-start',
      width: '50%',
      paddingBottom: 5,
    },
    cuisinesImageStyle: {
      width: scale(110),
      height: scale(18),
    },
    cuisinesTextStyle: {
      flex: 1,
      color: APP_COLOR_WHITE,
      fontSize: 12,
      fontFamily: DINENGSCHRIFT_REGULAR,
      marginStart: 5,
      paddingTop: IF_OS_IS_IOS ? 4.5 : null,
      flexWrap: 'nowrap'
    },
    listItemInnerContainerStyle: {
      flex: 1
    },
    ImageViewStyle: {
      marginLeft: 0,
      marginRight: 0,
      height: 180
    },
    innerContentViewStyle: {
      // height: 162,
      paddingBottom: 10,
      backgroundColor: APP_COLOR_BLACK
    },
    backgroundImageStyle: {
      width: '100%',
      height: 182
      // resizeMode: 'cover'
    },
    priceText: {
      alignSelf: 'flex-end',
      flexWrap: 'nowrap',
      color: APP_COLOR_WHITE,
      fontSize: 16,
      fontFamily: DINENGSCHRIFT_REGULAR,
      marginTop:1
    },
    itemNameText: {
      color: APP_COLOR_WHITE,
      fontSize: scale(18),
      fontFamily: DINENGSCHRIFT_BOLD,
    },
    cateDetailTextStyle: {
      color: APP_COLOR_WHITE,
      fontSize: 14,
      fontFamily: DINENGSCHRIFT_LIGHT,
      lineHeight: 16,
      marginLeft: 20,
      marginRight: 20,
      marginTop: 5
    },
    addToOrderButtonStyle: {
      backgroundColor: color,
      maxWidth: 152,
      // height: 34,
      width: '100%',
      height: ADD_TO_ORDER_BUTTON_HEIGHT,
      alignItems: 'center',
      position: 'relative',
      justifyContent: 'center',
      borderRadius: COMMON_BUTTON_RADIOUS,
      alignSelf: 'flex-end'
    },
    bottomButtonViewStyle: {
      flex: 1,
      // height: ADD_TO_ORDER_BUTTON_HEIGHT + 10,
      flexDirection: 'row',
      marginTop: 5,
      alignItems:'center'
    },
    newTagContainer: {
      width: 65,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: IF_OS_IS_IOS ? -8 : 1
    },
    newMenuItemTag: {
      width: 45,
      height: 25.5
    },
    promoTags: {
      flexDirection: 'row',
      position: 'absolute',
      zIndex: 7,
      left: 15,
      top: 100,
      justifyContent: 'space-between'
    },
    promoTagsRight: {
      alignItems: 'flex-end',
      left: null,
      right: 15
    },
    doubleStarsTag: {
      width: 60,
      height: 60,
      marginRight: 10
    },
    discountTag: {
      width: 60,
      height: 60,
      marginRight: 10
    },
    competitionTag: {
      width: 60,
      height: 60,
      marginRight: 10
    },
    titleContainer: {
      flex: 1,
      flexDirection: 'row',
      marginStart: 18,
      marginEnd: 18,
      marginTop: 15
    },
    priceContainer: {
      alignItems: 'flex-end'
    },
    titleTextRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start'
    },
    cuisineWrapper: { flexDirection: 'row', flexWrap: 'wrap' }
  };
};

function mapStateToProps (state) {
  const { LevelName, Currency } = getUserObject(state);
  const {
    app: { currency }
  } = state;

  return {
    Currency: Currency || currency,
    LevelName: LevelName || 'challenger'
  };
}

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      ...cartActions,
      ...categoriesActions
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  categoriesActions
)(MenuItem);
