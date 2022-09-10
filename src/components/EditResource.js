/* eslint-disable no-unused-vars */
/* eslint-disable new-cap */
import arrayMove from 'array-move';
import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { fetchSpecificResource, updateSpecificPart, updateSpecificResource } from '../firebase';
import { setErrorMessage } from '../redux/DispatchHelpers';
import EditPopup from './EditPopup';
import MarkdownEditor from './MarkdownEditor';

// handler, grab this to drag the pages
const DragHandle = SortableHandle(() => <span>:: </span>);

// generates a button using the higher-order component sortableElement
const PageButton = SortableElement(({ value, changePage }) => (
  <div className="pageIcon">
    <DragHandle />
    <Button onClick={changePage} className="pageButton" variant="light" value={value}>
      {/* Page  */}
      {value + 1}
    </Button>
  </div>
));

// generates a list of page buttons using the h-o-c SortableContainer
// would prefer to use a key without an array index at all
// but I combined that with the first content paragraph to create pseudo-unique keys
const PageButtonList = SortableContainer(({ pages, changePage }) => {
  return (
    <ul className="pageList">
      {pages.map((page, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <PageButton key={`${page[0]} ${index}`} changePage={changePage} index={index} value={index} />
      ))}
    </ul>
  );
});

// Creates text editor and page CRUD for a resource
class EditResource extends Component {
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

  // Create new Markdown page object in database
  addPage = () => {
    const { pages } = this.state.resource;
    const newPageIndex = pages.push(['# Page Title', 'Page Content']) - 1; // Add sample page to array

    // Refresh
    const reloadResource = () => {
      this.loadResource(newPageIndex);
    };
    this.props.updateSpecificResource(this.props.match.params.resourceID, pages, reloadResource);
  }

  // Update current Markdown page object in database
  savePage = (pageMarkdown) => {
    const { pages } = this.state.resource;
    pages[this.state.selectedPage] = pageMarkdown; // Update page in array

    // Refresh
    const reloadResource = () => {
      this.loadResource(this.state.selectedPage);
    };
    this.props.updateSpecificResource(this.props.match.params.resourceID, pages, reloadResource);
  }

  // Delete current Markdown page object in database
  deletePage = () => {
    const { pages } = this.state.resource;

    // Ensure resource still has pages
    if (pages.length <= 1) {
      this.props.setErrorMessage('You cannot have no pages in a resource. Consider deleting this resource entirely.');
    } else {
      pages.splice(this.state.selectedPage, 1); // Remove page in array
      const previousPageIndex = Math.max(this.state.selectedPage - 1, 0);

      // Refresh
      const reloadResource = () => {
        this.loadResource(previousPageIndex);
      };
      this.props.updateSpecificResource(this.props.match.params.resourceID, pages, reloadResource);
    }
  }

  // reorders page from oldIndex to newIndex
  // old/newIndex are defined names in react-sortable-hoc and cannot be renamed
  reorderPage = ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) return; // don't need to update if no change
    const { pages } = this.state.resource;
    const reorderedPages = arrayMove(pages, oldIndex, newIndex);
    // if moved current page, jump to new location
    // else stay on same page (either same page number, one up, or one down)
    // saves current page automatically
    const reloadResource = () => {
      const { selectedPage } = this.state;
      if (oldIndex === selectedPage) {
        this.loadResource(newIndex);
      } else if ((selectedPage < newIndex) === (selectedPage < oldIndex) && selectedPage !== newIndex) {
        this.loadResource(selectedPage);
      } else if (oldIndex > selectedPage) {
        this.loadResource(selectedPage + 1);
      } else {
        this.loadResource(selectedPage - 1);
      }
    };
    const { resourceID } = this.props.match.params;
    this.props.updateSpecificResource(resourceID, reorderedPages, reloadResource);
  }

  renderPageButtons = () => {
    if (!this.state.resource.pages) { return 'Loading...'; }

    // draggable sortable list
    // pressDelay means wait 150 ms before start drag
    return (
      <div className="pages">
        <PageButtonList
          useDragHandle
          axis="y"
          pressDelay={150}
          pages={this.state.resource.pages}
          onSortEnd={this.reorderPage}
          changePage={this.changePage}
        />
        <Button id="newPageButton" key="addNew" variant="info" onClick={this.addPage}>+ </Button>
      </div>

    );
  }

  editTitle = (data) => {
    const reloadResource = () => {
      this.loadResource(this.state.selectedPage);
    };
    // Pass true for Image, false for title
    this.props.updateSpecificPart(this.props.match.params.resourceID, data, reloadResource, false);
  }

  render() {
    return ( // Gonna Have to do something with img-box style, probably flex it underneath
      <div className="view page">
        <div className="img-box">
          <h1>Title: {this.state.resource.title}</h1>
          <EditPopup
            editorState={this.state.editTitle}
            editTitle={this.editTitle}
          />
        </div>
        <h2>Page {this.state.selectedPage + 1}</h2>
        <div className="editContentHalf">
          <div className="editContentBox">
            { this.state.resource.pages && this.renderPageButtons()}
            { this.state.resource.pages && (
            <MarkdownEditor
              savePage={this.savePage}
              deletePage={this.deletePage}
              key={this.state.selectedPage}
              page={this.state.resource.pages[this.state.selectedPage]}
            />
            ) }
          </div>
        </div>

      </div>
    );
  }
}

export default withRouter(connect(null, {
  fetchSpecificResource, updateSpecificResource, setErrorMessage, updateSpecificPart,
})(EditResource));
