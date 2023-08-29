import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';

import {
  APP_COLOR_WHITE,
  APP_COLOR_BLACK,
} from '../../config/colors';
import { DINENGSCHRIFT_REGULAR, DINENGSCHRIFT_BOLD } from '../../assets/fonts';
import strings from '../../config/strings/strings';
import { List, ListItem } from 'native-base';
import { TabView, TabBar } from 'react-native-tab-view';
import { FONT_SCALLING } from '../../config/common_styles';
import { Actions } from 'react-native-router-flux';
const TITLE_CONTAINER_HEIGHT = 53.5;
const TITLE_FONT_SIZE = 30;
const VOUCHER_ICON_WIDTH = 32.5;
const VOUCHER_ICON_HEIGHT = 23;
const TAB_CELL_WIDTH = 75;
import { connect } from 'react-redux';
import { actions as vouchersActions } from '../../ducks/vouchers';
import CommonLoader from '../../components/CommonLoader';
import TitleBar from '../../components/TitleBar';
import { numberWithCommas } from '../../config/common_functions';

class Vouchers extends Component {
  state = {
    index: 0,
    routes: [],
    temsVar: '',
    componentTheme: {},
    allVouchersArray: [],
  };
  componentWillUnmount() { }

  componentDidMount() {
    this.props.getVouchers();
  }
  componentWillMount() { }

  onPress = (event, caption) => {
    switch (caption) {
      case strings.BACK:
        Actions.pop();
        break;

      case strings.CONTINUE:
        alert(strings.CONTINUE);
        break;

      case strings.ADD_ITEMS:
        alert(strings.ADD_ITEMS);
        break;

      default:
    }
  };

  componentWillMount() {
    this.setThemeOfComponent();
  }

  onPressBack() {
    Actions.pop();
  }

  setThemeOfComponent() {
    const theme = AsyncStorage.getItem('theme').then(data =>
      this.setState({ componentTheme: JSON.parse(data) })
    );
  }
  _handleIndexChange = index =>
    this.setState({
      index
    });

  componentWillReceiveProps(nextProps) {
    if (nextProps.vouchers !== this.props.vouchers) {
      let formattedVouchers = {};
      let routes = [];

      if (Object.keys(nextProps.statuses).length) {
        let count = 0;
        for (const [key, value] of Object.entries(nextProps.statuses)) {
          routes.push({
            index: count, key: count + 1, param: value.toLowerCase(), title: value, status: key
          });
          count++;
        }
      }

      if (nextProps.vouchers && Object.keys(nextProps.statuses).length) {
          Object.values(nextProps.statuses).forEach(value => {
          let status = value.toLowerCase();
          if(status){
            if (!formattedVouchers[status]) {
                  formattedVouchers[status] = [];
              }
                formattedVouchers[status] = nextProps.vouchers[status];
            }
          })
      }
      this.setState({
        routes,
        allVouchersArray: formattedVouchers,
      });
    }
  }

