import React, { Component } from 'react';
import Editor, { composeDecorators } from 'draft-js-plugins-editor';
import createToolbarPlugin, { Separator } from 'draft-js-static-toolbar-plugin';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import createImagePlugin from 'draft-js-image-plugin';
import createVideoPlugin from 'draft-js-video-plugin';
import createLinkPlugin from 'draft-js-anchor-plugin';
import createFocusPlugin from 'draft-js-focus-plugin';
import createBlockDndPlugin from 'draft-js-drag-n-drop-plugin';
import { draftjsToMd, mdToDraftjs } from 'draftjs-md-converter';
import 'draft-js-static-toolbar-plugin/lib/plugin.css';
import 'draft-js-image-plugin/lib/plugin.css';
import 'draft-js-focus-plugin/lib/plugin.css';
import 'draft-js-anchor-plugin/lib/plugin.css';
import {
  ItalicButton,
  BoldButton,
  UnderlineButton,
  HeadlineOneButton,
  HeadlineTwoButton,
  HeadlineThreeButton,
  UnorderedListButton,
  OrderedListButton,
  BlockquoteButton,
} from 'draft-js-buttons';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Button from 'react-bootstrap/Button';
import getVideoId from 'get-video-id';

// Set up Draft JS plugins
const staticToolbarPlugin = createToolbarPlugin();
const { Toolbar } = staticToolbarPlugin;
const linkPlugin = createLinkPlugin();
const focusPlugin = createFocusPlugin();
const blockDndPlugin = createBlockDndPlugin();
const decorator = composeDecorators(
  focusPlugin.decorator,
  blockDndPlugin.decorator,
);
const imagePlugin = createImagePlugin({ decorator });
const videoPlugin = createVideoPlugin({ decorator });
const plugins = [staticToolbarPlugin, linkPlugin, focusPlugin, blockDndPlugin, imagePlugin, videoPlugin];

// Convert any 'embed' statements into a thumbnail image linked to a video
// Thumnbail image used to be generated from https://yt-embed.herokuapp.com/ (keeping this comment for now for reference just in case)
// Now using a different format that renders thumbnail on both web and mobile
function convertVideoToMarkdown(line) {
  let editedLine = line;
  const youtubeMatch = line.match(/url=(.*) /); // Find any lines with video URLs
  if (youtubeMatch != null) { // Did it match?
    const videoID = getVideoId(youtubeMatch[1]).id;
    editedLine = `[![YouTube Video](http://img.youtube.com/vi/${videoID}/0.jpg)](http://www.youtube.com/watch?v=${videoID})`;
  }
  return editedLine;
}

// Convert any images linked to YouTube videos into embed-style statements
// For live rendering by Draft JS
function convertVideoToEmbed(line) {
  let editedLine = line;
  const youtubeMatch = line.match(/\)]\((.*)\)/); // Find any lines with videos linked to images
  if (youtubeMatch != null) { // Did it match?
    editedLine = `[[ embed url=${youtubeMatch[1]} ]]`;
  }
  return editedLine;
}

// Convert DraftJS-style markdown into array of Markdown lines with videos converted to thumbnail format
function prepareMarkdownForMobile(markdown) {
  const markdownArray = [];

  const markdownSplit = markdown.split(/\r?\n/); // Split on both carriage return and newline (Windows vs UNIX)
  for (const line of markdownSplit) {
    if (line !== '') {
      const editedLine = convertVideoToMarkdown(line);
      markdownArray.push(editedLine);
    }
  }
  return (markdownArray);
}

// Convert array of Markdown lines into block of Markdown with videos converted to embed format
function prepareMarkdownForWeb(markdownArray) {
  let draftText = '';
  for (const line of markdownArray) {
    draftText += convertVideoToEmbed(line);
    draftText += '\n';
  }
  return draftText;
}

