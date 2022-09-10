/* eslint-disable no-confusing-arrow */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-destructuring */
/* eslint-disable new-cap */
/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  Button, DropdownButton, Dropdown, Form,
} from 'react-bootstrap';
import TimePicker from 'react-time-picker';
import {
  fetchSurveys, assignSurvey, getOrgSurveys, fetchSpecificSurvey,
} from '../firebase';

class AssignSurvey extends Component {
  constructor(props) {
    super(props);
    this.state = {
      alreadyAssigned: [],
      orgSurveyTitles: [],
      surveySelected: 'None',
      frequencySelected: 'Daily',
      surveyTime: 'None',
      surveyTime1: 'None',
      surveyTime2: 'None',
      surveyTime3: 'None',
      dateSelected: 'None',
      day: 'Monday',
      triMonths: ['January', 'April', 'July'],
    };
  }

  // loads all PEER-Tech wide Surveys for admins to choose from
  componentDidMount() {
    this.props.fetchSurveys();
    this.props.getOrgSurveys(this.props.orgID, (survey) => {
      const { alreadyAssigned } = this.state;
      alreadyAssigned.push(survey.id);
      this.setState({ alreadyAssigned });
    });
  }

  getCurrentDate = () => {
    const now = new Date();
    return now;
  }

  getSurvey(surveyName) {
    const surveys = this.state.orgSurveyTitles;
    let surveyRef = '';
    let answerSetRefs = '';
    for (let i = 0; i < surveys.length; i += 1) {
      const survey = surveys[i];
      if (survey[0] === surveyName) {
        surveyRef = survey[1];
        answerSetRefs = survey[2];
      }
    }
    return [surveyRef, answerSetRefs];
  }

  // adjust state of time selected for surveys, distingushing between assignements that need multiple times (tri-daily) and the ones that just need one time
  handleTimeChange0 = (time) => {
    this.setState({ surveyTime: time });
  }

  handleTimeChange1 = (time) => {
    this.setState({ surveyTime1: time });
  }

  handleTimeChange2 = (time) => {
    this.setState({ surveyTime2: time });
  }

  handleTimeChange3 = (time) => {
    this.setState({ surveyTime3: time });
  }

  handleDateChange = (dateEvent) => {
    this.setState({ dateSelected: dateEvent.target.value });
  }

  // renders choices of frequency and changes state of frequency selected based on selection
  // --and also adjust number of times needed to select based on frequency selection
  renderFrequency = () => {
    const dropDowntitle = 'Select a Frequency';
    const handleSelect = (event) => {
      const selectedFrequency = event;
      this.setState({
        frequencySelected: selectedFrequency,
      });
    };
    return (
      <DropdownButton
        id="dropdown-frequency-button"
        variant="secondary"
        title={this.state.frequencySelected}
        onSelect={handleSelect}
      >
        <Dropdown.Item key="Daily" eventKey="Daily">Daily (once a day)</Dropdown.Item>
        <Dropdown.Item key="Weekly" eventKey="Weekly">Weekly (once a week)</Dropdown.Item>
        <Dropdown.Item key="Tri-Daily" eventKey="Tri-Daily">Tri-Daily (three times a daily)</Dropdown.Item>
        <Dropdown.Item key="Monthly" eventKey="Monthly">Monthly (once a month)</Dropdown.Item>
        <Dropdown.Item key="Tri-Monthly" eventKey="Tri-Monthly">Tri-Monthly (once every three months)</Dropdown.Item>
      </DropdownButton>
    );
  }

