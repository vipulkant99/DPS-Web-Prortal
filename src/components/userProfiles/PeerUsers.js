import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { fetchUsers } from '../../firebase';
// import Roles from '../helpers/Roles';
import ListRow from '../ListRow';

// Shows list/table of a single peer's service users
class PeerUsers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      orderedUsers: null, // List of users
      orderByName: false, // Whether sorting is on
    };
  }

  componentDidMount() {
    this.props.fetchUsers(this.props.orgID, this.props.user.id);
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
        <div>
          <Button onClick={this.sortByName}>Sort by name</Button>
        </div>
        <div className="list">
          {renderedUsers}
        </div>
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

export default withRouter(connect(mapStateToProps, { fetchUsers })(PeerUsers));
