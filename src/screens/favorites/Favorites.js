import React, { Component } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { bindActionCreators } from 'redux';
import { actions as cartActions } from '../../ducks/cart';
import { getUserObject } from '../../helpers/UserHelper';
import { getThemeByLevel } from '../../config/common_styles/appthemes';
import TitleBar from '../../components/TitleBar';
import FavoriteItem from './FavoriteItem';
import { APP_COLOR_WHITE, APP_COLOR_BLACK } from '../../config/colors';
import {
  IF_OS_IS_IOS,
  COMMON_BUTTON_STYLE,
  COMMON_BUTTON_TEXT_STYLE,
  SCREEN_WIDTH
} from '../../config/common_styles';
import { ROADSTER_REGULAR, DINENGSCHRIFT_BOLD } from '../../assets/fonts';
import strings from '../../config/strings/strings';
import Common from '../../components/Common';
import CommonLoader from '../../components/CommonLoader';

const { Text, Popup, Button } = Common;

class Favorites extends Component {
  constructor(props) {
    super(props);
    this.state = {
      favoriteToRemove: {},
      showRemoveWarning: false
    };
  }

  componentDidMount() {
    this.props.getFavorites();
  }

  componentWillReceiveProps(nextProps) {
    const { favoriteDeleted, favoriteSaved } = nextProps;
    const deletedSuccess = this.props.favoriteDeleted !== favoriteDeleted && favoriteDeleted;
    const deletedError =
      this.props.favoriteDeleted !== favoriteDeleted && favoriteDeleted === false;
    const savedSuccess = this.props.favoriteSaved !== favoriteSaved && favoriteSaved;
    const savedError = this.props.favoriteSaved !== favoriteSaved && favoriteSaved === false;
  }

  //handlers
  handleHideRemoveFavorite = () => {
    this.setState({
      showRemoveWarning: false,
      favoriteToRemove: {}
    });
  };

  handleShowRemoveFavorite = () => {
    this.setState({ showRemoveWarning: true });
  };

  handleRemoveFavorite = () => {
    const { favoriteToRemove } = this.state;
    const { favorites } = this.props;
    this.setState({ showRemoveWarning: false }, () =>
      this.props.deleteFavorite(favoriteToRemove.ID)
    );
  };

  handleOnRemove = item => {
    this.setState({
      favoriteToRemove: item
    });
    this.handleShowRemoveFavorite();
  };

  handleOnAddToOrder = item => {
    item.quantity = 1;
    const { cartItemsArray } = this.props;
    cartItemsArray.push(item);
    this.props.additmeToCart(cartItemsArray);
  };

  //methods
  backButtonPress() {
    Actions.pop();
  }

  //renderers
  renderFavoriteItems() {
    const { componentTheme, currency, favorites } = this.props;
    const shouldRender = favorites.length > 0;
    return shouldRender && favorites.map((fave, index) => (
      <FavoriteItem
        key={fave.ID}
        item={fave}
        appTheme={componentTheme}
        currency={currency}
        onRemove={this.handleOnRemove}
        onAddToOrder={this.handleOnAddToOrder}
      />
    ));
  }

  renderNoFavorites() {
    const { favorites } = this.props;
    const shouldRender = favorites.length == 0;
    return shouldRender ? (
      <View style={styles.noFavorites}>
        <Text style={styles.noFavoritesText}>{strings.NO_FAVORITES.toUpperCase()}</Text>
      </View>
    ) : null;
  }

  renderRemoveWarning() {
    const { favPopupButton, favPopupButtonText, favPopupContainer } = styles;
    const {
      componentTheme: { thirdColor }
    } = this.props;
    return (
      <View style={favPopupContainer}>
        <Button style={favPopupButton} onPress={this.handleHideRemoveFavorite} color={thirdColor}>
          <Text style={favPopupButtonText}>{strings.CANCEL.toUpperCase()}</Text>
        </Button>
        <Button style={favPopupButton} onPress={this.handleRemoveFavorite} color={thirdColor}>
          <Text style={favPopupButtonText}>{strings.REMOVE.toUpperCase()}</Text>
        </Button>
      </View>
    );
  }

  render() {
    const {
      componentTheme,
      componentTheme: { FAVORITES, thirdColor, ARROW_LEFT_RED },
      title
    } = this.props;
    const { showRemoveWarning } = this.state;
    styles = renderStyles(thirdColor);
    console.log('Favorites--->', this.props.favorites)

    return (
      <View style={styles.container} behavior={IF_OS_IS_IOS ? 'position' : null} enabled>
        <TitleBar
          onPress={this.backButtonPress}
          color={thirdColor}
          titleText={title || strings.FAVORITES}
          titleIconSize={styles.titleIconSize}
          backIcon={ARROW_LEFT_RED}
        />
        <Popup
          color={thirdColor}
          visibilty={showRemoveWarning}
          hideCross={true}
          heading={strings.REMOVE_FAVORITE_WARNING}
          customBody={this.renderRemoveWarning()}
        />
        <CommonLoader />
        <ScrollView bounces={false} class={styles.subContainer}>
          {this.renderFavoriteItems()}
          {this.renderNoFavorites()}
        </ScrollView>
      </View>
    );
  }
}

let styles = {};
function renderStyles(color) {
  return StyleSheet.create({
    container: {
      flex: 1,
      width: SCREEN_WIDTH,
      backgroundColor: APP_COLOR_BLACK
    },
    subContainer: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: 400,
      backgroundColor: APP_COLOR_BLACK
    },
    titleIconSize: {
      width: 25,
      height: 40
    },
    noFavorites: {
      flex: 1,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 400
    },
    noFavoritesText: {
      color: APP_COLOR_WHITE,
      fontSize: 21,
      fontFamily: DINENGSCHRIFT_BOLD
    },
    favPopupButton: {
      ...COMMON_BUTTON_STYLE,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: color,
      marginTop: 20,
      maxWidth: '43%',
      paddingTop: 6,
      marginLeft: 10,
      marginRight: 10
    },
    favPopupButtonText: {
      ...COMMON_BUTTON_TEXT_STYLE,
      fontFamily: ROADSTER_REGULAR,
      fontSize: 20
    },
    favPopupContainer: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 0,
      paddingBottom: 20
    }
  });
}

function mapStateToProps(state) {
  //console.log('state', state);
  const {
    cart: { cartItemsArray, favorites, favoriteDeleted, favoriteSaved },
    app: { accessToken, currency }
  } = state;
  const userData = getUserObject(state);
  const { CustomerId, LevelName } = userData;
  return {
    favoriteDeleted,
    favoriteSaved,
    favorites,
    componentTheme: getThemeByLevel(LevelName),
    cartItemsArray,
    CustomerId,
    currency,
    ACCESS_TOKEN: accessToken
  };
}
const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      ...cartActions
    },
    dispatch
  )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Favorites);
