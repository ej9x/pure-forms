// @flow

// @flow
import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';

import type { WithFormContext, MetaField } from './form';

export type WithFieldOptions = {
  formName: string,
}

type FieldElementProps<T: *> = {
  input: {
    name: string,
    onChange: (value: T) => void,
    onBlur: (value: T) => void,
    onFocus: (value: T) => void,
  },
  meta: MetaField,
}


type FieldState = {
  meta: Meta,
}


type FieldProps<T: *> = {
  name: string,
  initialValue: T,
  component: React$Element<FieldElementProps>,
  validate?: Array<(value: T) => strinv | void>,
}

// export const withField = (options : WithFieldOptions) => <T: Object>(SourceComponent: T) =>
export class Field extends React.Component<FieldProps, FieldState> {

  state = {
    meta: {},
  }

  static contextTypes = {
    formData: PropTypes.object,
  }

  getContextData(): WithFormContext {
    return this.context.formData;
  }
  /*
  constructor(props: FieldProps, context: WithFormContext) {
    super(props, context);
  }

 */
  componentDidMount() {
    const { registerField } = this.getContextData();

    registerField(this.props.name);
  }

  componentWillUnmount() {
    const { unRegisterField } = this.getContextData();

    unRegisterField(this.props.name);
  }

  componentWillReceiveProps(nextProps: FieldProps) {
    if (!R.equals(nextProps.initialValue, this.props.initialValue)) {
      // this.setInitialValue(nextProps);
    }
  }

  setMetaValue(shapeMeta: $Shape<Meta>) {
    const { setFieldMeta } = this.getContextData();

    setFieldMeta(this.props.name, shapeMeta);
  }

  setInitialValue = (props: FieldProps) => {

  }

  onChange = (value: any) => {
    const { changeField } = this.getContextData();
    const { name } = this.props;

    changeField(name, value);
  }

  onFocus = () => this.setMetaValue({ active: true, visited: true })
  onBlur = () => this.setMetaValue({ active: false, touched: true })

  render() {
    const { component: Component, name } = this.props;
    const { values, metaFields } = this.getContextData();

    const metaProps = metaFields[name];

    const inputProps = {
      name,
      onChange: this.onChange,
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      value: values[name],
    };

    return (
      <PureFieldWrapper input={ inputProps } meta={ metaProps } >
        <Component input={ inputProps } meta={ metaProps } />
      </PureFieldWrapper>
    );
  }
}


export class PureFieldWrapper extends React.Component<FieldElementProps> {

  shouldComponentUpdate(nextProps: FieldElementProps) {
    return !R.equals(this.props, nextProps);
  }

  render() {
    return this.props.children;
  }
}
