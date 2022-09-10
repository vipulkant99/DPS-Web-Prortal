/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { Input } from 'reactstrap';
import { connect } from 'react-redux';
import Organizations from './Organizations';
// import { signInAndFetchData, fetchSpecificOrganization } from '../firebase';
import Routes, { createOrgRoute } from '../helpers/Routes';
import Roles from '../helpers/Roles';
import vectorArt from '../assets/home.png';

// Handle sign in and sign out
class Homepage extends Component {
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

  // Sign in on backend and push to approriate landing page based on role
  handleSignIn = (event) => {
    const secondCallback = () => {
      this.props.history.push(this.props.location.state?.requestedPath
        ?? this.props.role === Roles.SUPER_ADMIN ? Routes.ORGANIZATIONS : createOrgRoute(this.props.adminOrgID, Routes.ORG_USERS));
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
    const welcomeText = this.props.role === Roles.SUPER_ADMIN ? (
      'Manage your organizations here and help ensure Peers and Service Users are on the road to recovery!'
    ) : ('Make sure Peers and Service Users are on the road to recovery! ');


    return (
      <div className="view page">
        <div id="welcomeBox" className="boxshadow">
          <div id="welcomeText">
            <h1>Welcome {this.props.role} </h1>
            <p> {welcomeText} </p>
          </div>
          <img id="homeImg" src={vectorArt} alt="noimg" />
        </div>
        <Organizations />
      </div>
    );
  }
}

const mapStateToProps = reduxState => (
  {
    role: reduxState.auth.role,
    uid: reduxState.auth.uid,
    adminOrgID: reduxState.auth.orgID,
  }
);

export default withRouter(connect(mapStateToProps, { })(Homepage));
