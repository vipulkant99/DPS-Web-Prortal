/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
// import { Button } from 'react-bootstrap';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import {
  PieChart, Pie, Cell, Label,
} from 'recharts';
import ListRow from '../ListRow';


import UserGoals from './UserGoals';
import UserChat from './UserChat';
import UserSurveys from './UserSurveys';
import UserWellness from './UserWellness';
import PeerUsers from './PeerUsers';
import {
  fetchUser, fetchUserResources, fetchUsers, deleteUser, resendInvite,
} from '../../firebase';
import Routes, { createDoubleOrgRoute, createOrgRoute } from '../../helpers/Routes';

const tabs = {
  SERVICE_USERS: 'service_users',
  GOALS: 'goals',
  SURVEYS: 'surveys',
  CHATS: 'chats',
  PROGRESS: 'progress',
  WELLNESS: 'wellness',
};

class UserContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      peer: null,
      tab: '',
      resources: [],
    };
  }

  componentDidMount() {
    const { role, peerID, id } = this.props.location.state.user;
    this.setState({ tab: role === 'Peer' ? tabs.GOALS : tabs.CHATS });
    if (role !== 'Peer') {
      this.props.fetchUser(peerID, (peer) => {
        this.setState({ peer });
      });
      this.props.fetchUserResources(this.props.location.state.orgID, this.setResources);
    } else {
      this.props.fetchUsers(this.props.location.state.orgID, id);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.state.user !== prevProps.location.state.user) {
      const { role } = this.props.location.state.user;
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ tab: role === 'Peer' ? tabs.GOALS : tabs.CHATS });
    }
  }

  setResources = (resourceArray) => {
    const completions = this.props.location.state.user.resourceCompletions ?? [];
    const resources = resourceArray.map((resource) => {
      return { ...resource, completion: completions[resource.id] ?? 0 };
    });
    this.setState({ resources });
  }

  navToUser = () => {
    const { peerID } = this.props.location.state.user;
    const { orgID } = this.props.location.state;
    this.props.history.push({
      pathname: createOrgRoute(orgID, Routes.SINGLE_USER),
    });
  }

  renderInfo = () => {
    const {
      name, id, role, email,
    } = this.props.location.state.user;
    return (
      <div className="userInfo">
        <h6 className="bold">{name}</h6>
        {/* <p>{id}</p> */}
        {/* <p>phone number</p> */}
        <p><span className="bold">Email:</span> {email} </p>
        {role !== 'Peer' && this.state.peer && <p><span className="bold">Peer:</span> {this.state.peer.name}</p>}
      </div>
    );
  }

  setTab = (tab) => {
    this.setState({ tab });
  }

  deleteUserByID = () => {
    const { id, role, orgID } = this.props.location.state.user;
    // activate a modal?
    if (role === 'Service-User') {
      this.props.deleteUser(id, role, orgID);
    } else {
      this.props.deleteUser(id, role);
    }
  }

  sendPasswordReset = () => {
    this.props.resendInvite(this.props.location.state.user.email);
  }

  renderProgress = () => {
    let total = 0;
    let complete = 0;
    this.state.resources.forEach((resource) => {
      total += 1;
      if (resource.completion >= 1) {
        complete += 1;
      } else if (resource.completion === 0.5) {
        complete += 0.5;
      }
    });
    const data = [{ name: 'Complete', value: complete },
      { name: 'Incomplete', value: total - complete }];
    return (
      <div className="bottomleftPanel" id="progress">
        <h3>Library Progress</h3>
        <PieChart width={200} height={200}>
          <Pie
            data={data}
            cx={100}
            cy={100}
            innerRadius={60}
            outerRadius={80}
            fill="#9A3B81"
            onMouseEnter={this.onPieEnter}
            dataKey="value"
          >
            <Label
              value={`${(complete / total) * 100}%`}
              position="center"
              style={{ textAnchor: 'middle', fontSize: '140%', fill: '#9A3B81' }} // i know this is sketch form but when i made this like actual css it didn't do anything
            />
            {
          data.map((entry, index) => {
            return (
              index === 0 ? (
                <Cell key="complete" fill="#9A3B81" />
              ) : (
                <Cell key="incomplete" fill="rgba(137, 144, 159, 0.27)" />
              )
            );
          })
          }
          </Pie>
        </PieChart>
        <Link
        // pathname: createOrgRoute(this.props.orgID, Routes.SINGLE_USER), state: { user: this.props.user, orgID: this.props.orgID
          to={{
            pathname: createDoubleOrgRoute(this.props.location.state.orgID, Routes.VIEW_RESOURCEPROG),
            state: {
              user: this.props.location.state.user,
              orgID: this.props.location.state.orgID,
            },
          }}
          id="viewProgLink"
        >
          View full progress
        </Link>
      </div>
    );
  }

  renderServiceUsers = () => {
    const renderedUsers = Object.keys(this.props.allUsers).map((id) => {
      return (
        <ListRow key={this.props.allUsers[id].id} user={this.props.allUsers[id]} />
      );
    });
    return (
      <div className="bottomleftPanel">
        <h3>Service Users</h3>
        <div id="peersUsers">
          {renderedUsers}
        </div>
      </div>
    );
  }

  // IF SERVICE USER displays tabs for:
  //        goals, surveys, progress
  renderUserDetails = () => {
    const { user, orgID } = this.props.location.state;
    console.log(user);

    return (
      <Tabs
        activeKey={this.state.tab}
        onSelect={this.setTab}
      >
        <Tab eventKey={tabs.CHATS} title="Chats">
          <UserChat user={user} orgID={orgID} />
        </Tab>
        <Tab eventKey={tabs.SURVEYS} title="Surveys">
          <UserSurveys user={user} orgID={orgID} />
        </Tab>
        <Tab eventKey={tabs.WELLNESS} title="Wellness Plan">
          <UserWellness user={user} orgID={orgID} />
        </Tab>
        <Tab eventKey={tabs.GOALS} title="Goals">
          <UserGoals user={user} orgID={orgID} />
        </Tab>
      </Tabs>
    );
  }

  // IF PEER displays tabs for only:
  //        service users
  renderPeerDetails = () => {
    const { user, orgID } = this.props.location.state;
    return (
      <Tabs
        activeKey={this.state.tab}
        onSelect={this.setTab}
      >
        <Tab eventKey={tabs.GOALS} title="Goals">
          <UserGoals user={user} orgID={orgID} />
        </Tab>
      </Tabs>
    );
  }

  renderBack = () => {
    if (this.props.orgID !== '') {
      return (
        <div className="backContainer">
          <Link
            to={{
              pathname: createOrgRoute(this.props.orgID, Routes.ORG_PEOPLE),
              state: {
                orgID: this.props.orgID,
              },
            }}
            className="backButtons"
          > Back to User Database
          </Link>
          <Link
            className="userButton"
            to={{
              pathname: createOrgRoute(this.props.orgID, Routes.ORG_PEOPLE),
              state: {
                orgID: this.props.orgID,
              },
            }}
            onClick={this.deleteUserByID}
          > Delete user
          </Link>
          <div
            role="button"
            tabIndex={0}
            className="userButton"
            onClick={this.sendPasswordReset}
          > Resend invitation
          </div>
        </div>
      );
    } else {
      return (
        <div className="backContainer">
          <Link
            to={{
              pathname: Routes.ALL_PEOPLE,
              state: {
                orgID: this.props.orgID,
              },
            }}
            className="backButtons"
          > Back to User Database
          </Link>
          <Link
            className="userButton"
            to={{
              pathname: Routes.ALL_PEOPLE,
              state: {
                orgID: this.props.orgID,
              },
            }}
            onClick={this.deleteUserByID}
          > Delete user
          </Link>
          <div
            role="button"
            tabIndex={0}
            className="userButton"
            onClick={this.sendPasswordReset}
          > Resend invitation
          </div>
        </div>
      );
    }
  }

  render() {
    const { role } = this.props.location.state.user;
    return (
      <div className="page view">
        {this.renderBack()}

        <div className="userView">
          <div className="leftPanel">
            {this.renderInfo()}
            {role === 'Peer'
              ? this.renderServiceUsers()
              : this.renderProgress()
          }
          </div>
          <div className="rightPanel">
            {role === 'Peer'
              ? this.renderPeerDetails()
              : this.renderUserDetails()
          }
          </div>
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

export default withRouter(connect(mapStateToProps, {
  fetchUser, fetchUserResources, fetchUsers, deleteUser, resendInvite,
})(UserContainer));