  // render the specific times, days of the weeks, and dates available to pick based on the frequency selected
  // -- to send surveys out
  renderTimes = () => {
    // for Daily survey frequency admin needs to select a time of day
    if (this.state.frequencySelected === 'Daily') {
      return (
        <div>
          <TimePicker
            onChange={this.handleTimeChange0}
            maxDetail="hour"
            disableClock
          />
        </div>
      );
    }

    // for Weekly survey frequency admin needs to select a time of day AND a day of the week
    if (this.state.frequencySelected === 'Weekly') {
      const handleSelectDay = (event) => {
        const day = event.target.value;
        this.setState({ day: event.target.value });
      };
      return (
        <div>
          <TimePicker
            onChange={this.handleTimeChange0}
            maxDetail="hour"
            disableClock
          />
          <Form.Control as="select" size="sm" length="200px" className="dayDropdown" onChange={handleSelectDay}>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </Form.Control>
        </div>
      );
    }

    // for Monthly survey frequency admin needs to select a date for the month (survey will be sent on same numeral date every month)
    // -- AND a time of Day
    if (this.state.frequencySelected === 'Monthly') {
      return (
        <div>
          <div>Time of Day:</div>
          <TimePicker
            onChange={this.handleTimeChange0}
            maxDetail="hour"
            disableClock
          />
          <br />
          <br />
          <div>Date:</div>
          <input type="number"
            id="dateSelected"
            name="dateSelected"
            min="1"
            max="31"
            onChange={this.handleDateChange}
            required
          />
        </div>
      );
    }

    // for Tri-Monthly survey frequency admin needs to select a starting Month for every three months, along with a date and a time of day
    if (this.state.frequencySelected === 'Tri-Monthly') {
      // create hash Table mapping keys (month number) to values (month name), example: key=5 value=May
      const valueMonthTable = {};
      valueMonthTable[1] = 'January';
      valueMonthTable[2] = 'February';
      valueMonthTable[3] = 'March';
      valueMonthTable[4] = 'April';
      valueMonthTable[5] = 'May';
      valueMonthTable[6] = 'June';
      valueMonthTable[7] = 'July';
      valueMonthTable[8] = 'August';
      valueMonthTable[9] = 'September';
      valueMonthTable[10] = 'October';
      valueMonthTable[11] = 'November';
      valueMonthTable[12] = 'December';

      const handleSelectMonth = (event) => {
        const stringNum = event.target.value;

        // generate the months for every three months starting w/ the admin selected month
        const firstMonthNumber = parseInt(stringNum, 10);
        let secondMonthNumber = firstMonthNumber + 3;
        let thirdMonthNumber = secondMonthNumber + 3;

        if (secondMonthNumber > 12) {
          secondMonthNumber -= 12;
        }

        if (thirdMonthNumber > 12) {
          thirdMonthNumber -= 12;
        }

        this.setState({
          triMonths: [valueMonthTable[firstMonthNumber], valueMonthTable[secondMonthNumber], valueMonthTable[thirdMonthNumber]],
        });
      };
      return (
        <div>
          <div>Start Month:</div>
          <Form.Control as="select" size="sm" length="200px" className="dayDropdown" onChange={handleSelectMonth}>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </Form.Control>
          <p> The survey will be sent out in
            {this.state.triMonths.map((month, index) => (index < 2) ? ` ${month},` : ` and ${month}.`)}
          </p>
          <div>Time of Day:</div>
          <TimePicker
            onChange={this.handleTimeChange0}
            maxDetail="hour"
            disableClock
          />
          <br />
          <br />
          <div>Date:</div>
          <input type="number"
            id="dateSelected"
            name="dateSelected"
            min="1"
            max="31"
            onChange={this.handleDateChange}
          />
        </div>
      );
    }

    // Tri-Daily frequency has been selected, therefore admin needs to set three times
    return (
      <div>
        <div>First Time</div>
        <TimePicker
          onChange={this.handleTimeChange1}
          maxDetail="hour"
          disableClock
        />
        <br />
        <br />
        <div>Second Time</div>
        <TimePicker
          onChange={this.handleTimeChange2}
          maxDetail="hour"
          disableClock
        />
        <br />
        <br />
        <div>Third Time</div>
        <TimePicker
          onChange={this.handleTimeChange3}
          maxDetail="hour"
          disableClock
        />
      </div>
    );
  }

