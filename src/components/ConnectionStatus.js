import React, { Component } from 'react'
import {
  Modal,
  StyleSheet,
  View
} from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import { NetInfo } from "@react-native-community/netinfo";
import { Actions } from 'react-native-router-flux'
import * as Animatable from 'react-native-animatable'
import { APP_COLOR_BLACK } from '../config/colors'
import Common from './Common'
import PopupStyles from './Common/CommonPopupStyle'

const { Text, Button } = Common

class ConnectionStatus extends Component {
  state = {
    componentTheme: { thirdColor: APP_COLOR_BLACK },
    visibilty: false,
    isOnline: true
  }

  checkInterval = null

  componentDidMount () {
    console.log('CONN WILL MOUNT')
    this.addListeners()
    this.setThemeOfComponent()
  }

  componentWillUnmount () {
    console.log('CONN WILL UNMOUNT')
    this.removeListeners()
  }

  setThemeOfComponent() {
    const theme = AsyncStorage.getItem('theme').then(data =>
      this.setState({ componentTheme: JSON.parse(data) })
    )
  }

  addListeners () {
    this.checkInterval = setInterval(() => NetInfo.fetch().then(this.handleConnectionChange), 600)
    NetInfo.fetch().then(this.handleConnectionChange)
    // NetInfo.addEventListener(this.handleConnectedChange)
    const unsubscribe = NetInfo.addEventListener(this.handleConnectedChange);
     
    // Unsubscribe
    unsubscribe();
  }

  removeListeners () {
    clearInterval(this.checkInterval)
    // NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectedChange)
  }

  refreshListeners () {
    this.removeListeners()
    this.addListeners()
  }

  handleConnectionChange = connectionInfo => {
    const { visibilty } = this.state
    const isOnline = connectionInfo.type !== 'none'
    const shouldShow = visibilty === false && isOnline === false
    const state = { isOnline }
    if(shouldShow) state.visibilty = shouldShow
    // console.log('connection status change', connectionInfo, state)
    this.setState(state)
  }

  handleConnectedChange = isOnline => {
    const { visibilty } = this.state
    const shouldShow = visibilty === false && isOnline.isConnected === false
    const state = { isOnline }
    if(shouldShow) state.visibilty = shouldShow
    // console.log('connected status', isOnline, state)
    this.setState(state)
  }

  handleRequestClose () {}

  handleResetPress = () => {
    this.setState({ visibilty: false }, () => {
      Actions.splash({ type: 'reset' })
    })
  }

  render () {
    const { visibilty, componentTheme: { thirdColor } } = this.state
    return (
      <Modal
        transparent={true}
       
        visible={visibilty}
        onRequestClose={this.handleRequestClose}>
        <View style={PopupStyles.modalBackground}>
          <Animatable.View
            animation={'zoomIn'}
            duration={400}
            easing='ease-out-back'
            style={PopupStyles.popUpContainerView}>
            <View style={[PopupStyles.bodyContainerStyle, styles.container]}>
              <Text style={styles.text} color={thirdColor}>{"UH-OH! IT SEEMS YOU'VE LOST YOUR\nINTERNET CONNECTION."}</Text>
              <Button onPress={this.handleResetPress} color={thirdColor} style={styles.button} buttonText="RESET & RETRY" />
            </View>
          </Animatable.View>
        </View>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 15
  },
  text: {
    textAlign: "center"
  },
  button: {
    marginTop: 5
  }
})

export default ConnectionStatus
