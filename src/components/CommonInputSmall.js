import React, { Component } from "react";
import { View, TextInput } from "react-native";
import { DINENGSCHRIFT_REGULAR } from "../assets/fonts";
import { COMMON_SMALL_INPUT_STYLE, COMMON_INPUT_TEXT_STYLE } from "../config/common_styles";

class CommonInputSmall extends Component {
  handleKeyDown(e) {
    if (e.nativeEvent.key === " ") {
      return;
    }
  }
  render() {
    const {
      textInputStyle
    } = styles;
    return (
      <View style={this.props.viewStyle ? this.props.viewStyle : COMMON_SMALL_INPUT_STYLE}>
        <TextInput
          {...this.props}
          secureTextEntry={this.props.secureTextEntry}
          placeholder={this.props.placeholder}
          autoCorrect={false}
          multiline={this.props.multiline}
          style={[
            COMMON_INPUT_TEXT_STYLE,
            textInputStyle,
						this.props.textStyle
          ]}
          maxLength={this.props.maxLength}
          value={this.props.value}
          underlineColorAndroid="transparent"
          onChangeText={this.props.onChangeText}
          onFocus={this.props.onFocus}
          keyboardType={this.props.keyboardType}
          onBlur={this.props.onBlur}
          returnKeyType={this.props.returnKeyType}
        />
      </View>
    );
  }
}

const styles = {
  textInputStyle: {
		fontFamily: DINENGSCHRIFT_REGULAR,
		paddingVertical: 0
	}
};

export { CommonInputSmall };
