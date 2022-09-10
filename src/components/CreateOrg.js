/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { Input } from 'reactstrap';
import { connect } from 'react-redux';
import { addOrganization } from '../firebase';
import Roles from '../helpers/Roles';
import { setErrorMessage } from '../redux/DispatchHelpers';

// Creates a new organization with specified name
// currently still would need to go to createAccount page to create admin account for new org
class CreateOrganization extends Component {
  constructor(props) {
    super(props);

    // Form fields
    this.state = {
      name: '',
    };
  }

  onNameChange = (event) => {
    this.setState({ name: event.target.value });
  }


  // When user submits form, send data to backend
  handleOrgCreation = (event) => {
    const successCallback = () => {
      this.setState({ name: '' });
    };

    // Ensure that current user is a super admin
    // shouldn't even really need this b/c the page is like protected based on auth role, but just in case
    if (this.props.role !== Roles.SUPER_ADMIN) {
      this.props.setErrorMessage('Please select a specific organization for this account');
      return;
    }

    this.props.addOrganization(this.state.name, successCallback);
    this.props.history.push({
      pathname: '/home',
    });
  }

  render() {
    return (
      <div className="page view">
        <div className="pageHeader">
          <div>
            <h1>Add a new organization</h1>
            <p>
              Add the name of the new organization. Once the organization is created, you can add admin, peers, or service users to the organization.
            </p>
          </div>
        </div>
        <div> Enter the new organization&#39;s name: </div>
        <Input placeholder="Organization name" onChange={this.onNameChange} value={this.state.name} />
        <div>
          <Button className="createButton" onClick={this.handleOrgCreation}> Create Organization</Button>
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

export default withRouter(connect(mapStateToProps, { setErrorMessage, addOrganization })(CreateOrganization));
