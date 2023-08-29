
import React from 'react';
import { Image, View } from 'react-native';
import { LOGO_BRAND_IMAGE } from '../assets/images';
const LOGO_SIZE_WIDTH = 200;
const LOGO_SIZE_HEIGHT = 44;
const ROADSTER_TEXT_SIZE = 38.15;
const DINER_TEXT_SIZE = 18;
const REGISTER_TEXT_SIZE = 8;

const Logo = ({ onPress }) => {
	const { containerStyle,logoImageStyle } = styles;

return (
      <View onPress={ onPress } style={ containerStyle }>
        <Image style={ logoImageStyle } source={ LOGO_BRAND_IMAGE } resizeMode="contain"/>
      </View>
  );
};

const styles = {
	containerStyle: {
		alignSelf: 'center',
		alignItems: 'center',
		justifyContent: 'center'
  },
	logoImageStyle: {
		width: LOGO_SIZE_WIDTH,
		height: LOGO_SIZE_HEIGHT
	},
};

export { Logo };
