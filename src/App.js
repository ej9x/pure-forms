// @flow

import React, { Component } from 'react';
import * as R from 'ramda';
import logo from './logo.svg';
import { withForm, Field } from './pure-forms';

import './App.css';

const required = R.ifElse(
  R.isEmpty,
  () => 'Reqiered',
  () => undefined,
);

const Input = ({ input, meta }) => (
  <div>
    { JSON.stringify(input) }{ JSON.stringify(meta) }
    <input { ...input } value={ input.value || '' } onChange={ (event) => input.onChange(event.target.value) } />
    <span style={{ color: 'red' }}>{ meta.errors }</span>
  </div>
);

const TestForm = withForm()(class TestForm extends Component<*> {

  render() {

    return (
      <div>
        <div>
          { JSON.stringify(this.props) }
        </div>
        <Field name="field1" validate={ [required] } component={ Input } />
        <Field name="field2" component={ Input } />
        <Field name="field3" component={ Input } />
      </div>
    );
  }
});

class App extends Component<*> {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={ logo } className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <div className="App-intro">
          <TestForm />
        </div>
      </div>
    );
  }
}

export default App;
