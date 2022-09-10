import React, { Component } from 'react';
import Editor, { composeDecorators } from 'draft-js-plugins-editor';
import { EditorState, convertFromRaw } from 'draft-js';
import { mdToDraftjs } from 'draftjs-md-converter';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import createImagePlugin from 'draft-js-image-plugin';
import createVideoPlugin from 'draft-js-video-plugin';
import createLinkPlugin from 'draft-js-anchor-plugin';
import createFocusPlugin from 'draft-js-focus-plugin';
import createBlockDndPlugin from 'draft-js-drag-n-drop-plugin';
import 'draft-js-static-toolbar-plugin/lib/plugin.css';
import 'draft-js-image-plugin/lib/plugin.css';
import 'draft-js-focus-plugin/lib/plugin.css';
import 'draft-js-anchor-plugin/lib/plugin.css';

// Set up Draft JS plugins
const linkPlugin = createLinkPlugin();
const focusPlugin = createFocusPlugin();
const blockDndPlugin = createBlockDndPlugin();
const decorator = composeDecorators(
  focusPlugin.decorator,
  blockDndPlugin.decorator,
);
const imagePlugin = createImagePlugin({ decorator });
const videoPlugin = createVideoPlugin({ decorator });
const plugins = [linkPlugin, focusPlugin, blockDndPlugin, imagePlugin, videoPlugin];

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

// Convert array of Markdown lines into block of Markdown with videos converted to embed format
function prepareMarkdownForWeb(markdownArray) {
  let draftText = '';
  for (const line of markdownArray) {
    draftText += convertVideoToEmbed(line);
    draftText += '\n';
  }
  return draftText;
}

// Draft JS editor with disabled editing
class MarkdownViewer extends Component {
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

  // Render editor but view only
  render() {
    return (
      <div>
        <div role="main" className="editor" onClick={this.focus}>
          <Editor
            readOnly
            editorState={this.state.editorState}
            plugins={plugins}
            ref={(element) => { this.editor = element; }}
          />
        </div>
      </div>
    );
  }
}

export default withRouter(connect(null, {})(MarkdownViewer));
