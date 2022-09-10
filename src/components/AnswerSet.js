import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Answer from './Answer';
import Routes from '../helpers/Routes';
import { createAnswerSet } from '../firebase';


class AnswerSet extends Component {
  constructor(props) {
    super(props);

    this.state = {
      answerSetName: 'New Answer Set 1',
      answerMap: {},
      answersOrder: [],
    };
  }

  componentDidMount() {
    this.addAnswer();
  }

  changeAnswerSetName = (event) => {
    this.setState({ answerSetName: event.target.value });
  }

  handleCancel = () => {
    if (this.props.customAnswer !== undefined && this.props.customAnswer) {
      this.props.cancelAnswer();
    } else this.props.history.push({ pathname: Routes.SURVEYS });
  }

  generateRandomMapKey = () => {
    const num = Math.floor(Math.random() * 1000000);
    const otherRand = Math.random().toString(36).substr(2, 5);
    return `${num}${otherRand}`;
  }

  handleSave = () => {
    // check to make sure that answer set name and answers exist
    if (this.state.answerSetName === '') {
      // eslint-disable-next-line no-alert
      alert('please give the answer set a name');
    }
    if (Object.keys(this.state.answerMap).length === 0) {
      // eslint-disable-next-line no-alert
      alert('please add answers to the answer set');
    }
  }

  saveAnswerSet = () => {
    const tempAnswersOrder = this.state.answersOrder.filter(answerId => (answerId in this.state.answerMap));

    if (this.props.customAnswer !== undefined && this.props.customAnswer) {
      this.props.createAnswerSet(this.state.answerSetName, this.state.answerMap, tempAnswersOrder, this.props.saveAnswerSetId);
      this.props.saveAnswer(this.state.answerSetName);
    } else {
      this.props.createAnswerSet(this.state.answerSetName, this.state.answerMap, tempAnswersOrder);
      this.props.history.push({ pathname: Routes.SURVEYS });
    }
  }

  removeAnswerFromAnswers = (key) => {
    // eslint-disable-next-line react/no-access-state-in-setstate
    const tempAnswerMap = { ...this.state.answerMap };
    delete tempAnswerMap[key];
    this.setState({ answerMap: tempAnswerMap });
  }

  updateAnswerInAnswers = (answerId, ans, val) => {
    // eslint-disable-next-line react/no-access-state-in-setstate
    const tempAnswers = { ...this.state.answerMap };
    if (ans != null && ans !== undefined) {
      tempAnswers[answerId][0] = ans;
    }
    if (val != null && val !== undefined) {
      tempAnswers[answerId][1] = val;
    }
    this.setState({
      answerMap: tempAnswers,
    });
  }


  addAnswer = () => {
    const tempAnswerMap = { ...this.state.answerMap };
    const tempAnswersOrder = [...this.state.answersOrder];
    const randKey = this.generateRandomMapKey();
    tempAnswersOrder.push(randKey);
    tempAnswerMap[randKey] = ['', 1];
    this.setState(prevState => ({
      answerMap: tempAnswerMap,
      answersOrder: tempAnswersOrder,
    }));
  }


  render() {
    return (

      <div className="view answerSet">
        <input className="answerTitleInput"
          placeholder="Answer Set Name"
          value={this.state.answerSetName}
          type="text"
          onChange={this.changeAnswerSetName}
        />
        <hr />
        <div id="answerContainer">
          {Object.keys(this.state.answerMap).map((key) => {
            const answerPair = this.state.answerMap[key];
            return (
              <Answer key={key}
                answerId={key}
                answerPair={answerPair}
                title={this.state.answerSetName}
                editingMode
                removeAnswerFromAnswers={this.removeAnswerFromAnswers}
                updateAnswerInAnswers={this.updateAnswerInAnswers}
                answers={this.state.answerMap}
              />
            );
          })}
        </div>
        <div className="addAnswerRow">
          <div className="radioCircle" />
          <button type="button" className="addAnswerButton" onClick={this.addAnswer}>Add Answer</button>
        </div>
        <div className="saveAnswerSetRow">
          <button type="button" className="deleteAnsSet" onClick={this.handleCancel}>Discard</button>
          <button type="button" className="saveAnsSet" onClick={this.saveAnswerSet}>Save</button>
        </div>
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


export default withRouter(connect(mapStateToProps, { createAnswerSet })(AnswerSet));
