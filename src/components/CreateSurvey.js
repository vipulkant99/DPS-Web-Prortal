/* eslint-disable react/no-access-state-in-setstate */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Question from './Question';
import Routes from '../helpers/Routes';
import { addSurvey, fetchAllAnswers } from '../firebase';


// Allows user to create a survey (questions and answer options)
class CreateSurvey extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: 'New Survey 1',
      description: '',
      questionCount: 0,
      answerSetMap: {},
      questionsMap: {},
      firstQuestionMade: false,
    };
  }

  componentDidMount() {
    this.props.fetchAllAnswers(this.getAnswerSetPairs);
  }

  componentDidUpdate(prevProps) {
    if (this.props.answerSets !== prevProps.answerSets && !this.state.firstQuestionMade) {
      this.addEmptyQuestion();
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ firstQuestionMade: true });
    }
  }

  onTitleChange = (event) => {
    this.setState({ title: event.target.value });
  }

  onDescriptionChange = (event) => {
    this.setState({ description: event.target.value });
  }

  updateQuestion = (questionId, val, answerId, answerName) => {
    const tempQuestionsMap = { ...this.state.questionsMap };
    if (val != null && val !== undefined) {
      tempQuestionsMap[questionId].question = val;
    }
    if (answerId != null) {
      tempQuestionsMap[questionId].answerId = answerId;
      tempQuestionsMap[questionId].answerName = answerName;
    }
    this.setState(prevState => ({
      questionsMap: tempQuestionsMap,
    }));
  }

  getAnswerSetPairs = () => {
    const answerSetMap = {};
    if (this.props.answerSets) {
      for (let i = 0; i < this.props.answerSets.length; i += 1) {
        answerSetMap[this.props.answerSets[i].title] = this.props.answerSets[i].id;
      }
    }
    this.setState({ answerSetMap });
  }

  removeQuestion = (id) => {
    const tempQuestionsMap = { ...this.state.questionsMap };
    if (id !== undefined && id != null) {
      delete tempQuestionsMap[id];
    }

    this.setState({ questionsMap: tempQuestionsMap });
  }

  addSurvey = () => {
    if (this.state.title === '') {
      // eslint-disable-next-line no-alert
      alert('please give the survey a title');
    }

    if (this.state.description === '') {
      // eslint-disable-next-line no-alert
      alert('please give the survey a description');
    }

    if (this.state.questionsMap.length === 0) {
      // eslint-disable-next-line no-alert
      alert('please add questions to the survey');
    }

    if (this.state.title !== '' && this.state.description !== '' && Object.keys(this.state.questionsMap).length > 0) {
      this.props.addSurvey(this.state.questionsMap, this.state.title, this.state.description);
      this.props.history.push({ pathname: Routes.SURVEYS });
    }
  }

  addEmptyQuestion = () => {
    const tempQuestionsMap = { ...this.state.questionsMap };
    tempQuestionsMap[this.state.questionCount] = { answerId: '', answerName: '', question: '' };
    this.setState(prevState => ({
      questionCount: prevState.questionCount + 1,
      questionsMap: tempQuestionsMap,
    }));
    return this.state.questionCount;
  }

  renderQuestions = () => {
    if (Object.keys(this.state.questionsMap).length > 0) {
      return (
        <div className="questionsContainer">
          {Object.keys(this.state.questionsMap).map((key) => {
            const quest = this.state.questionsMap[key];
            return (
              <Question
                id={key}
                key={key}
                updateQuestion={this.updateQuestion}
                removeQuestion={this.removeQuestion}
                answerSetPairs={this.state.answerSetMap}
                question={quest}
              />
            );
          })}
        </div>
      );
    }
    return '';
  }

  render() {
    return (
      <div className="view">
        <input className="surveyTitleInput"
          placeholder="Survey Name"
          value={this.state.title}
          type="text"
          onChange={this.onTitleChange}
        />
        <br />
        <textarea className="surveyDescriptionInput"
          placeholder="Description"
          value={this.state.description}
          type="text"
          onChange={this.onDescriptionChange}
        />
        <div className="surveyContent">
          <h5 className="contentHeader">Survey Content</h5>
          <div className="headerRow">
            <h5 className="editQuestionHeader">Questions</h5>
            <h5 className="editQuestionHeader">Answer Sets</h5>
          </div>
          {this.renderQuestions()}
          <div className="addQuestionContainer">
            <button type="button" className="surveyAddButton" onClick={this.addEmptyQuestion}>Add New Question</button>
          </div>
        </div>
        <button type="button" className="surveyAddButton createSurvey" onClick={this.addSurvey}>Create Survey</button>
      </div>
    );
  }
}

const mapStateToProps = reduxState => ({
  answerSets: reduxState.surveys.answerSets,
});

export default withRouter(connect(mapStateToProps, { addSurvey, fetchAllAnswers })(CreateSurvey));
