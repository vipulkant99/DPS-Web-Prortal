import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Users from './OrgUsers';
import Peers from './OrgPeers';
import Admin from './OrgAdmins';


const tabs = {
  SERVICE_USERS: 'service_users',
  PEERS: 'peers',
  ADMIN: 'admin',
};


// Shows list/table of all an organization's service users
class People extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tab: '',
    };
  }

  componentDidMount() {
    this.setState({ tab: tabs.SERVICE_USERS });
  }

  addNew = () => {
    this.props.history.push({
      pathname: '/createAccount',
    });
  }

  // resetPasswords = () => {
  //   this.props.resetAllPasswords([...this.props.orgUsers, ...this.props.orgPeers, ...this.props.orgAdmins]);
  // }

  setTab = (tab) => {
    this.setState({ tab });
  }

  renderTableTabs = () => {
    // const { user, orgID } = this.props.location.state;
    return (
      <Tabs
        activeKey={this.state.tab}
        onSelect={this.setTab}
        id="peopleTabs"
      >
        <Tab className="peopleTab" eventKey={tabs.SERVICE_USERS} title="Service Users">
          <Users />
        </Tab>
        {/* <Tab eventKey={tabs.ADMIN} title="Admins">
          <Admin user={user} orgID={orgID} />
        </Tab> */}
        <Tab className="peopleTab" eventKey={tabs.PEERS} title="Peer Specialists">
          <Peers />
        </Tab>
        <Tab className="peopleTab" eventKey={tabs.ADMIN} title="Admin">
          <Admin />
        </Tab>

      </Tabs>
    );
  }


  render() {
    return (
      <div className="page view">
        <div className="pageHeader">
          <div>
            <h1>Users &amp; Staff </h1>
            <p>Manage other members in your organization here. </p>
          </div>
          {/* <Button className="resetAllPasswordsButton" id="purplebackground" onClick={this.resetPasswords}>
            Reset all passwords
          </Button> */}
          <Button className="addButton" id="purplebackground" onClick={this.addNew}>
            + Add New
          </Button>
        </div>
        {/* <div>
          <Button onClick={this.sortByName}>Sort by name</Button>
        </div> */}
        <div className="table">
          {/* <p>Show: </p> */}
          {this.renderTableTabs()}
        </div>
      </div>
    );
  }
}


export default withRouter(connect(null, {})(People));
