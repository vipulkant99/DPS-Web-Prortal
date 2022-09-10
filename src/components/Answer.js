/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

class Answer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      key: this.props.answerPair[0] || '',
      value: this.props.answerPair[1] || -1,
      answerId: this.props.answerId,
    };
  }

  componentDidMount() {
    this.setState({
      key: this.props.answerPair[0] || '',
      value: this.props.answerPair[1] || -1,
    });
  }

  onKeyChange = (event) => {
    this.setState({ key: event.target.value });
    this.props.updateAnswerInAnswers(this.state.answerId, event.target.value, null);
  }

  onValueChange = (event) => {
    this.setState({ value: event.target.value });
    this.props.updateAnswerInAnswers(this.state.answerId, null, Number(event.target.value));
  }

  removeAnswer = () => {
    this.props.removeAnswerFromAnswers(this.state.answerId);
  }


  render() {
    if (this.props.editingMode) {
      return (
        <div className="answerRow" id={this.props.id}>
          <div className="radioCircle" />
          <input className="textInput"
            placeholder="Option"
            type="text"
            onChange={this.onKeyChange}
            defaultValue={this.props.answerPair[0] || ''}
          />
          <input className="numberInput"
            placeholder="1"
            type="number"
            min="1"
            max="10"
            onChange={this.onValueChange}
            defaultValue={this.props.answerPair[1] || ''}
          />
          <p>points</p>
          <IconButton className="deleteAnswerButton" aria-label="create" onClick={this.removeAnswer}>
            <DeleteIcon className="deleteIcon" />
          </IconButton>
        </div>
      );
    }
    return (
      <div className="answerRow" id={this.props.id}>
        <div className="radioCircle" />
        <div className="answerText answerName">{this.props.answerPair[0] || ''}</div>
        <div className="answerText">{this.props.answerPair[1] || ''}</div>
        <div className="answerText">points</div>
      </div>
    );
  }
}

export default Answer;
