/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { fetchRole, fetchAll } from '../firebase';
import Roles from '../helpers/Roles';
import ListRow from './ListRow';

// Shows list/table of all an organization's peers
class OrgPeers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      orderedPeers: null, // List of all peers
      orderByName: false, // Whether sorting is on
    };
  }

  componentDidMount() {
    if (this.props.orgID !== '') {
      this.props.fetchRole(this.props.orgID, Roles.PEER);
    } else {
      this.props.fetchAll(Roles.PEER);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.orgID !== prevProps.orgID && this.props.orgID !== '') {
      this.props.fetchRole(this.props.orgID, Roles.PEER);
    }
  }


  // Reorder list by name
  sortByName = () => {
    const unorderedPeers = this.props.allPeers;
    unorderedPeers.sort((obj1, obj2) => {
      return obj1.name.localeCompare(obj2.name);
    });
    this.setState({ orderedPeers: unorderedPeers, orderByName: true });
  }

  render() {
    let renderedPeers = [];
    if (this.props.allPeers !== undefined && this.props.allPeers.length > 0) {
      renderedPeers = Object.keys(this.props.allPeers).map((id) => {
        return (
          <ListRow key={this.props.allPeers[id].id} user={this.props.allPeers[id]} />
        );
      });
    }
    // const renderedPeers = [];
    // if (this.state.orderByName) {
    //   renderedPeers = Object.keys(this.state.orderedPeers).map((id) => {
    //     return (
    //       <ListRow key={this.state.orderedPeers[id].id} user={this.state.orderedPeers[id]} />
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
        {renderedPeers.length > 0 ? (
          <div className="userList">
            <div className="listHeader">
              <h3 className="name">Details</h3>
              <h3 className="role">Role </h3>
              <h3 className="email">Email</h3>
            </div>
            {renderedPeers}
          </div>
        )
          : (
            <div>
              No peers yet
            </div>
          )}
      </div>
    );
  }
}

const mapStateToProps = reduxState => (
  {
    orgID: reduxState.orgs.selectedOrgID,
    allPeers: reduxState.users.orgPeers,
  }
);

export default withRouter(connect(mapStateToProps, { fetchRole, fetchAll })(OrgPeers));
