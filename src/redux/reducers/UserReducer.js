import ActionTypes from '../actions';

const UserReducer = (state = {
  orgUsers: [{}],
  orgPeers: [{}], // Array of objects representing organization's users
  orgAdmins: [{}],
}, action) => {
  switch (action.type) {
    case ActionTypes.FETCH_ORG_USERS:
      return Object.assign({}, state, {
        orgUsers: action.payload,
      });
    case ActionTypes.FETCH_ORG_PEERS:
      return Object.assign({}, state, {
        orgPeers: action.payload,
      });
    case ActionTypes.FETCH_ORG_ADMINS:
      return Object.assign({}, state, {
        orgAdmins: action.payload,
      });
    default:
      return state;
  }
};

export default UserReducer;