  // For simplicity, we are storing times in the same format that google's scheduled functions use
  // See format explanation here: https://cloud.google.com/scheduler/docs/configuring/cron-job-schedules
  sendSurvey = () => {
    // handle submission of survey assignement with daily frequency
    // --relevant survey information: survery reference, answer set refernces,
    // -- date of survey assigned, times based on frequency (in cron-job-schedule format)
    this.props.toggleAssign();
    const surveyRef = this.props.selectedSurvey ? this.props.selectedSurvey.id : '';
    const answerSetRefs = new Set();
    Object.keys(this.props.questionsMap).forEach((key) => {
      answerSetRefs.add(this.props.questionsMap[key].answerId);
    });

    const times = [];
    const startDate = this.getCurrentDate();
    if (this.state.frequencySelected === 'Daily') {
      const hour = this.state.surveyTime.slice(0, 2);
      const minute = this.state.surveyTime.slice(3);
      let timeString = '';

      if (minute > 9) {
        timeString += `${minute} `;
      } else {
        timeString += `${this.state.surveyTime[4]} `;
      }
      if (hour > 9) {
        timeString += `${hour} `;
      } else {
        timeString += `${this.state.surveyTime[1]} `;
      }

      timeString += '* * *';
      times.push(timeString);
    }

    // handle submission of survey assignement with daily frequency
    if (this.state.frequencySelected === 'Weekly') {
      const hour = this.state.surveyTime.slice(0, 2);
      const minute = this.state.surveyTime.slice(3);
      const dayValueTable = {};
      dayValueTable.Monday = '1';
      dayValueTable.Tuesday = '2';
      dayValueTable.Wednesday = '3';
      dayValueTable.Thursday = '4';
      dayValueTable.Friday = '5';
      dayValueTable.Saturday = '6';
      dayValueTable.Sunday = '0';
      const dayValue = dayValueTable[this.state.day];

      let timeString = '';

      if (minute > 9) {
        timeString += `${minute} `;
      } else {
        timeString += `${this.state.surveyTime[4]} `;
      }
      if (hour > 9) {
        timeString += `${hour} `;
      } else {
        timeString += `${this.state.surveyTime[1]} `;
      }

      timeString += '* * ';
      timeString += dayValue;
      times.push(timeString);
    }

    if (this.state.frequencySelected === 'Tri-Daily') {
      const hourA = this.state.surveyTime1.slice(0, 2);
      const minuteA = this.state.surveyTime1.slice(3);
      let timeStringA = '';

      if (minuteA > 9) {
        timeStringA += `${minuteA} `;
      } else {
        timeStringA += `${this.state.surveyTime1[4]} `;
      }
      if (hourA > 9) {
        timeStringA += `${hourA} `;
      } else {
        timeStringA += `${this.state.surveyTime1[1]} `;
      }

      timeStringA += '* * *';

      const hourB = this.state.surveyTime2.slice(0, 2);
      const minuteB = this.state.surveyTime2.slice(3);
      let timeStringB = '';

      if (minuteB > 9) {
        timeStringB += `${minuteB} `;
      } else {
        timeStringB += `${this.state.surveyTime2[4]} `;
      }
      if (hourB > 9) {
        timeStringB += `${hourB} `;
      } else {
        timeStringB += `${this.state.surveyTime2[1]} `;
      }

      timeStringB += '* * *';
      const hourC = this.state.surveyTime3.slice(0, 2);
      const minuteC = this.state.surveyTime3.slice(3);
      let timeStringC = '';

      if (minuteC > 9) {
        timeStringC += `${minuteC} `;
      } else {
        timeStringC += `${this.state.surveyTime3[4]} `;
      }
      if (hourC > 9) {
        timeStringC += `${hourC} `;
      } else {
        timeStringC += `${this.state.surveyTime3[1]} `;
      }

      timeStringC += '* * *';

      times.push(timeStringA);
      times.push(timeStringB);
      times.push(timeStringC);
    }

    if (this.state.frequencySelected === 'Monthly') {
      const hour = this.state.surveyTime.slice(0, 2);
      const minute = this.state.surveyTime.slice(3);
      const date = this.state.dateSelected;
      let timeString = '';

      if (minute > 9) {
        timeString += `${minute} `;
      } else {
        timeString += `${this.state.surveyTime[4]} `;
      }
      if (hour > 9) {
        timeString += `${hour} `;
      } else {
        timeString += `${this.state.surveyTime[1]} `;
      }

      timeString += date;
      timeString += ' * *';
      times.push(timeString);
    }

    if (this.state.frequencySelected === 'Tri-Monthly') {
      const valueMonthTable = {};
      valueMonthTable.January = '1';
      valueMonthTable.February = '2';
      valueMonthTable.March = '3';
      valueMonthTable.April = '4';
      valueMonthTable.May = '5';
      valueMonthTable.June = '6';
      valueMonthTable.July = '7';
      valueMonthTable.August = '8';
      valueMonthTable.September = '9';
      valueMonthTable.October = '10';
      valueMonthTable.November = '11';
      valueMonthTable.December = '12';
      const hour = this.state.surveyTime.slice(0, 2);
      const minute = this.state.surveyTime.slice(3);
      const date = this.state.dateSelected;
      let timeStringA = '';
      let timeStringB = '';
      let timeStringC = '';

      if (minute > 9) {
        timeStringA += `${minute} `;
        timeStringB += `${minute} `;
        timeStringC += `${minute} `;
      } else {
        timeStringA += `${this.state.surveyTime[4]} `;
        timeStringB += `${this.state.surveyTime[4]} `;
        timeStringC += `${this.state.surveyTime[4]} `;
      }
      if (hour > 9) {
        timeStringA += `${hour} `;
        timeStringB += `${hour} `;
        timeStringC += `${hour} `;
      } else {
        timeStringA += `${this.state.surveyTime[1]} `;
        timeStringB += `${this.state.surveyTime[1]} `;
        timeStringC += `${this.state.surveyTime[1]} `;
      }

      timeStringA += date;
      timeStringB += date;
      timeStringC += date;

      const months = this.state.triMonths;

      timeStringA += ` ${valueMonthTable[months[0]]} *`;
      timeStringB += ` ${valueMonthTable[months[1]]} *`;
      timeStringC += ` ${valueMonthTable[months[2]]} *`;

      times.push(timeStringA);
      times.push(timeStringB);
      times.push(timeStringC);
    }

    // firebase function defined in firebase.js that places survey info/references in database
    this.props.assignSurvey(this.props.orgID, startDate, times, surveyRef, Array.from(answerSetRefs), this.props.updateSurveyState);
  }


