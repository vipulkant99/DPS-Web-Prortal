import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { fetchRole, fetchAll } from '../firebase';
import Roles from '../helpers/Roles';
import ListRow from './ListRow';


// Shows list/table of all an organization's service users
class OrgUsers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      orderedUsers: null, // List of all peers
      orderByName: false, // Whether sorting is on
    };
  }

  componentDidMount() {
    if (this.props.orgID !== '') {
      this.props.fetchRole(this.props.orgID, Roles.SERVICE_USER);
    } else {
      this.props.fetchAll(Roles.SERVICE_USER);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.orgID !== prevProps.orgID && this.props.orgID !== '') {
      this.props.fetchRole(this.props.orgID, Roles.SERVICE_USER);
    }
  }

  // Reorder list by name
  sortByName = () => {
    const unorderedUsers = this.props.allUsers;
    unorderedUsers.sort((obj1, obj2) => {
      return obj1.name.localeCompare(obj2.name);
    });
    this.setState({ orderedUsers: unorderedUsers, orderByName: true });
  }


  render() {
    let renderedUsers = [];
    if (this.state.orderByName) {
      renderedUsers = Object.keys(this.state.orderedUsers).map((id) => {
        return (
          <ListRow key={this.state.orderedUsers[id].id} user={this.state.orderedUsers[id]} />
        );
      });
    } else {
      renderedUsers = Object.keys(this.props.allUsers).map((id) => {
        return (
          <ListRow key={this.props.allUsers[id].id} user={this.props.allUsers[id]} />
        );
      });
    }

    return (
      <div>
        {/*
        <div>
          <Button onClick={this.sortByName}>Sort by name</Button>
        </div> */}
        {renderedUsers.length > 0 ? (
          <div className="userList">
            <div className="listHeader">
              <h3 className="name">Details</h3>
              <h3 className="role">Role </h3>
              <h3 className="email">Email</h3>
            </div>
            {renderedUsers}
          </div>
        )
          : (
            <div>
              No users yet
            </div>
          )}
      </div>
    );
  }
}

const mapStateToProps = reduxState => (
  {
    orgID: reduxState.orgs.selectedOrgID,
    allUsers: reduxState.users.orgUsers,
  }
);

export default withRouter(connect(mapStateToProps, { fetchRole, fetchAll })(OrgUsers));
