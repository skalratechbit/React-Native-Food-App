import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Easing
} from 'react-native'
import { connect } from 'react-redux'
import Geolocation from '@react-native-community/geolocation';
import { BoostYourStartPopUp } from '../../components'
import strings from '../../config/strings/strings'
import Roulette from 'react-native-casino-roulette'
import { CachedImage } from 'react-native-img-cache';
import {
  APP_COLOR_WHITE,
  APP_COLOR_BLACK,
} from '../../config/colors'
import { ROADSTER_REGULAR, HELVETICANEUE_LT_STD_CN } from '../../assets/fonts'
import { IF_OS_IS_IOS, SCREEN_WIDTH, SCREEN_HEIGHT } from '../../config/common_styles'
import {
  GAME_BACKGROUND,
  ARROW,
  FOOTER,
  DEFAULT_WHEEL
} from '../../assets/images'
import { Actions } from 'react-native-router-flux'
import { actions } from "../../ducks/squardcorner";
import { actions as branchesActions } from '../../ducks/branches'
import { actions as appstateAction } from '../../ducks/setappstate'
import { bindActionCreators } from 'redux'
import {
  detectBeaconProximity,
  sortBeaconsFromBranches
} from '../../helpers/BeaconHelper'
import { getThemeByLevel } from '../../config/common_styles/appthemes'
import CommonLoader from '../../components/CommonLoader'
import Common from '../../components/Common'
import * as Animatable from 'react-native-animatable'

const { Text, Button } = Common

class WheelGame extends Component {
  constructor(props) {
    super(props)
    this.rouletteRef = React.createRef();
    const theme = getThemeByLevel(this.props.LevelName)
    this.state = {
      theme,
      branch: null,
      heading: 'UH-OH',
      message: 'You have already played',
      beaconPopupVisibilty: false,
      locationPopupVisibilty: false,
      showDialog: false,
      spun: false,
      selected: null,
      spinning: false,
      detectingBeacon: false,
      loadingAssets: true,
      detectedBeacon: false,
      beacon: null,
      latitude: null,
      longitude: null,
      error: null,
      playGame: false,
      optionsData: {
        GameConfig: []
      },
      zone: {},
      locationError: '',
      options: [
        { index: '100 stars' },
        { index: 'Better Luck Next Time' },
        { index: '$5 voucher' },
        { index: '50 stars' },
        { index: 'Better Luck Next Time' },
        { index: '$10 voucher' }
      ],
    }
  }

