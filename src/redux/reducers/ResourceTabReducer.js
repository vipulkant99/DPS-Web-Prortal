import ActionTypes from '../actions';

const ResourceTabReducer = (state = 'published', action) => {
  switch (action.type) {
    case ActionTypes.SET_RESOURCE_TAB:
      return action.payload;
    default:
      return state;
  }
};

export default ResourceTabReducer;
