/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable array-callback-return */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button } from 'react-bootstrap';
import { getSurveyResponses, getOrgSurveys } from '../../firebase';
import alert from '../../assets/alert.png';


// Display list/table of a user's goals
class UserSurveys extends Component {
  constructor(props) {
    super(props);

    this.state = {
      surveys: {},
      responses: [],
    };
  }

  componentDidMount() {
    let index = 0;

    getSurveyResponses(this.props.orgID, this.props.user.id, (response) => {
      const { responses } = this.state;
      if (response.score > 3) {
        response.show = true;
      } else {
        response.show = false;
      }
      response.index = index;
      index += 1;
      responses.push(response);
      this.setState({ responses });
    });
  }

  getTitle = (survID) => {
    let title = '';
    this.props.surveys.forEach((survey) => {
      if (survey.id === survID) {
        // eslint-disable-next-line prefer-destructuring
        title = survey.title;
      }
    });
    return title;
  }

  toggleInfo = (response) => {
    const { responses } = this.state;
    const prevShow = responses[response.index].show;
    const singleResp = { ...responses[response.index], show: !prevShow };
    responses[response.index] = singleResp;
    this.setState({ responses });
  }

  // renderResponsesForSeperateView(surveyID) {
  //   return (
  //     <div className="scroll">
  //       { this.state.responses ? (
  //         this.state.responses.map((response) => {
  //           const date = moment(response.completionDate.toDate()).format('MM/DD/YY, h:mm A');
  //           return (
  //             surveyID === response.surveyID ? (
  //               <div key={response.id}>
  //                 <span>Completed: {date}</span>
  //                 <span>Score: {response.score}</span>
  //                 {response.show ? (
  //                   <div key={response.id}>
  //                     <Button onClick={() => { this.toggleInfo(response); }}>Hide Answers</Button>
  //                     {response.answers.map(ans => Object.entries(ans).map(([key, value]) => <div key={response.id + key}> {key} : {value}</div>))}
  //                   </div>
  //                 ) : (
  //                   <Button onClick={() => { this.toggleInfo(response); }}>Show Answers</Button>
  //                 )}
  //               </div>
  //             ) : (
  //               <div />
  //             )
  //           );
  //         })
  //       ) : (<div />)}
  //     </div>

  //   );
  // }


  // renderSurveysSeperately() {
  //   return (
  //     this.state.surveys ? (
  //       this.state.surveys.map((survey) => {
  //         return (
  //           <div key={survey.id + survey.title}>
  //             {survey.title}
  //             {this.renderResponses(survey.id)}
  //           </div>
  //         );
  //       })
  //     ) : (<div />)
  //   );
  // }

  renderAlert(resp) {
    if (resp.show) {
      return (
        <img alt="alert" src={alert} />
      );
    } else {
      return (
        <div />
      );
    }
  }

  renderSurveys() {
    return (
      this.state.surveys ? (
        this.state.responses.map((response) => {
          const date = moment(response.completionDate.toDate()).format('MM/DD/YY, h:mm A');
          const title = this.getTitle(response.surveyID);
          return (
            <div className="table-row" key={date}>
              <div className="name">{title}</div>
              <div className="taken">{date}</div>
              <div className="lonely"> {this.renderAlert(response)} </div>
              {/* toggle to see the responses of the survey */}
              {/* {response.show ? (
                  <div key={response.id}>
                    <Button onClick={() => { this.toggleInfo(response); }}>Hide Answers</Button>
                    {response.answers.map(ans => Object.entries(ans).map(([key, value]) => <div key={response.id + key}> {key} : {value}</div>))}
                  </div>
                ) : (
                  <Button onClick={() => { this.toggleInfo(response); }}>Show Answers</Button>
                )} */}
            </div>
          );
        })
      ) : (<div />)
    );
  }

  render() {
    return (
      <div className="survey-table scroll">
        <div className="listHeader">
          <h3 className="name">Survey</h3>
          <h3 className="taken">Taken </h3>
          <h3 className="lonely">Alert</h3>
        </div>
        {this.renderSurveys()}
      </div>
    );
  }
}

const mapStateToProps = reduxState => (
  {
    surveys: reduxState.surveys.surveys,
    role: reduxState.auth.role,
  }
);

export default withRouter(connect(mapStateToProps, { getOrgSurveys })(UserSurveys));