  _renderLabel = props => {
    const {
      route: { index, title }
    } = props;
    const { index: selectedIndex } = this.state;
    const isSelected = selectedIndex == index;
    const {
      componentTheme: { thirdColor }
    } = this.state;
    return (
      <View style={styles.label}>
        <Text
          allowFontScaling={FONT_SCALLING}
          //numberOfLines={1}
          style={[
            styles.labelText,
            {
              color: isSelected ? APP_COLOR_WHITE : thirdColor,
              fontSize: 18
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
      pressColor={APP_COLOR_BLACK}
      onTabPress={this._handleTabItemPress}
      renderLabel={this._renderLabel}
      indicatorStyle={{ backgroundColor: APP_COLOR_BLACK }}
      tabStyle={styles.tab}
      scrollEnabled={true}
      style={styles.tabbar}
    />
  );

  _renderScene = state => {
    const {
      route: { param },
    } = state;
    let dataArray = (this.state.allVouchersArray[param] || []).slice();
    const {
      componentTheme: { thirdColor }
    } = this.state;

    return (
      <List
        style={{ backgroundColor: thirdColor }}
        bounces={false}
        horizontal={false}
        dataArray={dataArray}
        renderRow={item => (
          <View style={styles.listRow}>
            <ListItem noBorder style={[styles.listItemStyle, { backgroundColor: thirdColor }]}>
              <TouchableOpacity disabled={true} style={styles.cellTouchStyle}>
                <View style={{ width: '40%', alignItems: 'center', borderWidth: 0, marginStart: 0, justifyContent: 'flex-start' }}>
                  <Image style={styles.profileImageStyle} source={{ uri: item.URL }} resizeMode="contain" />
                  <Text allowFontScaling={FONT_SCALLING} style={styles.voycherNameTextStyle}>
                    {item.voucherNo}
                  </Text>
                </View>
                <View style={{ width: '60%', marginHorizontal: 20, justifyContent: 'flex-start'}}>
                  <Text allowFontScaling={FONT_SCALLING} style={styles.voucherHeadingTextStyle}>
                    {item.title}
                  </Text>
                  <Text allowFontScaling={FONT_SCALLING} style={styles.descriptionTextStyle}>
                  {numberWithCommas(item.value,item.currency)}
                  </Text>
                  {this.state.index != 1 && (
                    <Text allowFontScaling={FONT_SCALLING} style={styles.descriptionTextStyle}>
                      {this.state.index == 2 ? 'Expired on ' : 'Expires on '}
                      {moment(item.expiryDate).format('DD-MM-YYYY')}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </ListItem>
          </View>
        )}
      />
    );
  };

  render() {
    const {
      container,
    } = styles;
    const { componentTheme: { thirdColor, VOUCHER_ICON, ARROW_LEFT_RED } } = this.state;
    const { title } = this.props;

    return (
      <View style={container}>
        <CommonLoader />
        <TitleBar
          onPress={this.onPressBack}
          color={thirdColor}
          titleText={title || strings.VOUCHERS}
          titleIcon={VOUCHER_ICON}
          backIcon={ARROW_LEFT_RED}
          titleIconSize={{ width: VOUCHER_ICON_WIDTH }}
        />
          <TabView
            style={[styles.container]}
            swipeEnabled={true}
            navigationState={this.state}
            renderScene={this._renderScene}
            renderTabBar={this._renderTabBar}
            onIndexChange={this._handleIndexChange}
            initialTabIndex={2}
          />
      </View>
    );
  }
}

const styles = {
  listRow: {
    borderBottomWidth: 1,
    borderColor: APP_COLOR_WHITE,
  },
  cellTouchStyle: {
    flex: 1,
    height: 130,
    flexDirection: 'row',
    // borderBottomWidth: 1,
    // borderColor: APP_COLOR_WHITE,
    alignItems: 'center'
  },
  profileImageStyle: {
    width: 100,
    height: 70,
    borderRadius: 100 / 2,
    marginTop: 2,
    resizeMode: 'cover',
    borderWidth: 0
  },
  descriptionTextStyle: {
    color: APP_COLOR_BLACK,
    fontSize: 14,
    fontFamily: DINENGSCHRIFT_REGULAR,
    // marginStart: 10,
    marginTop: 5
  },
  voycherNameTextStyle: {
    color: APP_COLOR_BLACK,
    fontSize: 16,
    fontFamily: DINENGSCHRIFT_BOLD,
    textAlign: 'center',
    marginTop: 10
  },
  voucherHeadingTextStyle: {
    color: APP_COLOR_BLACK,
    // marginStart: 10,
    fontSize: 16,
    fontFamily: DINENGSCHRIFT_BOLD
  },
  tabBarUnderlineStyle: {
    backgroundColor: APP_COLOR_BLACK
  },
  tabStyle: {
    backgroundColor: APP_COLOR_BLACK,
    marginLeft: -6,
    marginRight: -6
  },
  activeTabStyle: {
    backgroundColor: APP_COLOR_BLACK
  },
  container: {
    flex: 1
  },
  indicator: {
    backgroundColor: APP_COLOR_BLACK
  },
  label: {},
  labelText: {
    fontSize: 16,
    fontFamily: DINENGSCHRIFT_BOLD,
    flexWrap: 'wrap',
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  tabbar: {
    backgroundColor: APP_COLOR_BLACK,
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 51
  },
  tab: {
    padding: 0,
    margin: 0,
    opacity: 1,
    backgroundColor: APP_COLOR_BLACK,
    borderWidth: 0,
    width: 120,
    // width: 'auto',
    height: 51,
    borderColor: 'yellow',
  },
  listItemStyle: {
    paddingEnd: 0,
    borderWidth: 0,
    height: 130
  }
};

function mapStateToProps(state) {
  console.log('voucher component', state);
  return {
    vouchers: state.vouchers.vouchers.vouchers,
    statuses: state.vouchers.vouchers.statuses
  };
}

export default connect(
  mapStateToProps,
  vouchersActions
)(Vouchers);
