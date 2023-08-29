import React, { Component } from "react";
import { TextInput, StyleSheet } from "react-native";
import {DINENGSCHRIFT_REGULAR} from "../../assets/fonts";
import { APP_COLOR_WHITE } from '../../config/colors';
import { moderateScale } from 'react-native-size-matters';

import {
  IF_OS_IS_IOS
} from '../../config/common_styles';

class CommonSlimInput extends Component {
  render() {
    return (
      <TextInput
        underlineColorAndroid="transparent"
        placeholder={'Enter Text'}
        {...this.props}
        style={[styles.slimInput, this.props.style]}
      />
    );
  }
}

const styles = StyleSheet.create({
  slimInput: {
    // fontFamily: HELVETICANEUE_LT_STD_CN,
    fontFamily: DINENGSCHRIFT_REGULAR,
    width: moderateScale(250),
    height: 33,
    borderWidth: 0,
    borderStyle: "solid",
    borderRadius: 10,
    backgroundColor: APP_COLOR_WHITE,
    paddingBottom: 0,
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: IF_OS_IS_IOS ? 5 : 0,
    fontSize: 18,
    lineHeight: IF_OS_IS_IOS ? null : 23,
    borderColor: "transparent"
  }
});

export default CommonSlimInput;
