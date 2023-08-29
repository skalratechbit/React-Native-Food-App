import React, { Component } from 'react'
import { View, Image, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as competitionActions } from '../../ducks/competition'
import {
  CHALLENGE_PLACE_3,
  CHALLENGE_PLACE_2,
  CHALLENGE_PLACE_1,
  CHALLENGE_LOGO
} from '../../assets/images'
import { getUserObject } from '../../helpers/UserHelper'
import { getThemeByLevel } from '../../config/common_styles/appthemes'

import { APP_COLOR_BLACK } from '../../config/colors'
import {
  COMMON_BUTTON_RADIOUS,
  IF_OS_IS_IOS,
  SCREEN_WIDTH
} from '../../config/common_styles'
import Common from '../../components/Common'
import strings from '../../config/strings/strings'
const { Text } = Common

class Congrats extends Component {
  constructor (props) {
    super(props)
    this.state = {
      icons: {
        1: CHALLENGE_PLACE_1,
        2: CHALLENGE_PLACE_2,
        3: CHALLENGE_PLACE_3
      }
    }
  }

  componentDidMount () {
    this.props.getCompetitionRanking()
  }

  parseWinners (rankings) {
    const winners = rankings.filter(rank => rank.Ranking < 4)
    return winners.sort(this.sortWinners)
  }

  sortWinners (winner) {
    return winner.Ranking > 1 ? (winner.Ranking > 2 ? 0 : -1) : 1
  }

  renderBrandLogo (isFirstPlace) {
    return (
      isFirstPlace && (
        <Image style={styles.challengeLogo} source={CHALLENGE_LOGO} />
      )
    )
  }

  renderWinner = winner => {
    const { icons } = this.state
    const { Ranking, FullName } = winner
    const WinnerBadge = icons[Ranking]
    const blockCompStyle = [styles.winnerBlock]
    const isFirstPlace = Ranking === '1'
    if (isFirstPlace) blockCompStyle.push(styles.firstBlock)
    return (
      <View style={styles.winner} key={Ranking}>
        <Image style={styles.winnerBadge} source={WinnerBadge} />
        <Text style={styles.winnerName}>{FullName.toUpperCase()}</Text>
        <View style={blockCompStyle}>
          <Text style={styles.winnerPlace}>{Ranking}</Text>
          {this.renderBrandLogo(isFirstPlace)}
        </View>
      </View>
    )
  };

  render () {
    const {
      componentTheme: { thirdColor },
      rankings
    } = this.props
    const winners = this.parseWinners(rankings)

    // styles
    styles = renderStyles(thirdColor)

    return (
      <View style={styles.container}>
        <View style={styles.titleBar}>
          <Text style={styles.title}>{strings.CONGRATS}</Text>
        </View>
        <View style={styles.winners}>{winners.map(this.renderWinner)}</View>
      </View>
    )
  }
}

let styles = {}

function renderStyles (color) {
  return StyleSheet.create({
    container: {
      flex: 1,
      width: SCREEN_WIDTH
    },
    titleBar: {
      backgroundColor: color,
      height: 55,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center'
    },
    title: {
      fontSize: 28,
      paddingTop: IF_OS_IS_IOS ? 4 : 0
    },
    winners: {
      flex: 1,
      backgroundColor: APP_COLOR_BLACK,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingBottom: 30
    },
    winner: {
      // flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      width: 105,
      height: 270
    },
    winnerBadge: {
      width: 45,
      height: 45,
      marginBottom: 5
    },
    winnerName: {
      fontSize: 28,
      marginBottom: 5
    },
    winnerBlock: {
      backgroundColor: color,
      height: 100,
      width: 100,
      borderRadius: COMMON_BUTTON_RADIOUS * 0.8,
      justifyContent: 'center',
      alignItems: 'center'
    },
    firstBlock: {
      height: 160,
      paddingBottom: 10
    },
    winnerPlace: {
      fontSize: 65,
      paddingTop: IF_OS_IS_IOS ? 10 : 0
    },
    challengeLogo: {
      width: 80,
      height: 50,
      marginTop: -5,
      marginBottom: 5
    }
  })
}

function mapStateToProps (state) {
  const {
    competition: {
      data: competition,
      rankings: { Ranking = [] }
    }
  } = state
  const userData = getUserObject(state)
  const { LevelName, LoyaltyId } = userData
  const componentTheme = getThemeByLevel(LevelName)
  return {
    LoyaltyId,
    componentTheme,
    competition,
    rankings: Ranking
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
)(Congrats)
