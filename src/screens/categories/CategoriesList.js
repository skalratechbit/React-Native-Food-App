import React, { Component } from 'react'
import { View, ScrollView } from 'react-native'
import { actions as categoriesActions } from '../../ducks/categories'
import { actions as cartActions } from '../../ducks/cart'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getThemeByLevel } from '../../config/common_styles/appthemes'
import CategoryOnScreenCartView from './CategoryOnScreenCartView'
import { getUserObject } from '../../helpers/UserHelper'
import MenuItem from './MenuItem'

class CategoriesList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      hideCartView: false,
      selectedId: '',
      componentTheme: getThemeByLevel(this.props.LevelName)
    }
  }

  findCuisineIcons () {
    const { icons = [] } = this.props
    const iconNames = []
    const iconObjects = {}
    icons.map(({ IconLabel, IconName, IconUrl }) => {
      iconNames.push(IconName)
      iconObjects[IconName] = { IconLabel, IconUrl }
    })
    return { iconNames, iconObjects }
  }

  setSelectedObjectToCartView (index) {
    const filterArray = this.props.categoriesItemArray.filter(
      obj => obj.ID === index
    )
    const sobj = Object.assign({}, filterArray[0])
    this.props.setSelectedObjectOfToCartViewIn(sobj)
  }

  handleAddToOrderPress = id => {
    this.setSelectedObjectToCartView(id)
    this.setState({ selectedId: id })
    if (this.state.hideCartView) this.setState({ hideCartView: false })
    else this.setState({ hideCartView: true })
  };

  renderList () {
    const { iconNames, iconObjects } = this.findCuisineIcons()
    const { categoriesItemArray } = this.props
    return categoriesItemArray.map((item, key) => (
      <MenuItem
        key={key}
        icons={{ iconNames, iconObjects }}
        item={item}
        addToOrderPress={this.handleAddToOrderPress}
      />
    ))
  }

  render () {
    const {
      componentTheme: { thirdColor }
    } = this.state
    styles = getStyles(thirdColor)
    return (
      <View style={styles.container}>
        <View style={styles.listContainer}>
          <ScrollView style={styles.flexOne} bounces={false}>
            {this.renderList()}
          </ScrollView>
        </View>
        {this.state.hideCartView && (
          <CategoryOnScreenCartView
            tabIndex={this.props.tabIndex}
            selectedId={this.state.selectedId}
            onCrossPress={this.handleAddToOrderPress}
            appColor={thirdColor}
          />
        )}
      </View>
    )
  }
}
let styles = {}
const getStyles = color => ({
  container: {
    flex: 1,
    width: null,
    height: null,
    alignItems: 'center',
    backgroundColor: color
  },
  listContainer: {
    flex: 1,
    backgroundColor: color,
    width: '100%'
  },
  flexOne: { flex: 1 }
})

function mapStateToProps (state) {
  const userData = getUserObject(state)

  return {
    LevelName: userData.LevelName || 'challenger'
  }
}

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      ...cartActions,
      ...categoriesActions
    },
    dispatch
  )
})

export default connect(
  mapStateToProps,
  categoriesActions
)(CategoriesList)
