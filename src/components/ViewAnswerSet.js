/* eslint-disable react/no-access-state-in-setstate */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  deleteAnswerSet, updateAnswerSet, fetchAnswer, addAnswerToAnswerSet, removeAnswersFromAnswerSet, updateTheAnswerSet,
} from '../firebase';
import Roles from '../helpers/Roles';
import Routes from '../helpers/Routes';
// import AnswerSet from './AnswerSet';
import Answer from './Answer';

class ViewAnswerSet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: this.props.location.state.currAnswer.title,
      answers: this.props.location.state.currAnswer.answers,
      editingMode: false,
      answerSetId: this.props.location.state.currAnswer.id,
      removedAnswers: [],
      changedAnswers: new Set(),
      answersOrder: [],
    };
  }

  componentDidMount() {
    this.props.fetchAnswer(this.state.answerSetId, this.updateAnswerState);
  }

  updateAnswerState = (resAnswer) => {
    this.setState({
      answers: resAnswer.answers,
      title: resAnswer.title,
      answersOrder: resAnswer.answersOrder,
    });
  }

  removeAnswerFromAnswers = (answerId) => {
    this.setState(prevState => ({
      removedAnswers: [
        ...prevState.removedAnswers,
        answerId,
      ],
    }));
  }

  updateAnswerInAnswers = (answerId, ans, val) => {
    const tempAnswers = { ...this.state.answers };
    const changedAnswers = new Set(this.state.changedAnswers);
    if (ans != null && ans !== undefined) {
      tempAnswers[answerId][0] = ans;
      changedAnswers.add(answerId);
    }
    if (val != null) {
      tempAnswers[answerId][1] = val;
      changedAnswers.add(answerId);
    }
    this.setState({
      answers: tempAnswers,
      changedAnswers,
    });
  }

  addAnswer = () => {
    this.props.addAnswerToAnswerSet(this.state.answerSetId);
    this.props.fetchAnswer(this.state.answerSetId, this.updateAnswerState);
  }

  changeAnswerSetTitle = (event) => {
    this.setState({
      title: event.target.value,
    });
  }

  deleteAnswerSet = () => {
    this.props.deleteAnswerSet(this.state.answerSetId, () => this.props.history.push({ pathname: Routes.SURVEYS }));
  }

  updateAnswerSet = () => {
    this.props.updateTheAnswerSet(this.state.answerSetId, this.state.title, this.state.removedAnswers, this.state.answers, this.state.changedAnswers);
    this.setState({
      changedAnswers: new Set(),
      // editingMode: false,
    });
    this.props.fetchAnswer(this.state.answerSetId, this.updateAnswerState);
  }

  toggleEditing = () => {
    if (this.state.isEditing === 'false') {
      this.setState({
        isEditing: 'true',
      });
    } else {
      this.setState({
        isEditing: 'false',
      });
    }
  }

  toggleEdit = () => {
    this.props.fetchAnswer(this.state.answerSetId, this.updateAnswerState);
    this.setState(prevState => ({
      editingMode: !prevState.editingMode,
    }));
  }

  navBack = () => {
    this.props.history.push({ pathname: Routes.SURVEYS });
  }

  render() {
    return (
      <div className="view answerSet">
        {!this.state.editingMode && <button type="button" className="surveyBackButton" onClick={this.navBack}>Back to All Surveys and Answer Sets</button>}
        {
          this.state.editingMode
            ? (
              <div>
                <button type="button" className="surveyBackButton" onClick={() => this.setState({ editingMode: false })}>Back to View</button>
                <input
                  className="answerTitleInput"
                  defaultValue={this.state.title}
                  onChange={this.changeAnswerSetTitle}
                />
              </div>
            )
            : <h1 className="answerSetTitle">{this.state.title}</h1>
        }

        <hr />
        { this.state.answers !== undefined && this.state.answersOrder !== undefined && (
          <div id={this.state.title}>
            {this.state.answersOrder.map((key) => {
              const answerPair = this.state.answers[key];
              if (answerPair && !this.state.removedAnswers.includes(key)) {
                return (
                  <Answer key={key}
                    answerId={key}
                    answerPair={answerPair}
                    title={this.state.title}
                    editingMode={this.state.editingMode}
                    removeAnswerFromAnswers={this.removeAnswerFromAnswers}
                    updateAnswerInAnswers={this.updateAnswerInAnswers}
                    answers={this.state.answers}
                  />
                );
              }
              return '';
            })}
          </div>
        )}

        {!this.state.editingMode && this.props.role === Roles.SUPER_ADMIN
          && (
            <button type="button" className="editAnsSet longAnsBtn" onClick={() => this.setState({ editingMode: true })}>Edit Answer Set</button>
          )}
        { this.state.editingMode && this.props.role === Roles.SUPER_ADMIN
          && (
            <div>
              <div className="addAnswerRow">
                <div className="radioCircle" />
                <button type="button"
                  className={this.state.changedAnswers.size > 0 ? 'addAnswerButton disabled' : 'addAnswerButton'}
                  onClick={this.state.changedAnswers.size > 0 ? undefined : this.addAnswer}
                >Add Answer
                </button>
              </div>
              <div className="saveAnswerSetRow">
                <button type="button" className="deleteAnsSet longAnsBtn" onClick={this.deleteAnswerSet}>Delete Answer Set</button>
                <button type="button" className="saveAnsSet longAnsBtn" onClick={this.updateAnswerSet}>Save Changes</button>
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
    organizations: reduxState.orgs.organizations,
    role: reduxState.auth.role,
    selectedOrgID: reduxState.orgs.selectedOrgID,
  }
);

export default withRouter(connect(mapStateToProps,
  {
    deleteAnswerSet, updateAnswerSet, fetchAnswer, addAnswerToAnswerSet, removeAnswersFromAnswerSet, updateTheAnswerSet,
  })(ViewAnswerSet));
