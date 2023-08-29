import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { CachedImage } from 'react-native-img-cache';
import { Actions } from 'react-native-router-flux';
import { Button } from 'native-base';
import strings from '../../config/strings/strings';
import { APP_COLOR_WHITE } from '../../config/colors';
import {
  ROADSTER_REGULAR,
  DINENGSCHRIFT_BOLD
} from '../../assets/fonts';
import {
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  FONT_SCALLING,
  IF_OS_IS_IOS,
  COMMON_BUTTON_STYLE,
  COMMON_BUTTON_TEXT_STYLE
} from '../../config/common_styles';
import { actions as categoriesActions } from '../../ducks/categories';
import { connect } from 'react-redux';
import { getThemeByLevel } from '../../config/common_styles/appthemes';
import { getUserObject } from '../../helpers/UserHelper';
import { KEY_RECOMMENDED_SHOWING } from '../../config/constants/network_api_keys';
import * as Animatable from 'react-native-animatable';

const TITLE_CONTAINER_HEIGHT = 50;
const TITLE_TEXT_SIZE = 21;
const TITLE_MARGIN = 13;
const ITEM_CELL_HEIGHT = 145;
const ITEM_TITLE_TEXT_SIZE = 18;
const ITEM_TITLE_TEXT_MARGINS = 20;
const ITEM_TITLE_TEXT_WIDTH = 124;
const ITEMS_MARGIN = 5;
const FOOTER_HEIGHT = 70;
const ADD_ITEMS_ARROW_MARGIN_LEFT = 5;
const SKIP_ARROW_WIDTH = 9;
const SKIP_ARROW_HEIGHT = 15;
const MODAL_WIDTH = SCREEN_WIDTH * 0.9;
const BORDER_RADIUS = 10;

class Recommended extends Component {
  constructor(props) {
    super(props);
    const { LevelName, categoriesData = [] } = this.props;
    const {
      menuCategories,
      startersCategoryId,
      dessertsCategoryId,
      drinksCategoryId,
      startersCategory,
      dessertsCategory,
      drinksCategory,
      recommendCategoryId,
      recommendCategory,
    } = this.parseMenuItems(categoriesData, true);

    const state = {
      componentTheme: getThemeByLevel(LevelName),
      menuCategories,
      startersCategoryId,
      dessertsCategoryId,
      drinksCategoryId,
      startersCategory,
      dessertsCategory,
      drinksCategory,
      recommendCategoryId,
      recommendCategory,
      recommendedList: []
    };

    if (menuCategories.length) state.recommendedList = this.parseRecommendedList(state, true);

    this.state = state;
  }

  componentWillMount() {}

  componentDidMount() {
    //fetch categories if empty
    if (this.state.menuCategories.length == 0) this.props.fetchCategories();
  }

  componentWillReceiveProps(nextProps) {
    const { categoriesData = [] } = nextProps;
    this.parseMenuItems(categoriesData);
  }

  parseMenuItems(categoriesData, shouldReturn) {
    const { menuCategories = [] } = this.state || {};
    let startersCategoryId, dessertsCategoryId, drinksCategoryId;
    let startersCategory, dessertsCategory, drinksCategory;
    let recommendCategoryId = [];
    let recommendCategory = [];

    if (categoriesData && categoriesData.length > menuCategories.length) {
      for (let index = 0; index < categoriesData.length; index++) {
        const { ID: key, MenuLabel: title, URL: url, Recommendation: recommendation } = categoriesData[index];
        const category = { index, key, title, url, recommendation };

        //find category keys
        if (recommendation === '1') {
          recommendCategoryId.push(key);
          recommendCategory.push(category);
        }
        menuCategories.push(category);
      }
    }

    if (shouldReturn)
      return {
        menuCategories,
        startersCategoryId,
        dessertsCategoryId,
        drinksCategoryId,
        startersCategory,
        dessertsCategory,
        drinksCategory,
        recommendCategoryId,
        recommendCategory
      };
    else
      this.setState(
        {
          menuCategories,
          startersCategoryId,
          dessertsCategoryId,
          drinksCategoryId,
          startersCategory,
          dessertsCategory,
          drinksCategory,
          recommendCategoryId,
          recommendCategory
        },
        this.parseRecommendedList
      );
  }

  parseRecommendedList(state, shouldReturn) {
    const { cartItemsArray } = this.props;
    let recommendedList = [];
    const {recommendCategory } = state || this.state;
    let newArray = recommendCategory;

    if (cartItemsArray) {
      cartItemsArray.forEach((item, index) => {
        const { CategoryId } = item;
        newArray.forEach((category, index) => {
          CategoryId === category.key && newArray.splice(index, 1);
        })
      })
    }
    // if there aren't any recommends then go straight to cart
    if (recommendedList.length == 0) Actions.yourcart();

    //TODO: Investigate the use of the below line. Do we really need it?
    AsyncStorage.setItem(KEY_RECOMMENDED_SHOWING, JSON.stringify(true));

    console.log('RecommendList--->', newArray);
    if (shouldReturn) return newArray;
    else this.setState({ recommendedList: newArray });
  }

  onBackPress() {
    Actions.drawer({ type: 'reset' });
    Actions.ourmenu();
  }

  onContinuePress = () => {
    this.props.onClose();
  };

