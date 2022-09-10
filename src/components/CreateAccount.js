/* eslint-disable react/no-did-update-set-state */
/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { Input } from 'reactstrap';
import { connect } from 'react-redux';
import { createAccountRequest, fetchRole } from '../firebase';
import Roles from '../helpers/Roles';
import { setErrorMessage } from '../redux/DispatchHelpers';

// Collects data for account to be pushed to accountRequests created by Cloud Function
class CreateAccount extends Component {
  constructor(props) {
    super(props);

    // Set the organization to the first org in the dropdown if user is super admin,
    // or to the current user's org if the user is admin
    let stateOrgID = '';
    if (props.role === Roles.ADMIN) {
      stateOrgID = props.orgID;
    } else {
      stateOrgID = props.selectedOrgID.length > 0
        ? props.selectedOrgID : props.organizations[0].orgID;
    }

    // Form fields
    this.state = {
      name: '',
      email: '',
      number: '',
      orgID: stateOrgID,
      peerID: '',
      role: Roles.PEER,
    };
  }

  componentDidMount() {
    if (this.props.role === Roles.ADMIN) {
      this.props.fetchRole(this.props.selectedOrgID, Roles.PEER);
    }
    if (this.props.role === Roles.SUPER_ADMIN) {
      this.props.fetchRole(this.state.orgID, Roles.PEER);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if ((this.props.peers.length > 0)
    && (prevState.peerID === '' || this.props.peers !== prevProps.peers)) {
      this.setState({ peerID: this.props.peers[0].id });
    }
  }

  onNameChange = (event) => {
    this.setState({ name: event.target.value });
  }

  onEmailChange = (event) => {
    this.setState({ email: event.target.value });
  }


  onNumberChange = (event) => {
    this.setState({ number: event.target.value });
  }

  onOrgChange = (event) => {
    this.setState({ orgID: event.target.value });
    if (this.props.role === Roles.SUPER_ADMIN) {
      // Update the peers in the dropdown
      this.props.fetchRole(event.target.value, Roles.PEER);
    }
  }

  onPeerChange = (event) => {
    this.setState({ peerID: event.target.value });
  }

  onRoleChange = (event) => {
    this.setState({ role: event.target.value });
  }

  // When user submits form, send data to backend
  handleAccountRequest = (event) => {
    const successCallback = () => {
      this.setState({
        email: '',
        name: '',
        number: '',
      });
    };

    if (this.state.name === '' || this.state.email === '' || this.state.number === '') {
      this.props.setErrorMessage('Please fill in all the required information');
      return;
    }

    // Ensure that organization was selected from dropdown (if applicable)
    if (this.state.role !== Roles.SUPER_ADMIN && !this.state.orgID && this.props.role === Roles.SUPER_ADMIN) {
      this.props.setErrorMessage('Please select a specific organization for this account');
      return;
    }
    if (this.state.role === Roles.SERVICE_USER && !this.state.peerID) {
      this.props.setErrorMessage('Please select a specific peer for this service user');
      return;
    }

    this.props.createAccountRequest(this.state.orgID, this.state.email.trim(), this.state.role, this.state.name.trim(), this.state.peerID, successCallback);
  }

  // Render a dropdown of each organization
  createOrganizationOptions = () => {
    const organizationOptions = Object.keys(this.props.organizations).map((id) => {
      const org = this.props.organizations[id];
      return (
        <option key={id} value={org.orgID}>{org.name}</option>
      );
    });
    return organizationOptions;
  }

  createPeerOptions = () => {
    const peerOptions = Object.keys(this.props.peers).map((id) => {
      const peer = this.props.peers[id];
      return (
        <option key={id} value={peer.id}>{peer.name}</option>
      );
    });
    return peerOptions;
  }

  render() {
    return (
      <div className="page view">
        <div className="pageHeader">
          <div>
            <h1>Add a New User</h1>
            <p>
              Fill out the form below with a new person&#39;s idenitfying and contact information to add them to your database.
              Once submitted, they will receive a “Reset Password” email with a link to log-in and can set their own password.
            </p>
          </div>
        </div>
        <div id="createAccount">
          <div id="createForm">
            <div> Select role<span className="important">*</span> </div>
            <div className="select">
              <select value={this.state.role} onChange={this.onRoleChange}>
                { this.props.role === Roles.SUPER_ADMIN && <option value={Roles.SUPER_ADMIN}>Super-Admin</option> }
                { this.props.role === Roles.SUPER_ADMIN && <option value={Roles.ADMIN}>Admin</option> }
                <option value={Roles.PEER}>Peer</option>
                <option value={Roles.SERVICE_USER}>Service User</option>
              </select>
            </div>
            <div className="important">All fields marked with * are required.</div>
            <div> Full Name <span className="important">*</span></div>
            <Input placeholder=" " onChange={this.onNameChange} value={this.state.name} />
            <div> Email Address <span className="important">*</span> </div>
            <Input placeholder=" " onChange={this.onEmailChange} value={this.state.email} />
            <div> Phone Number <span className="important">*</span> </div>
            <Input placeholder=" " onChange={this.onNumberChange} value={this.state.number} />

            { (this.props.role === Roles.SUPER_ADMIN && this.state.role !== Roles.SUPER_ADMIN) && (
            <div className="select">
              <div>Organization <span className="important">*</span></div>
              <div>
                <select value={this.state.orgID} onChange={this.onOrgChange}>
                  { this.createOrganizationOptions() }
                </select>
              </div>
            </div>
            )}
            {this.state.role === Roles.SERVICE_USER && this.state.orgID !== '' ? (
              <div>
                <div>Select a Peer: </div>
                <div>
                  <select value={this.state.peerID} onChange={this.onPeerChange}>
                    {this.createPeerOptions()}
                  </select>
                </div>
              </div>
            ) : (<div />)}
            <div>
              <Button className="createButton" onClick={this.handleAccountRequest}>Create</Button>
            </div>

          </div>
        </div>

      </div>
    );
  }
}

const mapStateToProps = reduxState => (
  {
    organizations: reduxState.orgs.organizations,
    role: reduxState.auth.role,
    orgID: reduxState.auth.orgID, // for admins
    selectedOrgID: reduxState.orgs.selectedOrgID, // for super admins
    peers: reduxState.users.orgPeers,
  }
);

export default withRouter(connect(mapStateToProps, { createAccountRequest, setErrorMessage, fetchRole })(CreateAccount));
