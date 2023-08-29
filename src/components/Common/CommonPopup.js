import React, { Component } from 'react';
import { View, Modal, Text, Image, TouchableOpacity } from 'react-native';
import { POPCROSS_IC, POPCROSS_IC_RED } from '../../assets/images';
import { FONT_SCALLING } from '../../config/common_styles';
import Styles from './CommonPopupStyle';
import {APP_COLOR_BLACK, APP_COLOR_RED} from '../../config/colors';
class CommonPopup extends Component {

  state = {
    visibilty: false,
  }

  handleRequestClose() {}

  componentWillReceiveProps(nextProps) {
      this.setState({ visibilty: nextProps.visibilty });
  }

  render() {
    const {
      color = APP_COLOR_RED,
      heading = null,
      subbody = null,
      details =null,
      customBody = null,
      hideCross = false
    } = this.props;
    const { visibilty } = this.state;
    const {
      modalBackground,
      popUpContainerView,
      headingViewStyle,
      crossImageTouchStyle,
      crossImageStyle,
      headingTextStyle,
      bodyContainerStyle,
      subHeadingStyle,
      detailTextStyle
    } = Styles;
    return (
      <Modal
        transparent={true}
        visible={visibilty}
        onRequestClose={this.handleRequestClose}>
        <View style={modalBackground}>
          <View style={popUpContainerView}>
            <View style={[headingViewStyle, { backgroundColor: color }]}>
              { hideCross ? null : (
                <TouchableOpacity onPress={this.props.onClose} style={crossImageTouchStyle}>
                  <Image style={crossImageStyle} source={color === APP_COLOR_BLACK ? POPCROSS_IC_RED : POPCROSS_IC } />
                </TouchableOpacity>
              ) }
              <Text allowFontScaling={FONT_SCALLING} style={headingTextStyle}>
                {String(heading).toLowerCase()}
              </Text>
            </View>
            <View style={bodyContainerStyle}>
              {subbody && (
                <Text allowFontScaling={FONT_SCALLING} style={[subHeadingStyle, { color: color }]}>
                  {String(subbody).toUpperCase()}
                </Text>
              )}
              {details && (
                <Text allowFontScaling={FONT_SCALLING} style={detailTextStyle}>
                  {details}
                </Text>
              )}
              {customBody && customBody}
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

export default CommonPopup;
