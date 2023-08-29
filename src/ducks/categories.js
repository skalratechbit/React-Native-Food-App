import { types as cartTypes } from './cart';
import { normalizePromoInfo } from '../helpers/MenuHelper';

export const types = {
    APP_THEME: 'app_theme',
    ADD_TO_CART: 'add_To_Cart',

    FETCH_CATEGORIES: 'fetch_categories',
    FETCH_CATEGORIES_SUCCESS: 'fetch_categories_success',
    FETCH_CATEGORIES_FAILURE: 'fetch_categories_failure',

    FETCH_MENU_ITEMS: 'fetch_menu_items',
    FETCH_MENU_ITEMS_SUCCESS: 'fetch_menu_items_success',
    FETCH_MENU_ITEMS_FAILURE: 'fetch_menu_items_failure',

    GET_ALL_MENU: 'get_all_menu',
    GET_ALL_MENU_SUCCESS: 'get_all_menu_success',
    GET_ALL_MENU_FAILURE: 'get_all_menu_failure',

    SELECTED_ITEM_OBJECT: 'selected_item_object'
};

const INITIAL_STATE = {
    count: 0,
    categoriesData: {},
    categoriesItmsData: {},
    selectedItemObject: {},
    icons: []
};

//export  default (state= INITIAL_STATE , action) => {

export default function reducer(state = INITIAL_STATE, action = {}) {
    if (action.type == cartTypes.ADD_ITEM_TO_CART) return state;

    switch (action.type) {
        case types.ADD_TO_CART:
            return { ...state, count: action.payload };
            break;

        case types.FETCH_CATEGORIES_SUCCESS:
            return { ...state, categoriesData: action.payload.rows };
            break;

        case types.FETCH_CATEGORIES_FAILURE:
            return { ...state, categoriesData: '' };
            break;

        case types.FETCH_MENU_ITEMS_SUCCESS:
            return {
                ...state,
                categoriesItmsData: action.payload.items,
                icons: action.payload.icons
            };
            break;

        case types.FETCH_MENU_ITEMS_FAILURE:
            return { ...state, categoriesItmsData: '' };
            break;

        case types.SELECTED_ITEM_OBJECT:
            return { ...state, selectedItemObject: action.payload };
            break;

        case types.GET_ALL_MENU_SUCCESS:
            const { allMenu, menuIcons } = action.payload;
            const newAllMenu = normalizePromoInfo(allMenu.rows);
            return { ...state, allMenu: newAllMenu, menuIcons };
            break;

        case types.GET_ALL_MENU_FAILURE:
            return { ...state, error: true, allMenu: [], menuIcons: [] };
            break;

        default:
            return state;
            break;
    }
}

export const actions = {
    fetchCategories: () => ({ type: types.FETCH_CATEGORIES }),
    fetchMenueItems: requestByData => ({ type: types.FETCH_MENU_ITEMS, requestByData }),
    getAllMenu: () => ({ type: types.GET_ALL_MENU }),
    setSelectedObjectOfToCartViewIn: object => ({
        type: types.SELECTED_ITEM_OBJECT,
        payload: Object.assign({}, object)
    })
};
