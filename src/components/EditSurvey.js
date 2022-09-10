/* eslint-disable prefer-destructuring */
/* eslint-disable react/no-unused-state */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-access-state-in-setstate */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Button, DropdownButton, Dropdown, Form,
} from 'react-bootstrap';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import { connect } from 'react-redux';
import { Input } from 'reactstrap';
import debounce from 'lodash.debounce';
import Question from './Question';
import { fetchAnswers, fetchAnswer } from '../firebase';


// Allows user to create a survey (questions and answer options)
class EditSurvey extends Component {
  constructor(props) {
    super(props);

    this.state = {
      question: this.props.question,
      answerSetID: this.props.currAns,
      answerSetPairs: this.props.answerSetPairs,
      tempQuestions: this.props.questionsMap,
      currentAnswerSet: '',
    };
  }

  removeQuestion = () => {
    this.props.removeQuestionFromQuestions(this.props.id);
  }

  changeQuestionText = (event) => {
    this.props.updateQuestionInQuestions(this.props.id, event.target.value, this.props.addedQuestion, null, null);
  }

  changeQuestionAnswer = (answerId, answerName) => {
    this.props.updateQuestionInQuestions(this.props.id, null, this.props.addedQuestion, answerId, answerName);
  }

  renderDropdown = () => {
    const dropDowntitle = this.props.q.answerName || 'Choose Answer Set';

    // changes Answer Set change for a question
    const changeAnswerSet = (event) => {
      const selectedAnswerSet = event;
      this.setState({
        currentAnswerSet: selectedAnswerSet,
      });

      if (Object.keys(this.state.answerSetPairs).includes(event)) {
        this.changeQuestionAnswer(this.state.answerSetPairs[event], event);
      }
    };

    const dropdownItems = Object.keys(this.state.answerSetPairs).map((key) => {
      const val = this.state.answerSetPairs[key];
      return (<Dropdown.Item value={val} key={val} eventKey={key}>{key}</Dropdown.Item>);
    });
    return (
      <DropdownButton
        id="dropdown-survey-button"
        variant="secondary"
        title={dropDowntitle}
        onSelect={changeAnswerSet}
      >
        {dropdownItems}
      </DropdownButton>

    );
  }

  render() {
    return (
      <div className={this.props.editingMode ? 'surveyQuestion' : 'viewQuestion'} id={this.props.id}>
        <div>
          {this.props.editingMode ? (
            <input className="textInput"
              placeholder="Type question here..."
              type="text"
              onChange={this.changeQuestionText}
              defaultValue={this.props.question}
            />
          )
            : <div className="questionText">{this.props.question}</div>}
        </div>
        <div className="endQuestionRow">
          <div className="questionAnswers">
            {this.props.editingMode && <div>{this.renderDropdown()}</div> }
            {!this.props.editingMode && this.props.q.answerName && <div>{this.props.q.answerName}</div>}
          </div>
          {this.props.editingMode && (
            <div className="deleteQuestionButton">
              <IconButton aria-label="create" onClick={this.removeQuestion}>
                <DeleteIcon className="deleteIcon" />
              </IconButton>
            </div>
          )}
        </div>
      </div>
      // <div id={this.props.id}>
      //   <hr />
      //   <div> Question: </div>
      //   {this.props.editingMode ? (
      //     <Input className="questionInput"
      //       defaultValue={this.props.question}
      //       onChange={this.changeQuestionText}
      //     />
      //   )
      //     : <div className="questionInput">{this.props.question}</div>}
      //   {this.props.currAns && <div> Answer Set: </div>}
      //   {this.props.editingMode && <div>{this.renderDropdown()}</div> }
      //   {!this.props.editingMode && this.props.q.answerName && <div>{this.props.q.answerName}</div>}
      //   {/* {this.props.editingMode && this.props.currAns
      //     ? <div>testing</div> : <div>{this.props.answerSetPairs.has(this.props.currAns) ? this.props.answerSetPairs.get(this.props.currAns) : 'hello world'}</div>}
      //   <div><p className="answerSetInput" hidden>{this.state.answerSetID}</p></div> */}
      //   {this.props.editingMode && <div><Button onClick={this.removeQuestion}>Remove Question</Button></div>}
      //   <hr />
      // </div>
    );
  }
}

export default withRouter(connect(null, { fetchAnswers, fetchAnswer })(EditSurvey));
