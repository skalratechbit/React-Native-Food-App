import React, { Component } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import {CachedImage} from 'react-native-img-cache';
const WIDTH = 30;
const HEIGHT = 50;

class FavButton extends Component {
  handleOnPress = () => {
    const { item } = this.props;
    this.props.onPress(item);
  }
  render() {
    const { theme, active, style } = this.props;
    const { buttonStyle, ribbonImage } = Styles;
    const { FAV_RIBBON, FAVED_RIBBON } = theme;
    const renderedRibbon = active ? FAVED_RIBBON : FAV_RIBBON;
    return (
      <TouchableOpacity
        onPress={this.handleOnPress}
        style={[buttonStyle, style]}>
        <CachedImage
          resizeMode={'contain'}
          style={ribbonImage}
          source={renderedRibbon}/>
      </TouchableOpacity>
    );
  }
}

const Styles = StyleSheet.create({
  buttonStyle: {
    width: WIDTH,
    height: HEIGHT,
    position: 'absolute',
    zIndex: 1
  },
  ribbonImage: {
    width: WIDTH,
    height: HEIGHT
  }
});

export default FavButton;
