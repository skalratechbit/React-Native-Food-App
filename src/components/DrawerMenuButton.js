import React from 'react';
import { Text, View } from 'react-native';
import {CachedImage} from 'react-native-img-cache';
import { Actions } from 'react-native-router-flux';
import { APP_COLOR_WHITE, APP_COLOR_BLACK, APP_COLOR_RED } from '../config/colors';
import { Button } from 'native-base';
import { DINENGSCHRIFT_REGULAR, DINENGSCHRIFT_BOLD } from '../assets/fonts';
import { ARROW_RIGHT_WHITE } from '../assets/images';
import { IF_OS_IS_IOS, FONT_SCALLING } from '../config/common_styles';
const ICON_SIZE = 15;
const ICON_VIEW_SIZE = 60;
const TEXT_SIZE = 20;
const BUTTON_HEIGHT = 53;
const ICONS_MARGIN = 16;
const LINE_HEIGHT = IF_OS_IS_IOS ? 0.3 : 0.5;

const DrawerMenuButton = ({
  color,
  onPress,
  title,
  imageSource,
  width,
  height,
  showCounter,
  unReadNotificationCount,
  action_key,
  noBorder,
  notify,
  iconVisible
}) => {
  const {
    containerStyle,
    buttonStyle,
    buttonTextStyle,
    buttonIconStyle,
    iconViewStyle,
    notificationCounterStyle,
  } = styles;
  const isCurrentScene = action_key && Actions.currentScene.includes(action_key);
  const buttonCompStyle = [buttonStyle];
  if(isCurrentScene) buttonCompStyle.push({ backgroundColor: color });
  return (
    <View style={[containerStyle, { borderBottomWidth: noBorder ? 0 : 1 }]}>
      <Button
        full
        iconLeft
        style={buttonCompStyle}
        onPress={onPress}>
        {(imageSource && iconVisible) ? (
          <View style={iconViewStyle}>
            <CachedImage
              style={[
                buttonIconStyle,
                {
                  width: width ? width : ICON_SIZE,
                  height: height ? height : ICON_SIZE
                }
              ]}
              source={imageSource}
            />
          </View>
        ) : null}

        <Text
          allowFontScaling={FONT_SCALLING}
          style={buttonTextStyle}>
          {title}
        </Text>
        {showCounter &&
          unReadNotificationCount > 0 && (
            <View style={[notificationCounterStyle, { backgroundColor: color }]}>
              <Text
                allowFontScaling={FONT_SCALLING}
                style={{
                  color: APP_COLOR_WHITE,
                  fontSize: 20,
                  fontFamily: DINENGSCHRIFT_REGULAR,
                  justifyContent: 'center'
                }}>
                {unReadNotificationCount}
              </Text>
            </View>
          )}
          {notify && (<View style={styles.alertCircle} />)}
        <CachedImage
          style={[
            buttonIconStyle,
            {
              width: ICON_SIZE,
              height: ICON_SIZE
            }
          ]}
          source={ARROW_RIGHT_WHITE}
        />
      </Button>
    </View>
  );
};

const styles = {
  notificationCounterStyle: {
    minWidth: 30,
    minHeight: 30,
    borderRadius: 15,
    marginStart: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: IF_OS_IS_IOS ? 3 : 0
  },
  counterFontsStyle: {
    color: APP_COLOR_WHITE,
    fontSize: 20,
    fontFamily: DINENGSCHRIFT_BOLD,
    alignSelf: 'center',
    alignText: 'center'
  },
  containerStyle: {
    borderBottomWidth: 1,
    borderBottomColor: APP_COLOR_BLACK,
    backgroundColor: APP_COLOR_RED,
    // paddingHorizontal: 20
  },
  buttonStyle: {
    height: BUTTON_HEIGHT,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: APP_COLOR_RED,
    paddingHorizontal: 20
  },
  buttonIconStyle: {
    marginTop: -1
  },
  iconViewStyle: {
    width: ICON_VIEW_SIZE,
    alignItems: 'center'
  },
  buttonTextStyle: {
    color: APP_COLOR_WHITE,
    fontSize: TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_BOLD,
    paddingTop: IF_OS_IS_IOS ? 8 : 0
  },
  lineStyle: {
    height: LINE_HEIGHT,
    width: '100%',
    backgroundColor: APP_COLOR_WHITE
  },
  alertCircle: {
    width: 14,
    height: 14,
    backgroundColor: 'red',
    borderRadius: 6,
    marginLeft: 10
  }
};

export { DrawerMenuButton };
