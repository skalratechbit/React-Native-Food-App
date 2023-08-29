import React , { Component }from 'react';
import { View, TextInput } from 'react-native';
import { DINENGSCHRIFT_REGULAR } from '../assets/fonts'
import {  COMMON_SMALL_INPUT_STYLE,
	COMMON_INPUT_TEXT_STYLE } from '../config/common_styles'

	class CommonInput120 extends Component {
		handleKeyDown(e) {

			if(e.nativeEvent.key === ' '){
				return ;
			}
		}
		render (){
			return (
				<View  style={ this.props.viewStyle? this.props.viewStyle : COMMON_SMALL_INPUT_STYLE }>
					<TextInput
						secureTextEntry={this.props.secureTextEntry}
						placeholder={this.props.placeholder }
						autoCorrect={false}
						style={[ COMMON_INPUT_TEXT_STYLE, { fontFamily: DINENGSCHRIFT_REGULAR, paddingVertical: 0, width: 120, paddingBottom: 5 }]  }
						value={this.props.value}
						underlineColorAndroid='transparent'
						onChangeText={this.props.onChangeText}
						onFocus={this.props.onFocus}
						keyboardType={this.props.keyboardType}
						onBlur={this.props.onBlur}
						returnKeyType={this.props.returnKeyType}

					/>
				</View>
			);
		}
	};

	export { CommonInput120 };
