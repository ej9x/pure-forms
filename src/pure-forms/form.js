// @flow
import React from 'react';
import * as R from 'ramda';
import PropTypes from 'prop-types';

export type WithFormOptions = {
  formName: string,
  initialValues: Object,
}


type MetaField = {
  active: boolean,
  dirty: boolean,
  error: boolean,
  initial: any,
  name: string,
  invalid: boolean,
  pristine: boolean,
  touched: boolean,
  valid: boolean,
  visited: boolean,
}

type MetaForm = {
  dirty: boolean,
  pristine: boolean,
}


type WithFormState = {
  values: Object,

  metaForm: MetaForm,
  metaFields: { [name: string]: MetaField },
}

export type WithFormContext = {|
  ...WithFormState,
  changeField: (fieldName: string, fieldValue: mixed) => void,
  setInitialFieldValue: (fieldName: string, fieldValue: mixed) => void,
  registerField: (fieldName: string) => void,
  unRegisterField: (fieldName: string) => void,
|}

const initalFormMeta: MetaForm = {
  dirty: false,
  pristine: true,
};

const getInitialMetaField = (name: string, initial: mixed): MetaField => ({
  name,
  initial,
  active: false,
  dirty: false,
  error: '',
  invalid: false,
  pristine: true,
  touched: false,
  valid: null,
  visited: false,
});

export const withForm = ({ initialValues } : WithFormOptions = { initialValues: {}}) => function<T: Object>(SourceComponent: React$Element<T>) {
  return class A extends React.Component<T> {
    static childContextTypes = {
      formData: PropTypes.object,
    }

    state = {
      values: {},
      metaForm: initalFormMeta,
      metaFields: {},
    }

    getChildContext(): WithFormContext {
      return {
        formData: {
          ...this.state,
          changeField: this.changeField,
          setInitialFieldValue: this.setInitialFieldValue,
          registerField: this.registerField,
          setFieldMeta: this.setFieldMeta,
          unregisterField: this.unregisterField,
        },
      };
    }

    registerField = (fieldName: string) => {
      this.setValueOnRegister(fieldName, initialValues[fieldName]);
      this.setFieldMetaOnRegister(fieldName, getInitialMetaField(fieldName));
    }

    unregisterField = (fieldName: string) => {
      const newMeta = R.set(R.lensProp(['fields', fieldName]), undefined, this.state.meta);

      this.setState({
        values: R.omit(fieldName, this.state.values),
        meta: newMeta,
      });
    }

    ifValueIsInitial = (fieldName:string, fieldValue: string) =>
      R.equals(fieldValue, initialValues[fieldName]) ||
      (R.isNil(initialValues[fieldName]) && R.isEmpty(fieldValue))

    setValue(fieldName: string, fieldValue: mixed) {
      this.setState({
        values: { ...this.state.values, [fieldName]: fieldValue },
      });
    }

    setDirtyFieldMeta(fieldName: string, fieldValue: mixed) {
      if (!this.ifValueIsInitial(fieldName, fieldValue)) {
        this.setDirty(fieldName);
        this.setFormDirty();
      }
      else {
        this.setPristine(fieldName);
        if (this.isAllFieldsIsPristine()) {
          this.setFormPistine();
        }
      }
    }

    isAllFieldsIsPristine() {
      return R.pipe(
        R.values,
        R.filter(R.propEq('dirty', true)),
        R.length,
        R.equals(1), //HACK. remake
      )(this.state.metaFields);
    }

    changeField = (fieldName: string, fieldValue: mixed) => {
      this.setValue(fieldName, fieldValue);
      this.setDirtyFieldMeta(fieldName, fieldValue);
    }

    setInitialFieldValue = (fieldName: string, initialValue: mixed) => {
      this.setValue(fieldName, initialValue);
    }

    getSetFieldMeta = (shapeMeta: $Shape<MetaField>) => (fieldName: string) =>
      this.setFieldMeta(fieldName, shapeMeta)

    setFieldMetaOnRegister = (fieldName: string, shapeMeta: $Shape<MetaField>) => {
      // TODO: thinking how to make it by another way
      // eslint-disable-next-line
      this.state.metaFields[fieldName] = ({ ...this.state.metaFields[fieldName], ...shapeMeta });
      this.setState({ });
    }

    setValueOnRegister(fieldName: string, fieldValue) {
      // TODO: thinking how to make it by another way
      // eslint-disable-next-line
      this.state.values[fieldName] = fieldValue;
      this.setState({});
    }

    setFieldMeta = (fieldName: string, shapeMeta: $Shape<MetaField>) => {
      const newMeta = R.set(
        R.lensPath([fieldName]),
        ({ ...this.state.metaFields[fieldName], ...shapeMeta }),
        this.state.metaFields,
      );

      this.setState({ metaFields: newMeta });
    }

    setFormMeta = (shapeMeta: $Shape<MetaForm>) => {
      this.setState({
        metaForm: shapeMeta,
      });
    }

    setDirty = this.getSetFieldMeta({ dirty: true, pristine: false })
    setPristine = this.getSetFieldMeta({ dirty: false, pristine: true })

    setFormDirty = () => this.setFormMeta({ dirty: true, pristine: false })
    setFormPistine = () => this.setFormMeta({ dirty: false, pristine: true })

    render() {
      const { metaForm } = this.state;

      const formData = { meta: metaForm };

      return <SourceComponent { ...this.props } formData={ formData } />;
    }
  };
};
