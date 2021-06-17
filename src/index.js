/* eslint-disable no-unused-vars */
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// adding bootstrap
import 'bootstrap/dist/css/bootstrap.css';
import $ from 'jquery';
import Popper from 'popper.js';
import 'bootstrap/dist/js/bootstrap.bundle.min';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
