import React, { Component } from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Actions } from 'react-native-router-flux';
import { List, ListItem } from 'native-base';
import {APP_COLOR_WHITE, APP_COLOR_RED, APP_COLOR_BLACK} from '../../config/colors';
import { RIGHT_ARROW_LARGE_WHITE } from '../../assets/images';
import { DINENGSCHRIFT_REGULAR, HELVETICANEUE_LT_STD_CN, DINENGSCHRIFT_BOLD } from '../../assets/fonts';
import { IF_OS_IS_IOS, FONT_SCALLING } from '../../config/common_styles';
import { actions as branchesActions } from '../../ducks/branches';
import { connect } from 'react-redux';
import CommonLoader from '../../components/CommonLoader';
import TitleBar from '../../components/TitleBar';

const TITLE_FONT_SIZE = 30;
const LEFT_RIGHT_MARGINS = 20;
const PIN_ICON_WIDTH = 18;
const PIN_ICON_HEIGHT = 25.5;
const DESCRIPTION_TEXT_SIZE = 18;

const MARGIN_LEFT_RIGHT = 20;
const ITEM_TITLE_TEXT_SIZE = 18;

class Notifications extends Component {
  state = {
    componentTheme: {},
    restaurantBranches: []
  };
  componentWillMount() {
    this.setThemeOfComponent();
  }
  setThemeOfComponent() {
    const theme = AsyncStorage.getItem('theme').then(data =>
      this.setState({ componentTheme: JSON.parse(data) })
    );
  }

  componentDidMount() {
    this.props.getBranches();
  }
  onPress = (event, item) => {
    Actions.atdetail({ addressObject: item });
  };

  onPressBack() {
    Actions.pop();
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.branches !== this.props.branches) {
      this.setState({ restaurantBranches: nextProps.branches });
    }
  }
  render() {
    const {
      container,
      listContainer,
      listItemTitleTextStyle,
      listItemContainer,
      arrowImageStyle
    } = styles;
    const { componentTheme: { thirdColor, ARROW_LEFT_RED} } = this.state;
    const {title} = this.props;
    return (
      <View style={container}>
        <CommonLoader />
        <TitleBar
          onPress={this.onPressBack}
          color={thirdColor}
          titleText={title}
          backIcon={ARROW_LEFT_RED}
          titleIconSize={{ width: PIN_ICON_WIDTH }}
          />
        <View style={listContainer}>
          <List
            bounces={false}
            horizontal={false}
            dataArray={this.state.restaurantBranches}
            style={{ flex: 1 }}
            renderRow={item => (
              <ListItem style={listItemContainer}>
                <TouchableOpacity
                  onPress={event => this.onPress(event, item)}
                  style={{
                    flex: 1,
                    width: '100%',
                    height: 50,
                    justifyContent: 'center'
                  }}>
                  <View>
                    <Text allowFontScaling={FONT_SCALLING} style={listItemTitleTextStyle}>
                      {item.Name}
                    </Text>
                    <Image style={arrowImageStyle} source={RIGHT_ARROW_LARGE_WHITE} />
                  </View>
                </TouchableOpacity>
              </ListItem>
            )}
          />
        </View>
      </View>
    );
  }
}
const styles = {
  container: {
    flex: 1,
    width: null,
    height: null,
    alignItems: 'center',
    backgroundColor: APP_COLOR_BLACK
  },
  subContainer: {
    backgroundColor: APP_COLOR_WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: 10,
    paddingEnd: LEFT_RIGHT_MARGINS,
    width: '100%'
  },
  titleArrowImageStyle: {
    marginStart: 10
    // marginBottom:IF_OS_IS_IOS?4:0
  },
  aboutTextStyle: {
    fontSize: TITLE_FONT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    color: APP_COLOR_RED
  },
  aboutIconStyle: {
    height: PIN_ICON_HEIGHT,
    width: PIN_ICON_WIDTH,
    marginStart: 10
  },
  listContainer: {
    flex: 1,
    backgroundColor: APP_COLOR_BLACK,
    width: '100%'
  },
  listItemContainer: {
    height: 50,
    flexDirection: 'column',
    marginLeft: 0,
    paddingLeft: 0,
    paddingRight: 0,
    marginRight: 0,
    marginTop: 0,
    paddingTop: 0,
    paddingBottom: IF_OS_IS_IOS ? 8 : 8,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 5
  },
  listItemTitleTextStyle: {
    color: APP_COLOR_WHITE,
    marginStart: MARGIN_LEFT_RIGHT,
    fontSize: ITEM_TITLE_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_BOLD,
    marginEnd: 50,
    marginTop: 10
  },
  descriptionTextStyle: {
    color: APP_COLOR_WHITE,
    fontSize: DESCRIPTION_TEXT_SIZE,
    fontFamily: HELVETICANEUE_LT_STD_CN,
    marginStart: MARGIN_LEFT_RIGHT
  },
  arrowImageStyle: {
    width: 11,
    height: 18,
    marginTop: 14,
    position: 'absolute',
    right: MARGIN_LEFT_RIGHT
  }
};
function mapStateToProps(state) {
  return {
    branches: state.branches.branches
  };
}

export default connect(
  mapStateToProps,
  branchesActions
)(Notifications);
