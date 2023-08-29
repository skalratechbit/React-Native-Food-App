export const types = {
  GET_COMPETITION: 'get_competition',
  SET_COMPETITION: 'set_competition',
  RESPOND_TO_COMPETITION_TERMS: 'respond_to_competition_terms',
  SET_COMPETITION_RANKING: 'set_competition_ranking',
  GET_COMPETITION_RANKING: 'get_competition_ranking'
}

const INITIAL_STATE = {
  data: {},
  rankings: []
}

export default function reducer (state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case types.SET_COMPETITION:
      return { ...state, data: { ...(action.payload || INITIAL_STATE.data) } }
      break
    case types.SET_COMPETITION_RANKING:
      return { ...state, rankings: action.payload || INITIAL_STATE.rankings }
      break
    default:
      return state
      break
  }
}

export const getCompetitionId = state => state.competition.data.Id

export const actions = {
  getCompetitionData: () => ({ type: types.GET_COMPETITION }),
  getCompetitionRanking: () => ({ type: types.GET_COMPETITION_RANKING }),
  respondToCompetitionTerms: (CompetitionId, Agreed) => ({
    type: types.RESPOND_TO_COMPETITION_TERMS,
    CompetitionId,
    Agreed
  })
}
