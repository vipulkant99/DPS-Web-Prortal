/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Routes, { createOrgRoute } from '../helpers/Routes';
import Roles from '../helpers/Roles';

// Helper for users view (to display user's details in a list/table)
class ListRow extends Component {
  // Set state from props
  componentDidMount() {
  }

  // Go to user's specific page
  navToUser = () => {
    this.props.history.push({ pathname: createOrgRoute(this.props.user.orgID, Routes.SINGLE_USER), state: { user: this.props.user, orgID: this.props.user.orgID } });
  }

  renderRow() {
    if (this.props.user.role === Roles.ADMIN) {
      return (
        <div className="listRow table-row" role="button" tabIndex={0}>
          <div className="name">
            {this.props.user.name}
          </div>
          <span>&nbsp;</span>
          <div className="role">
            {this.props.user.role}
          </div>
          <span>&nbsp;</span>
          <div className="email">
            {this.props.user.email || 'no email'}
          </div>
        </div>
      );
    } else {
      return (
        <div className="listRow table-row link" onClick={this.navToUser} role="button" tabIndex={0}>
          <div className="name">
            {this.props.user.name}
          </div>
          <span>&nbsp;</span>
          <div className="role">
            {this.props.user.role}
          </div>
          <span>&nbsp;</span>
          <div className="email">
            {this.props.user.email || 'no email'}
          </div>
        </div>
      );
    }
  }

  // Display all user properties as a row
  render() {
    return (
      this.renderRow()
    );
  }
}

const mapStateToProps = reduxState => (
  {
    orgID: reduxState.orgs.selectedOrgID,
  }
);

export default withRouter(connect(mapStateToProps, null)(ListRow));
