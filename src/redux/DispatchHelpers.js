// A collection of functions to handle simple one-liner dispatch actions
// To be imported and used in components
// As opposed to standard redux updates which occur in firebase.js

import ActionTypes from './actions';

// Ensure error alerts are only shown once
export function clearErrorMessage() {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: '' });
  };
}

// Ensure success alerts are only shown once
export function clearSuccessMessage() {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_SUCCESS, payload: '' });
  };
}

// Create error alert in non-connected component
export function setErrorMessage(message) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: message });
  };
}

// Update selected organization ID (for super-admins to change context)
export function selectOrg(orgID, orgName, suspended) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SELECT_ORGANIZATION, payload: { orgID, orgName, suspended } });
  };
}

// unselect org if superadmin wants to see all orgs
export function deselectOrg() {
  return (dispatch) => {
    dispatch({ type: ActionTypes.DESELECT_ORGANIZATION, payload: { } });
  };
}

// Stop loading overlay
export function stopLoading(orgID) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: false });
  };
}

// switch tabs for superadmin resource library
export function switchTabs(tabName) {
  return (dispatch) => {
    dispatch({ type: ActionTypes.SET_RESOURCE_TAB, payload: tabName });
  };
}
