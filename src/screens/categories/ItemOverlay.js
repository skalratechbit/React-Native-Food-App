import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native'
import {CachedImage} from 'react-native-img-cache';
import * as Animatable from 'react-native-animatable'
import { IGH_TAG, OVERLAY_TAG_LEFT, OVERLAY_TAG_RIGHT } from '../../assets/images'
import { APP_COLOR_WHITE } from '../../config/colors'
import Common from '../../components/Common'
import strings from '../../config/strings/strings';

const { Text } = Common

// custom animations
Animatable.initializeRegistryWithDefinitions({
  closeFadeIn: {
    from: {
      opacity: 0,
      marginRight: -25
    },
    to: {
      opacity: 1,
      marginRight: 0
    }
  },
  closeFadeOut: {
    from: {
      opacity: 1,
      marginRight: 0
    },
    to: {
      opacity: 0,
      marginRight: -25
    }
  },
  detailsSlideIn: {
    from: {
      opacity: 0,
      marginBottom: -25
    },
    to: {
      opacity: 1,
      marginBottom: 0
    }
  },
  detailsSlideOut: {
    from: {
      opacity: 1,
      marginBottom: 0
    },
    to: {
      opacity: 0,
      marginBottom: -25
    }
  }
})

class ItemOverlay extends Component {
  state = {
    opened: false,
    opacity: 0
  };

  handleClose = () => {
    this.setState({
      opened: false
    })
  };

  handleToggleOpen = () => {
    const { opened } = this.state
    this.setState({
      opened: !opened
    })
  };

  componentDidMount () {
    this.internval = setTimeout(() => {
      this.setState({ opacity: 1 })
    }, 1e3)
  }

  componentWillUnmount () {
    clearInterval(this.internval)
  }

  renderWideIGHIcon ({ color, overlayColorBase, overlayWideImage }) {
    return (
      <View onPress={this.handleOpen} style={overlayColorIcon}>
        <CachedImage
          resizeMode='contain'
          style={overlayWideImage}
          source={IGH_TAG}
        />
        <View style={overlayColorBase}></View>
      </View>
    )
  }

  renderOverlayTextIcon ({ color, overlayTextTagIcon, overlayText, overlayTextCenter, overlaySideTag }) {
    const {
      titleSize,
      title
    } = this.props
    return (
      <View onPress={this.handleOpen} style={overlayTextTagIcon}>
        <CachedImage
          resizeMode='contain'
          style={overlaySideTag}
          source={OVERLAY_TAG_LEFT}
        />
        <View style={overlayTextCenter}>
          <Text color={color} style={[overlayText, titleSize ? { fontSize: parseInt(titleSize) } : {}]}>{title || '#InGoodHands'}</Text>
        </View>
        <CachedImage
          resizeMode='contain'
          style={overlaySideTag}
          source={OVERLAY_TAG_RIGHT}
        />
      </View>
    )
  }

  renderIGHIcon ({ overlay, overlayImage, color, ighTagText, overlayImageBtn }) {
    const { icon } = this.props
    return icon ? (
      <TouchableOpacity onPress={this.handleToggleOpen} style={overlayImageBtn}>
        <CachedImage
          resizeMode='contain'
          style={overlayImage}
          source={{ uri: icon.IconUrl }}
        />
      </TouchableOpacity>
    ) : (
      <TouchableOpacity onPress={this.handleToggleOpen} style={overlay}>
        <Text color={color} style={ighTagText}>
          {strings.IGH}
        </Text>
      </TouchableOpacity>
    )
  }

  renderTagIcon ({ icon, overlayTagBtn, overlayTagImg }) {
    return (
      <TouchableOpacity onPress={this.handleToggleOpen} style={overlayTagBtn}>
        <CachedImage
          resizeMode='contain'
          style={overlayTagImg}
          source={{ uri: icon}}
        />
      </TouchableOpacity>
    )
  }

