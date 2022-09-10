import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { fetchGoals } from '../../firebase';
import ActiveGoals from './ActiveGoals';
import AccomplishedGoals from './AccomplishedGoals';

const tabs = {
  ACTIVE: 'active_goals',
  ACCOMPLISHED: 'accomplished',
};
// Display list/table of a user's goals
class UserGoals extends Component {
  constructor(props) {
    super(props);

    this.state = {
      active: [],
      accomplished: [],
      tab: tabs.ACTIVE,
    };
  }


  componentDidMount() {
    this.props.fetchGoals(this.props.orgID, this.props.user.id, this.setGoals);
  }

  setGoals = (goals) => {
    const active = [];
    const accomplished = [];
    goals.forEach((goal) => {
      if (goal.isCompleted) {
        accomplished.push(goal);
      } else {
        active.push(goal);
      }
    });
    this.setState({
      active,
      accomplished,
    });
  }

  setTab = (tab) => {
    this.setState({ tab });
  }


  render() {
    return (

      <div>
        {this.state.active && this.state.accomplished
          ? (
            <div>
              <Tabs
                activeKey={this.state.tab}
                onSelect={this.setTab}
              >
                <Tab eventKey={tabs.ACTIVE} title="Active Goals">
                  <ActiveGoals goals={this.state.active} />
                </Tab>
                <Tab eventKey={tabs.ACCOMPLISHED} title="Accomplished">
                  <AccomplishedGoals goals={this.state.accomplished} />
                </Tab>
              </Tabs>

            </div>
          )
          : (<div />
          )}
      </div>

    );
  }
}

export default withRouter(connect(null, { fetchGoals })(UserGoals));
