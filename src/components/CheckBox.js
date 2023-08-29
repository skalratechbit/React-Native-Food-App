import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { APP_COLOR_WHITE } from '../config/colors';

class CheckBox extends Component {
  render() {
    const { CheckboxStyle, CheckStyle } = styles;
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
        style={[CheckboxStyle, customStyle, style]}>
        { isActive ? <View style={CheckStyle}/> : null }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  CheckboxStyle: {
    alignSelf: 'center',
    width: moderateScale(18),
    height: moderateScale(18),
    borderRadius: 3,
    borderWidth: 2,
    borderColor: APP_COLOR_WHITE
  },
  CheckStyle: {
    marginTop: moderateScale(1),
    marginLeft: moderateScale(1),
    width: moderateScale(8),
    height: moderateScale(5),
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: APP_COLOR_WHITE,
    transform: [{ rotate: '-45deg' }]
  }
});

export default CheckBox;
