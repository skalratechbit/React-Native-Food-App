import { StyleSheet } from 'react-native'
import { DINENGSCHRIFT_REGULAR } from '../../../assets/fonts'
import { APP_COLOR_WHITE } from '../../../config/colors'
import { IF_OS_IS_IOS } from '../../../config/common_styles'

export default function renderStyles (color) {
  const textBaseStyle = {
    fontFamily: DINENGSCHRIFT_REGULAR
  }

  return StyleSheet.create({
    container: {
      marginLeft: 15,
      paddingTop: 2,
      flexDirection: 'row'
    },
    cardButton: {
      flexDirection: 'row'
    },
    radioButton: {
      marginRight: 10
    },
    currencyLabel: {
      paddingTop: IF_OS_IS_IOS ? 5 : 1,
      ...textBaseStyle,
      fontSize: 18,
      color: color || APP_COLOR_WHITE
    }
  })
}
