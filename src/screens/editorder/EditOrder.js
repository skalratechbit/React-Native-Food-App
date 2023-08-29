import React, { Component } from "react";
import { Text, View, Image, TouchableOpacity } from "react-native";
import AsyncStorage from '@react-native-community/async-storage';
import { actions as cartActoins } from "../../ducks/cart";
import { Item, Input, Button, List, ListItem } from "native-base";
import { connect } from "react-redux";
import {
  APP_COLOR_WHITE,
  APP_COLOR_RED,
  SEARCH_BACKGROUND_COLOR,
  APP_COLOR_BLACK
} from "../../config/colors";
import {
  DINENGSCHRIFT_REGULAR,
  ROADSTER_REGULAR,
  HELVETICANEUE_LT_STD_CN
} from "../../assets/fonts";
import { numberWithCommas } from "../../config/common_functions";
import { BASE_DOMAIN } from '../../config/constants/network_constants';
import strings from "../../config/strings/strings";
import {
  IF_OS_IS_IOS,
  COMMON_BUTTON_RADIOUS,
  COMMON_BUTTON_TEXT_STYLE,
  COMMON_BUTTON_STYLE,
  FONT_SCALLING
} from "../../config/common_styles";
import { SEARCH_ICON } from "../../assets/images";

const SEARCH_CONTAINER_HEIGHT = 41.5;
const SEARCH_TEXT_SIZE = 25.5;
const SEARCH_ICON_WIDTH = 23.5;
const SEARCH_ICON_HEIGHT = 25.5;
const TITLE_CONTAINER_HEIGHT = 42.5;
const ADD_ITEMS_TEXT_SIZE = 20.5;
const TITLE_CONTAINER_PADDING = 5;
const TITLE_ARROW_WIDTH = 9;
const TITLE_ARROW_HEIGHT = 15;
const TITLE_ARROW_MARGIN_LEFT = 4;
const MARGIN_LEFT_RIGHT = 15;
const TITLE_TEXT_SIZE = 30;
const CHECK_MEAL_CONTAINER_HEIGHT = 70.5;
const TOTAL_AMOUNT_CONTAINER_HEIGHT = 90.5;
const IS_VEGGIE_MEAL = true;
const GO_FOR_IT_BUTTON_WIDTH = 153;
const GO_FOR_IT_BUTTON_HEIGHT = 32;
const GO_FOR_IT_BUTTON_TEXT_SIZE = 17.5;
const ITEM_CELL_HEIGHT = 85;
const ITEM_TITLE_TEXT_SIZE = 25;
const CUSTOMIZE_TEXT_SIZE = 15.5;
const BASE_UPLOAD_URL = `${BASE_DOMAIN}uploads/`;

class EditOrder extends Component {
  state = { loggedInUserInfo: "", itemsArrayforEdit: [], componentTheme: {} };
  componentWillMount() {
    this.setThemeOfComponent();
  }
  setThemeOfComponent() {
    const theme = AsyncStorage.getItem("theme").then(data =>
      this.setState({ componentTheme: JSON.parse(data) })
    );
  }
  onPress = (event, caption, index) => {
    switch (caption) {
      case strings.GO_FOR_IT:
        break;
      case strings.PLUS:
        var array = this.state.itemsArrayforEdit.slice();
        var filteredArray = array[index];
        var selectedObject = filteredArray;

        array[index]["quantity"] = array[index]["quantity"] + 1;
        this.setState({ itemsArrayforEdit: _.cloneDeep(array) });
        break;

      case strings.MINUS:
        var array = this.state.itemsArrayforEdit.slice();
        var selectedObject = array[index];
        //var selectedObject =  filteredArray;
        selectedObject["quantity"] =
          selectedObject["quantity"] - 1 == 0
            ? selectedObject["quantity"]
            : selectedObject["quantity"] - 1;
        this.setState({ itemsArrayforEdit: _.cloneDeep(array) });
        break;

      case strings.CONTINUE:
        this.props.additmeToCart(this.state.itemsArrayforEdit);
        break;

      default:
    }
  };

  getTotalPrice() {
    var count = 0;
    for (var i = 0; i < this.state.itemsArrayforEdit.length; i++) {
      const totalAmountOfOneItem =
        parseInt(this.state.itemsArrayforEdit[i].quantity) *
        parseInt(this.state.itemsArrayforEdit[i].Price);
      count = count + parseInt(totalAmountOfOneItem);
    }
    return count;
  }
  componentDidMount() {
    this.setRowIndexOfCartItems(this.props.itemsArray);
  }

