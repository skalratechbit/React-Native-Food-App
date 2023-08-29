import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  StatusBar,
    SafeAreaView,
} from 'react-native'
import RouterComponent from './src/config/router/Router'
import { Provider } from 'react-redux'
import { isIphoneX } from 'react-native-iphone-x-helper'
import {
  setNativeExceptionHandler
} from 'react-native-exception-handler'
import { actions as appActions } from './src/ducks/setappstate'
import {
  APP_COLOR_BLACK,
  APP_COLOR_RED
} from './src/config/colors'
import configureStore from './src/store/store'
import IphoneXMenu from './src/components/IphoneXMenu'
import Common from './src/components/Common'
import { IF_OS_IS_IOS } from './src/config/common_styles'
import strings from './src/config/strings/strings'

const { Text } = Common

console.disableYellowBox = true

export default class App extends Component {
  store = configureStore();
  errorShown = false;

  constructor (props) {
    super(props)
  }

  handleIphoneXMenuRef (ref) {
    this.iPhoneXMenu = ref
  }

  render () {
    return (
        <View
          style={[
            styles.container,
            isIphoneX() ? styles.iPhoneXContainer : {}
          ]}>
          <SafeAreaView style={{flex: 1, backgroundColor: 'black'}}>
            <StatusBar
              backgroundColor='transparent'
              barStyle='light-content'
              translucent
            />
            <Provider store={this.store}>
              <RouterComponent />
            </Provider>
            <IphoneXMenu ref={this.handleIphoneXMenuRef} />
          </SafeAreaView>
        </View>
    )
  }
}

class ErrorBoundary extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showError: false
    }
    // registering the error handler (maybe u can do this in the index.android.js or index.ios.js)
    setNativeExceptionHandler(this.handleNativeException)
  }

  static getDerivedStateFromError (error) {
    // Update state so the next render will show the fallback UI.
    return { showError: true }
  }

  componentDidCatch (error, info) {
    // to prevent this alert blocking your view of a red screen while developing
    if (__DEV__) {
      return
    }

    // to prevent multiple alerts shown to your users
    if (this.errorShown) {
      return
    }

    this.sendErrorLog(String(error))
    return true
  }

  handleNativeException = exceptionString => {
    // This is your custom global error handler
    // You do stuff like show an error dialog
    // or hit google analytics to track crashes
    // or hit a custom api to inform the dev team.

    // to prevent multiple alerts shown to your users
    if (this.errorShown) {
      return
    }

    this.sendErrorLog(String(exceptionString))

    console.log('NativeException ERROR', exceptionString)
  };

  sendErrorLog (log) {
    this.errorShown = true
    const logErrorReport = appActions.logErrorReport(log)
    this.props.store.dispatch(logErrorReport, log)
  }

  errorShown = false;

  renderErrorScreen () {
    const { error, info } = this.state
    return (
      <View
        style={[styles.container, isIphoneX() ? styles.iPhoneXContainer : {}]}>
        <StatusBar
            style={{flex: 1}}
            backgroundColor='red'
            barStyle='light-content'
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {strings.APP_SCREEN_ERROR}
          </Text>
        </View>
      </View>
    )
  }

  render () {
    if (this.state.showError) {
      // You can render any custom fallback UI
      return this.renderErrorScreen()
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: IF_OS_IS_IOS ? 'transparent' : APP_COLOR_BLACK,
    flex: 1
  },
  iPhoneXContainer: {
    backgroundColor: APP_COLOR_BLACK,
    paddingTop: 24
  },
  errorContainer: {
    flex: 1,
    backgroundColor: APP_COLOR_RED,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    fontSize: 26,
    textAlign: 'center'
  }
})
