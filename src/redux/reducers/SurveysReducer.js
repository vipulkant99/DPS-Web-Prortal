import ActionTypes from '../actions';

const initialState = {
  surveys: [],
  answerSets: [],
};

const SurveyReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.FETCH_SURVEYS:
      return { ...state, surveys: action.payload };
    case ActionTypes.FETCH_ANSWER_SETS:
      return { ...state, answerSets: action.payload };
    default:
      return state;
  }
};

export default SurveyReducer;
