/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Alert from 'react-bootstrap/Alert';
import { Button, Dropdown } from 'react-bootstrap';
import Navbar from 'react-bootstrap/Navbar';
import Routes, { createOrgRoute } from '../helpers/Routes';
import Roles from '../helpers/Roles';
import { signOut, fetchOrganizations, changeOrganizationStatus } from '../firebase';
import { selectOrg, deselectOrg } from '../redux/DispatchHelpers';


import logo from '../assets/peertech-logo.png';


// Website navigation to float above all other components
class NavBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      organizations: [],
    };
  }

  componentDidMount() {
    if (this.props.role === Roles.SUPER_ADMIN) {
      this.loadOrganizations();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.role !== prevProps.role && this.props.role !== '' && this.props.role === Roles.SUPER_ADMIN) {
      this.loadOrganizations();
    }
  }

  // Fetch all organizations from database
  loadOrganizations = () => {
    const callback = (organizations) => {
      this.setState({ organizations });
    };
    this.props.fetchOrganizations(callback);
  }

  // returns true if we're inside a selected organization (and show should org-specific stuff)
  // false otherwise
  isWithinOrganization = () => {
    return this.props.role === Roles.ADMIN
      || (this.props.selectedOrgID !== ''
      );
  };

  // returns the organization-specific top alert
  renderOrganizationInfo = () => {
    if (this.isWithinOrganization()) {
      return (
        <Alert variant="primary">
          <Alert.Heading>
            Current Organization: {this.props.selectedOrgName ?? this.props.selectedOrgID}
          </Alert.Heading>
          <div><strong>Your Role: {this.props.role}</strong></div>
          { this.props.role === Roles.SUPER_ADMIN
            && <NavLink to={Routes.ORGANIZATIONS} exact> All Organizations </NavLink>
          }
        </Alert>
      );
    }
    return <div />;
  };

  handleSignOut = (event) => {
    const successCallback = () => {
      this.props.history.push(Routes.SIGN_IN);
    };
    this.props.signOut(successCallback);
  };

  // toggles suspension status of selected organization
  handleSuspension = (event) => {
    this.props.changeOrganizationStatus(this.props.selectedOrgID, !this.props.selectedOrgSuspended);
    this.loadOrganizations();
  }

  goToOrganization = (organization) => {
    const { orgID, name, suspended } = organization;
    this.props.selectOrg(orgID, name, suspended);
    this.props.history.push({
      pathname: createOrgRoute(orgID, Routes.ORG_PEOPLE),
    });
  }

  goToAllOrgs = () => {
    this.props.deselectOrg();
    this.props.history.push({
      pathname: Routes.HOMEPAGE,
    });
  }

  renderOrgDropdown = () => {
    let orgname = '';
    if (this.props.selectedOrgName !== '') {
      orgname = this.props.selectedOrgName;
    } else {
      orgname = 'No Org Selected';
    }
    return (
      <div className="orgDropdown">
        <h3>Organization: </h3>
        <Dropdown id="orgToggle">
          <Dropdown.Toggle>
            {orgname}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item key="all" as="button" onClick={() => this.goToAllOrgs()}>
              All Organizations
            </Dropdown.Item>
            {this.state.organizations.map((org) => {
              return (
                <Dropdown.Item key={org.orgID} as="button" onClick={() => this.goToOrganization(org)}>
                  {org.name}
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>

        </Dropdown>
      </div>

    );
  }

  // specific org routes

  render() {
    // const UserOrgRoute = createOrgRoute(this.props.selectedOrgID, Routes.ORG_USERS);
    const PeopleOrgRoute = createOrgRoute(this.props.selectedOrgID, Routes.ORG_PEOPLE);
    // const PeersOrgRoute = createOrgRoute(this.props.selectedOrgID, Routes.ORG_PEERS);
    const SurveysOrgRoute = createOrgRoute(this.props.selectedOrgID, Routes.SURVEYS);
    const ResourcesOrgRoute = createOrgRoute(this.props.selectedOrgID, Routes.ORG_RESOURCE_LIBRARY);

    return (
      <div id="nav-info">
        {/* On any specific organization page, show the name of the organization above navbar */}
        <h3>{this.props.username}</h3>
        <h4>{this.props.role}</h4>
        {/* {this.renderOrganizationInfo()} */}
        {this.props.role === Roles.SUPER_ADMIN
          ? this.renderOrgDropdown() : <div />
      }
        { this.isWithinOrganization() && (
          <div>
            <h1 id="org-status">Current status: {(this.props.selectedOrgSuspended) ? 'Suspended' : 'Active'}</h1>
            <Button className="suspendButton" id="purplebackground" onClick={this.handleSuspension}>
              {(this.props.selectedOrgSuspended) ? 'Activate' : 'Suspend'}
            </Button>
          </div>
        )}
        <Navbar>
          <ul>
            {/* These routes always available */}
            { this.isWithinOrganization() ? (
              <>
                {/* These routes are specific to orgs */}
                {/* {this.props.role === Roles.ADMIN ? (
                  <li><NavLink to={Routes.CREATE_ACCOUNT}> Create Admin/User/Peer </NavLink></li>
                ) : (<div />)} */}
                <li><NavLink to={PeopleOrgRoute}> Users &amp; Staff </NavLink></li>
                {/* <li><NavLink to={PeersOrgRoute}> Staff </NavLink></li> */}
                <li><NavLink to={SurveysOrgRoute}> Org Surveys </NavLink></li>
                <li><NavLink to={ResourcesOrgRoute}> Org Resources </NavLink></li>
              </>
            )
              : (
                <>
                  {/* These routes are PeerTECH-wide */}
                  <li><NavLink exact to={Routes.HOMEPAGE}> Home Screen </NavLink></li>
                  <li><NavLink to={Routes.ALL_PEOPLE}> Users &amp; Staff </NavLink></li>
                  <li><NavLink to={Routes.SURVEYS}> All Surveys </NavLink></li>
                  {/* <li><NavLink to={Routes.ORGANIZATIONS}> All Organizations </NavLink></li> */}
                  <li><NavLink to={Routes.RESOURCE_LIBRARY}> All Resources </NavLink></li>
                </>
              ) }
            <li id="logout"><Button id="logoutButton" onClick={this.handleSignOut}> Log out </Button> </li>
          </ul>
        </Navbar>
        <img id="logo" src={logo} alt="logo here" />
      </div>
    );
  }
}

const mapStateToProps = reduxState => (
  {
    selectedOrgID: reduxState.orgs.selectedOrgID,
    selectedOrgName: reduxState.orgs.selectedOrgName,
    selectedOrgSuspended: reduxState.orgs.selectedOrgSuspended,
    role: reduxState.auth.role,
    username: reduxState.auth.name,
  }
);

export default withRouter(connect(mapStateToProps, {
  signOut, fetchOrganizations, selectOrg, deselectOrg, changeOrganizationStatus,
})(NavBar));
