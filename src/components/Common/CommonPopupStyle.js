import { StyleSheet } from 'react-native';
import { HELVETICANEUE_LT_STD_CN, PACIFICO, DINENGSCHRIFT_BOLD } from '../../assets/fonts';
import { APP_COLOR_WHITE, APP_COLOR_RED, APP_COLOR_BLACK } from '../../config/colors';

export default StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000099'
  },
  bodyContainerStyle: {
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  headingViewStyle: {
    backgroundColor: APP_COLOR_RED,
    padding: 22,
    paddingBottom: 12
  },
  popUpContainerView: {
    borderRadius: 10,
    borderWidth: 0,
    width: '80%',
    overflow: 'hidden'
  },
  headingTextStyle: {
    fontSize: 27,
    fontFamily: PACIFICO,
    alignSelf: 'center',
    color: APP_COLOR_WHITE,
    textAlign: 'center'
  },
  subHeadingStyle: {
    fontSize: 16,
    fontFamily: DINENGSCHRIFT_BOLD,
    alignSelf: 'center',
    color: APP_COLOR_RED,
    marginTop: 15,
    marginBottom: 15,
    textAlign: 'center'
  },
  detailTextStyle: {
    fontSize: 18,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    alignSelf: 'center',
    color: APP_COLOR_BLACK,
    textAlign: 'center',
    marginStart: 10,
    marginEnd: 10,
    marginBottom: 10,
    marginTop: 5
  },
  crossImageStyle: {
    width: 18,
    height: 18,
    resizeMode: 'contain'
  },
  crossImageTouchStyle: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 8,
    top: 5
  }
});
