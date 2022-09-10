import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';

import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { PersistGate } from 'redux-persist/integration/react';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import reducers from './redux/reducers';
import App from './components/app';

import './style.scss';

// Set up toast alerts to float over screen
toast.configure({
  autoClose: 8000,
  position: toast.POSITION.TOP_CENTER,
});

// Allow redux to re-hydrate on refresh
const persistConfig = {
  key: 'root',
  storage,
};
const persistedReducers = persistReducer(persistConfig, reducers);

// this creates the store with the reducers, and does some other stuff to initialize devtools
// boilerplate to copy, don't have to know
const store = createStore(persistedReducers, {}, compose(
  applyMiddleware(thunk),
  window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f,
));

const persistor = persistStore(store);

// we now wrap App in a Provider
ReactDOM.render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  document.getElementById('main'),
);
