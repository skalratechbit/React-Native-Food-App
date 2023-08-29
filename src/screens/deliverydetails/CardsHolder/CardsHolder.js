import React, { Component } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { FONT_SCALLING } from '../../../config/common_styles'
import CheckBox from '../../../components/CheckBox'
import renderStyles from './CardsHolderStyles'
import Card from './Card'
import strings from '../../../config/strings/strings'

let styles = {}

export default class CardsHolder extends Component {
  state = {
    cvv: '',
    token: null,
    selectedIndex: null,
    saveCard: false
  };

  componentWillMount () {
    const { color } = this.props
    styles = renderStyles(color)
  }

  // methods
  getCardSelection = () => {
    const { cvv, token, saveCard } = this.state
    return { cvv, token, saveCard }
  };

  setCardSelection = (selectedIndex, token) => {
    this.setState({
      selectedIndex,
      token,
      saveCard: false
    })
  };

  setCVVValue = cvv => {
    this.setState({
      cvv
    })
  };

  // handlers
  handleToggleSaveCard = () => {
    const { saveCard } = this.state
    this.setState({
      saveCard: !saveCard
    })
  };

  handleToggleDeleteCard = (id) => {
    this.props.deleteCard(id)
  }

  // renderers
  renderCard = (card, i) => {
    const { selectedIndex } = this.state
    const { color, selectedCurrency } = this.props
    const {
      Card: label,
      Id: id,
      Token: token,
      Brand: brand,
      Currency: currency
    } = card
    const matchCurrency = selectedCurrency === currency
    const index = i
    const token_card = {
      id,
      index,
      label,
      token,
      brand,
      currency
    }
    return (
      matchCurrency && (
        <Card
          key={i}
          index={i}
          isSelected={token_card.index === selectedIndex}
          card={token_card}
          setCardSelection={this.setCardSelection}
          setCVVValue={this.setCVVValue}
          color={color}
          handleDeleteCard={this.handleToggleDeleteCard}
        />
      )
    )
  };

  renderCards (cards) {
    return cards.map(this.renderCard)
  }

  renderSaveCardOption () {
    const { saveCard } = this.state
    const { color } = this.props

    return (
      <TouchableOpacity
        style={[styles.cardButton, styles.newCardButton]}
        onPress={this.handleToggleSaveCard}>
        <CheckBox
          style={styles.radioButton}
          size={14}
          isActive={saveCard}
          color={color}
        />
        <Text allowFontScaling={FONT_SCALLING} style={styles.buttonLabel}>
          {strings.SAVE_CARD.toUpperCase()}
        </Text>
      </TouchableOpacity>
    )
  }

  render () {
    const { cards, color } = this.props
    const { selectedIndex } = this.state
    const new_card = {
      index: -1,
      label: `New Card Payment`,
      token: 'new'
    }
    const isNewSelected = selectedIndex === new_card.index

    return (
      <View style={styles.cardsHolder}>
        <View style={styles.newCardOption}>
          <Card
            key={new_card.index}
            index={new_card.index}
            isSelected={isNewSelected}
            card={new_card}
            setCardSelection={this.setCardSelection}
            setCVVValue={this.setCVVValue}
            color={color}
          />
          {isNewSelected ? this.renderSaveCardOption() : null}
        </View>
        {this.renderCards(cards)}
      </View>
    )
  }
}
