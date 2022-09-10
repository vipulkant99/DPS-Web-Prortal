/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-expressions */
/* eslint-disable consistent-return */
/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import { fetchChats } from '../../firebase';


class UserChat extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      userID: this.props.user.id,
      peerID: this.props.user.peerID,
      chats: [],
    };
  }

  componentDidMount() {
    if (this.props.location.state.orgID !== '') {
      fetchChats(this.props.location.state.orgID, this.state.userID, this.state.peerID, this.setChats);
      this._isMounted = true;
    }
    // this.unsubscribe = fetchChats(this.props.orgID, this.state.userID, this.state.peerID, (messages) => {
    //   if (this.state.messages.length === 0) {
    //     // Set the initial state of messages on the first snapshot send
    //     this.setState({
    //       messages,
    //     });
    //   } else if (this.state.messages[0]._id !== messages[0]._id) {
    //     // Grab latest message in the snapshot listener
    //     console.log('here, this is a problem');
    //     this.setState(previousState => ({
    //       messages: messages.append(previousState.messages, messages[0]),
    //     }));
    //   }
    // });
  }

  componentWillUnmount() {
    // this._isMounted = false;
    // this.unsubscribe && this.unsubscribe();
  }

  setChats = (chats) => {
    this.setState({ chats });
  }

  renderDate = (chat) => {
    let time = null;
    const today = moment().format('MM/DD/YY');
    if (today === moment(chat.createdAt).format('MM/DD/YY')) {
      time = moment(chat.createdAt).format('h:mm A');
    } else {
      time = moment(chat.createdAt).format('MM/DD/YY, h:mm A');
    }
    return time;
  }

  renderTime = (seconds) => {
    let time = null;
    const today = moment().format('MM/DD/YY');
    if (today === moment(seconds).format('MM/DD/YY')) {
      time = moment(seconds).format('h:mm A');
    } else {
      time = moment(seconds).format('MM/DD/YY, h:mm A');
    }
    return time;
  }

  // /////SHOWING TIME IS BROKEN RN, REALIZED I FUNDAMENTALLY BUILT THIS SO THAT TIME IS DIFFICULT TO CALCULATE HA HA HA, SO WILL FIGURE OUT LATER

  renderChat = () => {
    let lastTime = 0;
    let last = null;
    return (
      this._isMounted ? (
        this.state.chats.length > 0 ? (
          this.state.chats.map((chat) => {
            let difference = false;
            if (last !== null) {
              lastTime = last.createdAt.getTime();
            }
            // console.log('chat time ', chat.createdAt.getTime());
            // console.log('last time ', lastTime);
            // console.log('//////////////////');
            if (lastTime !== 0) {
              if (lastTime - chat.createdAt.getTime() > 180000) {
                // console.log(last);
                // console.log(last.createdAt.getTime());
                // console.log(lastTime);
                difference = true;
              }
            }
            // lastTime = chat.createdAt.getTime();
            last = chat;
            // console.log(this.renderDate(lastTime));
            if (chat.senderID === this.state.peerID) {
              return (
                (difference) ? (
                  <div key={chat.firebaseID}>
                    <div title={chat.createdAt} className="sender chat">
                      <span>{chat.text}</span>
                    </div>
                    {/* <span>{this.renderDate(lastTime)}</span> */}
                  </div>
                ) : (
                  <div title={chat.createdAt} className="sender chat" key={chat.firebaseID}>
                    <span>{chat.text}</span>
                  </div>
                )
              );
            } else {
              return (
                (difference) ? (
                  <div key={chat.firebaseID}>
                    {/* <span>{this.renderDate(chat)}</span> */}
                    <div title={chat.createdAt} className="receiver chat">
                      <span>{chat.text}</span>
                    </div>
                  </div>
                ) : (
                  <div title={chat.createdAt} className="receiver chat" key={chat.firebaseID}>
                    <span>{chat.text}</span>
                  </div>
                )

              );
            }
          })
        ) : (
          <div id="noChatMsg">
            This user has no chats with their peer
          </div>
        )
      ) : (
        <div>Loading...</div>
      )
    );
  }

  // renderChat = () => {
  //   return (
  //     this._isMounted ? (
  //       this.state.chats.map((chat) => {
  //         console.log(chat.createdAt);
  //         console.log(chat.createdAt.getTime());
  //         if (chat.senderID === this.state.peerID) {
  //           return (
  //             <div title={chat.createdAt} className="sender chat" key={chat.firebaseID}>
  //               <span>{chat.text}</span>
  //             </div>
  //           );
  //         } else {
  //           return (
  //             <div title={chat.createdAt} className="receiver chat" key={chat.firebaseID}>
  //               <span>{chat.text}</span>
  //             </div>
  //           );
  //         }
  //       })
  //     )
  //       : (
  //         <div> Loading ...</div>
  //       )
  //   );
  // }

  render() {
    return (
      <div className="chatWindow">
        {this.renderChat()}
      </div>
    );
  }
}

const mapStateToProps = reduxState => (
  {
    orgID: reduxState.orgs.selectedOrgID,
    allUsers: reduxState.users.orgUsers,
  }
);

export default withRouter(connect(mapStateToProps, { fetchChats })(UserChat));