  setRowIndexOfCartItems(items) {
    for (var i = 0; i < items.length; i++) {
      items[i]["rowIndex"] = i;
    }
    this.setState({ itemsArrayforEdit: items });
  }
  render() {
    const {
      scrollStyle,
      container,
      subContainer,
      mealTitleTextStyle,
      titleContainerStyle,
      searchBarStyle,
      listItemContainer,
      listItemSubContainer,
      searchBarTextStyle,
      starsTextStyle,
      totalAmountTextStyle,
      listItemTitleTextStyle,
      starImageStyle,
      priceContainerStyle,
      detailRowContainerStyle,
      searchIconStyle,
      quantityTextStyle,
      quantityViewStyle,
      instructionsContainerStyle,
      plusTextStyle,
      minusViewStyle,
    } = styles;
    return (
      <View style={[scrollStyle, { backgroundColor: this.state.componentTheme.thirdColor }]}>
        <View style={container}>
          <View
            style={[
              subContainer,
              {
                flexDirection: "row",
                height: SEARCH_CONTAINER_HEIGHT,
                backgroundColor: SEARCH_BACKGROUND_COLOR
              }
            ]}
          >
            <Item style={searchBarStyle}>
              <Input style={searchBarTextStyle} placeholder="Search" />
              <Image source={SEARCH_ICON} style={searchIconStyle} />
            </Item>
          </View>
          <View style={[subContainer, { flexDirection: "row", height: TITLE_CONTAINER_HEIGHT }]}>
            <TouchableOpacity style={titleContainerStyle}>
              <Text
                allowFontScaling={FONT_SCALLING}
                style={[mealTitleTextStyle, { color: this.state.componentTheme.thirdColor }]}
              >
                {strings.VEGGIE_MEAL.toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: "row",
              backgroundColor: this.state.componentTheme.thirdColor,
              width: "100%"
            }}
          >
            <List
              bounces={false}
              horizontal={false}
              dataArray={this.state.itemsArrayforEdit}
              style={{ marginBottom: 225 }}
              renderRow={(item, sectionID, rowID, higlightRow) => (
                <ListItem style={listItemContainer}>
                  <View style={[listItemSubContainer]}>
                    <Text allowFontScaling={FONT_SCALLING} style={listItemTitleTextStyle}>
                      {item.ItemName.toUpperCase()}
                    </Text>
                    <TouchableOpacity
                      style={{ flexDirection: "row", alignItems: "center" }}
                      onPress={event => this.onPress(event, strings)}
                    >
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: "row", position: "absolute", end: 0 }}>
                    <TouchableOpacity
                      onPress={event => this.onPress(event, strings.MINUS, rowID)}
                      style={{
                        width: 30,
                        height: 32,
                        borderRadius: 10,
                        alignItems: "flex-end",
                        marginRight: 4,
                        justifyContent: "center"
                      }}
                    >
                      <View style={minusViewStyle} />
                    </TouchableOpacity>
                    <View style={quantityViewStyle}>
                      <Text allowFontScaling={FONT_SCALLING} style={quantityTextStyle}>
                        {item.quantity}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={event => this.onPress(event, strings.PLUS, rowID)}
                      style={{
                        width: 30,
                        height: 32,

                        alignItems: "flex-start",
                        justifyContent: "center"
                      }}
                    >
                      <Text allowFontScaling={FONT_SCALLING} style={plusTextStyle}>
                        {strings.PLUS}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ListItem>
              )}
            />
          </View>
        </View>
        <View
          style={{
            height: TOTAL_AMOUNT_CONTAINER_HEIGHT,
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            bottom: 0,
            flex: 1
          }}
        >
          <View
            style={[
              subContainer,
              {
                flexDirection: "column",
                height: TOTAL_AMOUNT_CONTAINER_HEIGHT + 80,
                backgroundColor: APP_COLOR_BLACK,
                alignItems: "center",
                justifyContent: "center",
                paddingStart: MARGIN_LEFT_RIGHT,
                paddingEnd: MARGIN_LEFT_RIGHT
              }
            ]}
          >
            <View style={detailRowContainerStyle}>
              <View style={[instructionsContainerStyle, { width: "50%" }]}>
                <Text allowFontScaling={FONT_SCALLING} style={totalAmountTextStyle}>
                  {strings.TOTAL_AMOUNT.toUpperCase() + ":"}
                </Text>
              </View>
              <View style={priceContainerStyle}>
                <Text allowFontScaling={FONT_SCALLING} style={totalAmountTextStyle}>
                  {/* { "67,250" + " " + strings.LBP } */}
                  {numberWithCommas(this.getTotalPrice())}
                </Text>
              </View>
            </View>

            <View
              style={[
                priceContainerStyle,
                { justifyContent: "flex-end", flexDirection: "row", width: "100%" }
              ]}
            >
              <Text allowFontScaling={FONT_SCALLING} style={starsTextStyle}>
                {Math.round(this.getTotalPrice() / 1000) + " " + strings.STARS}
              </Text>
              <Image style={starImageStyle} source={this.state.componentTheme.STAR_IMAGE} />
            </View>
            <Button
              onPress={event => this.onPress(event, strings.CONTINUE)}
              style={[
                COMMON_BUTTON_STYLE,
                {
                  marginBottom: 35,
                  marginTop: 10,
                  alignSelf: "center",
                  backgroundColor: this.state.componentTheme.thirdColor
                }
              ]}
            >
              <Text
                allowFontScaling={FONT_SCALLING}
                style={[COMMON_BUTTON_TEXT_STYLE, { fontFamily: ROADSTER_REGULAR }]}
              >
                {strings.CONTINUE.toUpperCase()}
              </Text>
            </Button>
          </View>
        </View>
      </View>
    );
  }
}

