import React, { Component } from 'react'
import { Text, StyleSheet } from 'react-native'
import {
  ROADSTER_REGULAR,
  HELVETICANEUE_LT_STD_CN,
  DINENGSCHRIFT_BOLD
} from '../../assets/fonts'
import { IF_OS_IS_IOS, FONT_SCALLING } from '../../config/common_styles'
import { APP_COLOR_WHITE } from '../../config/colors'

class CommonText extends Component {
  render () {
    const {
      color = APP_COLOR_WHITE,
      children,
      style,
      roadster,
      light
    } = this.props
    const { textStyle } = Styles
    const styleComp = [textStyle, { color: color }, style]
    if (roadster) styleComp.push({ fontFamily: ROADSTER_REGULAR })
    if (light) styleComp.push({ fontFamily: HELVETICANEUE_LT_STD_CN })
    return (
      <Text allowFontScaling={FONT_SCALLING} style={styleComp}>
        {children}
      </Text>
    )
  }
}

const Styles = StyleSheet.create({
  textStyle: {
    fontFamily: DINENGSCHRIFT_BOLD,
    fontSize: 16,
    marginTop: IF_OS_IS_IOS ? 3 : 0
  }
})

export default CommonText
