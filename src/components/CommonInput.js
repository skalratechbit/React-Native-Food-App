import React, { Component } from "react";
import { View, TextInput } from "react-native";
import { DINENGSCHRIFT_REGULAR } from "../assets/fonts";
import { COMMON_INPUT_STYLE, COMMON_INPUT_TEXT_STYLE } from "../config/common_styles";

class CommonInput extends Component {
  handleKeyDown(e) {
    if (e.nativeEvent.key === " ") {
      return;
    }
  }
  render() {
    return (
      <View style={COMMON_INPUT_STYLE}>
        <TextInput
          {...this.props}
          ref={this.props.ref}
          autoFocus={this.props.autoFocus}
          secureTextEntry={this.props.secureTextEntry}
          placeholder={this.props.placeholder}
          placeholderTextColor={'#BBBBBB'}
          autoCorrect={false}
          multiline={this.props.multiline}
          style={[
            COMMON_INPUT_TEXT_STYLE,
            { fontFamily: DINENGSCHRIFT_REGULAR, paddingVertical: 0 }
          ]}
          value={this.props.value}
          underlineColorAndroid="transparent"
          onChangeText={this.props.onChangeText}
          onFocus={this.props.onFocus}
          keyboardType={this.props.keyboardType}
        />
      </View>
    );
  }
}

//export method
export { CommonInput };
