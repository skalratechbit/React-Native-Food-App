import React, { Component } from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { scale, verticalScale } from 'react-native-size-matters'
import {
  IF_OS_IS_IOS,
  COMMON_BUTTON_RADIOUS
} from '../../config/common_styles'
import CommonText from './CommonText'
import { APP_COLOR_BLACK } from '../../config/colors'

class CommonButton extends Component {
  render () {
    const {
      color = APP_COLOR_BLACK,
      buttonText,
      textColor,
      onPress,
      style,
      children,
      roadster,
      disabled = false
    } = this.props
    const { buttonStyle, textStyle } = Styles
    const compStyle = [buttonStyle, { backgroundColor: color }, style]
    if(disabled) compStyle.push({ opacity: 0.5 })
    return (
      <TouchableOpacity
        disabled={disabled}
        title={buttonText || 'button'}
        onPress={onPress}
        style={compStyle}>
        {children || (
          <CommonText color={textColor} style={textStyle} roadster={roadster}>
            {buttonText}
          </CommonText>
        )}
      </TouchableOpacity>
    )
  }
}

const Styles = StyleSheet.create({
  buttonStyle: {
    width: scale(130),
    height: verticalScale(32),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: COMMON_BUTTON_RADIOUS,
  },
  textStyle: {
    paddingTop: IF_OS_IS_IOS ? verticalScale(2) : 0
  }
})

export default CommonButton