  onCategoryPress({ index, key }) {
    const categoriesNames = this.props.categoriesData.map((obj, i) => {
      return { index: i, key: obj.ID, title: obj.MenuLabel };
    });
    Actions.categories({
      categoryId: key,
      categoriesNames,
      tabIndex: index
    });
  }

  renderCategory = (category = {}, count) => {
    if(!category) return;
    const { recommendedList } = this.state;
    const { url, key, index, title = '' } = category;
    const {
      backgroundImageStyle,
      listItemContainer,
      listItemTitleTextStyle,
      listItemStyle,
      lastListItemStyle
    } = styles;
    const lastStyle = count < recommendedList.length - 1 ? {} : lastListItemStyle;
    return (
      <View style={[listItemContainer, lastStyle]} key={key}>
        <CachedImage
          resizeMode="cover"
          style={backgroundImageStyle}
          source={{ uri: `${url}?location=recommendation` }}
        />
        <TouchableOpacity
          key
          index
          onPress={() => this.onCategoryPress({ index, key })}
          style={listItemStyle}>
          <Text allowFontScaling={FONT_SCALLING} style={listItemTitleTextStyle}>
            {title.toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  renderRecommended(recommendedList) {
    return recommendedList.map((data, index) => this.renderCategory(data, index));
  }

  render() {
    const {
      modalBackground,
      titleText,
      recommendedListStyle,
      popUpContainerView,
      titleBarStyle,
      buttonStyle,
      buttonTextStyle,
      errorStyle,
      footerStyle
    } = styles;
    const { visible } = this.props;
    const {
      componentTheme: { thirdColor },
      recommendedList,
      error
    } = this.state;
    const backgroundTheme = { backgroundColor: thirdColor };
    const renderList = recommendedList.length > 0;
    return (
      <Modal transparent={true} visible={visible && recommendedList?.length > 0} onRequestClose={this.handleRequestClose}>
        <View style={modalBackground}>
          <Animatable.View
            animation={'fadeInUp'}
            duration={2e3}
            easing="ease-out-expo"
            style={popUpContainerView}>
            <View style={[titleBarStyle, backgroundTheme]}>
              <Text allowFontScaling={FONT_SCALLING} style={titleText}>
                {strings.ANYTHING_ELSE.toUpperCase()}
              </Text>
            </View>
            <View style={[recommendedListStyle, backgroundTheme]}>
              {this.renderRecommended(recommendedList)}
            </View>
            <View style={footerStyle}>
              {error ? <Text style={errorStyle}>{error}</Text> : null}
              <Button onPress={this.onContinuePress} style={[buttonStyle, backgroundTheme]}>
                <Text allowFontScaling={FONT_SCALLING} style={buttonTextStyle}>
                  {strings.CONTINUE.toUpperCase()}
                </Text>
              </Button>
            </View>
          </Animatable.View>
        </View>
      </Modal>
    );
  }
}

const styles = {
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)'
  },
  popUpContainerView: {
    flex: 1,
    height: 'auto',
    maxHeight: SCREEN_HEIGHT * 0.9,
    borderWidth: 0,
    maxWidth: MODAL_WIDTH,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  titleBarStyle: {
    height: TITLE_CONTAINER_HEIGHT,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS
  },
  titleText: {
    color: APP_COLOR_WHITE,
    fontSize: TITLE_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_BOLD,
    alignItems: 'center',
    margin: 0,
    paddingTop: IF_OS_IS_IOS ? 8 : 0
  },
  listItemContainer: {
    width: MODAL_WIDTH,
    height: ITEM_CELL_HEIGHT,
    marginBottom: 4
  },
  lastListItemStyle: {
    marginBottom: 0
  },
  listItemStyle: {
    width: '100%',
    flexDirection: 'column',
    height: '100%'
  },
  listItemTitleTextStyle: {
    width: '100%',
    color: APP_COLOR_WHITE,
    marginLeft: TITLE_MARGIN,
    marginTop: ITEM_TITLE_TEXT_MARGINS,
    fontSize: ITEM_TITLE_TEXT_SIZE,
    fontFamily: DINENGSCHRIFT_BOLD
  },
  recommendedListStyle: {
    //flex: 1,
    backgroundColor: APP_COLOR_WHITE,
    width: '100%'
  },
  backgroundImageStyle: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: -0,
    width: MODAL_WIDTH,
    height: '100%'
  },
  buttonStyle: {
    ...COMMON_BUTTON_STYLE,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10
  },
  buttonTextStyle: {
    ...COMMON_BUTTON_TEXT_STYLE,
    fontFamily: ROADSTER_REGULAR
  },
  errorStyle: {
    color: 'red',
    fontSize: 14,
    marginTop: 10
  },
  footerStyle: {
    width: '100%',
    height: 'auto',
    backgroundColor: APP_COLOR_WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: BORDER_RADIUS,
    borderBottomRightRadius: BORDER_RADIUS
  }
};

function mapStateToProps(state) {
  const userData = getUserObject(state);
  const { LevelName } = userData;
  const {
    category: { categoriesData }
  } = state;
  return {
    LevelName,
    categoriesData,
    cartItemsArray: state.cart.cartItemsArray
  };
}
export default connect(
  mapStateToProps,
  categoriesActions
)(Recommended);

//export default Recommended;
