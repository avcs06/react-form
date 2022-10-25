
# react-form
A context & hook based react form. Supports dirty-check, validation, reset and save functionalities of form

## Features
- Dirty Checking
  - Dirty checks for both individual fields and whole form
  - Marks current values as pristine on successful submit
  - Single method tp reset the complete form to last known pristine values

- Validation
  - Supports writing your own custom validation rules
  - Live validation at both individual field level and whole form level
  - Does not check for required field errors until first submit
  - Live validation for required fields after first submit

- General
  - Supports changing the initial form data
  - Pure API, can be integrated with all available UI libraries seamlessly
  - [Small size, tree-shakable and no dependancies](https://bundlephobia.com/package/@avcs/react-form@latest)

## Installation
```bash
 npm i --save @avcs/react-form
```

## Documentation
```typescript
useForm: ReactHook

arguments: [{
  // initial form object
  formData: { [string | symbol]: any };\
  // Optional Event handler if you want to listen to changes in form
  onFormChange?: (formMeta: { isFormDirty: boolean, formData: { [string | symbol]: any } }) => void;
  // Optional Event handler if you want to listen to changes in form errors
  onErrorChange?: (errorMeta: { hasErrors: boolean, errors: { [string | symbol]: any } }) => void;
}]

returnValue: {
  /* Handle submit action, accepts 2 params onSubmit & onError. validates required errors
   *     any changes from this state will be considered dirty in future
   *   will execute onSubmit if there are no errors
   *   will mark the form as pristine if onSubmit returns anything other than false
   *   will execute onError if there are any errors
   */
  handleSubmit: (
    onSubmit: (formData: { [string | symbol]: any }) => any,
    onError: (errors: { [string | symbol]: any }) => any
  ) => void;

  // Resets the form to last known pristine state
  clearForm: () => void;

  /* Provider to wrap any child components with,
   *   so that they and useFormState in them can access FormContext
   *
   * If using useFormState in the same component where useForm is used,
   *   this can be passed in options.provider to useFormState
   */
  FormProvider: React.Element
}
```

```typescript
useFormContext: ReactHook

returnValue: {
  // Same as useForm except FormProvider
}
```

```typescript
useFormState<T>: ReactHook

arguments: [
  // key to identify which value from form,
  //   this field is associated with
  key: string | symbol,
  // Options for this field
  {
    // default value is applied if the key doesn't exist in the initial form
    defaultValue?: any,
    // validate the value and return error or undefined if no errors
    validate?: (value: any) => any | undefined,
    // Validates value for required on submit, if true
    required?: boolean,
    // Error info to record when there is a require error
    requiredErrorMessage?: any,
    // Pass the Provider manually if this hook is not used inside a component thats wrapped in Provider
    provider?: React.Element
  }
]

returnValue: [
  // current state of the field
  state: T,
  // setState method for the field
  setState: ReactSetState<T>,
  // true if current state of the field is
  //   different from last known pristine state
  isDirty: boolean,
  // error info if the state is not valid
  error: any,
]
```

> Please note: error is any instead of string, this is there so you can pass anything.

> Example: You can pass reference to the error node so you can scroll to specific error when clicking submit

## Usage
Can be used in 2 different formats. Form & Fields in a single component or in separate components,
please refer below for an example of both the use cases

### Form
```typescript
// Form.tsx
import React from 'react';
import { useForm } from '@avcs/react-form';

const Form = () => {
  const {
    handleSubmit, clearForm, FormProvider
  } = useForm({ formData: initialForm });

  // using useFormField in the same component as useForm
  // check how we are passing provider here but not in FormField component
  const [field, setField, isFieldDirty, fieldError] = useFormField(key, {
    defaultValue:  'some value',
    validate:  (value)  =>  {
      if  (value !==  'some value')  return  'some error';
    },
    required:  true,
    requiredErrorMessage:  'this field is required',
    provider: FormProvider
  });

  const handleChange = useCallback((e) => {
    setData(e.target.value);
  }, []);

  const submitForm = useCallback((e) => {
    handleSubmit(
      formData => {
        // API call to save data
      },
      errors => {
        // Process errors
      }
    );
  }, []);

  return (
    <form>
      {/* OPTION 1: using form fields separately,
          see below for definition of FormField */}
      <FormProvider>
        <FormField />
      </FormProvider>

      {/* OPTION 2: using form field in same component as form */}
      <input type="text" onChange={handleChange} value={field}  />

      <button onClick={submitForm}>Submit</input>
      <button onClick={clearForm}>Clear</button>
    </form>
  );
};

export default Form;
```

### FormField
```typescript
  import React from 'react';
  import { useFormState } from '@avcs/react-form';

  const FormField = () => {
    const [data, setData, isDirty, error] = useFormState(key, {
      defaultValue: 'some value',
      validate: (value) => {
        if (value !== 'some value') return 'some error';
      },
      required: true,
      requiredErrorMessage: 'this field is required',
    });

    const handleChange = useCallback((e) => {
      setData(e.target.value);
    }, []);

    return (
      <input type="text" onChange={handleChange} value={data} />
    );
  };

  export default FormField;
```

## Performance
- **useForm**: re-renders once per load, submit, reset
- **useFormContext**: re-renders once per load
- **useFormField**: re-renders once per load, submit, reset, value-change
- **onFormChange**: triggers once per value-change
- **oErrorChange**: triggers once per error-change (adding a new error, clearing an error)