  componentDidMount() {
    Geolocation.getCurrentPosition(
      position => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null
        })
      },
      error => this.setState({ error: error.message }),
      { enableHighAccuracy: false, timeout: 50000, maximumAge: 1000 }
    )
    this.props.getBranches()
    setTimeout(() => {
      this.props.getWheelOptions({ latitude: this.state.latitude, longitude: this.state.longitude })
    }, 1000);
  }

  componentWillReceiveProps(nextProps) {
    const {
      branches,
      wheelOptions: { optionsData, zone, message }
    } = nextProps;
    const {
      wheelOptions: { zone: prevZone }
    } = this.props;

    const {
      wheelGame: { status, message: wheelGameMessage }
    } = nextProps
    const {
      wheelGame: { status: prevStatus }
    } = this.props
    const spinWheel = status === 200 && status != prevStatus;

    if((status == false || status == 201) && wheelGameMessage != '') {
      this.setState({
        showDialog: true,
        heading: "UH-HO",
        message: wheelGameMessage
      });
    }
    this.setState({
      playGame: zone !== null && zone !== prevZone,
      optionsData,
      zone,
      locationError: message,
      locationPopupVisibilty: zone === null && (zone !== prevZone || zone === prevZone)
    });

    if (spinWheel) this.spinTheWheel(nextProps)
    if (branches.length > 0) this.setState({ loadingAssets: false })
  }

  getBranch() {
    const { branch: selectedBranch } = this.state
    const { branches } = this.props
    const fallBackBranch = { Code: 0, Assets: {} }
    const firstBranch = branches[0]
    const branch = { ...(selectedBranch || firstBranch || fallBackBranch) }
    // normalize Assets param
    if (branch.Assets.length) branch.Assets = branch.Assets[0]
    return branch
  }

  goBack = () => {
    this.setState({ showDialog: false })
    Actions.drawer({ type: 'reset' })
    Actions.home({ drawerMenu: true })
  };

  cancel = () => {
    Actions.pop()
  };

  showWinningsMessage = () => {
    const {
      wheelGame: { playData }
    } = this.props
    const {
      LabelTitle = playData.LabelTitle,
      Label = playData.Label
    } = playData
    this.setState({ showDialog: true, heading: LabelTitle, message: Label })
  };

  onRotateChange = state => {
    let spinning = false
    switch (state) {
      case 'start':
        spinning = true
        break
      default:
      case 'stop':
        spinning = false
        break
    }
    this.setState(
      {
        spinning
      },
      () => {
        if (!spinning) this.showWinningsMessage()
      }
    )
  };

  onRotate = option => {
    const selected = option.index
    this.setState({
      spun: true,
      selected
    })
  };

  spinTheWheel(props) {
    const { spinning, options } = this.state
    const {
      wheelGame: {
        playData: { Sorting = null }
      }
    } = props
    const dynamicOptions = this.parseWheelOptions()
    const rouletteOptions = dynamicOptions.length ? dynamicOptions : options
    const optionsLength = rouletteOptions.length
    if (!spinning) {
      this.rouletteRef.current.triggerSpin(
        Sorting != null ? optionsLength - Sorting : null
      )
    }
  }

  parseWheelOptions() {
    const { optionsData } = this.state
    const { GameConfig = [] } = optionsData
    return GameConfig.map(config => ({ ...config, index: config.Label }))
  }

  handlePlayPress = () => {
    const {
      playGame,
    } = this.state;

    if (playGame === true) {
      const {
        optionsData: {
          Id,
          Assets
        },
        zone: {
          branch_id
        }
      } = this.state;
      if (Assets?.length) {
        this.setState({ branch: { Assets } }, () => {
          // update selected branch then fetch wheelGame results
          this.props.getWheelGame({
            StoreNumber: branch_id,
            WheelID: Id
          })
        })
      }
    } else {
      this.setState({
        locationPopupVisibilty: true
      })
    }
  };

  handleCancelPress = () => {
    const { spinning } = this.state
    if (!spinning) this.cancel()
  };

  handleDetectBranch = () => {
    const { branches } = this.props
    const beacons = sortBeaconsFromBranches(branches)
    this.setState({ detectingBeacon: true, detectedBeacon: false })
    if (beacons.length > 0) {
      detectBeaconProximity(
        beacons,
        this.handleDetectSuccess,
        this.handleDetectStopped
      )
    }
  };

  handleHideLocationWarning = () => {
    this.setState({
      locationPopupVisibilty: false
    }, () => {
      this.cancel()
    });
  };

  firstLoad = true
  handleBackgroundLoaded = () => {
    const { branches } = this.props
    if (!this.firstLoad || branches.length)
      this.setState({ loadingAssets: false })
    this.firstLoad = false
  }

  render() {
    const { container, rouletteView, subContainer } = styles
    const {
      wheelGame,
      wheelOptions,
      branches,
      LevelName
    } = this.props
    const {
      branch,
      options,
      spinning,
      spun,
      showPlayNoMoreWarning,
      theme,
      theme: { thirdColor },
      showDialog,
      heading,
      message,
      bluetoothWarning,
      locationError,
      locationPopupVisibilty,
      detectingBeacon,
      loadingAssets
    } = this.state
    const selectedBranch = this.getBranch()
    const {
      ID: StoreID,
      Assets: {
        Arrow,
        Footer,
        Background,
        WheelImg,
        DefaultWheel,
        Color,
        HideMarker = true,
        MarkerTop = 55,
        MarkerSize = 20,
        Radius = SCREEN_WIDTH - 20,
        Distance = 300,
        Duration = 6e3,
        Turns = 10,
        FooterSpacing = 70,
        FooterColor = 'black',
      }
    } = selectedBranch;
    const dynamicOptions = this.parseWheelOptions()
    const rouletteOptions = dynamicOptions.length ? dynamicOptions : options
    const optionsLength = rouletteOptions.length
    const halfSegment = 300 / optionsLength / 1.5 + Math.random() * 1
    const rouletteRotate = spun ? halfSegment : 0
    const DefaultWheelTheme = DefaultWheel
      ? { uri: DefaultWheel }
      : DEFAULT_WHEEL
    const WheelBackground = WheelImg ? { uri: WheelImg } : DefaultWheelTheme
    const GameBackground = Background ? { uri: Background } : GAME_BACKGROUND
    const FooterImage = Footer ? { uri: Footer } : FOOTER
    const ArrowImage = Arrow ? { uri: Arrow } : ARROW
    const cancelCompStyle = [styles.cancelButton]
    const playCompStyle = [styles.playButton]
    const buttonColor = Color || thirdColor
    const tightFit = SCREEN_HEIGHT < 550
    const tightFitSize = 250

    if (spinning) cancelCompStyle.push(styles.cancelFade)
    if (spun) playCompStyle.push(styles.playFade)
    const transitionStyle = loadingAssets ? { backgroundColor: buttonColor, zIndex: 8 } : { backgroundColor: `${buttonColor}00`, zIndex: -0 }

    return (
      <View style={container}>
        <CommonLoader color={Color} isLoading={detectingBeacon || loadingAssets} noAutoOff />
        <Animatable.View duration={1e3} transition={['backgroundColor', 'zIndex']} style={[styles.blocker, { backgroundColor: thirdColor }, transitionStyle]} />
        <ImageBackground
          source={GameBackground}
          style={subContainer}
          onLoadEnd={this.handleBackgroundLoaded}
          resizeMode='cover'>
          <BoostYourStartPopUp
            onCrossPress={this.handleHideLocationWarning}
            modalVisibilty={locationPopupVisibilty}
            selectedHeading={'UH-OH!'}
            selectedSubHeading={locationError}
            appTheme={theme}
          />
          <BoostYourStartPopUp
            onCrossPress={this.goBack}
            modalVisibilty={showDialog}
            selectedHeading={heading}
            selectedSubHeading={message}
            appTheme={theme}
          />
          <View style={[rouletteView, tightFit ? { height: tightFitSize * 1.1 } : {height: SCREEN_HEIGHT * 0.65 }]}>
            <View style={[styles.staticMarker, HideMarker ? { backgroundColor: 'transparent' } : {}]} />
            <CachedImage source={ArrowImage} style={[styles.arrowMarker, { width: MarkerSize, height: MarkerSize, top: MarkerTop }]} />
            {optionsLength ? (
              <Roulette
                enableUserRotate={false}
                step={0}
                ref={this.rouletteRef}
                background={WheelBackground}
                radius={tightFit ? tightFitSize : Radius}
                distance={Distance}
                duration={Duration}
                onRotate={this.onRotate}
                onRotateChange={this.onRotateChange}
                easing={Easing.out(Easing.exp)}
                turns={Turns}
                rouletteRotate={rouletteRotate}
                options={rouletteOptions}
              />
            ) : null}
          </View>
          <View style={styles.footer}>
            <ImageBackground
              resizeMode='repeat'
              style={[styles.footerImage, {marginTop: 0, paddingTop: 0 }]}
              source={FooterImage}>
              <View style={[styles.footerBase, { backgroundColor: FooterColor }]}>
                <Text style={styles.pressPlayText}>{strings.PRESS_PLAY}</Text>
                <Text style={styles.toSpinText}>{strings.TO_SPIN}</Text>
                <Button
                  style={playCompStyle}
                  onPress={this.handlePlayPress}
                  color={buttonColor}
                >
                  <Text style={styles.playText}>{strings.PLAY}</Text>
                </Button>
                <TouchableOpacity
                  onPress={this.handleCancelPress}
                  style={cancelCompStyle}
                >
                  <Text style={styles.cancelText}>{strings.CANCEL}</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
        </ImageBackground>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLOR_BLACK
  },
  subContainer: {
    flex: 1,
    flexDirection: 'column'
  },
  rouletteView: {
    // flex: 2,
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    height: 375
  },
  staticMarker: {
    width: 7,
    height: 25,
    backgroundColor: APP_COLOR_WHITE,
    marginBottom: -2
  },
  footer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  footerImage: {
    flex: 1,
    width: SCREEN_WIDTH,
    marginTop: 20,
    paddingTop: 70
  },
  footerBase: {
    flex: 1,
    width: SCREEN_WIDTH,
    backgroundColor: APP_COLOR_BLACK,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pressPlayText: {
    alignSelf: 'center',
    fontSize: 26,
    color: APP_COLOR_WHITE
  },
  toSpinText: {
    alignSelf: 'center',
    fontSize: 30,
    marginTop: -6,
    color: APP_COLOR_WHITE
  },
  playButton: {
    alignSelf: 'center',
    width: 200,
    height: 45,
    padding: 0,
    marginTop: IF_OS_IS_IOS ? 0 : 10
  },
  playText: {
    fontFamily: ROADSTER_REGULAR,
    fontSize: 28,
    lineHeight: 28
  },
  playFade: {
    opacity: 0.2
  },
  cancelButton: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#666666',
    padding: 0
  },
  cancelText: {
    fontFamily: HELVETICANEUE_LT_STD_CN,
    color: '#666666',
    fontSize: 16,
    lineHeight: 16
  },
  cancelFade: {
    opacity: 0.2
  },
  arrowMarker: {
    position: 'absolute',
    top: 50,
    width: 20,
    height: 20,
    zIndex: 1
  },
  secondaryBackground: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    zIndex: -0
  },
  blocker: {
    backgroundColor: APP_COLOR_BLACK,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
    left: 0,
    zIndex: 8
  }
})

function mapStateToProps(state) {
  const {
    branches: { branches, wheelGame, wheelOptions }
  } = state

  return {
    wheelOptions,
    wheelGame,
    branches,
  }
}

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      ...actions,
      ...branchesActions,
      ...appstateAction
    },
    dispatch
  )
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WheelGame)
// export default WheelGame