const styles = {
  scrollStyle: {
    flex: 1,
    backgroundColor: APP_COLOR_RED
  },
  container: {
    flex: 1
  },
  subContainer: {
    left: 0,
    right: 0,
    backgroundColor: APP_COLOR_WHITE,
    alignItems: "center"
  },
  addItemsContainerStyle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end"
  },
  addItemsTextStyle: {
    textAlign: "right",
    color: APP_COLOR_RED,
    fontSize: ADD_ITEMS_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR
  },
  arrowImageStyle: {
    marginLeft: TITLE_ARROW_MARGIN_LEFT,
    marginRight: MARGIN_LEFT_RIGHT,
    width: TITLE_ARROW_WIDTH,
    height: TITLE_ARROW_HEIGHT,
    marginBottom: IF_OS_IS_IOS ? 7 : 0
  },
  mealTitleTextStyle: {
    color: APP_COLOR_RED,
    fontSize: TITLE_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    alignItems: "center",
    textAlign: "center",
    marginStart: MARGIN_LEFT_RIGHT,
    alignSelf: "flex-start",
    marginTop: IF_OS_IS_IOS ? 8 : 0
  },
  titleContainerStyle: {
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1
  },
  searchBarStyle: {
    backgroundColor: SEARCH_BACKGROUND_COLOR
  },
  searchBarTextStyle: {
    fontFamily: DINENGSCHRIFT_REGULAR,
    fontSize: SEARCH_TEXT_SIZE,
    marginStart: MARGIN_LEFT_RIGHT - 5,
    color: APP_COLOR_BLACK
  },
  searchIconStyle: {
    marginEnd: MARGIN_LEFT_RIGHT,
    width: SEARCH_ICON_WIDTH,
    height: SEARCH_ICON_HEIGHT
  },
  listItemContainer: {
    height: ITEM_CELL_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 0,
    paddingRight: 0,
    marginRight: 0,
    marginTop: 0,
    paddingTop: 0,
    paddingBottom: 0
  },
  listItemSubContainer: {
    height: ITEM_CELL_HEIGHT,
    flexDirection: "column",
    justifyContent: "center",
    marginLeft: 0,
    paddingLeft: 0,
    paddingRight: 0,
    marginRight: 0,
    marginTop: 0,
    paddingTop: 0,
    paddingBottom: 0
  },
  goForItButtonStyle: {
    backgroundColor: APP_COLOR_RED,
    width: GO_FOR_IT_BUTTON_WIDTH,
    height: GO_FOR_IT_BUTTON_HEIGHT,
    alignItems: "center",
    position: "absolute",
    paddingBottom: IF_OS_IS_IOS ? 9 : 5,
    right: MARGIN_LEFT_RIGHT,
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: COMMON_BUTTON_RADIOUS
  },
  priceContainerStyle: {
    alignItems: "flex-end",
    justifyContent: "center",
    width: "50%"
  },
  starsTextStyle: {
    textAlign: "right",
    color: APP_COLOR_WHITE,
    fontSize: 19.8,
    fontFamily: HELVETICANEUE_LT_STD_CN
  },
  starImageStyle: {
    alignSelf: "center",
    marginStart: 3,
    width: 20,
    height: 20,
    marginBottom: IF_OS_IS_IOS ? 8 : 0
  },
  detailRowContainerStyle: {
    flexDirection: "row"
  },
  instructionsContainerStyle: {
    width: "75%"
  },
  totalAmountTextStyle: {
    fontSize: 30,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_WHITE
  },
  listItemTitleTextStyle: {
    color: APP_COLOR_BLACK,
    marginStart: MARGIN_LEFT_RIGHT,
    fontSize: ITEM_TITLE_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR
  },
  customizeTextStyle: {
    color: APP_COLOR_WHITE,
    fontSize: CUSTOMIZE_TEXT_SIZE,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    marginStart: MARGIN_LEFT_RIGHT
  },
  plusTextStyle: {
    fontSize: 21,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    color: APP_COLOR_WHITE,
    fontWeight: "400",
    paddingTop: IF_OS_IS_IOS ? 5 : 0,
    marginLeft: 2
  },
  minusViewStyle: {
    backgroundColor: APP_COLOR_WHITE,
    width: 10,
    height: 1.5
  },
  quantityViewStyle: {
    width: 41.5,
    height: 32,
    backgroundColor: APP_COLOR_WHITE,
    borderRadius: 10,
    marginLeft: 5,
    marginRight: 5,
    alignItems: "center",
    justifyContent: "center"
  },
  quantityTextStyle: {
    fontSize: 20.25,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_BLACK,
    paddingTop: IF_OS_IS_IOS ? 5 : 0
  },
  editOrderArrowImageStyle: {
    marginBottom: IF_OS_IS_IOS ? 4 : 0
  }
};
const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      ...homeActions,
      ...cartActoins
    },
    dispatch
  )
});

export default connect(
  null,
  cartActoins
)(EditOrder);

//export default EditOrder;
