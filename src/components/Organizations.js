import React, { Component } from 'react';
import { withRouter, NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { fetchOrganizations } from '../firebase';
import Routes, { createOrgRoute } from '../helpers/Routes';
import { selectOrg } from '../redux/DispatchHelpers';
// Allow Super-Admin to see all PeerTECH organizations
class Organizations extends Component {
  constructor(props) {
    super(props);

    this.state = {
      organizations: [],
    };
  }

  componentDidMount() {
    this.loadOrganizations();
  }

  // Fetch all organizations from database
  loadOrganizations = () => {
    const callback = (organizations) => {
      this.setState({ organizations });
    };
    this.props.fetchOrganizations(callback);
  }

  // Go to specific organization workspace on selection
  // higher order function
  goToOrganization = (organization) => {
    const { orgID, name, suspended } = organization;
    this.props.selectOrg(orgID, name, suspended);
    this.props.history.push({
      pathname: createOrgRoute(orgID, Routes.ORG_PEOPLE),
    });
  }

  // Render each organization's details as a card
  renderOrganizations = () => {
    if (this.state.organizations.length === 0) { return 'No organizations found'; }

    const renderedOrganizations = this.state.organizations.map((organization) => {
      return (
        <Card value={organization.orgID} onClick={() => this.goToOrganization(organization)} className="orgCard" key={organization.orgID}>
          <Card.Body>
            <Card.Title>{organization.name}</Card.Title>
            <Card.Text>{(organization.suspended) ? 'Suspended' : 'Active'}</Card.Text>
            {/* <Card.Text>members </Card.Text>
            <Card.Text>pairs </Card.Text> */}
          </Card.Body>
        </Card>
      );
    });
    return renderedOrganizations;
  }

  render() {
    return (
      <div className="orgSelection boxshadow">
        <div className="orgHeader">
          <div>
            <h1>Organizations</h1>
            <p>Select an organization to continue to the rest of your portal. </p>
          </div>
          {/* <Button onClick={this.loadOrganizations}> Reload Organizations </Button> */}
          <NavLink className="buttonLink" to={Routes.CREATE_ORGANIZATION}>
            <Button className="addButton" id="purplebackground">
              + Create New
            </Button>
          </NavLink>
        </div>
        <div className="orgs">
          { this.state.organizations && this.renderOrganizations() }
        </div>
      </div>
    );
  }
}

const mapStateToProps = reduxState => (
  {
    role: reduxState.auth.role,
  }
);

export default withRouter(connect(mapStateToProps, {
  fetchOrganizations, selectOrg,
})(Organizations));
