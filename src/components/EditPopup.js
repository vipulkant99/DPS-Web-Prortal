import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
// import firebase from 'firebase';
// import 'firebase/firestore';


class EditPopup extends Component {
  // Start the popover closed
  constructor(props) {
    super(props);

    this.state = {
      url: '',
      open: false,
    };
  }

  // When the popover is open and users click anywhere on the page, the popover should close
  componentDidMount() {
    document.addEventListener('click', this.closePopover);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.closePopover);
  }

  // Note: make sure whenever a click happens within the popover it is not closed
  onPopoverClick = () => {
    this.preventNextClose = true;
  }

  openPopover = () => {
    if (!this.state.open) {
      this.preventNextClose = true;
      this.setState({
        open: true,
      });
    }
  };

  changeUrl = (evt) => {
    this.setState({ url: evt.target.value });
  }

  closePopover = () => {
    if (!this.preventNextClose && this.state.open) {
      this.setState({
        open: false,
        url: '',
      });
    }

    this.preventNextClose = false;
  }

  addMedia = () => {
    if (this.props.isPic) {
      this.props.editImg(this.state.url);
    } else {
      this.props.editTitle(this.state.url);
    }
    this.closePopover();
  }

  render() {
    const buttonText = this.props.isPic
      ? 'Change Image'
      : 'Change Title';
    const popoverClassName = this.state.open
      ? 'addImagePopover'
      : 'addImageClosedPopover';
    const buttonClassName = 'addImageButton';
    const prompt = this.props.isPic
      ? 'Image URL'
      : 'Title Name';

    return (
      <div className="addImage">
        <button
          className={buttonClassName}
          onMouseUp={this.openPopover}
          type="button"
        >
          {buttonText}
        </button>
        <div
          role="main"
          className={popoverClassName}
          onClick={this.onPopoverClick}
        >
          <input
            type="text"
            placeholder={prompt}
            className="addImageInput"
            onChange={this.changeUrl}
            value={this.state.url}
          />
          <button
            className="addImageConfirmButton"
            type="button"
            onClick={this.addMedia}
          >
            Save
          </button>
        </div>
      </div>
    );
  }
}

export default withRouter(connect(null, {})(EditPopup));
