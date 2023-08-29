import React, { Component } from 'react';
import { Text, View, Image, TouchableOpacity, BackHandler } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { CROSS_IMAGE } from '../../assets/images';
import { Button } from 'native-base';
import { APP_COLOR_WHITE, APP_COLOR_BLACK, APP_COLOR_RED } from '../../config/colors';
import { DINENGSCHRIFT_REGULAR, ROADSTER_REGULAR } from '../../assets/fonts';
import strings from '../../config/strings/strings';
import { actions as categoriesActions } from '../../ducks/categories';
import { actions as cartActions } from '../../ducks/cart';
import { bindActionCreators } from 'redux';
import { AppEventsLogger } from 'react-native-fbsdk';

import {
  COMMON_BUTTON_STYLE,
  COMMON_BUTTON_TEXT_STYLE,
  COMMON_INPUT_STYLE,
  FONT_SCALLING
} from '../../config/common_styles';

import { connect } from 'react-redux';
import _ from 'lodash';
import Common from "../../components/Common";
class CategoryOnScreenCartView extends Component {
  state = { count: 1,  alertVisibilty: false,
    alertMessage: ''};

	componentDidMount() {
		//list for back buttonq
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
	}

	componentWillUnmount() {
		//clean up
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
	}

	onBackPress = () => {
		this.props.onCrossPress();
		return true;
	}

  onPress = (event, caption) => {

    const {objectdata} = this.props;
    switch (caption) {
      case strings.PLUS:

        if (this.state.count + 1 > parseInt(objectdata.MaxItems))
        {
          this.setState({ alertVisibilty: true,
            alertMessage:  `You can’t select \nmore than ${objectdata.MaxItems} item${
                objectdata.MaxItems > 1 ? 's' : ''
            } here.`});
        }
        else {this.setState(prevState => ({ count: prevState.count + 1 }));}
        break;

      case strings.MINUS:
        if (this.state.count > 1) {
          this.setState({ count: this.state.count - 1 });
        }
        break;

      case strings.CUSTOMIZE:
        // //console.log("this.props.selectedItemObject in view ",this.props.selectedItemObject);
        var selectedObject = Object.assign({}, this.props.objectdata);
        selectedObject['quantity'] = this.state.count;
        this.props.setSelectedObjectOfToCartViewIn(selectedObject);
        Actions.customize({ editing: false, tabIndex: this.props.tabIndex });
        break;

      case strings.QUICK_ORDER:
        this.addItemToCart();
        this.props.onCrossPress();
        break;

      default:
    }
  };

  getCartObject(object) {
    var itemObject = Object.create(object);

    itemObject = {
      CategoryId: object.CategoryId,
      CategoryName_en: object.CategoryName_en,
      Details: object.Details,
      DetailsImg: object.DetailsImg,
      ID: object.ID,
      IceCream: object.IceCream,
      ItemName: object.ItemName,
      LargeImg: object.LargeImg,
      LowCal: object.LowCal,
      Modifiers: object.Modifiers,
      Price: object.Price,
      Spicy: object.Spicy,
      ThumbnailImg: object.LowCal,
      Vegetarian: object.Vegetarian,
      PLU: object.PLU,
      quantity: object.quantity
    };

    return itemObject;
  }

  addItemToCart = () => {
    const array = this.props.cartItemsArray.slice();
    const { currency, objectdata } = this.props;
    const { count } = this.state;
    const itemObj = _.cloneDeep(objectdata);
    itemObj['quantity'] = count;
    array.push(itemObj);
    AppEventsLogger.logEvent('fb_mobile_add_to_cart', {
      content: itemObj.ItemName,
      contentId: itemObj.ID,
      contentType: itemObj.CategoryName_en,
      currency: currency
    }, itemObj.Price);
    this.props.additmeToCart(array);
  };

