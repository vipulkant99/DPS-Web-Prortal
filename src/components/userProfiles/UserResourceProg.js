/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { fetchUserResources } from '../../firebase';
import inprog from '../../assets/in-progress.png';
import complete from '../../assets/resource-check.png';
import Routes, { createOrgRoute } from '../../helpers/Routes';


// resource progress
class UserResourceProg extends Component {
  constructor(props) {
    super(props);

    this.state = {
      completed: [],
      inprogress: [],
      unopened: [],
    };
  }

  componentDidMount() {
    this.props.fetchUserResources(this.props.location.state.orgID, this.setResources);
  }

  setResources = (resourceArray) => {
    const completions = this.props.location.state.user.resourceCompletions ?? [];
    let completed = [];
    let inprogress = [];
    let unopened = [];
    resourceArray.forEach((resource) => {
      const progress = completions[resource.id] ?? 0;
      if (progress >= 1) {
        const resourceUpdated = { ...resource, completion: completions[resource.id] ?? 0 };
        completed = [...completed, resourceUpdated];
      } else if (progress === 0.5) {
        const resourceUpdated = { ...resource, completion: completions[resource.id] ?? 0 };
        inprogress = [...inprogress, resourceUpdated];
      } else {
        const resourceUpdated = { ...resource, completion: completions[resource.id] ?? 0 };
        unopened = [...unopened, resourceUpdated];
      }
    });
    // const resources = resourceArray.map((resource) => {
    //   return { ...resource, completion: completions[resource.id] ?? 0 };
    // });
    this.setState({
      completed,
      unopened,
      inprogress,
    });
  }

  // translates a number to human readable output
  completeNumberToText = ({ completion }) => {
    switch (completion) {
      case 0:
        return 'unopened';
      case 0.5:
        return 'in progress';
      default:
        return `read ${completion} times`;
    }
  }

  // Navigate to specific resource's preview page
  goToResource = (event) => {
    this.props.history.push({
      pathname: `/resourceLibrary/${event.target.value}`,
    });
  }


  renderUnopened() {
    return this.state.unopened.map((resource) => {
      return (
        <div className="progItem" key={resource.id}>
          <div className="emptyCircle" />
          <h3>{resource.title}</h3>

          {/* <Button variant="primary" value={resource.id} onClick={this.goToResource}>{resource.title}</Button> */}
          <h4>{this.completeNumberToText(resource)}</h4>
        </div>
      );
    });
  }

  renderInprogress() {
    return this.state.inprogress.map((resource) => {
      return (
        <div className="progItem" key={resource.id}>
          <div className="iconAndTitle">
            <img className="progImg" src={inprog} alt="no img" />
            <h3>{resource.title}</h3>
          </div>


          {/* <Button variant="primary" value={resource.id} onClick={this.goToResource}>{resource.title}</Button> */}
          <h4>{this.completeNumberToText(resource)}</h4>
        </div>
      );
    });
  }

  renderCompleted() {
    return this.state.completed.map((resource) => {
      return (
        <div className="progItem" key={resource.id}>
          <div className="iconAndTitle">
            <img className="progImg" src={complete} alt="no check" />
            <h3>{resource.title}</h3>
          </div>


          {/* <Button variant="primary" value={resource.id} onClick={this.goToResource}>{resource.title}</Button> */}
          <h4>{this.completeNumberToText(resource)}</h4>
        </div>
      );
    });
  }

  //   navToUser = () => {
  //     const { peerID } = this.props.location.state.user;
  //     const { orgID } = this.props.location.state;
  //     this.props.history.push({
  //       pathname: createOrgRoute(orgID, Routes.SINGLE_USER),
  //     });
  //   }

  render() {
    const totalrec = this.state.inprogress.length + this.state.completed.length + this.state.unopened.length;
    const progress = 100 * ((this.state.completed.length + (0.5 * this.state.inprogress.length)) / totalrec);

    return (
      <div className="page view">
        <Link
          to={{
            pathname: createOrgRoute(this.props.location.state.orgID, Routes.SINGLE_USER),
            state: {
              user: this.props.location.state.user,
              orgID: this.props.location.state.orgID,
            },
          }}
          className="backButtons"
        > Back to {this.props.location.state.user.name}&rsquo;s User Profile
        </Link>
        <h1>Full Library Progress</h1>
        <div className="progBar">
          <ProgressBar
            variant="success"
            now={progress}
          />
          <p>{progress}% Complete</p>
        </div>
        <div className="progList">
          {this.renderCompleted()}
          {this.renderInprogress()}
          {this.renderUnopened}
        </div>
      </div>
    );
  }
}

export default withRouter(connect(null, { fetchUserResources })(UserResourceProg));