  render() {
    let timeInstruction = '';
    if (this.state.frequencySelected === 'Daily') {
      timeInstruction = 'Select a time at which to send out the survey.';
    } else if (this.state.frequencySelected === 'Weekly') {
      timeInstruction = 'Select a time and day on which to send out the survey.';
    } else if (this.state.frequencySelected === 'Tri-Daily') {
      timeInstruction = 'Select three times at which to send out the survey.';
    } else if (this.state.frequencySelected === 'Monthly') {
      timeInstruction = 'Select a time and date on which to send out the survey.';
    } else {
      timeInstruction = 'Select a start month, time, and date on which to send out the survey.';
    }

    return (
      <div>
        <br />
        <h4>Select the frequency with which service users will take the survey.</h4>
        {this.renderFrequency()}
        <br />
        <h4>{timeInstruction}</h4>
        {this.renderTimes()}
        <br />
        <button type="button" className="editSurveyButton" onClick={this.sendSurvey}>Send Survey</button>
      </div>
    );
  }
}
const mapStateToProps = reduxState => (
  {
    orgID: reduxState.orgs.selectedOrgID,
    allUsers: reduxState.users.orgUsers,
    surveys: reduxState.surveys.surveys,
  }
);

export default withRouter(connect(mapStateToProps, {
  fetchSurveys, assignSurvey, getOrgSurveys, fetchSpecificSurvey,
})(AssignSurvey));
