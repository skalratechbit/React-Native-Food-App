import React, { Component } from 'react';
import { Text, View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { verticalScale, moderateScale } from 'react-native-size-matters';
import { APP_COLOR_WHITE, APP_COLOR_BLACK } from '../config/colors';
import { PACIFICO } from '../assets/fonts';
import { ifIphoneX } from 'react-native-iphone-x-helper';

import {
  IF_OS_IS_IOS,
} from '../config/common_styles';

export default class TitleBar extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { color, titleText, backIcon, titleIcon, titleIconSize, titleRightComponent } = this.props;
    const { container, backIconStyle, titleBarContainer, titleTextStyle, titleIconStyle, titleRightStyle } = renderStyles(color)
    return (
      <View style={container}>
        <TouchableOpacity
          style={titleBarContainer}
          onPress={this.props.onPress}>
          { !backIcon ? null : (
              <View style={{justifyContent:'center', paddingVertical:20}}>
            <Image
              style={backIconStyle}
              source={backIcon}
            />
              </View>
          ) }
          <View style={{justifyContent:'center',marginTop:-4}}>
            <Text style={titleTextStyle}>
            {titleText && titleText.toLowerCase()}
          </Text>
          </View>
          { !titleIcon ? null : (
            <Image style={[titleIconStyle, titleIconSize ? titleIconSize : {} ]} source={titleIcon} resizeMode="contain" />
          ) }
          { titleRightComponent ? <View style={titleRightStyle}>{titleRightComponent}</View> : null }
        </TouchableOpacity>
      </View>
    );
  }
}
function renderStyles(color) {
  return StyleSheet.create({
    container: {
      width: '100%',
      backgroundColor: APP_COLOR_WHITE
    },
    titleBarContainer: {
      backgroundColor: APP_COLOR_WHITE,
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: moderateScale(16),
      paddingRight: moderateScale(16),
      zIndex: 8
    },
    backIconStyle: {
      width: 20,
      height: 20,
      alignSelf: 'center',
      marginRight: moderateScale(10),
      resizeMode: 'contain',
    },
    titleTextStyle: {
      // textAlign: 'center',
      alignSelf:'center',
      fontSize: moderateScale(27),
      fontFamily: PACIFICO,
      color: APP_COLOR_BLACK,
      marginBottom: ifIphoneX(8, verticalScale(IF_OS_IS_IOS ? 8 : 4)),
    },
    titleIconStyle: {
      alignSelf: 'center',
      width: 50,
      height: 22,
      marginTop: verticalScale(-3),
      marginLeft: moderateScale(10)
    },
    titleRightStyle: {
      flex: 1,
      paddingTop: verticalScale(2),
      alignSelf: 'flex-end',
      alignItems: 'flex-end',
      justifyContent: 'center',
      height: verticalScale(52),
      position: 'relative',
      zIndex: -1
    }
  });
}
