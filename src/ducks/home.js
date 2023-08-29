export const types = {
  FETCH_MEALS: 'fetch_meals',
  FETCH_MEALS_SUCCESS: 'fetch_meals_success',
  FETCH_MEALS_FAILURE: 'fetch_meals_failure',

  FETCH_USUAL_MEALS: 'fetch_usual_meals',
  FETCH_USUAL_MEALS_SUCCESS: 'fetch_usual_meals_success',
  FETCH_USUAL_MEALS_FAILURE: 'fetch_usual_meals_failure',

  FETCH_USER_ORDER_COUNT: 'fetch_user_order_count',
  FETCH_USER_ORDER_COUNT_SUCCESS: 'fetch_user_order_count_success',
  FETCH_USER_ORDER_COUNT_FAILURE: 'fetch_user_order_count_failure',

  FETCH_EXTRA_CHARGE_SUCCESS: 'fetch_extra_charge_success',

  FETCH_USER_ORDERS_SUCCESS: 'fetch_user_orders_success',
  FETCH_USER_ORDERS_FAILURE: 'fetch_user_orders_failure',

  FETCH_LAST_ORDER: 'fetch_last_order',
  SET_LAST_ORDER: 'set_last_order',

  CANCEL_ORDER: 'cancel_order',
  CANCEL_ORDER_SUCCESS: 'cancel_order_success',
  CANCEL_ORDER_FAILURE: 'cancel_order_failure',
  SET_CANCEL_ORDER_STATUS: 'set_cancel_order_status',

  SELECTED_MEAL_OBJECT: 'selected_meal_object',

  GET_BANNERS: 'get_banners',
  SET_BANNERS: 'set_banners',

  SET_SLIDES: 'set_slides',
  SENT_SEEN_SLIDES: 'sent_seen_slides'
};

const INITIAL_STATE = {
  count: 0,
  mealsData: {},
  mealsItmsData: {},
  selectedMealObject: {},
  usualMealsData: {},
  userOrdersCount: { data: [], total: 0, total_pending: 0 },
  banners: {},
  lastOrder: { timestamp: 0, order: null },
  cancelOrderData: { timestamp: 0, status: null },
  introSlides: [],
  seenSlider: false,
  extraCharage: {}
};

export default function reducer(state = INITIAL_STATE, action = {}, OrderHistoryData: []) {
  switch (action.type) {
    // case types.ADD_TO_CART:
    //
    // return {...state, count: action.payload};
    // break;

    case types.FETCH_MEALS_SUCCESS:
      return { ...state, mealsData: action.payload };
      break;

    case types.FETCH_MEALS_FAILURE:
      return { ...state, mealsData: '' };
      break;

    // case types.FETCH_MENU_ITEMS_SUCCESS:
    // return {...state,categoriesItmsData: action.payload};
    //
    // break;

    // case types.FETCH_MENU_ITEMS_FAILURE:
    //
    // return {...state,categoriesItmsData: ""};
    // break;

    case types.SELECTED_MEAL_OBJECT:
      return { ...state, selectedMealObject: action.payload };
      break;

    case types.FETCH_USUAL_MEALS_SUCCESS:
      return { ...state, usualMealsData: action.payload };
      break;

    case types.FETCH_USUAL_MEALS_FAILURE:
      return { ...state, usualMealsData: '' };
      break;

    case types.FETCH_EXTRA_CHARGE_SUCCESS:
      return { ...state, extraCharage: action.payload };
      break;

    case types.FETCH_USER_ORDER_COUNT_SUCCESS:
      let ordersArray = [];
      let ordersTotal = 0;
      let totalPending = 0;
      // if(action.payload) {
      //   //should prepend
      //   // const { data: rows, total } = action.payload;
      //   // const prevFirst = state.userOrdersCount.data[0];
      //   // const newFirst = action.payload.data[0];
      //   ordersTotal = action.payload.total;
      //   totalPending = action.payload.pending_orders;
      //   ordersArray = [].concat(action.payload.rows);
      //   if(action.payload) {
      //     ordersArray = [].concat(state.userOrdersCount.data).concat(ordersArray);
      //   }
      // }
      return { ...state, userOrdersCount: { data: action.payload.rows, total: action.payload.total, total_pending: action.payload.pending_orders } };
      break;

    case types.FETCH_USER_ORDER_COUNT_FAILURE:
      return { ...state, userOrdersCount: { data: [], total: 0, total_pending: 0 } };
      break;

    case types.SET_CANCEL_ORDER_STATUS:
      return { ...state, cancelOrderData: { timestamp: new Date().getTime(), status: action.payload } };
      break;

    case types.CANCEL_ORDER_SUCCESS:
      return { ...state, userOrdersCount: { data: [], total: 0, total_pending: 0 } };
      break;

    case types.CANCEL_ORDER_FAILURE:
      return { ...state, cancelOrderData: { timestamp: new Date().getTime(), status: { message: 'Request Error!' } } };
      break;

    case types.FETCH_USER_ORDERS_SUCCESS:
      return { ...state, OrderHistoryData: action.payload };
      break;

    case types.FETCH_USER_ORDERS_FAILURE:
      return { ...state, OrderHistoryData: [] };
      break;

    case types.SET_BANNERS:
      return { ...state, banners: action.payload };
      break;

    case types.SET_LAST_ORDER:
      return { ...state, lastOrder: { timestamp: new Date().getTime(), order: action.payload } };
      break;
    case types.SET_SLIDES:
      return { ...state, introSlides: action.payload }
      break;
    case types.SENT_SEEN_SLIDES:
      return { ...state, seenSlider: action.seen }
      break;
    default:
      return state;
      break;
  }
}

export const actions = {
  fetchMeals: () => ({ type: types.FETCH_MEALS }),
  fetchMealsItems: requestByData => ({ type: types.FETCH_MEALS_ITEMS, requestByData }),
  //setSelectedObjectOfToCartViewIn: (object) => ({ type: types.SELECTED_MEAL_OBJECT,payload:object  }),

  fetchUsualMeals: () => ({ type: types.FETCH_USUAL_MEALS }),
  fetchUserOrdersCount: (pagination) => ({ type: types.FETCH_USER_ORDER_COUNT, pagination }),
  fetchLastOrder: () => ({ type: types.FETCH_LAST_ORDER }),
  cancelOrder: params => ({ type: types.CANCEL_ORDER, params }),
  setSeenSlides: seen => ({ type: types.SENT_SEEN_SLIDES, seen }),
  getBanners: () => ({ type: types.GET_BANNERS }),
};
