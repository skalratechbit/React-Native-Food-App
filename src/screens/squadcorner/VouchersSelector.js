import React, { Component } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView
} from "react-native";
import AsyncStorage from '@react-native-community/async-storage';
import { Actions } from "react-native-router-flux";
import { APP_COLOR_RED, APP_COLOR_BLACK } from "../../config/colors";
import { IF_OS_IS_IOS, FONT_SCALLING } from "../../config/common_styles";
import strings from "../../config/strings/strings";
import {
  ARROW_RED_LEFT,
  ARROW_RED_RIGHT,
} from "../../assets/images";
import { DINENGSCHRIFT_REGULAR } from "../../assets/fonts";
import { connect } from "react-redux";
import { actions as vouchersActions } from "../../ducks/vouchers";
import { numberWithCommas } from "../../config/common_functions";

class VouchersHelper extends Component {
  state = {
    componentTheme: {},
    vouchersArray: []
  };

  componentWillMount() {
    this.setThemeOfComponent();
  }

  componentDidMount() {
    // this.props.getVouchers()
    if (this.props.fromsquard && this.props.fromsquard == true) {
      this.setSelectonInVouchersObject(this.props.vouchers);
    }
  }

  setThemeOfComponent() {
    const theme = AsyncStorage.getItem("theme").then(data =>
      this.setState({ componentTheme: JSON.parse(data) })
    );
  }
  selectVoucher(index) {
    var array = this.state.vouchersArray.slice();

    if (this.props.fromDelivery == true) {
      if (array[index].selection == 1) {
        array[index].selection = 0;
      } else {
        array[index].selection = 1;
      }
    } else {
      for (var i = 0; i < array.length; i++) {
        if (i == index) {
          array[i].selection = 1;
        } else {
          array[i].selection = 0;
        }
      }
    }
    //  if(this.props.fromDelivery){
    this.props.setSelectedVoucherArray(null, array);
    //}
    this.setState({ vouchersArray: array });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.vouchers !== this.props.vouchers) {
      this.setSelectonInVouchersObject(nextProps.vouchers);
    }
  }

  setSelectonInVouchersObject(array) {
    if (array != undefined) {
      const voucherArray = [];
      array.filter(
        item => { 
          if(item.isActive){
            voucherArray.push({
              ...item,
              Icon: item.URL
            });
          }
        })

      for (let i = 0; i < voucherArray.length; i++) {
        voucherArray[i]["selection"] = voucherArray[i]["selection"] == 1 ? 1 : 0;
        if (this.props.fromDelivery == true) {
          const amount = parseInt(voucherArray[i].Value);
          voucherArray[i].Value = amount;
          //voucherArray[i].Amount=amount*1500;
        }
      }

      this.setState({ vouchersArray: voucherArray });
    }
  }

  onPress = (event, caption) => {
    switch (caption) {
      case strings.BACK:
        Actions.weareat();
        break;

      case strings.ADD_ITEMS:
        alert(strings.ADD_ITEMS);
        break;

      default:
    }
  };

  render() {
    const { vouchersArray } = this.state;
    const isEmpty = vouchersArray.length === 0;
    return (
      <View style={styles.blackInnerContanerStyle}>
        <View style={styles.voucherSelectionStyle}>
          <Text allowFontScaling={FONT_SCALLING} style={[styles.voucherTextStyle]}>
            {strings.VOUCHER.toUpperCase()}:
          </Text>
        </View>
        <View style={styles.voucherSliderStyle}>
          <Image style={styles.voucherRightLeftArrowStyle} source={ARROW_RED_LEFT} />

          <ScrollView horizontal hideHorizontalScrollIndicator={true} style={{ flex: 1 }}>
            {vouchersArray.map((item, i) => (
              <View key={i} style={styles.voucherListItemStyle}>
                <TouchableOpacity onPress={() => this.selectVoucher(i)}>
                  <Image
                    style={[styles.voucherImageStyle]}
                    source={{ uri: item.Icon ? item.Icon : '' }}
                  />
                  
                  {item.selection == 1 && <View style={styles.disabledViewColor} />}
                </TouchableOpacity>
                <Text style={styles.voucherValue}>{numberWithCommas(item.value, item.currency)}</Text>
              </View>
            ))}
            {isEmpty && (
              <View style={styles.noVoucherContainer}>
                <Text allowFontScaling={FONT_SCALLING} style={styles.noVoucherText}>
                  {strings.YOU_HAVE_NO_VOUCHERS}
                </Text>
              </View>
            )}
          </ScrollView>

          <Image style={styles.voucherRightLeftArrowStyle} source={ARROW_RED_RIGHT} />
        </View>
      </View>
    );
  }
}
const styles = {
  voucherRightLeftArrowStyle: {
    height: 12,
    width: 10,
    marginStart: 10,
    resizeMode: "contain",
    marginBottom: IF_OS_IS_IOS ? 10 : 0,
    marginTop: 5
  },
  voucherSliderStyle: {
    //width: 220,
    flex: 2,
    height: "auto",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center"
  },
  voucherTextStyle: {
    fontSize: 16,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_RED
  },
  noVoucherContainer: {
    flex: 1,
    width: '100%',
    minWidth: IF_OS_IS_IOS ? 230 : 200,
    alignItems: "center",
    justifyContent: "center"
  },
  noVoucherText: {
    fontSize: 12,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_BLACK,
    paddingTop: IF_OS_IS_IOS ? 0 : 5,
    textAlign: 'center'
  },
  voucherSelectionStyle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  blackInnerContanerStyle: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1
  },
  disabledViewColor: {
    flex: 1,
    backgroundColor: "#00000090",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0
  },
  voucherImageStyle: {
    width: 45,
    height: 45,
    resizeMode: "contain"
    //backgroundColor:APP_COLOR_RED
  },
  voucherListItemStyle: {
    alignSelf: "center",
    width: 55,
    maxHeight: 60,
    marginLeft: 5
  },
  voucherValue: {
    color:'black',
    marginTop: -5,
    fontSize: 8,
    marginLeft: 3
  }
};

export default connect(
  null,
  vouchersActions
)(VouchersHelper);
