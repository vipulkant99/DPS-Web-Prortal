import React, { Component } from 'react';
// import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Tab from 'react-bootstrap/Tab';
import Nav from 'react-bootstrap/Nav';
import { fetchWellness } from '../../firebase';

const tabs = {
  TODOS: 'todos',
  CONTACTS: 'contacts',
  STRATEGIES: 'strategies',
};

class UserWellness extends Component {
  constructor(props) {
    super(props);

    this.state = {
      todos: {
        morning: [],
        afternoon: [],
        evening: [],
      },
      strategies: [],
      contacts: [],
      displayedContacts: [],
      filter: '',
    };
  }

  componentDidMount() {
    this.props.fetchWellness(this.props.orgID, this.props.user.id, this.setWellness);
  }

  setWellness = (todos, strategies, contacts) => {
    const todoObject = {
      morning: [],
      afternoon: [],
      evening: [],
    };
    todos.forEach((activity) => {
      todoObject[activity.timePeriod].push(activity);
    });
    this.setState({
      todos: todoObject,
      strategies,
      contacts,
    });
  }

  handleFilter = ({ target: { value } }) => {
    this.setState(prevState => ({
      filter: value,
      displayedContacts: value
        ? prevState.contacts.filter((contact) => {
          return `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(value.toLowerCase());
        })
        : [],
    }));
  }

  // currently does not render done status/dates, need designs
  renderTodos = () => {
    return Object.entries(this.state.todos).map(([time, activities]) => {
      const timeUppercase = time.charAt(0).toUpperCase() + time.slice(1);
      return (
        <div className="todo-timeframe" key={time}>
          <h2 className="todo-time">{timeUppercase}</h2>
          {activities.map((todo) => {
            return (
              <div className="todo-item" key={todo.id}>
                <h3 className="wellness-title">{todo.title}</h3>
                <p className="wellness-text">{todo.text}</p>
              </div>
            );
          })}
        </div>
      );
    });
  }

  // currently does not render them in any particular order/scoring
  renderStrategies = () => {
    return this.state.strategies.map((strat) => {
      return (
        <div className="strategy-item" key={strat.id}>
          <h3 className="wellness-title">{strat.title}</h3>
          <p className="wellness-text">{strat.text}</p>
          {/* <hr /> */}
        </div>
      );
    });
  }

  renderContacts = () => {
    return (
      <>
        <div className="contacts-filter">
          <div className="search-bar">
            <span className="fas fa-search" />
            <input
              className="search-input"
              placeholder="Search contacts..."
              value={this.state.filter}
              onChange={this.handleFilter}
            />
          </div>

          {this.renderSomeContacts(this.state.filter
            ? this.state.displayedContacts
            : this.state.contacts)}
        </div>
      </>
    );
  }

  renderSomeContacts = (someContacts) => {
    return someContacts.map((contact) => {
      return (
        <div className="contact-item" key={contact.id}>
          <h3 className="contact-name">{contact.firstName} <b>{contact.lastName}</b></h3>
          <p className="contact-text">{contact.relationship}</p>
          <p className="contact-text">{contact.phoneNumber}</p>
          <p className="contact-text">{contact.availability}</p>
          {/* <hr /> */}
        </div>
      );
    });
  }


  render() {
    return (
      <Tab.Container defaultActiveKey={tabs.TODOS}>
        <Nav variant="pills">
          <Nav.Item>
            <Nav.Link eventKey={tabs.TODOS}>Daily To-Do</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey={tabs.STRATEGIES}>Strategies</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey={tabs.CONTACTS}>Contacts</Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey={tabs.TODOS}>
            {this.renderTodos()}
          </Tab.Pane>
          <Tab.Pane eventKey={tabs.STRATEGIES}>
            {this.renderStrategies()}
          </Tab.Pane>
          <Tab.Pane eventKey={tabs.CONTACTS}>
            {this.renderContacts()}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    );
  }
}

export default connect(null, { fetchWellness })(UserWellness);
