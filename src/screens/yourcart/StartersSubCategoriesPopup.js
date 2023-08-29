import React, { Component } from 'react';
import {
  View,
  Modal,
  Text,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback
} from "react-native";
import {
  APP_COLOR_WHITE,
  APP_COLOR_RED,
  APP_COLOR_BLACK,
  TRANSPARENT_COLOR
} from "../../config/colors";
import {
  DINENGSCHRIFT_REGULAR,
  HELVETICANEUE_LT_STD_CN
} from "../../assets/fonts";
import {
  POPCROSS_IC,
  ITEM1,
  ITEM2,
  ITEM3,
  ITEM4,
  ITEM5,
  ITEM6
} from "../../assets/images";
import {
  FONT_SCALLING
} from "../../config/common_styles";
import { BASE_DOMAIN } from '../../config/constants/network_constants';

import { connect } from "react-redux";
import {CachedImage} from 'react-native-img-cache';
import { actions as cartActions } from "../../ducks/cart";
const ICON_SIZE = 31;
const ICON_VIEW_SIZE = 60;
const TEXT_LEFT_MARGIN = 65;
const TEXT_SIZE = 25;
const REGISTER_TEXT_SIZE = 8;
const BUTTON_HEIGHT = 53;
const ICONS_MARGIN = 16;
const LINE_HEIGHT = 0.5;
import { IF_OS_IS_IOS } from "../../config/common_styles";
import strings from '../../config/strings/strings';
const styles = {
  containerStyle: {
    flex: 1,
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.8,
    backgroundColor: APP_COLOR_BLACK
  },
  modalBackground: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00000099"
  },
  activityIndicatorWrapper: {
    backgroundColor: "#FFFFFF",
    display: "flex",
    alignItems: "center"
  },
  headingViewStyle: {
    backgroundColor: APP_COLOR_RED,
    padding: 18
  },
  popUpContainerView: {
    borderRadius: 10,
    borderWidth: 0,
    width: 300,
    overflow: "hidden"
  },
  headingTextStyle: {
    fontSize: 35,
    fontFamily: DINENGSCHRIFT_REGULAR,
    alignSelf: "center",
    color: APP_COLOR_WHITE,
    marginTop: 7,
    textAlign: "center"
  },
  subHeadingStyle: {
    fontSize: 25,
    fontFamily: DINENGSCHRIFT_REGULAR,
    alignSelf: "center",
    color: APP_COLOR_RED
  },
  detailTextStyle: {
    fontSize: 18,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    alignSelf: "center",
    color: APP_COLOR_BLACK,
    textAlign: "center",
    marginStart: 10,
    marginEnd: 10,
    marginTop: 20
  },
  crossImageStyle: {
    width: 18,
    height: 18,
    resizeMode: "contain"
  },
  crossImageTouchStyle: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 8,
    top: 10
  },

  bottomviewStyle: {
    height: 60,
    width: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  imageContainerStyle: {},
  itemImageStyle: {
    width: 350,
    height: 206,
    resizeMode: "contain"
  },
  selectedDotColor: {
    backgroundColor: APP_COLOR_RED,
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
    borderColor: APP_COLOR_RED,
    marginTop: IF_OS_IS_IOS ? 1 : 2
  }
};

class StartersSubCategoriesPopup extends Component {
  state = {
    modalVisibilty: false,
    apiname: "",
    freeItemsDataArray: [
      { image: ITEM1, item: 1, datamargin: 0 },
      { image: ITEM2, item: 1, datamargin: 4 },
      { image: ITEM3, item: 1, datamargin: 0 },
      { image: ITEM4, item: 1, datamargin: 4 },
      { image: ITEM5, item: 1, datamargin: 0 },
      { image: ITEM6, item: 1, datamargin: 4 }
    ],
    bbQStatus: true,
    bufflo: true
  };
  componentWillReceiveProps(nextProps) {
    if (nextProps.starters !== this.props.starters) {
      this.getstartersItemsFomObject(nextProps.starters);
    }
  }
  componentDidMount() {}
  addFreeItemsToCart() {
    var filteredArray = this.state.freeItemsDataArray.filter(obj => obj.Selection == 1);
    if (filteredArray.length == 0) {
      alert("Select at lest one item");
    } else {
      this.setState({ modalVisibilty: false });
      this.props.addFreeItemsToCart(null, this.state.freeItemsDataArray);
    }
  }

