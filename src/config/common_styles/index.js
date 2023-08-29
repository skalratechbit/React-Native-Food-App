import { Platform, Dimensions } from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';
import { APP_COLOR_RED, APP_COLOR_WHITE, APP_COLOR_BLACK }  from '../../config/colors';
import { ROADSTER_REGULAR, DINENGSCHRIFT_REGULAR, HELVETICANEUE_LT_STD_CN } from '../../assets/fonts';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const BUTTON_PADDING_BOTTOM_BUG = 10;


export const BUTTON_WIDTH = 200;
export const BUTTON_HEIGHT = 42.5;
export const INPUT_HEIGHT = 43;
export const COMMON_BUTTON_RADIOUS = 5;
const BUTTON_TEXT_SIZE = 21;
const BOTTOM_CLICKABLE_TEXT_SIZE = 16;
const REGISTER_LOGIN_FLOW_TEXT_SIZE = 21;
export const INPUT_TEXT_SIZE = 13;
export const INPUT_TEXT_LEFT_PADDING = 15;
// export const COMMON_MARGIN_BETWEEN_COMPONENTS = 10;
export const COMMON_MARGIN_BETWEEN_COMPONENTS = scale(5);
export const INPUT_SMALL_WIDTH = 206;
export const INPUT_SMALL_HEIGHT = 32;

export const GET_HEADER_HEIGHT  = () => {
  if (IF_OS_IS_IOS) {
    if (isIphoneX()) {
        return 54;
    } else {
        return 74;
    }
  }else{
      return 74;
  }
};

export const GET_HEADER_PADDINGTOP  = () => {
  if (IF_OS_IS_IOS) {
    if (isIphoneX()) {
        return 0;
    } else {
        return 20;
    }
  }else{
      return 24;
  }
};

export const COMMON_BOTTOM_UNDERLINED_TEXT_TOP_MARGIN = 15;

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;

export const IF_OS_IS_IOS = (Platform.OS === 'ios');
export const FONT_SCALLING =IF_OS_IS_IOS ?true:false;

export const COMMON_BACKGROUND_IMAGE_CONTAINER_STYLE = {
    backgroundColor: APP_COLOR_BLACK,
    flex: 1,
    // remove width and height to override fixed static size
    width: null,
    height: null,
    // marginRight: -1,
    // marginTop: -1,
    alignItems: 'center',
    justifyContent: 'center'
};

export const COMMON_BUTTON_STYLE = {
  backgroundColor: APP_COLOR_RED,
  width: BUTTON_WIDTH,
  height: BUTTON_HEIGHT,
  justifyContent: 'center',
  alignItems: 'center',
  // paddingBottom: BUTTON_PADDING_BOTTOM_BUG,
  borderRadius: COMMON_BUTTON_RADIOUS
};
export const COMMON_BUTTON_SCALED_STYLE = {
  backgroundColor: APP_COLOR_RED,
  width: scale(BUTTON_WIDTH),
  height: verticalScale(BUTTON_HEIGHT),
  justifyContent: 'center',
  paddingBottom: moderateScale(BUTTON_PADDING_BOTTOM_BUG),
  borderRadius: COMMON_BUTTON_RADIOUS
};

export const COMMON_INPUT_STYLE = {
  backgroundColor: APP_COLOR_WHITE,
  width: BUTTON_WIDTH,
  height: INPUT_HEIGHT,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: COMMON_BUTTON_RADIOUS
};

export const COMMON_INPUT_SCALLED_STYLE = {
  backgroundColor: APP_COLOR_WHITE,
  width: scale(BUTTON_WIDTH),
  height: verticalScale(INPUT_HEIGHT),
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: COMMON_BUTTON_RADIOUS
};

export const COMMON_SMALL_INPUT_STYLE = {
  backgroundColor: APP_COLOR_WHITE,
  width: INPUT_SMALL_WIDTH,
  height: INPUT_SMALL_HEIGHT,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: COMMON_BUTTON_RADIOUS
};

export const COMMON_INPUT_TEXT_STYLE = {
  color: APP_COLOR_BLACK,
  fontSize: INPUT_TEXT_SIZE,
  paddingLeft: INPUT_TEXT_LEFT_PADDING,
  fontFamily: DINENGSCHRIFT_REGULAR,
  paddingVertical: 0,
  width: BUTTON_WIDTH
};

export const COMMON_INPUT_TEXT_SCALLED_STYLE = {
  color: APP_COLOR_BLACK,
  fontSize: moderateScale(INPUT_TEXT_SIZE),
  paddingLeft: moderateScale(INPUT_TEXT_LEFT_PADDING),
  fontFamily: DINENGSCHRIFT_REGULAR,
  paddingVertical: moderateScale(0),
  width: scale(BUTTON_WIDTH)
};

export const COMMON_BUTTON_TEXT_STYLE = {
  color: APP_COLOR_WHITE,
  // fontSize: BUTTON_TEXT_SIZE,
  // lineHeight: BUTTON_TEXT_SIZE,
  fontSize: scale(BUTTON_TEXT_SIZE),
  lineHeight: scale(BUTTON_TEXT_SIZE),
  fontFamily: ROADSTER_REGULAR,
  textAlign: 'center',
  textAlignVertical: 'center'
};
export const COMMON_BUTTON_TEXT_SCALED_STYLE = {
  color: APP_COLOR_WHITE,
  fontSize: moderateScale(BUTTON_TEXT_SIZE),
  fontFamily: ROADSTER_REGULAR,
  textAlign: 'center'
};

export const COMMON_REGISTER_LOGIN_FLOW_TEXT_STYLE = {
  alignSelf: 'center',
  color: APP_COLOR_WHITE,
  fontSize: REGISTER_LOGIN_FLOW_TEXT_SIZE,
  fontFamily: DINENGSCHRIFT_REGULAR,
  textAlign: 'center'
};

export const COMMON_BOTTOM_CLICKABLE_TEXT_STYLE = {
  color: APP_COLOR_WHITE,
  fontSize: BOTTOM_CLICKABLE_TEXT_SIZE,
  fontFamily: HELVETICANEUE_LT_STD_CN,
};

export const COMMON_OVERLAY_VIEW_STYLE = {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: 'black',
    opacity: 0.5
};

export const USER_INPUTS_ERROR_TEXT_STYLE = {
    color:'red',
    fontSize:16,
};
