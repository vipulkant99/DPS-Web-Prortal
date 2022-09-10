import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { fetchSpecificResource } from '../firebase';
import MarkdownViewer from './MarkdownViewer';
import Routes, { createOrgRoute } from '../helpers/Routes';


// view-only version of the edit resource component for admins
class ViewResource extends Component {
  constructor(props) {
    super(props);

    this.state = {
      resource: {}, // Current resource (set of pages) to display
      selectedPage: 0, // Which page to display in the editor
    };
  }

  componentDidMount() {
    this.loadResource();
  }

  // Fetch resource from backend and select specific page to initially view
  loadResource = (pageIndex = 0) => {
    const callback = (resource) => {
      this.setState({ resource, selectedPage: pageIndex });
    };
    this.props.fetchSpecificResource(this.props.match.params.resourceID, callback);
  }

  changePage = (event) => {
    this.setState({ selectedPage: Number(event.target.value) });
  }

  renderPageButtons = () => {
    if (!this.state.resource.pages) { return 'Loading...'; }

    const renderedPages = this.state.resource.pages.map((page, index) => {
      return (
      // eslint-disable-next-line react/no-array-index-key
        <Button key={`${page[0]} ${index}`}
          onClick={this.changePage}
          variant="secondary"
          value={index}
        >
          Page {index + 1}
        </Button>
      );
    });
    return renderedPages;
  }

  renderBackButton() {
    if (this.props.orgID !== '') {
      return (
        <Link
          to={{
            pathname: createOrgRoute(this.props.orgID, Routes.ORG_RESOURCE_LIBRARY),
            state: {
              orgID: this.props.orgID,
            },
          }}
          className="backButtons"
        > Back to Library
        </Link>
      );
    } else {
      return (
        <Link
          to={{
            pathname: Routes.RESOURCE_LIBRARY,
            state: {
              orgID: this.props.orgID,
            },
          }}
          className="backButtons"
        > Back to Library
        </Link>
      );
    }
  }

  render() {
    return ( // Gonna Have to do something with img-box style, probably flex it underneath
      <div className="page view">
        {this.renderBackButton()}
        <div className="img-box">
          <h1>Title: {this.state.resource.title}</h1>
        </div>
        { this.state.resource.pages && this.renderPageButtons()}
        <h2>Page {this.state.selectedPage + 1}</h2>
        { this.state.resource.pages && (
          <MarkdownViewer
            key={this.state.selectedPage}
            page={this.state.resource.pages[this.state.selectedPage]}
          />
        ) }
      </div>
    );
  }
}


const mapStateToProps = reduxState => (
  {
    orgID: reduxState.orgs.selectedOrgID,
  }
);

export default withRouter(connect(mapStateToProps, { fetchSpecificResource })(ViewResource));
