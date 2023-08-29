import React, { PureComponent } from 'react';
import { Container } from 'native-base';
import {
  Text,
  View,
  BackHandler
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Actions } from 'react-native-router-flux';
import CategoriesList from './CategoriesList';
import {
  APP_COLOR_WHITE,
  APP_COLOR_BLACK,
  DETAIL_TEXT_COLOR
} from '../../config/colors';
import { DINENGSCHRIFT_BOLD } from '../../assets/fonts';
import { actions } from '../../ducks/categories';
import { connect } from 'react-redux';

import { TabView, TabBar } from 'react-native-tab-view';
import CommonLoader from '../../components/CommonLoader';
import { FONT_SCALLING } from '../../config/common_styles';
import { AppEventsLogger } from 'react-native-fbsdk';

const TAB_CELL_WIDTH = 105;
class Categories extends PureComponent<*, State> {
  static title = 'Scroll views';
  static backgroundColor = APP_COLOR_BLACK;
  static tintColor = APP_COLOR_BLACK;
  static appbarElevation = 0;
  state = {
    index: this.props.tabIndex || 0,
    routes: this.props.categoriesNames || [
      { key: '1', title: 'STARTRES' },
      { key: '2', title: 'SALADS' },
      { key: '3', title: 'SANDWICHES' },
      { key: '4', title: 'BURGERS' },
      { key: '5', title: 'SALADS' },
      { key: '6', title: 'SANDWICHES' }
    ],
    componentTheme: {}
  };

  componentWillReceiveProps(nextProps) {
    this.setState({ routes: nextProps.categoriesNames });
  }

  componentDidMount() {
    this.setThemeOfComponent();
    //list for back button
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    //log fb event
    const { routes, index } = this.state;
    AppEventsLogger.logEvent("fb_mobile_content_view", routes[index].title);
  }

  componentWillUnmount() {
    //clean up
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  setThemeOfComponent() {
    const theme = AsyncStorage.getItem('theme').then(data =>
      this.setState({ componentTheme: JSON.parse(data) })
    );
  }

  onBackPress() {
    Actions.ourmenu();
    return true;
  }

  setTabViewRef = (ref) => {
    this.TabView = ref
  }

  _handleIndexChange = index => {
    console.log('CHANGE INDEX', index)
    this.setState({
      index: Number(index)
    }, () => {
      AsyncStorage.setItem('categoryIndex', `${this.state.index}`);
      //log fb event
      const { routes, index } = this.state;
      AppEventsLogger.logEvent("fb_mobile_content_view", routes[index].title);
    });
  };

  _handleTabItemPress = (props) => {
    console.log('this.TabView', this.TabView)
    const { route: { key }, index } = props;
    this.setState({ index: Number(this.state.index) });
    // this.TabView._jumpTo(key)
  };

  _renderLabel = (props) => {
    const { route: { index, title } } = props;
    const { index: selectedIndex } = this.state;
    const isSelected = selectedIndex == index;
    return (
      <View style={styles.label}>
        <Text
          allowFontScaling={FONT_SCALLING}
          style={[styles.labelText, {
              color: isSelected ? APP_COLOR_WHITE : DETAIL_TEXT_COLOR,
            }
          ]}>
          {title}
        </Text>
      </View>
    );
  };

  _renderTabBar = props => (
    <TabBar
      {...props}
      scrollEnabled
      pressColor={APP_COLOR_BLACK}
      onTabPress={this._handleTabItemPress}
      renderLabel={this._renderLabel}
      indicatorStyle={{ backgroundColor: APP_COLOR_BLACK }}
      tabStyle={styles.tab}
      style={styles.tabbar}
    />
  );

  _renderScene = (state) => {
    const { route: { key, index } } = state;
    const { allMenu, menuIcons = [] } = this.props;
    const { index: stateIndex } = this.state;
    const categoriesItemArray = allMenu.filter((data) => data.CategoryId === key);
    const isSelected = stateIndex == index;
    const prevState = stateIndex - 1
    const isBefore = prevState > -1 && prevState == index
    const isAfter = stateIndex + 1 == index
    return (isBefore || isAfter || isSelected ?
      <CategoriesList
        categoriesItemArray={categoriesItemArray}
        cartItemsArray={this.props.cartItemsArray}
        appCurrency={this.props.currency}
        icons={menuIcons}
        tabIndex={stateIndex}
      />
    : <View/>);
  };

  render() {
    const { componentTheme } = this.state;
    let thirdColor = componentTheme && componentTheme.thirdColor || '';
    const { allMenu } = this.props;
    return (
      <Container>
        <CommonLoader isLoading={allMenu.length == 0} />
        <TabView
          ref={this.setTabViewRef}
          style={[
            styles.container,
            this.props.style,
            { backgroundColor: thirdColor }
          ]}
          navigationState={this.state}
          renderScene={this._renderScene}
          renderTabBar={this._renderTabBar}
          onIndexChange={this._handleIndexChange}
          initialTabIndex={this.state.index}
        />
      </Container>
    );
  }
}

const styles = {
  activeTabStyle: {
    backgroundColor: APP_COLOR_BLACK
  },
  container: {
    flex: 1
  },
  indicator: {
    backgroundColor: APP_COLOR_BLACK
  },
  tab: {
    opacity: 1,
    backgroundColor: APP_COLOR_BLACK,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    borderColor: 'red',
    width: TAB_CELL_WIDTH
  },
  label: {
    //minWidth: TAB_CELL_WIDTH,
  },
  labelText: {
    fontFamily: DINENGSCHRIFT_BOLD,
    textAlign: 'center',
    fontSize: 15
  },
  tabbar: {
    backgroundColor: APP_COLOR_BLACK
  },
};

function mapStateToProps(state) {
  const { category, category: { CategoriesArray } } = state;
  return {
    loadingState: state.app.loading,
    categoriesItemArray: category.categoriesItmsData,
    cartItemsArray: state.cart.cartItemsArray,
    currency: state.app.currency,
    menuIcons: category.menuIcons || [],
    allMenu: category.allMenu || [],
  };
}

export default connect(
  mapStateToProps,
  actions
)(Categories);
