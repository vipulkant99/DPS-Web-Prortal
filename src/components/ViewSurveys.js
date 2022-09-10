import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Routes from '../helpers/Routes';
// import Roles from '../helpers/Roles';
// import ListSurveys from './ListSurveys';
import Survey from './Survey';

// Display of all an organization's surveys
class ViewSurveys extends Component {
  constructor(props) {
    super(props);

    this.state = {
    //   email: '',
      assignSurveys: false,
      // viewSurveys: false
      // assignView: false,
    };
  }

  componentDidMount() {
    // this.setState({ email: this.props.email });
  }

  addSurveyNav = () => {
    this.props.history.push(Routes.ADD_SURVEY);
  }

  addAnswerNav = () => {
    this.props.history.push(Routes.ADD_ANSWER);
  }

  toggleAssignSurveys = () => {
    this.setState(prevState => ({
      assignSurveys: !prevState.assignSurveys,
    }));
  }

  render() {
    if (this.props.location.state.currSurvey) {
      return (
        <Survey
          id={this.props.location.state.currSurvey.id}
          title={this.props.location.state.currSurvey.title}
          // answers={this.props.location.state.currSurvey.answers}
          // questions={this.props.location.state.currSurvey.questions}
          description={this.props.location.state.currSurvey.desc}
          // orgsAssigned={this.props.location.state.currSurvey.organizations} // array organizations a survey is assigned to ( could be empty )
          // showInfo="true"
        />
      );
    }
    return <div />;
  }
}

const mapStateToProps = reduxState => (
  {
    email: reduxState.auth.email,
    role: reduxState.auth.role,
    uid: reduxState.auth.uid,
  }
);

export default withRouter(connect(mapStateToProps, null)(ViewSurveys));
