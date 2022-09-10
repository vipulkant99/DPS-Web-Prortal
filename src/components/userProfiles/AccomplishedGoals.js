import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import goalimg from '../../assets/body-goal-incomplete.png';
import accomCheck from '../../assets/accom-check.png';


// Display list/table of a user's goals
const AccomplishedGoals = (props) => {
  let goalObject = null;
  if (props.goals) {
    goalObject = Object.keys(props.goals).map((id) => {
      const goal = props.goals[id];
      return (
        <div className="goalTile" id="accomplished" key={goal.id}>
          <div>
            <img className="goalImg" src={goalimg} alt="no icon" />
          </div>
          <div className="goalText">
            <h6>{goal.title}</h6>
            <p>{goal.text}</p>
          </div>
          <div className="goalCheckbox">
            <img className="checkImg" src={accomCheck} alt="no check" />
            <p className="goalOutOf">
              Done
            </p>
          </div>
        </div>

      );
    });
  }

  const renderDate = () => {
    const today = new Date();
    const weekday = { weekday: 'short' };
    const month = { month: 'long' };
    return (
      <div>
        {`${new Intl.DateTimeFormat('en-US', weekday).format(today)}, ${new Intl.DateTimeFormat('en-US', month).format(today)} ${today.getDate()}`}
      </div>
    );
  };

  return (
    <div className="goalList">
      {renderDate()}
      <div>
        {goalObject}
      </div>
    </div>
  );
};

export default withRouter(connect(null, { })(AccomplishedGoals));
