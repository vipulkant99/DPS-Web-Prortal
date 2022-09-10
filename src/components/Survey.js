/* eslint-disable react/no-array-index-key */
/* eslint-disable no-loop-func */
/* eslint-disable react/no-unused-state */
/* eslint-disable import/named */
/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { Input } from 'reactstrap';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {
  addQuestionToSurvey, changeQuestionsInQuestions, deleteSurvey, fetchAnswers,
  fetchSurveys, fetchSpecificSurvey, updateTheSurvey, getOrgSurveys,
  updatePublish, unassignSurvey,
} from '../firebase';
import AssignSurvey from './AssignSurvey';
import Roles from '../helpers/Roles';
import EditSurvey from './EditSurvey';
import IOSSwitch from './iosSwitch';
import Routes from '../helpers/Routes';


class Survey extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.id,
      title: this.props.title,
      description: this.props.description,
      answers: this.props.answers,
      questions: this.props.questions,
      questionsMap: {},
      addedQuestions: [],
      removedQuestions: [],
      answerSetPairs: 'None',
      answerSetMap: new Map(),
      editingMode: false,
      addedAnswers: [],
      addedQuestionsMap: {},
      questionsOrder: [],
      changedQuestions: new Set(),
      assignSurveyToggle: false,
      unassignSurveyToggle: false,
      currSurvey: null,
      alreadyAssigned: [],
      published: false,
      organizations: [],
    };
  }

  componentDidMount() {
    this.props.fetchSpecificSurvey(this.state.id, this.updateSurveyState);
    const answerSetPairs = [];
    const answerSetMap = new Map();
    if (!this.props.answerSets) this.props.fetchAnswers();
    if (this.props.answerSets) {
      for (let i = 0; i < this.props.answerSets.length; i += 1) {
        answerSetPairs.push([this.props.answerSets[i].title, this.props.answerSets[i].id]);
        answerSetMap.set(this.props.answerSets[i].id, this.props.answerSets[i].title);
      }
    }
    if (this.props.role === Roles.ADMIN) this.props.getOrgSurveys(this.props.selectedOrgID, this.updateAlreadyAssigned);
    this.setState({ answerSetPairs, answerSetMap });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.surveys !== this.props.surveys) {
      this.props.fetchSpecificSurvey(this.state.id, this.updateSurveyState);
    }
  }

  createQuestionsMap = (surveyQuestions) => {
    const tempQuestionsMap = {};

    // .map and return
    if (surveyQuestions) {
      for (let i = 0; i < surveyQuestions.length; i += 1) {
        tempQuestionsMap[surveyQuestions[i].id] = surveyQuestions[i];
      }
    }

    this.setState({ questionsMap: tempQuestionsMap });
  }

  getAnswerSetPairs = () => {
    const answerSetPairs = [];
    const answerSetMap = {};
    if (!this.props.answerSets) this.props.fetchAnswers();
    if (this.props.answerSets) {
      for (let i = 0; i < this.props.answerSets.length; i += 1) {
        answerSetPairs.push([this.props.answerSets[i].title, this.props.answerSets[i].id]);
        answerSetMap[this.props.answerSets[i].title] = this.props.answerSets[i].id;
      }
    }
    return answerSetMap;
  }

  // might be simpler to make live changes to firebase instead of having temp state
  addQuestion = () => {
    this.props.addQuestionToSurvey(this.state.id, { question: '', answerId: '', answerName: '' }, this.updateSurveyState);
    this.props.changeQuestionsInQuestions(this.state.id, this.state.changedQuestions, this.state.questionsMap);
    // this.props.fetchSpecificSurvey(this.state.id, this.updateSurveyState);
  }

  changeSurveyDescription = (event) => {
    this.setState({
      description: event.target.value,
    });
  }

  changeSurveyTitle = (event) => {
    this.setState({
      title: event.target.value,
    });
  }

  displayEditSurvey = (key) => {
    const value = this.state.addedQuestionsMap[key];
    if (!this.state.removedQuestions.includes(key)) {
      return (
        <EditSurvey key={key}
          id={key}
          title={this.state.title}
          question={value.question}
          description={value.desc}
          editingMode={this.state.editingMode}
          removeQuestionFromQuestions={this.removeQuestionFromQuestions}
          answerSetPairs={this.getAnswerSetPairs()}
          updateQuestionInQuestions={this.updateQuestionInQuestions}
          addedQuestion
        />
      );
    }
    return '';
  }

  // deletes survey using surveyId from firebase
  onDelete =() => {
    this.props.deleteSurvey(this.props.id);
    this.props.history.push({ pathname: Routes.SURVEYS });
  }

  updateAlreadyAssigned = (assigned) => {
    this.setState({ alreadyAssigned: assigned });
  }

  updateThisSurvey = () => {
    const survey = this.state.id;
    const surveyTitle = this.state.title;
    const surveyDescription = this.state.description;

    this.props.updateTheSurvey(survey, surveyTitle, surveyDescription,
      this.state.addedQuestionsMap, this.state.removedQuestions, this.state.questionsMap, this.state.changedQuestions, console.log('hello'));
    this.setState({
      addedQuestionsMap: {},
      changedQuestions: new Set(),
    });
    this.props.fetchSpecificSurvey(this.state.id, this.updateSurveyState);
  }

  updateSurveyState = (survey, surveyQuestions) => {
    this.setState(prevState => ({
      title: survey.title,
      description: survey.desc,
      questions: surveyQuestions,
      changedQuestions: new Set(),
      addedQuestionsMap: {},
      questionsOrder: survey.questionsOrder,
      currSurvey: survey,
      published: survey.published || false,
      organizations: survey.organizations,
    }));
    this.createQuestionsMap(surveyQuestions);
  }

  removeQuestionFromQuestions = (questionId) => {
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState(prevState => ({
      removedQuestions: [
        ...prevState.removedQuestions,
        questionId,
      ],
    }));
  }

  updateQuestionInQuestions = (questionId, val, inAddedQuestions, answerId, answerName) => {
    if (inAddedQuestions) {
      const tempQuestionsMap = { ...this.state.addedQuestionsMap };
      if (val) tempQuestionsMap[questionId].question = val;
      if (answerId != null) {
        tempQuestionsMap[questionId].answerId = answerId;
        tempQuestionsMap[questionId].answerName = answerName;
      }
      this.setState(prevState => ({
        addedQuestionsMap: tempQuestionsMap,
      }));
    } else {
      const tempQuestionsMap = { ...this.state.questionsMap };
      const changedQuestions = new Set(this.state.changedQuestions);
      if (val != null && val !== undefined) {
        tempQuestionsMap[questionId].question = val;
        changedQuestions.add(questionId);
      }
      if (answerId != null) {
        tempQuestionsMap[questionId].answerId = answerId;
        tempQuestionsMap[questionId].answerName = answerName;
        changedQuestions.add(questionId);
      }
      this.setState(prevState => ({
        questionsMap: tempQuestionsMap,
        changedQuestions,
      }));
    }
  }

  togglePublish = () => {
    const currState = this.state.published;
    this.setState(prevState => ({
      published: !prevState.published,
    }));
    this.props.updatePublish(this.state.id, !currState);
  }

  toggleAssign = () => {
    this.setState(prevState => ({ assignSurveyToggle: !prevState.assignSurveyToggle }));
  }

  toggleView = () => {
    this.props.fetchSpecificSurvey(this.state.id, this.updateSurveyState);
    this.setState(prevState => ({
      editingMode: !prevState.editingMode,
      addedQuestionsMap: {},
    }));
  }

  navBack = () => {
    this.props.history.push({ pathname: Routes.SURVEYS });
  }


  render() {
    return (
      <div className="view survey">
        {!this.state.editingMode && <button type="button" className="surveyBackButton" onClick={this.navBack}>Back to All Surveys and Answer Sets</button>}
        {this.props.role === Roles.SUPER_ADMIN && this.state.editingMode
          ? (
            <div>
              <button type="button" className="surveyBackButton" onClick={this.toggleView}>Back to View</button>
              <input className="surveyTitleInput"
                placeholder="Survey Name"
                defaultValue={this.state.title}
                type="text"
                onChange={this.changeSurveyTitle}
              />
              <br />
              <textarea className="surveyDescriptionInput"
                placeholder="Description"
                defaultValue={this.state.description}
                type="text"
                onChange={this.changeSurveyDescription}
              />
            </div>
          )
          : (
            <div>
              <h1 className="surveyTitle">{this.state.title}</h1>
              <p className="surveyDescription">{this.state.description}</p>
            </div>
          )
        }
        {this.props.role === Roles.ADMIN && this.state.currSurvey && !this.state.currSurvey.organizations.includes(this.props.selectedOrgID)
          && <button type="button" className="editSurveyButton" onClick={this.toggleAssign}>Assign Survey</button>}
        {this.props.role === Roles.ADMIN && this.state.currSurvey && this.state.currSurvey.organizations.includes(this.props.selectedOrgID)
          && (
          <button type="button"
            className="editSurveyButton"
            onClick={() => {
              this.props.unassignSurvey(this.state.id, this.props.selectedOrgID, this.updateSurveyState);
              this.setState(prevState => ({ assignSurveyToggle: false }));
            }}
          >
            Unassign Survey
          </button>
          )
        }
        {this.state.assignSurveyToggle && (
        <AssignSurvey selectedSurvey={this.state.currSurvey}
          questionsMap={this.state.questionsMap}
          updateSurveyState={this.updateSurveyState}
          toggleAssign={this.toggleAssign}
        />
        )}
        {this.props.role === Roles.SUPER_ADMIN && (
        <FormControlLabel
          disabled={(this.state.organizations.length > 0)}
          control={(
            <IOSSwitch
              checked={this.state.published}
              onChange={this.togglePublish}
              name="checkedB"
            />
              )}
          label={this.state.published ? 'Published' : 'Not Published'}
        />
        )}
        <br />
        {!this.state.editingMode && this.props.role === Roles.SUPER_ADMIN
          && (
            <button type="button" className="editSurveyButton" onClick={this.toggleView}>Edit Survey</button>
          )}
        { this.state.questionsMap !== undefined && this.state.questionsOrder !== undefined ? (
          <div className="surveyContent" id={this.state.title}>
            <h5 className="contentHeader">Survey Content</h5>
            <div className="headerRow">
              <h5 className={this.state.editingMode ? 'editQuestionHeader' : 'viewQuestionHeader'}>Questions</h5>
              <h5 className={this.state.editingMode ? 'editQuestionHeader' : 'viewQuestionHeader'}>Answer Sets</h5>
            </div>
            <div className="questionsContainer">
              {this.state.questionsOrder.map((key) => {
                const question = this.state.questionsMap[key];
                if (question && !this.state.removedQuestions.includes(question.id)) {
                  return (
                    <EditSurvey key={key}
                      q={question}
                      id={key}
                      title={this.state.title}
                      question={question.question}
                      description={question.desc}
                      editingMode={this.state.editingMode}
                      currAns={question.answerId}
                      removeQuestionFromQuestions={this.removeQuestionFromQuestions}
                      updateQuestionInQuestions={this.updateQuestionInQuestions}
                      questions={this.state.questionsMap}
                      answerSetPairs={this.getAnswerSetPairs()}
                      addedQuestion={false}
                    />
                  );
                }
                return '';
              })}
            </div>
            { this.state.editingMode && this.props.role === Roles.SUPER_ADMIN
            && (
              <div className="addQuestionContainer">
                <button type="button"
                  className={this.state.changedQuestions.size > 0 ? 'disabled surveyAddButton' : 'surveyAddButton'}
                  onClick={this.state.changedQuestions.size > 0 ? undefined : this.addQuestion}
                >Add New Question
                </button>
              </div>
            )}
            {Object.keys(this.state.addedQuestionsMap).map(this.displayEditSurvey)}
          </div>
        ) : ''}
        { this.state.editingMode && this.props.role === Roles.SUPER_ADMIN
          && (
          <div className="saveAnswerSetRow">
            <button type="button" className="deleteAnsSet longAnsBtn" onClick={this.onDelete}>Delete Survey</button>
            <button type="button" className="saveAnsSet longAnsBtn" onClick={this.updateThisSurvey}>Save Changes</button>
          </div>
          )
         }
      </div>
    );
  }
}


const mapStateToProps = reduxState => (
  {
    organizations: reduxState.orgs.organizations,
    role: reduxState.auth.role,
    selectedOrgID: reduxState.orgs.selectedOrgID,
    surveys: reduxState.surveys.surveys,
    answerSets: reduxState.surveys.answerSets,
  }
);


export default withRouter(connect(mapStateToProps, {
  addQuestionToSurvey,
  changeQuestionsInQuestions,
  deleteSurvey,
  fetchSurveys,
  fetchAnswers,
  getOrgSurveys,
  updatePublish,
  fetchSpecificSurvey,
  updateTheSurvey,
  unassignSurvey,
})(Survey));
