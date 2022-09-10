import ActionTypes from '../actions';

const nullState = {
  name: '', // User's name
  email: '', // User's email
  uid: '', // User's unique identifier under Google Identity Platform
  role: '', // User's PeerTECH role (Service-User, Peer, Admin, or Super-Admin)
  orgID: '', // Organization ID that user is associated with (may be blank for Super-Admins)
};

const AuthReducer = (state = nullState, action) => {
  switch (action.type) {
    case ActionTypes.FETCH_AUTH:
      return {
        name: action.payload.name ?? state.name,
        email: action.payload.email ?? state.email,
        uid: action.payload.uid ?? state.uid,
        role: action.payload.role ?? state.role,
        orgID: action.payload.orgID ?? state.orgID,
      };
    case ActionTypes.CLEAR_AUTH:
      return nullState;

    default:
      return state;
  }
};

export default AuthReducer;
