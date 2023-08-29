import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  BackHandler
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import strings from '../../config/strings/strings';
import { CachedImage } from "react-native-img-cache";
import { APP_COLOR_WHITE, APP_COLOR_RED, APP_COLOR_BLACK } from '../../config/colors';
import {
  DINENGSCHRIFT_REGULAR,
  DINENGSCHRIFT_BOLD
} from '../../assets/fonts';
import { List, ListItem } from 'native-base';
import CommonLoader from '../../components/CommonLoader';
import TitleBar from '../../components/TitleBar';
import { FONT_SCALLING, IF_OS_IS_IOS } from '../../config/common_styles';
import { actions as categoriesActions } from '../../ducks/categories';
import { connect } from 'react-redux';
import { getUserObject } from '../../helpers/UserHelper';
import { getThemeByLevel } from '../../config/common_styles/appthemes';
import { AppEventsLogger } from 'react-native-fbsdk';

const TITLE_CONTAINER_HEIGHT = 39.23;
const TITLE_TEXT_SIZE = 30;
const TITLE_MARGIN = 13;
const ITEM_CELL_HEIGHT = 139.5;
const ITEM_TITLE_TEXT_SIZE = 21;
const ITEM_TITLE_TEXT_MARGINS = 20;
const ITEM_TITLE_TEXT_WIDTH = 124;
const ITEMS_MARGIN = 5;

class OurMenu extends Component {
  state = {
    categoryList: [],
    componentTheme: {}
  };

  componentWillMount() {

  }

  componentWillUnmount() {
    //clean up
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  componentWillReceiveProps(nextProps) {

    //set component's theme
    let { componentTheme } = this.state;
    const newComponenTheme = getThemeByLevel(nextProps.LevelName);
    if(componentTheme != newComponenTheme)
      this.setState({ componentTheme: newComponenTheme });

  }

  componentDidMount() {
    //fetch all menu items
    this.props.getAllMenu();

    //fetch categories
    this.props.fetchCategories();

    //list for back button
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);

    //log fb event
    AppEventsLogger.logEvent('fb_mobile_content_view', "Our Menu");
  }

  onBackPress = () => {
    Actions.drawer({ type: 'reset' });
    Actions.home({ drawerMenu: true });
    return true;
  };

  onPress = (event, caption, string, index) => {
    switch (string) {
      case 'Push to Categories':
        const categoriesNames = this.props.CategoriesArray.map((obj, i) => {
          return { index: i, key: obj.ID, title: obj.MenuLabel };
        });
        Actions.categories({
          categoryId: caption,
          categoriesNames,
          tabIndex: index
        });
        break;

      case strings.BACK:
        this.onBackPress();
        break;

      default:
    }
  };

  render() {
    const {
      container,
      listContainer,
      listItemContainer,
      listItemTitleTextStyle,
      backgroundImageStyle
    } = styles;

    return (
      <View style={[container, { backgroundColor: this.state.componentTheme.thirdColor }]}>
        <CommonLoader />
        <TitleBar
          onPress={this.onBackPress}
          color={APP_COLOR_RED}
          backIcon={this.state.componentTheme.ARROW_LEFT_RED}
          titleText={strings.OUR_MENU}
        />
        <View style={[listContainer, { backgroundColor: this.state.componentTheme.thirdColor }]}>
          <List
            bounces={false}
            horizontal={false}
            dataArray={this.props.CategoriesArray}
            style={{ flex: 1 }}
            renderRow={item => (
              <ListItem style={listItemContainer}>
                <TouchableOpacity
                  onPress={event =>
                    this.onPress(event, item.ID, 'Push to Categories', item.index)
                  }
                  style={listItemContainer}>
                  <Text allowFontScaling={FONT_SCALLING} style={listItemTitleTextStyle}>
                    {item.MenuLabel}
                  </Text>
                </TouchableOpacity>
                <CachedImage
                  resizeMode={'cover'}
                  style={backgroundImageStyle}
                  source={{ uri: item.URL }}/>
              </ListItem>
            )}
          />
        </View>
      </View>
    );
  }
}

const styles = {
  scrollStyle: {
    flex: 1
  },
  container: {
    flex: 1,
    width: null,
    height: null,
    alignItems: 'center',
    backgroundColor: APP_COLOR_RED
  },
  subContainer: {
    height: TITLE_CONTAINER_HEIGHT,
    width: '100%',
    backgroundColor: APP_COLOR_BLACK,
    marginBottom: ITEMS_MARGIN
  },
  ourMenuTextStyle: {
    color: APP_COLOR_RED,
    fontSize: TITLE_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_REGULAR,
    marginStart: TITLE_MARGIN
  },
  listContainer: {
    flex: 1,
    backgroundColor: APP_COLOR_RED,
    width: '100%'
  },
  listItemContainer: {
    flex: 1,
    height: ITEM_CELL_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginLeft: 0,
    paddingLeft: 0,
    paddingRight: 0,
    marginRight: 0,
    marginTop: 0,
    paddingTop: 0,
    paddingBottom: 0,
    marginBottom: ITEMS_MARGIN
  },
  listItemTitleTextStyle: {
    color: APP_COLOR_WHITE,
    marginLeft: ITEM_TITLE_TEXT_MARGINS,
    marginTop: ITEM_TITLE_TEXT_MARGINS,
    fontSize: ITEM_TITLE_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_BOLD
  },
  backgroundImageStyle: {
    position: 'absolute',
    zIndex: -1,
    width: '100%',
    height: ITEM_CELL_HEIGHT
  },
  titleArrowImageStyle: {
    marginStart: 10,
    marginBottom: IF_OS_IS_IOS ? 4 : 0
  }
};

function mapStateToProps(state) {
  var list = [];
  var object = {};

  if (state.category.categoriesData && state.category.categoriesData.length > 0)
    for (var i = 0; i < state.category.categoriesData.length; i++) {
      object = {
        index: i,
        ID: state.category.categoriesData[i].ID,
        Label_en: state.category.categoriesData[i].Label_en,
        MenuLabel: state.category.categoriesData[i].MenuLabel,
        URL: state.category.categoriesData[i].URL
      };
      list.push(object);
    }

  return { CategoriesArray: list, loadingState: state.app.loading, LevelName: getUserObject(state).LevelName };
}

export default connect(
  mapStateToProps,
  categoriesActions
)(OurMenu);
