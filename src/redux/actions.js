// Helper enum to define redux dispatch action types
const ActionTypes = {
  FETCH_AUTH: 'FETCH_AUTH',
  CLEAR_AUTH: 'CLEAR_AUTH',
  FETCH_ORG_USERS: 'FETCH_ORG_USERS',
  FETCH_ORG_PEERS: 'FETCH_ORG_PEERS',
  FETCH_ORG_ADMINS: 'FETCH_ORG_ADMINS',
  FETCH_SURVEYS: 'FETCH_SURVEYS',
  FETCH_ANSWER_SETS: 'FETCH_ANSWER_SETS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SUCCESS: 'SET_SUCCESS',
  SET_ORGANIZATIONS: 'SET_ORGANIZATIONS',
  SELECT_ORGANIZATION: 'SELECT_ORGANIZATION',
  CHANGE_ORG_STATUS: 'CHANGE_ORG_STATUS',
  DESELECT_ORGANIZATION: 'DESELECT_ORGANIZATION',
  SET_RESOURCE_TAB: 'SET_RESOURCE_TAB',
  DELETE_USER: 'DELETE_USER',
};

export default ActionTypes;
