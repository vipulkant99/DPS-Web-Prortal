/* eslint-disable prefer-destructuring */
/* eslint-disable react/no-unused-state */
/* eslint-disable consistent-return */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import AnswerSet from './AnswerSet';
import { fetchAnswers, fetchAnswer } from '../firebase';


class Question extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: this.props.id,
      question: '',
      answerID: '',
      answerSetPairs: this.props.answerSetPairs,
      answerChosen: {},
      showAns: false,
      newAns: false,
      toggleNewAnswer: false,
      currentAnswerSet: '',
    };
  }

  changeQuestionText = (event) => {
    this.props.updateQuestion(this.props.id, event.target.value, null, null);
  }

  changeQuestionAnswer = (answerId, answerName) => {
    this.props.updateQuestion(this.props.id, null, answerId, answerName);
  }

  removeQuestion = () => {
    this.props.removeQuestion(this.props.id);
  }

  renderAnswers = () => {
    return (
      Object.keys(this.state.answerChosen).map((key) => {
        return (
          <div key={key}>
            <span>
              {key} : {this.state.answerChosen[key]}
            </span>
          </div>
        );
      })
    );
  }

  renderDropdown = () => {
    // changes Answer Set change for a question
    const changeAnswerSet = (event) => {
      const selectedAnswerSet = event;
      if (selectedAnswerSet === 'Custom Answers') {
        this.setState({
          currentAnswerSet: selectedAnswerSet,
          toggleNewAnswer: true,
        });
      } else {
        this.setState({
          currentAnswerSet: selectedAnswerSet,
          toggleNewAnswer: false,
        });
      }


      if (Object.keys(this.state.answerSetPairs).includes(event)) {
        this.changeQuestionAnswer(this.state.answerSetPairs[event], event);
      }
    };

    const dropdownItems = Object.keys(this.state.answerSetPairs).map((key) => {
      const val = this.state.answerSetPairs[key];
      return (<Dropdown.Item value={val} key={val} eventKey={key}>{key}</Dropdown.Item>);
    });

    dropdownItems.push(<Dropdown.Item value="Custom Answers" key="Custom Answers" eventKey="Custom Answers">Custom Answers</Dropdown.Item>);

    return (
      <DropdownButton
        id="dropdown-survey-button"
        variant="secondary"
        title={this.state.currentAnswerSet !== '' ? this.state.currentAnswerSet : 'Choose Answer Set'}
        onSelect={changeAnswerSet}
      >
        {dropdownItems}
      </DropdownButton>

    );
  }

  cancelAnswer = () => {
    this.setState({ toggleNewAnswer: false, currentAnswerSet: '' });
  }

  saveAnswer = (newAnswer) => {
    this.setState({ toggleNewAnswer: false, currentAnswerSet: newAnswer });
  }

  saveAnswerSetId = (newAnswerSetId, name) => {
    const tempPairs = { ...this.state.answerSetPairs };
    tempPairs[name] = newAnswerSetId;
    this.setState(prevState => ({
      answerSetPairs: tempPairs,
    }));
  }

  render() {
    return (
      <div className="surveyQuestion" id={this.props.id}>
        <div className="question">
          <input className="textInput"
            placeholder="Type question here..."
            type="text"
            onChange={this.changeQuestionText}
            defaultValue={this.props.question.question}
          />
        </div>
        <div className="endQuestionRow">
          <div className="questionAnswers">
            <div>{this.renderDropdown()}</div>
            {this.state.toggleNewAnswer && <AnswerSet customAnswer cancelAnswer={this.cancelAnswer} saveAnswer={this.saveAnswer} saveAnswerSetId={this.saveAnswerSetId} /> }
          </div>
          <div className="deleteQuestionButton">
            <IconButton aria-label="create" onClick={this.removeQuestion}>
              <DeleteIcon className="deleteIcon" />
            </IconButton>
          </div>
        </div>
      </div>
    );
  }
}


export default withRouter(connect(null, { fetchAnswers, fetchAnswer })(Question));
