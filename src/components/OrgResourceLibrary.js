import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Roles from '../helpers/Roles';
import IOSSwitch from './iosSwitch';
import {
  fetchOrgResources,
  unselectOrgResource,
  selectOrgResource,
} from '../firebase';

// component for organization-specific resources
class OrgResourceLibrary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      resources: [], // Array of all resources
    };
  }

  componentDidMount() {
    this.loadResources();
  }

  loadResources = () => {
    const callback = (resources) => {
      this.setState({ resources });
    };
    this.props.fetchOrgResources(this.props.orgID, callback);
  }

  toggleSelectResource = (resource) => {
    if (resource.selected) this.props.unselectOrgResource(this.props.orgID, resource.resourceID, this.loadResources);
    else this.props.selectOrgResource(this.props.orgID, resource.resourceID, this.loadResources);
  }

  // Navigate to specific resource's preview page
  goToResource = resourceID => () => {
    this.props.history.push({
      pathname: `/resourceLibrary/${resourceID}`,
    });
  }

  renderResources = () => {
    if (this.state.resources.length === 0) { return 'No resources found'; }

    return (
      <div className="resources">
        {this.state.resources.map((resource, index) => (
          this.renderResourceCard(resource, index)
        ))}
      </div>
    );
  }

  renderResourceCard = (resource, index) => {
    const { role } = this.props;
    const toggleSelected = () => {
      this.toggleSelectResource(resource);
      // what i'm doing here is VERY BAD but necessary for response time
      // eslint-disable-next-line no-param-reassign
      resource.selected = !resource.selected;
    };
    return (
      <Card key={index} className="resource-card">
        <Card.Body>
          <Card.Title>{resource.title}</Card.Title>
          <div className="buttons">
            <div className="left">
              <div role="button"
                tabIndex={0}
                className="resource-button"
                onClick={this.goToResource(resource.resourceID)}
              >
                <i className="fas fa-eye" />
                Preview
              </div>
            </div>
            <FormControlLabel
              control={(
                <IOSSwitch
                  disabled={role === Roles.SUPER_ADMIN || resource.required}
                  checked={resource.required || resource.selected}
                  onChange={toggleSelected}
                  name="checkedB"
                />
            )}
              label={
              // eslint-disable-next-line no-nested-ternary
              !resource.required
                ? resource.selected
                  ? 'Selected' : 'Unselected'
                : 'Required'}
            />
          </div>
        </Card.Body>
      </Card>
    );
  }

  render() {
    return (
      <div className="page view">
        <div className="pageHeader">
          <div className="pageText">
            <h1>Resource Library</h1>
            <div className="resource-lib-desc-wrap">
              <div className="resource-lib-desc">
                <p>
                  Preview and publish resources to the users in your organization here. Resources must be published to be visible to users.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'left' }}>
          { this.state.resources && this.renderResources() }

        </div>
      </div>
    );
  }
}

const mapStateToProps = reduxState => (
  {
    role: reduxState.auth.role,
    orgID: reduxState.orgs.selectedOrgID,
    orgName: reduxState.orgs.selectedOrgName,
  }
);

export default withRouter(connect(mapStateToProps, {
  fetchOrgResources,
  unselectOrgResource,
  selectOrgResource,
})(OrgResourceLibrary));
