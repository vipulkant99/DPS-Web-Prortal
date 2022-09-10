import React from 'react';
import { withRouter, Redirect, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import Routes from './Routes';
import { setErrorMessage } from '../redux/DispatchHelpers';

// Higher-order component to role-restrict access to routes
const AuthorizedRoute = ({
  component: Component, path, exact = true, validRoles, ...rest
}) => {
  const {
    uid, role, history, setAlertMessage,
  } = rest;
  const isLoggedIn = !!uid;
  const isValidRole = validRoles.includes(role);

  const message = isLoggedIn ? 'You do not have access to that page' : 'Please log in to view that page';
  if (!isLoggedIn || !isValidRole) { setAlertMessage(message); }
  if (isLoggedIn && !isValidRole) { history.goBack(); }

  return (
    <Route
      path={path}
      exact={exact}
      {...rest}
      render={(props) => {
        return isLoggedIn && isValidRole
          ? <Component {...props} />
          : (
            <Redirect
              to={{
                pathname: Routes.SIGN_IN, // Send back to sign-in if not authorized
                state: {
                  requestedPath: path,
                  error: message,
                },
              }}
            />
          );
      }}
    />
  );
};

const mapStateToProps = reduxState => (
  {
    uid: reduxState.auth.uid,
    role: reduxState.auth.role,
  }
);

export default withRouter(connect(mapStateToProps, { setAlertMessage: setErrorMessage })(AuthorizedRoute));
