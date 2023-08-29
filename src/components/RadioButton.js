import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { APP_COLOR_WHITE } from '../config/colors';

class RadioButton extends Component {
  render() {
    const { RadioStyle, RadioActiveStyle } = styles;
    const { isActive, onPress, style, color, size } = this.props;
    const customStyle = {};
    if (color) {
      //set base color & set active color
      customStyle.borderColor = color;
      if (isActive) customStyle.backgroundColor = color;
    }
    if (size) {
      //set sizes
      customStyle.width = customStyle.height = moderateScale(size);
    }
    return (
      <View
        onPress={onPress}
        style={[RadioStyle, isActive ? RadioActiveStyle : {}, customStyle, style]}
      />
    );
  }
}

const styles = StyleSheet.create({
  RadioStyle: {
    alignSelf: 'center',
    width: moderateScale(18),
    height: moderateScale(18),
    borderRadius: 25,
    borderWidth: 2,
    borderColor: APP_COLOR_WHITE
  },
  RadioActiveStyle: {
    backgroundColor: APP_COLOR_WHITE
  }
});

export default RadioButton;
