/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { fetchRole, fetchAll } from '../firebase';
import Roles from '../helpers/Roles';
import ListRow from './ListRow';

// Shows list/table of all an organization's admin
class OrgAdmins extends Component {
  constructor(props) {
    super(props);

    this.state = {
      orderedAdmin: null, // List of all admins
      orderByName: false, // Whether sorting is on
    };
  }

  componentDidMount() {
    if (this.props.orgID !== '') {
      this.props.fetchRole(this.props.orgID, Roles.ADMIN);
    } else {
      this.props.fetchAll(Roles.ADMIN);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.orgID !== prevProps.orgID && this.props.orgID !== '') {
      this.props.fetchRole(this.props.orgID, Roles.ADMIN);
    }
  }


  // Reorder list by name
  sortByName = () => {
    const unorderedAdmin = this.props.orgAdmins;
    unorderedAdmin.sort((obj1, obj2) => {
      return obj1.name.localeCompare(obj2.name);
    });
    this.setState({ orderedAdmin: unorderedAdmin, orderByName: true });
  }

  render() {
    let renderedAdmins = [];

    if (this.props.orgAdmins !== undefined && this.props.orgAdmins.length > 0) {
      renderedAdmins = Object.keys(this.props.orgAdmins).map((id) => {
        return (
          <ListRow key={this.props.orgAdmins[id].id} user={this.props.orgAdmins[id]} />
        );
      });
    }
    // const renderedAdmins = [];
    // if (this.state.orderByName) {
    //   renderedAdmins = Object.keys(this.state.orderedAdmin).map((id) => {
    //     return (
    //       <ListRow key={this.state.orderedAdmin[id].id} user={this.state.orderedAdmin[id]} />
    //     );
    //   });
    // } else {

    // }

    return (
      <div>
        {/*
        <div>
          <Button onClick={this.sortByName}>Sort by name</Button>
        </div> */}
        {renderedAdmins.length > 0 ? (
          <div className="userList">
            <div className="listHeader">
              <h3 className="name">Details</h3>
              <h3 className="role">Role </h3>
              <h3 className="email">Email</h3>
            </div>
            {renderedAdmins}
          </div>
        )
          : (
            <div>
              No admin yet
            </div>
          )}

      </div>
    );
  }
}

const mapStateToProps = reduxState => (
  {
    orgID: reduxState.orgs.selectedOrgID,
    orgAdmins: reduxState.users.orgAdmins,
  }
);

export default withRouter(connect(mapStateToProps, { fetchRole, fetchAll })(OrgAdmins));
