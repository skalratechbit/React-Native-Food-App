export const types = {
  GET_BRANCHES: 'get_branches',
  GET_BRANCHES_SUCCESS: 'get_branches_succsess',
  GET_BRANCHES_FAILURE: 'get_branches_failure',

  GET_BRANCHES_FOR_BEACON: 'get_branches_for_beacon',
  GET_BRANCHES_FOR_BEACON_SUCCESS: 'get_branches_for_beacon_succsess',
  GET_BRANCHES_FOR_BEACON_FAILURE: 'get_branches_for_beacon_failure',
  RESET_WHEEL_GAME: 'reset_wheel_game',
  SET_WHEEL_GAME: 'set_wheel_game',
  GET_WHEEL_GAME: 'get_wheel_game',
  GET_WHEEL_OPTIONS: 'get_wheel_options',
  SET_WHEEL_OPTIONS: 'set_wheel_options'
};

const INITIAL_STATE = {
  branches: [],
  wheelGame: {
    playData: {},
    status: 0,
    message: ''
  },
  wheelOptions: {
    optionsData: {},
    zone: {},
    message: ''
  }
};

export default function (state = INITIAL_STATE, { type, payload }) {
  switch (type) {
    case types.GET_BRANCHES_SUCCESS:
      return { ...state, branches: payload };

    case types.GET_BRANCHES_FAILURE:
      return { ...state, branches: payload };

    case types.GET_BRANCHES_FOR_BEACON_SUCCESS:
      return { ...state, branches: payload };

    case types.GET_BRANCHES_FOR_BEACON_FAILURE:
      return { ...state, branches: payload };

    case types.SET_WHEEL_GAME:
      return {
        ...state,
        wheelGame: Object.assign(INITIAL_STATE.wheelGame, payload)
      };
    case types.SET_WHEEL_OPTIONS:
      return {
        ...state,
        wheelOptions: payload
      };

    case types.RESET_WHEEL_GAME:
      return { ...state, wheelGame: INITIAL_STATE }

    default:
      return state
  }
}

export const actions = {
  getBranches: () => ({ type: types.GET_BRANCHES }),
  getBranchesForBeacon: () => ({ type: types.GET_BRANCHES_FOR_BEACON }),
  getWheelGame: wheelData => ({ type: types.GET_WHEEL_GAME, wheelData }),
  getWheelOptions: position => ({ type: types.GET_WHEEL_OPTIONS, position })
};
