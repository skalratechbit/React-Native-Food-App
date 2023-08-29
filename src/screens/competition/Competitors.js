import React, { Component } from 'react'
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from 'react-native'
import moment from 'moment'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as competitionActions } from '../../ducks/competition'
import {
  CHALLENGE_PLACE_3,
  CHALLENGE_PLACE_2,
  CHALLENGE_PLACE_1,
  ARROW_RIGHT_WHITE
} from '../../assets/images'
import { getUserObject } from '../../helpers/UserHelper'
import { getThemeByLevel } from '../../config/common_styles/appthemes'
import { APP_COLOR_WHITE, APP_COLOR_BLACK } from '../../config/colors'
import { IF_OS_IS_IOS, SCREEN_WIDTH } from '../../config/common_styles'
import { numberWithCommas } from '../../config/common_functions'
import Common from '../../components/Common'
import strings from '../../config/strings/strings'
const { Text } = Common

class Competitors extends Component {
  constructor (props) {
    super(props)
    this.state = {
      icons: {
        1: CHALLENGE_PLACE_1,
        2: CHALLENGE_PLACE_2,
        3: CHALLENGE_PLACE_3
      },
      showHistory: false,
      showHistoryItem: {}
    }
  }

  componentDidMount () {
    this.props.getCompetitionRanking()
  }

  handleToggleHistory = () => {
    const { showHistory } = this.state
    this.setState({
      showHistory: !showHistory
    })
    this.scrollToButtom()
  };

  handleToggleOrderDetails = item => {
    const { showHistoryItem } = this.state
    this.setState({
      showHistoryItem: item.OrderId == showHistoryItem.OrderId ? {} : item
    })
    this.scrollToButtom()
  };

  scrollToButtom () {
    setTimeout(() => this.refs.scrollView.scrollToEnd(), 4)
  }

  renderRankIcon (icon) {
    return (
      icon && (
        <View style={styles.iconContainer}>
          <Image style={styles.placeIcon} source={icon} />
        </View>
      )
    )
  }

