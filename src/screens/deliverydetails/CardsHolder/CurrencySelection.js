import React, { Component } from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { FONT_SCALLING } from '../../../config/common_styles'
import renderStyles from './CurrencySelectionStyles'
import CheckBox from '../../../components/CheckBox'

export default class CurrencySelection extends Component {
  handleSetCurrency = () => {
    const { setCurrency, CurrencyObject } = this.props
    this.props.setCurrency(CurrencyObject)
  };

  render () {
    const { Currency, isSelected, color } = this.props
    const styles = renderStyles(color)
    return (
      <TouchableOpacity
        onPress={this.handleSetCurrency}
        style={styles.container}>
        <CheckBox style={styles.radioButton} size={14} isActive={isSelected} color={color} />
        <Text allowFontScaling={FONT_SCALLING} style={styles.currencyLabel}>
          {Currency}
        </Text>
      </TouchableOpacity>
    )
  }
}
