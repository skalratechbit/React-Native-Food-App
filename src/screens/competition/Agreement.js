import React, { Component } from 'react'
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from 'react-native'
import { connect } from 'react-redux'
import { Actions } from 'react-native-router-flux'
import { bindActionCreators } from 'redux'
import { actions as competitionActions } from '../../ducks/competition'
import { CHALLENGE_LOGO } from '../../assets/images'
import { getUserObject } from '../../helpers/UserHelper'
import { getThemeByLevel } from '../../config/common_styles/appthemes'
import RadioButton from '../../components/RadioButton'
import { APP_COLOR_WHITE, APP_COLOR_BLACK } from '../../config/colors'
import {
  COMMON_BUTTON_RADIOUS,
  IF_OS_IS_IOS,
  SCREEN_WIDTH
} from '../../config/common_styles'
import Common from '../../components/Common'
import strings from '../../config/strings/strings'
const { Text, Button } = Common

class Agreement extends Component {
  constructor (props) {
    super(props)
    this.state = {
      agreed: false
    }
  }

  handleToggleAgreement = () => {
    const { agreed } = this.state
    this.setState({ agreed: !agreed })
  };

  handleAcceptPress = () => {
    const {
      competition: { Id }
    } = this.props
    this.props.respondToCompetitionTerms(Id, true)
  };

  handleRejectPress = () => {
    const {
      competition: { Id }
    } = this.props
    this.props.respondToCompetitionTerms(Id, false)
    Actions.drawer({ type: 'reset' })
  };

  render () {
    const {
      componentTheme: { thirdColor },
      competition: {
        Label,
        Details,
        AgreementTermsConditions,
        AgreementCheckBox,
        Logo
      }
    } = this.props
    styles = renderStyles(thirdColor)
    const { agreed } = this.state
    const LOGO_SOURCE = Logo ? { uri: Logo } : CHALLENGE_LOGO
    return (
      <ScrollView style={styles.container}>
        <View style={styles.challengeSlogan}>
          <Text style={styles.tagline}>{strings.GET_LUCKY_WITH}</Text>
          <Image
            style={styles.challengeLogo}
            resizeMode='contain'
            source={LOGO_SOURCE}
          />
        </View>
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimer}>{Details}</Text>
        </View>
        <View style={styles.agreementContainer}>
          <Text style={styles.termsAndConditions}>{strings.TERMS_AND_CONDITIONS}</Text>
          <View style={styles.termsDetailsScroll}>
            <View style={styles.termsDetailsContainer}>
              <Text light style={styles.termsDetails}>
                {AgreementTermsConditions}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.agreementCheck}
            onPress={this.handleToggleAgreement}>
            <RadioButton
              size={12}
              isActive={agreed}
              style={styles.agreementRadio}
            />
          <Text style={styles.agreementStatement}>{AgreementCheckBox}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <Button
            style={[styles.button, styles.acceptButton]}
            disabled={!agreed}
            onPress={this.handleAcceptPress}
          >
            <Text style={styles.buttonText} roadster>
              {strings.ACCEPT}
            </Text>
          </Button>
          <Button style={styles.button} onPress={this.handleRejectPress}>
            <Text style={styles.buttonText} roadster>
              {strings.REJECT}
            </Text>
          </Button>
        </View>
      </ScrollView>
    )
  }
}
let styles = {}
function renderStyles (color) {
  return StyleSheet.create({
    container: {
      flex: 1,
      width: SCREEN_WIDTH,
      backgroundColor: APP_COLOR_BLACK
    },
    challengeSlogan: {
      alignItems: 'center',
      paddingTop: 18,
      paddingBottom: 18
    },
    tagline: {
      fontSize: 30
    },
    challengeLogo: {
      width: 115,
      height: 70,
      marginTop: -30,
      marginBottom: 0
    },
    disclaimerContainer: {
      backgroundColor: color,
      padding: 15,
      paddingLeft: 25,
      paddingRight: 25
    },
    disclaimer: {
      textAlign: 'justify'
    },
    agreementContainer: {
      padding: 15,
      paddingLeft: 25,
      paddingRight: 25,
      paddingBottom: 15,
      alignItems: 'center'
    },
    termsAndConditions: {
      fontSize: 20,
      marginBottom: 5
    },
    termsDetailsScroll: {
      backgroundColor: APP_COLOR_WHITE,
      borderRadius: COMMON_BUTTON_RADIOUS * 0.8,
      width: '100%',
      //height: 90
    },
    termsDetailsContainer: {
      padding: 20,
      paddingTop: 10,
      paddingBottom: 10
    },
    termsDetails: {
      textAlign: 'left',
      fontSize: 16,
      color: APP_COLOR_BLACK
    },
    agreementCheck: {
      paddingLeft: 9,
      paddingRight: 9,
      paddingTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      //justifyContent: 'center'
    },
    agreementRadio: {
      marginRight: 7,
      marginBottom: 2
    },
    agreementStatement: {
      fontSize: 15
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      // paddingTop: 10,
      paddingBottom: 20
    },
    button: {
      backgroundColor: color,
      height: 40,
      width: 'auto',
      paddingLeft: 15,
      paddingRight: 15,
      justifyContent: 'flex-start',
      paddingTop: 2
    },
    acceptButton: {
      marginRight: 20
    },
    buttonText: {
      fontSize: 22,
      paddingTop: IF_OS_IS_IOS ? null : 2
    }
  })
}

function mapStateToProps (state) {
  const {
    competition: { data }
  } = state
  const userData = getUserObject(state)
  const { LevelName } = userData
  return {
    componentTheme: getThemeByLevel(LevelName),
    competition: data
  }
}

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      ...competitionActions
    },
    dispatch
  )
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Agreement)