  renderCompetitor = (competitor, i) => {
    const {
      FullName,
      Ranking,
      LoyaltyId: RankLoyaltyId,
      Trend,
      Total,
      MenuName = 'NESTEA'
    } = competitor
    const { icons } = this.state
    const { LoyaltyId } = this.props
    const Icon = icons[Ranking]
    const isMe = LoyaltyId == RankLoyaltyId
    const competitorStyles = [styles.competitor]
    const leftSectionComp = []
    const trendPrefix = String(Trend)
      .substr(0, 1)
      .toLowerCase()

    if (isMe) {
      // set find flag
      this.foundYou = true
      competitorStyles.push(styles.mine)
    }
    if (trendPrefix == 'u') {
      leftSectionComp.push(<View key={'up'} style={styles.arrowUp} />)
    }
    leftSectionComp.push(
      <Text key={'rnk'} style={styles.placeText}>
        {Ranking}
      </Text>
    )
    if (trendPrefix == 'd') {
      leftSectionComp.push(<View key={'dwn'} style={styles.arrowDown} />)
    }

    return (
      <View style={competitorStyles} key={i}>
        <View style={styles.placeContainer}>{leftSectionComp}</View>
        <View style={styles.nameContainer}>
          <Text style={styles.nameText}>{FullName.toUpperCase()}</Text>
        </View>
        {this.renderRankIcon(Icon)}
        {isMe && (
          <View style={styles.statContainer}>
            <Text style={styles.statText}>
              {Total} x {String(MenuName).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
    )
  };

  renderHistoryButton () {
    // only if you were found
    return this.foundYou ? (
      <View style={styles.loadContainer}>
        <TouchableOpacity
          style={styles.loadButton}
          onPress={this.handleToggleHistory}
        >
          <View style={styles.underline}>
            <Text style={styles.loadHistory}>{strings.LOAD_HISTORY}</Text>
          </View>
        </TouchableOpacity>
      </View>
    ) : null
  }

  renderHistory () {
    const { showHistory } = this.state
    const { history } = this.props
    return showHistory ? history.map(this.renderHistoryRow) : null
  }

  renderHistoryRow = (history, i) => {
    const { showHistoryItem } = this.state
    const { BranchName, Date, Items, Quantity } = history
    const BranchLabel = (BranchName || 'BRANCH NAME').toUpperCase()
    const OrderTime = moment(Date).format('YYYY-MM-DD / h:mm a')
    const CompetitionItems = (Items || []).filter(
      item => parseInt(item.IsCompetition) > 0
    )
    const ItemsCount = CompetitionItems.length
    const CompetitionItemName = (ItemsCount
      ? CompetitionItems[0].MenuName || ''
      : '').toUpperCase()
    const ShowItems =
      showHistoryItem && showHistoryItem.OrderId === history.OrderId
    return (
      <View style={styles.history} key={i}>
        <TouchableOpacity
          style={styles.historyRow}
          onPress={() => this.handleToggleOrderDetails(history)}
        >
          <View style={styles.arrow}>
            <Image
              style={[styles.arrowIcon, ShowItems ? styles.arrowIconDown : {}]}
              source={ARROW_RIGHT_WHITE}
            />
          </View>
          <View style={styles.branch}>
            <Text style={styles.branchText}>{BranchLabel}</Text>
          </View>
          <View style={styles.time}>
            <Text style={styles.timeText} light>
              {OrderTime}
            </Text>
          </View>
          <View style={styles.quantity}>
            <Text style={styles.quantityText} light>
              {Quantity} x {CompetitionItemName}
            </Text>
          </View>
        </TouchableOpacity>
        {ShowItems && this.renderHistoryItemsList(Items)}
      </View>
    )
  };

  renderHistoryItemsList = Items => {
    return (
      <View style={styles.itemsList}>{Items.map(this.renderOrderDetail)}</View>
    )
  };

  renderOrderDetail = HistoryItem => {
    const { MenuName, Qty, Amount } = HistoryItem
    const { currency } = this.props
    const ItemName = MenuName.toUpperCase()
    const Quantity = parseInt(Qty)
    const Price = numberWithCommas(Amount, currency)

    return (
      <View style={styles.itemRow}>
        <Text style={styles.itemName} light>
          {`${Quantity} ${ItemName}`}
        </Text>
        <Text style={styles.itemPrice} light>
          {Price}
        </Text>
      </View>
    )
  };

  render () {
    const {
      componentTheme,
      componentTheme: { thirdColor },
      rankings,
      competition
    } = this.props
    styles = renderStyles(thirdColor)

    // reset find flag
    this.foundYou = false
    return (
      <View style={styles.container}>
        <ScrollView ref='scrollView' style={styles.leaderBoard}>
          {rankings.map(this.renderCompetitor)}
          {this.renderHistoryButton()}
          {this.renderHistory()}
        </ScrollView>
      </View>
    )
  }
}
let styles = {}
function renderStyles (color) {
  const textStyle = {
    fontSize: 26,
    paddingTop: IF_OS_IS_IOS ? 4 : 0
  }
  return StyleSheet.create({
    container: {
      flex: 1,
      width: SCREEN_WIDTH,
      backgroundColor: APP_COLOR_BLACK
    },
    leaderBoard: {
      flex: 1
    },
    competitor: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: APP_COLOR_WHITE,
      height: 52
    },
    mine: {
      backgroundColor: color
    },
    placeContainer: {
      width: 52,
      alignItems: 'center'
    },
    placeText: {
      ...textStyle
    },
    nameContainer: {
      flex: 1
    },
    nameText: {
      ...textStyle
    },
    iconContainer: {
      width: 50,
      alignItems: 'center'
    },
    placeIcon: {
      width: 25,
      height: 25
    },
    arrowUp: {
      width: 0,
      height: 0,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      backgroundColor: 'transparent',
      borderBottomColor: APP_COLOR_WHITE,
      borderStyle: 'solid',
      borderLeftWidth: IF_OS_IS_IOS ? 5 : 4,
      borderRightWidth: IF_OS_IS_IOS ? 5 : 4,
      borderBottomWidth: IF_OS_IS_IOS ? 15 : 8,
      marginTop: -5,
      marginBottom: IF_OS_IS_IOS ? -5 : -2
    },
    arrowDown: {
      width: 0,
      height: 0,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      backgroundColor: 'transparent',
      borderTopColor: APP_COLOR_WHITE,
      borderStyle: 'solid',
      borderLeftWidth: IF_OS_IS_IOS ? 5 : 4,
      borderRightWidth: IF_OS_IS_IOS ? 5 : 4,
      borderTopWidth: IF_OS_IS_IOS ? 15 : 8,
      marginTop: IF_OS_IS_IOS ? -8 : -3,
      marginBottom: -3
    },
    statContainer: {
      paddingRight: 15
    },
    statText: {
      ...textStyle,
      fontSize: 22
    },
    loadContainer: {},
    loadButton: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      marginBottom: IF_OS_IS_IOS ? 10 : 5
    },
    loadHistory: {
      ...textStyle,
      fontSize: 22
    },
    underline: {
      height: 27,
      borderBottomWidth: 1,
      borderBottomColor: APP_COLOR_WHITE
    },
    history: {
      width: '100%',
      borderTopWidth: 1,
      borderTopColor: APP_COLOR_WHITE
    },
    historyRow: {
      height: 55,
      flexDirection: 'row',
      alignItems: 'center'
    },
    arrow: {
      width: 35,
      paddingLeft: 10,
      alignItems: 'center',
      justifyContent: 'center'
    },
    arrowIcon: {
      width: 7,
      height: 15
    },
    arrowIconDown: {
      transform: [{ rotate: '90deg' }]
    },
    branch: {
      justifyContent: 'center',
      flex: 1
    },
    branchText: {
      ...textStyle
    },
    time: {
      justifyContent: 'center',
      paddingLeft: 10,
      paddingRight: 10
    },
    timeText: {
      fontSize: 14
    },
    quantity: {
      justifyContent: 'center',
      paddingRight: 20
    },
    quantityText: {
      fontSize: 14
    },
    itemsList: {
      width: '100%',
      paddingLeft: 20,
      paddingRight: 20,
      paddingBottom: 15
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    itemName: {
      fontSize: 14
    },
    itemPrice: {
      fontSize: 14,
      textAlign: 'right'
    }
  })
}

function mapStateToProps (state) {
  const {
    app: { currency },
    competition: {
      data: competition,
      rankings: { Ranking = [], History = [] }
    }
  } = state
  const userData = getUserObject(state)
  const { LevelName, LoyaltyId } = userData
  const componentTheme = getThemeByLevel(LevelName)
  return {
    LoyaltyId,
    componentTheme,
    competition,
    rankings: Ranking,
    history: History,
    currency
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
)(Competitors)
