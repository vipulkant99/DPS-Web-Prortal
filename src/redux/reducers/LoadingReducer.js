import ActionTypes from '../actions';

const nullState = {
  isLoading: false, // Whether the site should display a loading overlay
};

const LoadingReducer = (state = nullState, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return Object.assign({}, state, {
        isLoading: action.payload,
      });
    default:
      return state;
  }
};

export default LoadingReducer;
