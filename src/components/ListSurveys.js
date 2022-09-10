/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-state */
/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
// import Survey from './Survey';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Button } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import Routes from '../helpers/Routes';
import Roles from '../helpers/Roles';
import { fetchSurveys, fetchAnswers, updatePublish } from '../firebase';
import IOSSwitch from './iosSwitch';

// Allow Admin to view all surveys
class ListSurveys extends Component {
  constructor(props) {
    super(props);
    this.state = {
      componentViewed: 'Surveys',
    };
  }

  // Fetch all surveys from firebase database surveys collection
  componentDidMount() {
    // get surveys from firebase
    this.props.fetchSurveys();
    this.props.fetchAnswers();
  }

  viewSurveysNav = (survey) => {
    this.props.history.push({ pathname: Routes.VIEW_SURVEY, state: { currSurvey: survey } });
  }

  viewAnswersNav = (answer) => {
    this.props.history.push({ pathname: Routes.VIEW_ANSWER, state: { currAnswer: answer, id: answer.id } });
  }


  viewAnswerSets = () => {
    if (this.state.componentViewed === 'Surveys') {
      this.setState({
        componentViewed: 'AnswerSets',
      });
    }
  }

  viewSurveys = () => {
    if (this.state.componentViewed === 'AnswerSets') {
      this.setState({
        componentViewed: 'Surveys',
      });
    }
  }

  togglePublish = (id, published) => {
    this.props.updatePublish(id, published);
  }

  addSurveyNav = () => {
    this.props.fetchAnswers();
    this.props.history.push(Routes.ADD_SURVEY);
  }

  addAnswerNav = () => {
    this.props.history.push(Routes.ADD_ANSWER);
  }

  render() {
    return (
      <div>
        <div id="viewingButtons">
          <button type="button"
            className={this.state.componentViewed === 'Surveys' ? 'surveyPageBtnActive' : 'surveyPageBtnInactive'}
            onClick={this.viewSurveys}
          >Surveys
          </button>
          <button type="button"
            className={this.state.componentViewed === 'Surveys' ? 'surveyPageBtnInactive' : 'surveyPageBtnActive'}
            onClick={this.viewAnswerSets}
          >Answer Sets
          </button>
        </div>
        {this.state.componentViewed === 'Surveys'
          ? (
            <div>
              <hr />
              { this.props.role === Roles.SUPER_ADMIN && !(this.props.location.pathname !== Routes.ORGANIZATIONS && RegExp('organization').test(this.props.location.pathname)
              ) && <Button className="addButton" id="purplebackground" onClick={this.addSurveyNav}>Create New Survey</Button>}
              <div className="viewSurveys">
                {this.props.surveys.map((survey) => {
                  if (this.props.role === Roles.SUPER_ADMIN || (this.props.role === Roles.ADMIN && survey.published)) {
                    return (
                      <Card className="surveyCard" key={survey.id}>
                        <Card.Body>
                          <Card.Title>{survey.title}</Card.Title>
                          <div>{survey.desc}</div>
                          {this.props.role === Roles.SUPER_ADMIN && (
                            <FormControlLabel
                              disabled={(survey.organizations.length > 0)}
                              control={(
                                <IOSSwitch
                                  checked={survey.published}
                                  onChange={() => this.togglePublish(survey.id, !survey.published)}
                                  name="checkedB"
                                />
                            )}
                              label={survey.published ? 'Published' : 'Not Published'}
                            />
                          )}
                          <button type="button" className="editSurveyButton cardButton" onClick={() => { this.viewSurveysNav(survey); }}>
                            View Survey
                          </button>
                        </Card.Body>
                      </Card>
                    );
                  } else return null;
                })}
              </div>
            </div>
          )
          : (
            <div>
              <hr />
              { this.props.role === Roles.SUPER_ADMIN && !(this.props.location.pathname !== Routes.ORGANIZATIONS && RegExp('organization').test(this.props.location.pathname)
              ) && <Button className="addButton" id="purplebackground" onClick={this.addAnswerNav}>Create New Answer Set</Button>}
              <div className="viewSurveys">
                {this.props.answerSets.map((answerSet) => {
                  return (
                    <Card className="surveyCard" key={answerSet.id}>
                      <Card.Body>
                        <Card.Title>{answerSet.title}</Card.Title>
                        <button type="button" className="editSurveyButton cardButton" onClick={() => { this.viewAnswersNav(answerSet); }}>
                          View Answer Set
                        </button>
                      </Card.Body>
                    </Card>
                  );
                })}
              </div>
            </div>
          )
      }

      </div>
    );
  }
}

const mapStateToProps = reduxState => (
  {
    surveys: reduxState.surveys.surveys,
    answerSets: reduxState.surveys.answerSets,
    role: reduxState.auth.role,
  }
);

export default withRouter(connect(mapStateToProps, { fetchSurveys, fetchAnswers, updatePublish })(ListSurveys));
