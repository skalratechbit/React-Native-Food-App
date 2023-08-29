import { StyleSheet } from 'react-native';
import { DINENGSCHRIFT_REGULAR } from '../../../assets/fonts';
import { APP_COLOR_WHITE, APP_COLOR_BLACK } from '../../../config/colors';
import { IF_OS_IS_IOS } from '../../../config/common_styles';

export default function renderStyles(color) {
  const textBaseStyle = {
    fontFamily: DINENGSCHRIFT_REGULAR
  };

  return StyleSheet.create({
    cardsHolder: {
      marginTop: IF_OS_IS_IOS ? 0 : 5,
      paddingLeft: 27,
      alignItems: 'flex-start'
    },
    card: {
      marginBottom: 7,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'flex-start'
    },
    newCardOption: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'flex-start'
    },
    newCardButton: {
      marginLeft: 10
    },
    radioButton: {
      marginRight: 10
    },
    cardButton: {
      flexDirection: 'row'
    },
    buttonLabel: {
      paddingTop: IF_OS_IS_IOS ? 5 : 1,
      ...textBaseStyle,
      fontSize: 15,
      color: color || APP_COLOR_WHITE
    },
    cvcInput: {
      ...textBaseStyle,
      marginLeft: 7,
      backgroundColor: APP_COLOR_WHITE,
      borderRadius: 5,
      width: 38,
      lineHeight: 20,
      paddingBottom: 0,
      fontSize: 18,
      height: 25,
      paddingTop: 0,
      paddingLeft: 7,
      paddingRight: 7,
      borderColor: color || APP_COLOR_WHITE,
      borderWidth: 1,
      textAlign: 'center',
      color: APP_COLOR_BLACK
    }
  });
}
