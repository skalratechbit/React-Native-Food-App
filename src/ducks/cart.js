import AsyncStorage from '@react-native-community/async-storage'

export const types = {
  ADD_ITEM_TO_CART: 'add_item_to_cart',
  DLETE_ITEM_FROM_CART: 'dlete_item_from_cart',
  TOTAL_AMOUNT: 'total_amount',
  CLEAR_CART: 'clear_cart',
  GET_FREE_STARTER: 'get_free_starter',
  GET_FREE_STARTER_SUCCESS: 'get_free_starter_success',
  GET_FREE_STARTER_FAILURE: 'get_free_starter_failure',
  GET_FAVORITES: 'get_favorites',
  SET_FAVORITES: 'set_favorites',
  DELETE_FAVORITE: 'delete_favorite',
  DELETED_FAVORITE: 'deleted_favorite',
  SAVE_FAVORITE: 'save_favorite',
  SAVED_FAVORITE: 'saved_favorite',
  RESET_FAVORITE_STATES: 'reset_favorite_states',
  GET_CART_PROMOS: 'get_promos',
  SET_CART_PROMOS: 'set_promos',
  SET_PROMO_CODE: 'set_promo_code',
  VALIDATE_PROMO: 'validate_promo',
  PROMO_VALIDATED: 'promo_validated',
  PROMO_INVALID: 'promo_invalid'
};

const INITIAL_STATE = {
  cartItemsArray: [],
  totalAmount: 0,
  starterItems: [],
  favorites: [],
  favoriteDeleted: null,
  favoriteSaved: null,
  promoCode: '',
  promoValidated: null,
  promoObject: {},
  cartPromos: []
};

export default function reducer(state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case types.ADD_ITEM_TO_CART:
      // store items locally
      // console.log('=============+++========+> STORING CART', action.payload);
      const arrayString = JSON.stringify(action.payload);
      AsyncStorage.setItem('cartItems', arrayString);
      return { ...state, cartItemsArray: JSON.parse(arrayString) };
      break;

    case types.DLETE_ITEM_FROM_CART:
      return { ...state, cartItemsArray: action.payload };
      break;

    case types.TOTAL_AMOUNT:
      return { ...state, totalAmount: action.payload };
      break;

    case types.CLEAR_CART:
      return { ...state, cartItemsArray: [] };
      break;

    case types.GET_FREE_STARTER_SUCCESS:
      return { ...state, startersItems: action.payload };
      break;

    case types.GET_FREE_STARTER_FAILURE:
      return { ...state, startersItems: [] };
      break;

    case types.SET_CART_PROMOS:
      let cartPromos = action.payload;
      if(typeof cartPromos == 'string' || cartPromos == null) cartPromos = [];
      return { ...state, cartPromos };
      break;

    case types.SET_FAVORITES:
      const favoriteDeleted = null;
      const favoriteSaved = null;
      return {
        ...state,
        favoriteSaved,
        favoriteDeleted,
        favorites: action.payload || []
      };
      break;

    case types.DELETED_FAVORITE:
      const deleteId = action.payload;
      if (deleteId === false) {
        state.favoriteDeleted = false;
      } else {
        const faveLength = state.favorites.length;
        const favorites = [].concat(state.favorites);
        for (let i = 0; i < faveLength; i++) {
          if (favorites[i]?.ID == deleteId) {
            favorites.splice(i, 1);
            i = faveLength;
          }
        }
        state.favorites = favorites;
        state.favoriteDeleted = true;
      }
      return { ...state };
      break;

    case types.SAVED_FAVORITE:
      const savedItem = action.payload;
      if (savedItem === false) {
        state.favoriteSaved = false;
      } else {
        state.favorites = [savedItem].concat(state.favorites);
        state.favoriteSaved = true;
      }
      return { ...state };
      break;

    case types.RESET_FAVORITE_STATES:
      state.favoriteDeleted = null;
      state.favoriteSaved = null;
      return { ...state };
      break;

    case types.SET_PROMO_CODE:
      return {
        ...state,
        promoObject: {},
        promoCode: action.payload,
        promoValidated: null
      };
      break;

    case types.PROMO_VALIDATED:
      const {
        PromoCode: promoCode
      } = action.payload
      const promoValidated = true;
      const promoObject = action.payload;
      return {
        ...state,
        promoCode,
        promoValidated,
        promoObject
      };
      break;

    case types.PROMO_INVALID:
      return { ...state, promoObject: { reason: action.payload }, promoCode: '', promoValidated: false };
      break;

    default:
      return state;
      break;
  }
}

export const actions = {
  setTotalAmountOfCart: amount => ({
    type: types.TOTAL_AMOUNT,
    payload: amount
  }),
  additmeToCart: cartItemArray => ({
    type: types.ADD_ITEM_TO_CART,
    payload: cartItemArray
  }),
  deleteItemFromCart: cartItemArray => ({
    type: types.ADD_ITEM_TO_CART,
    payload: cartItemArray
  }),
  clearCart: () => ({ type: types.CLEAR_CART }),
  getFreeStarter: () => ({ type: types.GET_FREE_STARTER }),
  setFavorites: favorites => ({ type: types.SET_FAVORITES, payload: favorites }),
  getFavorites: () => {
    return { type: types.GET_FAVORITES };
  },
  deleteFavorite: favoriteId => {
    return { type: types.DELETE_FAVORITE, payload: favoriteId };
  },
  deletedFavorite: deletedId => {
    return { type: types.DELETED_FAVORITE, payload: deletedId };
  },
  saveFavorite: saveItem => {
    return { type: types.SAVE_FAVORITE, payload: saveItem };
  },
  savedFavorite: savedItem => {
    return { type: types.SAVED_FAVORITE, payload: savedItem };
  },
  resetFavoriteStates: () => {
    return { type: types.RESET_FAVORITE_STATES };
  },
  setPromoCode: promoCode => {
    return { type: types.SET_PROMO_CODE, payload: promoCode };
  },
  validatePromo: promoCode => {
    return { type: types.VALIDATE_PROMO, payload: promoCode };
  },
  getCartPromos: () => {
    return { type: types.GET_CART_PROMOS };
  },
  setCartPromos: promos => {
    return { type: types.SET_CART_PROMOS, payload: promos };
  }
};