  render() {
    const {
      containerStyle,
      crossImageStyle,
      counterTextStyle,
      buttonContainerStyle,
      addtoOrderTextStyle,
      counterPlusViewStyle,
      counterMinusViewStyle
    } = styles;
    const{alertVisibilty,alertMessage} = this.state;
    return (
      <View style={containerStyle}>
        <Common.Popup
            onClose={() => {
              this.setState({
                alertVisibilty: false,
                alertMessage: ''
              });
            }}
            // color={thirdColor}
            visibilty={alertVisibilty}
            heading={'Whoops'}
            subbody={alertMessage}
        />
        <TouchableOpacity
          onPress={this.props.onCrossPress}
          style={{
            marginTop: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: APP_COLOR_BLACK
          }}>
          <Image source={CROSS_IMAGE} tintColor={APP_COLOR_RED} style={crossImageStyle} />
        </TouchableOpacity>
        <Text allowFontScaling={FONT_SCALLING} style={addtoOrderTextStyle}>
          {strings.ADD_TO_ORDER.toUpperCase()}
        </Text>
        <View style={buttonContainerStyle}>
          <View style={COMMON_INPUT_STYLE}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20
              }}>
              <TouchableOpacity
                style={counterMinusViewStyle}
                onPress={event => this.onPress(event, strings.MINUS)}>
                <Text
                  allowFontScaling={FONT_SCALLING}
                  style={[counterTextStyle, { color: this.props.appColor }]}>
                  {strings.MINUS}
                </Text>
              </TouchableOpacity>
              <Text
                allowFontScaling={FONT_SCALLING}
                style={[counterTextStyle, { width: 140 }]}>
                {this.state.count}
              </Text>

              <TouchableOpacity style={counterPlusViewStyle}>
                <Text
                  allowFontScaling={FONT_SCALLING}
                  style={[counterTextStyle, { color: this.props.appColor }]}
                  onPress={event => this.onPress(event, strings.PLUS)}>
                  {strings.PLUS}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {(this.props.objectdata.QuickOrder !== '0' ||(this.props.objectdata.QuickOrder === '0' &&(this.props.objectdata.Modifiers && this.props.objectdata.Modifiers.length===0)))&& (
            <Button
              style={[COMMON_BUTTON_STYLE, { marginTop: 15, backgroundColor: this.props.appColor }]}
              onPress={event => this.onPress(event, strings.QUICK_ORDER)}>
              <Text
                allowFontScaling={FONT_SCALLING}
                style={[COMMON_BUTTON_TEXT_STYLE, { fontFamily: ROADSTER_REGULAR, fontSize: 18, lineHeight: 18 }]}>
                {strings.QUICK_ORDER.toUpperCase()}
              </Text>
            </Button>
          )}
          {this.props.objectdata.Modifiers && this.props.objectdata.Modifiers.length>0 && (
            <Button
              style={[COMMON_BUTTON_STYLE, { marginTop: 15, backgroundColor: this.props.appColor }]}
              onPress={event => this.onPress(event, strings.CUSTOMIZE)}>
              <Text
                allowFontScaling={FONT_SCALLING}
                style={[COMMON_BUTTON_TEXT_STYLE, { fontFamily: ROADSTER_REGULAR, fontSize: 18, lineHeight: 18 }]}>
                {strings.CUSTOMIZE.toUpperCase()}
              </Text>
            </Button>
          )}
        </View>
      </View>
    );
  }
}

const styles = {
  containerStyle: {
    height: 300,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    backgroundColor: APP_COLOR_BLACK,
    alignItems: 'center'
  },
  listItemTitleTextStyle: {
    color: APP_COLOR_WHITE,
    marginStart: 20,
    marginTop: 20,
    marginEnd: 20,
    fontSize: 12,
    fontFamily: DINENGSCHRIFT_REGULAR
  },
  crossImageStyle: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    // color: APP_COLOR_RED,
    tintColor: APP_COLOR_RED
  },

  buttonContainerStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20
  },
  addtoOrderTextStyle: {
    fontSize: 18,
    marginTop: 10,
    fontFamily: ROADSTER_REGULAR,
    color: APP_COLOR_WHITE
  },
  counterTextStyle: {
    color: APP_COLOR_BLACK,
    fontSize: 24,
    fontFamily: ROADSTER_REGULAR,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  counterMinusViewStyle: {
    width: 20
  },
  counterPlusViewStyle: {
    width: 20
  }
};
function mapStateToProps(state) {
  return {
    objectdata: state.category.selectedItemObject,
    cartItemsArray: state.cart.cartItemsArray,
    currency: state.app.currency
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
  mapDispatchToProps
)(CategoryOnScreenCartView);
