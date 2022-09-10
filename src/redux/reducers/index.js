// the starting point for your redux store
// this defines what your store state will look like
import { combineReducers } from 'redux';
import AuthReducer from './AuthReducer';
import UserReducer from './UserReducer';
import LoadingReducer from './LoadingReducer';
import AlertReducer from './AlertReducer';
import OrganizationsReducer from './OrganizationsReducer';
import ResourceTabReducer from './ResourceTabReducer';
import SurveysReducer from './SurveysReducer';

const rootReducer = combineReducers({
  auth: AuthReducer,
  users: UserReducer,
  loading: LoadingReducer,
  alert: AlertReducer,
  orgs: OrganizationsReducer,
  resourceTab: ResourceTabReducer,
  surveys: SurveysReducer,
});

export default rootReducer;
