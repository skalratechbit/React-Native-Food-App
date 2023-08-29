import React, { Component } from 'react'
import {StyleSheet, Modal} from 'react-native'
import { openInStore } from 'react-native-app-link'
import { connect } from 'react-redux'
import VersionNumber from 'react-native-version-number'
import * as Animatable from 'react-native-animatable'
import { APP_COLOR_WHITE } from '../../config/colors';
import strings from '../../config/strings/strings'
import { APP_STORE_ID } from '../../config/constants/network_constants'
import { getUserObject } from '../../helpers/UserHelper';
import { getThemeByLevel } from '../../config/common_styles/appthemes'
import { Logo } from '../../components/Logo';
import Common from '../../components/Common'

const { Text, Button } = Common

class UpdateScreen extends Component {
  handleOpenInStore () {
    openInStore({
      appName: 'Bar Tartine',
      appStoreId: APP_STORE_ID,
      appStoreLocale: 'us',
      playStoreId: VersionNumber.bundleIdentifier
    })
  }

  render () {
    const { shouldGetVersion, theme } = this.props
    const { thirdColor: color } = theme
    const styles = getStyles(color)
    console.log('COLOR', color)
    return (
        <Modal>
          <Animatable.View
            style={styles.container}
            ease={'ease-out-expo'}
            duration={1e3}
            animation={'fadeIn'}>
            <Logo style={styles.logo} />
            <Text style={styles.title}>{strings.UH_OH}</Text>
            <Text style={styles.info} textAlign={'center'}>{strings.YOUR_APP_VERSION}</Text>
            <Button
              onPress={this.handleOpenInStore}
              color={APP_COLOR_WHITE}
              textColor={color}
              style={styles.button}
              buttonText={strings.UPDATE_APP_NOW}
            />
          </Animatable.View>
        </Modal>
    )
  }
}

function getStyles (color) {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingLeft: 80,
      paddingRight: 80,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: color,
      justifyContent: 'center',
      alignItems: 'center'
    },
    logo: {},
    title: {
      marginTop: 20,
      fontSize: 36,
      alignItems: 'center',
      justifyContent: 'center'
    },
    info: {
      fontSize: 24,
      textAlign: 'center'
    },
    button: {
      marginTop: 10,
      width:"100%"
    }
  })
}

function mapStateToProps (state) {
  const { LevelName } = getUserObject(state);
  const theme = getThemeByLevel(LevelName)
  const {
    app: { shouldGetVersion = 0 }
  } = state
  return { shouldGetVersion, theme }
}

export default connect(
  mapStateToProps,
  null
)(UpdateScreen)
