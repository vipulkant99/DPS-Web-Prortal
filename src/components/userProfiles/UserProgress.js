import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import { fetchUserResources } from '../../firebase';

// resource progress
class UserProgress extends Component {
  constructor(props) {
    super(props);

    this.state = {
      resources: [],
    };
  }

  componentDidMount() {
    this.props.fetchUserResources(this.props.orgID, this.setResources);
  }

  setResources = (resourceArray) => {
    const completions = this.props.user.resourceCompletions ?? [];
    const resources = resourceArray.map((resource) => {
      return { ...resource, completion: completions[resource.id] ?? 0 };
    });
    this.setState({ resources });
  }

  // translates a number to human readable output
  completeNumberToText = ({ completion }) => {
    switch (completion) {
      case 0:
        return 'unopened';
      case 0.5:
        return 'in progress';
      default:
        return `completed ${completion} times`;
    }
  }

  // Navigate to specific resource's preview page
  goToResource = (event) => {
    this.props.history.push({
      pathname: `/resourceLibrary/${event.target.value}`,
    });
  }

  render() {
    return this.state.resources.map((resource) => {
      return (
        <span key={resource.id}>
          <h3>{resource.title}</h3>
          <Button variant="primary" value={resource.id} onClick={this.goToResource}>View</Button>
          <h4>{this.completeNumberToText(resource)}</h4>
        </span>
      );
    });
  }
}

export default withRouter(connect(null, { fetchUserResources })(UserProgress));
