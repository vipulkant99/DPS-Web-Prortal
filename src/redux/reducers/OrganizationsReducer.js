import ActionTypes from '../actions';

const nullState = {
  organizations: [], // Array of objects representing all PeerTECH organizations (their IDs and names)
  selectedOrgID: '', // Current organization ID to show data for. Super-Admins can change this.
  selectedOrgName: '', // Organization name corresponding to selectedOrgID
  selectedOrgSuspended: false,
};

const OrganizationsReducer = (state = nullState, action) => {
  switch (action.type) {
    case ActionTypes.SET_ORGANIZATIONS:
      return {
        ...state,
        organizations: action.payload,
      };
    case ActionTypes.SELECT_ORGANIZATION:
      return {
        ...state,
        selectedOrgID: action.payload.orgID,
        selectedOrgName: action.payload.orgName,
        selectedOrgSuspended: action.payload.suspended,
      };
    case ActionTypes.CHANGE_ORG_STATUS:
      return {
        ...state,
        selectedOrgSuspended: action.payload.suspended,
      };
    case ActionTypes.DESELECT_ORGANIZATION:
      return {
        ...state,
        selectedOrgID: '',
        selectedOrgName: '',
      };
    case ActionTypes.CLEAR_AUTH:
      return nullState;

    default:
      return state;
  }
};

export default OrganizationsReducer;
