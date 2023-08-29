import React, { Component } from 'react'
import {
  View,
  StyleSheet
} from 'react-native'
import { connect } from 'react-redux'
import moment from 'moment'
import { Actions } from 'react-native-router-flux'
import { bindActionCreators } from 'redux'
import { actions as competitionActions } from '../../ducks/competition'
import { getUserObject } from '../../helpers/UserHelper'
import { getThemeByLevel } from '../../config/common_styles/appthemes'
import CommonLoader from '../../components/CommonLoader'
import TitleBar from '../../components/TitleBar'
import AgreementScreen from './Agreement'
import CompetitorsScreen from './Competitors'
import CongratsScreen from './Congrats'

import { APP_COLOR_BLACK } from '../../config/colors'
import { SCREEN_WIDTH } from '../../config/common_styles'
import { verticalScale } from 'react-native-size-matters'

class Competition extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    // competition
    this.props.getCompetitionData()
  }

  backButtonPress () {
    Actions.pop()
  }

  renderCompetitionModule () {
    const {
      competition: {
        data: { Id, Agreement, StartDate, EndDate, ShowDaysAfterEnd, MenuLabel }
      }
    } = this.props
    const startDate = moment(StartDate)
    const endDate = moment(EndDate)
    const currentDate = moment()
    const isValidDate = currentDate >= startDate && currentDate <= endDate
    const hasEnded = currentDate > endDate
    const expired = currentDate > endDate.add(ShowDaysAfterEnd, 'days')
    console.log('Agreement', Agreement)
    console.log('isValidDate', isValidDate)
    console.log('hasEnded', hasEnded)
    console.log('expired', expired)

    if(!Id) return null

    if (!Agreement || Agreement == 'rejected') {
      console.log('competition: Agreement')
      // show agreement screen
      return <AgreementScreen />
    }

    if (isValidDate) {
      console.log('competition: isValidDate')
      // show competitors stat screen
      return <CompetitorsScreen />
    }

    if (hasEnded && !expired) {
      console.log('competition: hasEnded')
      // show congratulations / winner screen
      return <CongratsScreen />
    }

    if (expired) {
      console.log('competition: expired')
      // return to home screen since competition is expired
      Actions.pop()
    }
  }

  render () {
    const {
      componentTheme,
      componentTheme: { thirdColor, ARROW_LEFT_RED },
      loading,
      MenuLabel: DefaultMenuLabel
    } = this.props
    styles = renderStyles(thirdColor)
    const {
      competition: {
        data: { MenuLabel = DefaultMenuLabel || 'Competition' }
      }
    } = this.props
    return (
      <View style={styles.container}>
        <TitleBar
          onPress={this.backButtonPress}
          color={thirdColor}
          titleText={MenuLabel}
          backIcon={ARROW_LEFT_RED}
        />
        <CommonLoader />
        {loading ? <View style={styles.overlay} /> : null}
        {this.renderCompetitionModule()}
      </View>
    )
  }
}
let styles = {}
function renderStyles (color) {
  return StyleSheet.create({
    container: {
      flex: 1,
      width: SCREEN_WIDTH,
      //backgroundColor: APP_COLOR_BLACK
    },
    overlay: {
      backgroundColor: APP_COLOR_BLACK,
      flex: 1,
      width: SCREEN_WIDTH,
      height: '100%',
      position: 'absolute',
      top: verticalScale(52),
      zIndex: 8
    }
  })
}

function mapStateToProps (state) {
  const {
    app: { loading },
    register: { contactUsData },
    competition
  } = state
  const userData = getUserObject(state)
  const { CustomerId, LevelName, FirstName, LastName, Email } = userData
  return {
    loading,
    componentTheme: getThemeByLevel(LevelName),
    competition
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
)(Competition)