  getstartersItemsFomObject(object) {
    var array = [];
    for (var i = 0; i < object[0].Items.length; i++) {
      object[0].Items[i]["Selection"] = 0;
      object[0].Items[i]["Free"] = 1;
      array.push(object[0].Items[i]);
    }
    this.setState({ freeItemsDataArray: array, modalVisibilty: true });
  }
  selectItemOption(index) {
    if (this.state.bbQStatus && index == 2) {
      this.setState({ bufflo: true, bbQStatus: false });
    } else if (this.state.bufflo && index == 1) {
      this.setState({ bufflo: false, bbQStatus: true });
    }
  }
  selectOptionOne = () => {
    this.selectItemOption(1);
  };
  selectOptionTwo = () => {
    this.selectItemOption(2);
  };
  selectItem(index) {
    var array = this.state.freeItemsDataArray;
    for (var i = 0; i < array.length; i++) {
      array[i].Selection = 0;
    }
    array[index].Selection = 1;

    this.setState({ freeItemsDataArray: array });
  }
  handleRequestClose() {}
  render() {
    var days;
    if (this.props.freeStarterExpiryDate) {
    }
    return (
      <Modal
        transparent={true}
        visible={this.state.modalVisibilty}
        onRequestClose={this.handleRequestClose}
      >
        <View style={styles.modalBackground}>
          <View style={styles.popUpContainerView}>
            <View style={styles.activityIndicatorWrapper}>
              <TouchableWithoutFeedback>
                <View style={[styles.imageContainerStyle]}>
                  <CachedImage
                    style={styles.itemImageStyle}
                    source={{
                      uri: `${BASE_DOMAIN}uploads/21/BBQ-wings-pop-up_(1).jpg`,
                    }}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
            <TouchableOpacity
              onPress={this.props.onCrossPressSubCategory}
              style={styles.crossImageTouchStyle}
            >
              <Image style={styles.crossImageStyle} source={POPCROSS_IC} />
            </TouchableOpacity>
            <View
              style={{
                flexDirection: "row",
                height: 50,
                backgroundColor: APP_COLOR_WHITE,
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <TouchableOpacity
                style={{ marginStart: 40, flexDirection: "row" }}
                onPress={this.selectOptionOne}
              >
                {this.state.bbQStatus ? (
                  <View
                    style={[
                      styles.selectedDotColor,
                      { backgroundColor: this.props.appTheme.thirdColor }
                    ]}
                  />
                ) : (
                  <View
                    style={[
                      styles.unslectedTopColor,
                      { borderColor: this.props.appTheme.thirdColor }
                    ]}
                  />
                )}
                <Text
                  style={{
                    color: this.props.appTheme.thirdColor,
                    fontSize: 20,
                    fontFamily: DINENGSCHRIFT_REGULAR,
                    marginStart: 10
                  }}
                >
                  BBQ{" "}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ marginStart: 50, flexDirection: "row", marginEnd: 40 }}
                onPress={selectOptionTwo}
              >
                {this.state.bufflo ? (
                  <View
                    style={[
                      styles.selectedDotColor,
                      { backgroundColor: this.props.appTheme.thirdColor }
                    ]}
                  />
                ) : (
                  <View
                    style={[
                      styles.unslectedTopColor,
                      { borderColor: this.props.appTheme.thirdColor }
                    ]}
                  />
                )}
                <Text
                  style={{
                    color: this.props.appTheme.thirdColor,
                    fontSize: 20,
                    fontFamily: DINENGSCHRIFT_REGULAR,
                    marginStart: 10
                  }}
                >
                  Buffalo
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[styles.bottomviewStyle, { backgroundColor: this.props.appTheme.thirdColor }]}
            >
              <Text
                allowFontScaling={FONT_SCALLING}
                style={[
                  styles.detailTextStyle,
                  {
                    color: APP_COLOR_WHITE,
                    textAlign: "center",
                    marginTop: 0,
                    fontFamily: DINENGSCHRIFT_REGULAR,
                    fontSize: 25
                  }
                ]}
              >
                {strings.VALID_FOR_ONE_MONTH}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}
function mapStateToProps(state) {
  return {
    cartItemsArray: state.cart.cartItemsArray,
    freeStarterExpiryDate: state.app.freeStarterExpiryDate
  };
}

export default connect(
  mapStateToProps,
  cartActions
)(StartersSubCategoriesPopup);
