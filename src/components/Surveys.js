import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
// import { Button } from 'react-bootstrap';
// import Routes from '../helpers/Routes';
// import Roles from '../helpers/Roles';
import ListSurveys from './ListSurveys';
import { fetchAnswers } from '../firebase';

// Display of all an organization's surveys
class Surveys extends Component {
  constructor(props) {
    super(props);

    this.state = {
      assignSurveys: false,
      viewSurveys: false,
    };
  }

  toggleAssignSurveys = () => {
    this.setState(prevState => ({
      assignSurveys: !prevState.assignSurveys,
    }));

    if (this.state.viewSurveys) {
      this.toggleViewSurveys();
    }
  }

  toggleViewSurveys = () => {
    this.setState(prevState => ({
      viewSurveys: !prevState.viewSurveys,
    }));
    if (this.state.assignSurveys) {
      this.toggleAssignSurveys();
    }
  }

  render() {
    return (
      <div className="page view">
        <ListSurveys />
      </div>
    );
  }
}

const mapStateToProps = reduxState => (
  {
    email: reduxState.auth.email,
    role: reduxState.auth.role,
    uid: reduxState.auth.uid,
  }
);

export default withRouter(connect(mapStateToProps, { fetchAnswers })(Surveys));
