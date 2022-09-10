import ActionTypes from '../actions';

const nullState = {
  errorMessage: '', // Error message to be displayed on toast alert
  successMessage: '', // Success message to be displayed on toast alert
};

const AlertReducer = (state = nullState, action) => {
  switch (action.type) {
    case ActionTypes.SET_ERROR:
      return Object.assign({}, state, {
        errorMessage: action.payload,
      });
    case ActionTypes.SET_SUCCESS:
      return Object.assign({}, state, {
        successMessage: action.payload,
      });
    default:
      return state;
  }
};

export default AlertReducer;