  render () {
    const { icon, color, visible, details, detailsSize } = this.props
    const { opened, opacity } = this.state
    const {
      container,
      overlayDetailsText,
      activeContainer,
      overlayDetails,
      overlayTextTagIcon,
      overlayTextCenter,
      overlaySideTag,
      overlayText,
      closeButton,
      hitArea,
      fadeContainer,
      close,
      closeX,
      closeXL,
      overlayTagBtn,
      overlayTagImg
    } = getStyles(color)
    const isOpened = opened === true
    const containerCompStyles = [container]
    let closeButtonAnimation = 'closeFadeOut'
    let detailsAnimation = 'detailsSlideOut'

    if (isOpened) {
      containerCompStyles.push(activeContainer)
      closeButtonAnimation = 'closeFadeIn'
      detailsAnimation = 'detailsSlideIn'
    }

    const overlayTextConfig = { color, overlayTextTagIcon, overlayText, overlayTextCenter, overlaySideTag }
    const overlayIconConfig = { icon, overlayTagBtn, overlayTagImg }

    return !parseInt(visible) ? null : (
      <TouchableWithoutFeedback style={hitArea} onPress={this.handleToggleOpen}>
        <Animatable.View
          style={[fadeContainer, { opacity: opacity }]}
          duration={1e3}
          easing='ease-out-expo'
          transition={['opacity']}>
          <Animatable.View
            style={containerCompStyles}
            transition={['backgroundColor', 'paddingBottom']}
            duration={1e3}
            easing='ease-out-expo'>
            {icon ? this.renderTagIcon(overlayIconConfig) : this.renderOverlayTextIcon(overlayTextConfig)}
            <Animatable.View
              animation={detailsAnimation}
              duration={500}
              easing='ease-out-expo'
              style={[overlayDetails, isOpened ? { height: "auto" } : {}]}>
              <Text style={[overlayDetailsText, detailsSize ? { fontSize: parseInt(detailsSize) } : {}]}>{details}</Text>
            </Animatable.View>
            <Animatable.View
              animation={closeButtonAnimation}
              delay={200}
              duration={500}
              easing='ease-out-expo'
              style={close}>
              <TouchableOpacity style={closeButton} onPress={this.handleClose}>
                <View style={closeX} />
                <View style={[closeX, closeXL]} />
              </TouchableOpacity>
            </Animatable.View>
          </Animatable.View>
        </Animatable.View>
        </TouchableWithoutFeedback>
    )
  }
}

const HEX2RGBA = (hex, alpha) => {
  const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16))
  return `rgba(${r}, ${g}, ${b}, ${alpha || 1})`
}

const getStyles = color => {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      zIndex: 8,
      flex: 1,
      top: 0,
      left: 0,
      height: 182,
      padding: 20,
      width: '100%',
      paddingTop: 17,
      justifyContent: 'flex-end',
      flexDirection: 'column',
      alignItems: 'flex-start',
      paddingBottom: 20,
      overflow: 'hidden'
    },
    activeContainer: {
      backgroundColor: HEX2RGBA(color, 0.9)
      // paddingBottom: 67
    },
    hitArea: {
      width: '100%',
      height: '100%'
    },
    fadeContainer: {
      opacity: 0,
      width: '100%',
      height: '100%',
      position: 'absolute',
      zIndex: 8,
      top: 0,
      left: 0
    },
    overlay: {
      borderRadius: 8,
      backgroundColor: APP_COLOR_WHITE,
      width: 50,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 20
    },
    ighTagText: {
      fontSize: 32,
      lineHeight: 50
    },
    overlayImageBtn: {
      alignItems: 'flex-start',
      justifyContent: 'flex-end'
    },
    overlayImage: {
      minWidth: 100,
      width: 'auto',
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 20
    },
    overlayWideImage: {
      width: 118,
      height: 33
    },
    overlaySideTag: {
      width: 10,
      height: 33
    },
    overlayTextTagIcon: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible',
      height: 31
    },
    overlayColorIcon: {
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible',
      height: 31
    },
    overlayColorBase: {
      position: 'absolute',
      backgroundColor: color,
      zIndex: -1,
      height: 31,
      width: 100
    },
    overlayTextCenter: {
      backgroundColor: APP_COLOR_WHITE,
      alignItems: 'center',
      justifyContent: 'center',
      height: 33,
      width: 'auto'
    },
    overlayText: {
      paddingTop: 3,
      fontSize: 24
    },
    overlayDetails: {
      height: 35,
      opacity: 0,
      paddingLeft: 4,
      paddingTop: 4,
      marginBottom: -25
    },
    overlayDetailsText: {
      color: APP_COLOR_WHITE,
      fontSize: 20
    },
    overlayTagBtn: {
      alignItems: 'flex-start',
      justifyContent: 'flex-end'
    },
    overlayTagImg: {
      width: 60,
      height: 60,
      marginRight: 10
    },
    close: {
      top: 20,
      right: 20,
      zIndex: 8,
      opacity: 0,
      marginRight: -25,
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center'
    },
    closeButton: {
      backgroundColor: 'transparent',
      paddingRight: 0,
      paddingTop: 0,
      paddingLeft: 20,
      paddingBottom: 25,
      marginTop: -5,
      alignItems: 'center',
      justifyContent: 'center'
    },
    closeX: {
      width: 2,
      height: 15,
      backgroundColor: APP_COLOR_WHITE,
      transform: [{ rotate: '45deg' }],
      position: 'absolute'
    },
    closeXL: {
      transform: [{ rotate: '-45deg' }]
    }
  })
}

export default ItemOverlay
