import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { FONT_SCALLING } from '../../../config/common_styles';
import RadioButton from '../../../components/RadioButton';
import renderStyles from './CardsHolderStyles';
import { DINENGSCHRIFT_BOLD } from '../../../assets/fonts';
import strings from '../../../config/strings/strings';

let styles = {};

export default class Card extends Component {

  constructor(props) {
    super(props)
    this.state = { cvvText: '' };
  }

  componentWillMount() {
    const { color } = this.props;
    styles = renderStyles(color);
  }

  componentWillReceiveProps(nextProps) {
    const { isSelected } = nextProps;
    const { cvvText } = this.state;
    const doKeep = isSelected && isSelected == this.props.isSelected;
    if(isSelected) console.log(isSelected, isSelected == this.props.isSelected, this.props.isSelected);
    if(!doKeep) this.setState({ cvvText: '' });
  }

  handleCardSelection = () => {
    const {
      card: { token, index, id }
    } = this.props;
    this.props.setCardSelection(index, token, id);
  };

  onChangeCVV = cvv => {
    this.props.setCVVValue(cvv);
    this.setState({
      cvvText: cvv
    });
  };

  setTextInputRef = ref => {
    this.textInput = ref;
  };

  render() {
    const { card, isSelected, color } = this.props;
    const { cvvText } = this.state;
    const { token, id, brand, label } = card;
    const masterBRAND = brand && brand.match(/MASTERCARD/i);
    const visaBRAND = brand && brand.match(/VISA/i);
    const brandName = masterBRAND || visaBRAND || [brand]
    const CardRadio = (<RadioButton style={styles.radioButton} size={15} isActive={isSelected} color={color} />);
    const CardLabel = (
      <Text allowFontScaling={FONT_SCALLING} style={styles.buttonLabel}>
        {brandName[0] ? `${brandName[0]} ${label}` : label}
      </Text>
    );
    const CardButton = (
      <TouchableOpacity style={styles.cardButton} onPress={this.handleCardSelection}>
        {CardRadio}
        {CardLabel}
      </TouchableOpacity>
    );
    const CardCVC = (
      <TextInput
        autoFocus
        keyboardType="numeric"
        ref={this.setTextInputRef}
        style={styles.cvcInput}
        maxLength={3}
        placeholder="CVV"
        onChangeText={this.onChangeCVV}
        autoCorrect={false}
        underlineColorAndroid="transparent"
        value={cvvText}
      />
    );
    return (
      <View style={[styles.card, isSelected && this.props.index !== -1 && { flexDirection: 'column' }]}>
        {CardButton}
        {isSelected && this.props.index !== -1 && <TouchableOpacity
          style={{ marginLeft: 28, alignItems: 'center' }}
          onPress={() => this.props.handleDeleteCard(card.id)}
         >
          <Text style={{ fontSize: 12, color: color, fontFamily: DINENGSCHRIFT_BOLD }}>{strings.DELETE_CARD}</Text>
        </TouchableOpacity>}
      </View>
    );
  }
}