// Button that opens popup letting user input image/video link
// Copied from https://github.com/draft-js-plugins/draft-js-plugins/blob/master/docs/client/components/pages/Video/CustomAddVideoVideoEditor/VideoAdd/index.js
class MediaAddButton extends Component {
  // Start the popover closed
  state = {
    url: '',
    open: false,
  };

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

  closePopover = () => {
    if (!this.preventNextClose && this.state.open) {
      this.setState({
        open: false,
        url: '',
      });
    }

    this.preventNextClose = false;
  };

  addMedia = () => {
    const { editorState, onChange } = this.props;
    const payload = this.props.isVideo ? { src: this.state.url } : this.state.url;
    onChange(this.props.action(editorState, payload));
  };

  changeUrl = (evt) => {
    this.setState({ url: evt.target.value });
  }

  render() {
    const buttonText = this.props.isVideo
      ? 'Video'
      : 'Image';
    const popoverClassName = this.state.open
      ? 'addImagePopover'
      : 'addImageClosedPopover';
    const buttonClassName = 'addImageButton';
    const prompt = this.props.isVideo
      ? 'YouTube Video URL'
      : 'Image URL';

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
            Add
          </button>
        </div>
      </div>
    );
  }
}

// Draft JS editor
class MarkdownEditor extends Component {
  constructor(props) {
    super(props);

    // Load editor with content from backend Markdown
    const webMarkdown = prepareMarkdownForWeb(this.props.page);
    const draftData = mdToDraftjs(webMarkdown);
    const contentState = convertFromRaw(draftData);

    this.state = {
      editorState: EditorState.createWithContent(contentState),
    };
  }

  onEditorChange = (editorState) => {
    this.setState({
      editorState,
    });
  };

  focus = () => {
    this.editor.focus();
  };

  // Convert content to Markdown and push to backend
  savePage = () => {
    const content = this.state.editorState.getCurrentContent();
    const markdown = draftjsToMd(convertToRaw(content));
    const pageMarkdown = prepareMarkdownForMobile(markdown);
    this.props.savePage(pageMarkdown);
  }

  deletePage = () => {
    this.props.deletePage();
  }

  // Render editor with rich text buttons, media add buttons, and save/delete page buttons
  render() {
    return (
      <div className="resource-view">
        <div className="hidden">
          <Editor
            editorState={this.state.editorState}
            onChange={this.onEditorChange}
            plugins={plugins}
            ref={(element) => { this.editor = element; }}
          />
        </div>
        <div className="editor-container">
          <Toolbar>
            {
                // may be use React.Fragment instead of div to improve perfomance after React 16
                externalProps => (
                  <div className="toolbar">
                    <HeadlineOneButton {...externalProps} />
                    <HeadlineTwoButton {...externalProps} />
                    <HeadlineThreeButton {...externalProps} />
                    <Separator {...externalProps} />
                    <BoldButton {...externalProps} />
                    <ItalicButton {...externalProps} />
                    <UnderlineButton {...externalProps} />
                    <Separator {...externalProps} />
                    <UnorderedListButton {...externalProps} />
                    <OrderedListButton {...externalProps} />
                    <BlockquoteButton {...externalProps} />
                    <linkPlugin.LinkButton {...externalProps} />
                    <MediaAddButton
                      editorState={this.state.editorState}
                      onChange={this.onEditorChange}
                      action={imagePlugin.addImage}
                    />
                    <MediaAddButton
                      editorState={this.state.editorState}
                      onChange={this.onEditorChange}
                      action={videoPlugin.addVideo}
                      isVideo
                    />
                  </div>
                )
              }
          </Toolbar>
          <div role="main" className="editor" onClick={this.focus}>
            <Editor
              editorState={this.state.editorState}
              onChange={this.onEditorChange}
              plugins={plugins}
              ref={(element) => { this.editor = element; }}
            />
          </div>
        </div>
        <Button variant="secondary" onClick={this.savePage}>save page</Button>
        <Button variant="secondary" onClick={this.deletePage}>delete page</Button>
      </div>
    );
  }
}

export default withRouter(connect(null, {})(MarkdownEditor));
