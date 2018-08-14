// ACTION TYPES
const UPDATE_SCORE = 'UPDATE_SCORE'

// INITIAL STATE
const initialState = 0

// ACTION CREATORS
export const updateScore = (total) => ({
  type: UPDATE_SCORE,
  total
})

// REDUCER
const reducer = (state = initialState, action) => {
  switch(action.type) {
    case UPDATE_SCORE:
      return action.total
    default:
      return state
  }
}

export default reducer
