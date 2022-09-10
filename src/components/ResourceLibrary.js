/* eslint-disable new-cap */
import arrayMove from 'array-move';
import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

import {
  addResource,
  deleteSpecificResource,
  fetchResources,
  reorderResource,
  requireResource,
  unrequireResource,
  publishSpecificResource,
  unpublishSpecificResource,
} from '../firebase';

import { switchTabs } from '../redux/DispatchHelpers';
import IOSSwitch from './iosSwitch';

const ResourceCard = SortableElement(({
  resource,
  goToResource,
  goToEditResource,
  toggleResourceRequirement,
  unpublishResource,
}) => {
  const toggleRequired = () => {
    toggleResourceRequirement(resource);
    // what i'm doing here is VERY BAD but necessary for response time
    // eslint-disable-next-line no-param-reassign
    resource.required = !resource.required;
  };
  return (
    <Card className="resource-card">
      <Card.Body>
        <Card.Title>{resource.title}</Card.Title>
        <div className="buttons">
          <div className="left">
            <div role="button"
              tabIndex={0}
              className="resource-button"
              onClick={goToEditResource(resource.resourceID)}
            >
              <i className="fas fa-pen" />
              Edit
            </div>
            <div role="button"
              tabIndex={0}
              className="resource-button"
              onClick={goToResource(resource.resourceID)}
            >
              <i className="fas fa-eye" />
              Preview
            </div>
            <div role="button"
              tabIndex={0}
              className="resource-button"
              onClick={unpublishResource(resource.resourceID)}
            >
              <i className="fas fa-file-import" />
              Unpublish
            </div>
          </div>
          <FormControlLabel
            control={(
              <IOSSwitch
                checked={resource.required}
                onChange={toggleRequired}
                name="checkedB"
              />
              )}
            label={resource.required ? 'Required' : 'Optional'}
          />
        </div>
      </Card.Body>
    </Card>
  );
});

const ResourcesList = SortableContainer(({
  resources,
  goToResource,
  deleteResource,
  goToEditResource,
  toggleResourceRequirement,
  unpublishResource,
}) => {
  return (
    <div className="resources">
      {resources.map((resource, index) => (
        <ResourceCard
          helperClass="resource-card"
          key={resource.resourceID}
          index={index}
          resource={resource}
          goToResource={goToResource}
          goToEditResource={goToEditResource}
          deleteResource={deleteResource}
          toggleResourceRequirement={toggleResourceRequirement}
          unpublishResource={unpublishResource}
        />
      ))}
    </div>
  );
});

