import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { Input } from 'reactstrap';
import { connect } from 'react-redux';
import { signOut, signInAndFetchData, fetchSpecificOrganization } from '../firebase';
import Routes, { createOrgRoute } from '../helpers/Routes';
import Roles from '../helpers/Roles';
import logo from '../assets/PeerTech 3.png';

// Handle sign in and sign out
class SignIn extends Component {
  constructor(props) {
    super(props);

    // Form fields
    this.state = {
      email: '',
      password: '',
    };
  }

  onEmailChange = (event) => {
    this.setState({ email: event.target.value });
  }

  onPasswordChange = (event) => {
    this.setState({ password: event.target.value });
  }

  handleSignOut = (event) => { // invoke when org is suspended (admin cannot access portal)
    const successCallback = () => {
      this.props.history.push(Routes.SIGN_IN);
    };
    this.props.signOut(successCallback, true);
  };

  // Sign in on backend and push to approriate landing page based on role
  handleSignIn = (event) => {
    const secondCallback = () => {
      if (this.props.role === Roles.ADMIN && this.props.selectedOrgSuspended) { // org suspended, user logged out
        this.handleSignOut();
      } else {
        this.props.history.push(this.props.location.state?.requestedPath
          ?? this.props.role === Roles.SUPER_ADMIN ? Routes.HOMEPAGE : createOrgRoute(this.props.adminOrgID, Routes.ORG_PEOPLE));
      }
    };

    const successCallback = () => {
      this.setState({ email: '', password: '' });

      if (this.props.role === Roles.ADMIN) {
        this.props.fetchSpecificOrganization(this.props.adminOrgID, secondCallback);
      } else {
        secondCallback();
      }
    };

    this.props.signInAndFetchData(this.state.email, this.state.password, successCallback);
  }

  render() {
    return (
      <div id="loginPage">
        <div id="loginOverlay">
          <img src={logo} alt="no logo" />
          <div id="loginForm">
            <br />
            {/* <div> Email: (admin@test.com OR superadmin@test.com)</div> */}
            <Input className="loginInput" placeholder="Email" onChange={this.onEmailChange} value={this.state.email} />
            {/* <div> Password: (password)</div> */}
            <Input className="loginInput" type="password" placeholder="Password" onChange={this.onPasswordChange} value={this.state.password} />
            <Button id="signin" onClick={this.handleSignIn}>Login</Button>
          </div>

        </div>
      </div>
    );
  }
}

const mapStateToProps = reduxState => (
  {
    role: reduxState.auth.role,
    uid: reduxState.auth.uid,
    adminOrgID: reduxState.auth.orgID,
    selectedOrgSuspended: reduxState.orgs.selectedOrgSuspended,
  }
);

export default withRouter(connect(mapStateToProps, { signOut, signInAndFetchData, fetchSpecificOrganization })(SignIn));
