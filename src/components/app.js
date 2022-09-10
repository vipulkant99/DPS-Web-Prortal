import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import { connect } from 'react-redux';
// import LoadingOverlay from 'react-loading-overlay';
import { toast } from 'react-toastify';
import NavBar from './NavBar';
import Homepage from './Homepage';
import SignIn from './SignIn';
import People from './People';
import CreateAccount from './CreateAccount';
import CreateOrg from './CreateOrg';
import Surveys from './Surveys';
import ViewSurvey from './ViewSurveys';
import ViewAnswer from './ViewAnswerSet';
import CreateSurvey from './CreateSurvey';
import CreateAnswer from './AnswerSet';
import UserResourceProg from './userProfiles/UserResourceProg';
import UserContainer from './userProfiles/UserContainer';
import AuthorizedRoute from '../helpers/AuthorizedRoute';
import EditResource from './EditResource';
import ViewResource from './ViewResource';
import ResourceLibrary from './ResourceLibrary';
import Organizations from './Organizations';
import Roles from '../helpers/Roles';
import Routes from '../helpers/Routes';
import { createAuthListener } from '../firebase';
import { clearErrorMessage, clearSuccessMessage, stopLoading } from '../redux/DispatchHelpers';
import OrgResourceLibrary from './OrgResourceLibrary';
import '../style.scss';

// 404 Page
const FallBack = (props) => {
  return <div> URL Not Found </div>;
};

// Root component: creates router and displays all other components within it
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.props.stopLoading(); // Clear loading overlay in case it's present on launch
  }

  componentDidMount() {
    this.props.createAuthListener(); // Set up Google auth listener
  }

  // Show error/success alert if prop (provided by redux store) updates
  componentDidUpdate(prevProps) {
    if (this.props.errorMessage && this.props.errorMessage !== prevProps.errorMessage) {
      toast.error(this.props.errorMessage);
      this.props.clearErrorMessage();
    }
    if (this.props.successMessage && this.props.successMessage !== prevProps.successMessage) {
      toast.success(this.props.successMessage);
      this.props.clearSuccessMessage();
    }
  }

  render() {
    return (
    // <LoadingOverlay
    //   active={this.props.isLoading}
    //   spinner
    // >
      <Router>
        <div className="main-page">
          { this.props.uid && <NavBar /> }
          <Switch>
            <Route path={Routes.SIGN_IN} exact component={SignIn} />
            <AuthorizedRoute
              path={Routes.CREATE_ACCOUNT}
              exact
              component={CreateAccount}
              validRoles={[Roles.SUPER_ADMIN, Roles.ADMIN]}
            />
            <AuthorizedRoute
              path={Routes.CREATE_ORGANIZATION}
              exact
              component={CreateOrg}
              validRoles={[Roles.SUPER_ADMIN]}
            />
            <AuthorizedRoute
              path={Routes.HOMEPAGE}
              exact
              component={Homepage}
              validRoles={[Roles.SUPER_ADMIN]}
            />
            <AuthorizedRoute
              path={Routes.ALL_PEOPLE}
              exact
              component={People}
              validRoles={[Roles.SUPER_ADMIN]}
            />
            <AuthorizedRoute
              path={Routes.ADD_SURVEY}
              exact
              component={CreateSurvey}
              validRoles={[Roles.SUPER_ADMIN]}
            />
            <AuthorizedRoute
              path={Routes.ADD_ANSWER}
              exact
              component={CreateAnswer}
              validRoles={[Roles.SUPER_ADMIN]}
            />
            <AuthorizedRoute
              path={Routes.SURVEYS}
              exact
              component={Surveys}
              validRoles={[Roles.SUPER_ADMIN, Roles.ADMIN]}
            />
            <AuthorizedRoute
              path={Routes.VIEW_SURVEY}
              exact
              component={ViewSurvey}
              validRoles={[Roles.SUPER_ADMIN, Roles.ADMIN]}
            />
            <AuthorizedRoute
              path={Routes.VIEW_ANSWER}
              exact
              component={ViewAnswer}
              validRoles={[Roles.SUPER_ADMIN, Roles.ADMIN]}
            />
            <AuthorizedRoute
              path={Routes.ORG_SURVEYS}
              exact
              component={Surveys}
              validRoles={[Roles.SUPER_ADMIN, Roles.ADMIN]}
            />
            <AuthorizedRoute
              path={Routes.ORG_PEOPLE}
              exact
              component={People}
              validRoles={[Roles.SUPER_ADMIN, Roles.ADMIN]}
            />
            <AuthorizedRoute
              path={Routes.SINGLE_USER}
              exact
              component={UserContainer}
              validRoles={[Roles.SUPER_ADMIN, Roles.ADMIN]}
            />
            <AuthorizedRoute
              path={Routes.VIEW_RESOURCEPROG}
              exact
              component={UserResourceProg}
              validRoles={[Roles.SUPER_ADMIN, Roles.ADMIN]}
            />
            {/* <AuthorizedRoute
                path={Routes.ORG_PEERS}
                exact
                component={OrgPeers}
                validRoles={[Roles.SUPER_ADMIN, Roles.ADMIN]}
              /> */}
            <AuthorizedRoute
              path={Routes.RESOURCE_LIBRARY}
              exact
              component={ResourceLibrary}
              validRoles={[Roles.SUPER_ADMIN]}
            />
            <AuthorizedRoute
              path={Routes.ORG_RESOURCE_LIBRARY}
              exact
              component={OrgResourceLibrary}
              validRoles={[Roles.SUPER_ADMIN, Roles.ADMIN]}
            />
            <AuthorizedRoute
              path={Routes.VIEW_RESOURCE}
              exact
              component={ViewResource}
              validRoles={[Roles.SUPER_ADMIN, Roles.ADMIN]}
            />
            <AuthorizedRoute
              path={Routes.EDIT_RESOURCE}
              exact
              component={EditResource}
              validRoles={[Roles.SUPER_ADMIN]}
            />
            <AuthorizedRoute
              path={Routes.ORGANIZATIONS}
              exact
              component={Organizations}
              validRoles={[Roles.SUPER_ADMIN]}
            />
            <Route component={FallBack} />
          </Switch>
        </div>
      </Router>
    // </LoadingOverlay>
    );
  }
}

const mapStateToProps = reduxState => (
  {
    uid: reduxState.auth.uid,
    role: reduxState.auth.role,
    selectedOrgID: reduxState.orgs.selectedOrgID,
    isLoading: reduxState.loading.isLoading,
    errorMessage: reduxState.alert.errorMessage,
    successMessage: reduxState.alert.successMessage,
  }
);

export default connect(mapStateToProps, {
  createAuthListener, clearErrorMessage, clearSuccessMessage, stopLoading,
})(App);