// Display all an organization's resources
class ResourceLibrary extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      publishedResources: [],
      draftResources: [],
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.loadResources();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // Fetch resources from database
  loadResources = () => {
    const callback = (bothResources) => {
      const [publishedResources, draftResources] = bothResources;
      this.setState({ publishedResources, draftResources });
    };
    this.props.fetchResources(callback);
  }

  reorderResources = ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) return;
    const { publishedResources } = this.state;
    this.setState({
      publishedResources: arrayMove(publishedResources, oldIndex, newIndex),
    });
    this.props.reorderResource(oldIndex, newIndex, this.loadResources);
  }

  toggleResourceRequirement = (resource) => {
    if (resource.required) this.props.unrequireResource(resource.resourceID, this.loadResources);
    else this.props.requireResource(resource.resourceID, this.loadResources);
  }

  // Navigate to specific resource's edit page
  goToEditResource = resourceID => () => {
    this.props.history.push({
      pathname: `/resourceLibrary/${resourceID}/edit`,
    });
  }

  // Navigate to specific resource's preview page
  goToResource = resourceID => () => {
    this.props.history.push({
      pathname: `/resourceLibrary/${resourceID}`,
    });
  }

  publishResource = resourceID => () => {
    this.props.publishSpecificResource(resourceID, this.loadResources);
  }

  unpublishResource = resourceID => () => {
    this.props.unpublishSpecificResource(resourceID, this.loadResources);
  }

  // Delete resource in database
  deleteResource = resourceID => () => {
    this.props.deleteSpecificResource(resourceID, this.loadResources);
  }

  // Show all resource details and edit/delete capability in card view
  renderPublishedResources = () => {
    if (this.state.publishedResources.length === 0) { return 'No published resources found'; }

    // draggable sortable list time
    // pressdelay means wait 150 ms before start drag
    return (
      <ResourcesList
        axis="xy"
        pressDelay={150}
        resources={this.state.publishedResources}
        onSortEnd={this.reorderResources}
        goToResource={this.goToResource}
        goToEditResource={this.goToEditResource}
        deleteResource={this.deleteResource}
        toggleResourceRequirement={this.toggleResourceRequirement}
        unpublishResource={this.unpublishResource}
      />
    );
  }

  renderDraftResources = () => {
    if (this.state.draftResources.length === 0) { return 'No drafts found'; }

    return (
      <>
        {this.state.draftResources.map((resource, index) => (
          this.renderDraftCard(resource, index)
        ))}
      </>
    );
  }

  renderDraftCard = (resource, index) => {
    return (
      <Card key={resource.resourceID} className="resource-card">
        <Card.Body>
          <Card.Title>{resource.title}</Card.Title>
          <div className="buttons">
            <div className="left">
              <div role="button"
                tabIndex={0}
                className="resource-button"
                onClick={this.goToEditResource(resource.resourceID)}
              >
                <i className="fas fa-pen" />
                Edit
              </div>
              <div role="button"
                tabIndex={0}
                className="resource-button"
                onClick={this.goToResource(resource.resourceID)}
              >
                <i className="fas fa-eye" />
                Preview
              </div>
              <div role="button"
                tabIndex={0}
                className="resource-button"
                onClick={this.publishResource(resource.resourceID)}
              >
                <i className="fas fa-file-upload" />
                Publish
              </div>
              <div role="button"
                tabIndex={0}
                className="resource-button"
                onClick={this.deleteResource(resource.resourceID)}
              >
                <i className="fas fa-trash" />
                Delete
              </div>
            </div>
            <FormControlLabel
              control={(
                <IOSSwitch
                  disabled
                  checked={false}
                  name="checkedB"
                />
            )}
              label="Draft"
            />
          </div>
        </Card.Body>
      </Card>
    );
  }

  addResourceCallback = (newID) => {
    this.props.history.push({
      pathname: `/resourceLibrary/${newID}/edit`,
    });
  }

  // Create new resource with default parameters and push to database
  addResource = () => {
    const newResource = {
      title: 'New Resource',
      pages: {
        0: ['# Page Title', 'Page Content'],
      },
    };
    this.props.addResource(newResource, this.addResourceCallback);
  }

  setCurrentTab = (key) => {
    this.props.switchTabs(key);
  }

  render() {
    if (this._isMounted) {
      return (
        <div className="page view">

          <div className="pageHeader">
            <div className="pageText">
              <h1>Resource Library</h1>
              <div className="resource-lib-desc-wrap">
                <div className="resource-lib-desc">
                  <p>
                    Preview, edit, and publish resources here.
                    Resources must be published to be available to organizations and users.
                    Drag-and-drop published resources to change the order they will appear in.
                    Note: new resources will be created in the drafts tab.
                  </p>
                </div>
              </div>
            </div>
            <div id="resourceAdd">
              <Button className="addButton" id="purplebackground" onClick={this.addResource}>
                + New Resource
              </Button>
            </div>
          </div>
          <Tabs
            activeKey={this.props.tab}
            onSelect={this.setCurrentTab}
          >
            <Tab eventKey="published" title="Published">
              <div className="resources">
                {this.renderPublishedResources()}
              </div>
            </Tab>
            <Tab eventKey="drafts" title="Drafts">
              <div className="resources">
                {this.renderDraftResources()}
              </div>
            </Tab>
          </Tabs>
        </div>
      );
    } else {
      return null;
    }
  }
}

const mapStateToProps = reduxState => ({
  tab: reduxState.resourceTab,
});

export default withRouter(connect(mapStateToProps, {
  fetchResources,
  addResource,
  reorderResource,
  deleteSpecificResource,
  requireResource,
  unrequireResource,
  publishSpecificResource,
  unpublishSpecificResource,
  switchTabs,
})(ResourceLibrary));
