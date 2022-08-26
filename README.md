# react-form
A context based react form. Supports Dirty check, validation, reset and save functionalities of form

### Installation
```bash
 npm i --save @avcs/react-form
```

### Documentation
```javascript
FormProvider: ReactComponent

props: {
  data: { [string | symbol]: any } // Initial form data
}
```

```javascript
useFormContext: ReactHook

returnValue: {
  formData: { [string | symbol]: any }; // current form data
  isFormDirty: boolean; // true if current form data is different from last known pristine state

  errors: { [string | symbol]: any }; // collected errors across the form
  hasErrors: boolean; // true if form has errors

  /* Handle submit action, accepts 2 params onSubmit & onError
   *   validates required errors, if there are no errors will mark the current formState as pristine
   *     any changes from this state will be considered dirty in future
   *   will execute onSubmit if there are no errors
   *   will execute onError if there are any errors
   */
  handleSubmit: (
    onSubmit: (formData: { [string | symbol]: any }) => any,
    onError: (errors: { [string | symbol]: any }) => any
  ) => void;
  
  // Resets the form to last known pristine state
  clearForm: () => void;
}
```

```javascript
useFormState<T>: ReactHook

arguments: [
  key: string | symbol, // key to identify which value from form, this field is associated with
  {
    defaultValue: any, // default value is applied if the key doesnt exist in the initial form
    validate: (value: any) => any | undefined, // validate the value and return error or undefined if no errors
    required: boolean, // Validates value for required on submit, if true
    requiredErrorMessage: any, // Error info to record when there is a require error
  }
]

returnValue: [
  state: T, // current state of the field
  setState: ReactSetState<T>, // setState method for the field
  isDirty: boolean, // true if current state of the field is different from last known pristine state
  error: any, // error info if the state is not valid
]
```

> Please note: error is any instead of string, this is there so you can pass anything.

> Example: You can pass reference to the error node so you can scroll to specific error when clicking submit

### Usage
You need following 3 entities for using react-form, `FormContainer`, `Form` and `FormField`.

> You can combine the `Form` and `FormField` entities inside a single component if necessary.

> For this example we will create separate components for both.

##### FormContainer
You can provide initial form data in this entity. This entity should wrap all `Form` and `FormField` entities related to this form.

```javascript
// FormContainer.tsx
import React from 'react';
import { FormProvider } from '@avcs/react-form';

const FormContainer = () => {
  const [form, setForm] = useState({});
  
  return (
    <FormProvider data={form}>
      <Form />
    </FormProvider>
  );
};

export default FormContainer;
```

#### Form
You can handle your submit, reset, dirty check and global validation in this entity

```javascript
// Form.tsx
import React from 'react';
import { useFormContext } from '@avcs/react-form';

const Form = () => {
  const { formData, isFormDirty, hasErrors, errors, handleSubmit, clearForm } = useFormContext();
  
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
      {/* Form Contents */}
      <button disabled={!isFormDirty} onClick={submitForm}>Submit</input>
      <button disabled={!isFormDirty} onClick={clearForm}>Clear</button>
    </form>
  );
};

export default Form;
```

#### FormField
You can handle the state, dirty check and error management of single form field in this entity

```javascript
  import React from 'react';
  import { useFormState } from '@avcs/react-form';

  const FormField = () => {
    const [data, setData, isDirty, error] = useFormState(key, {
      // default value is applied if the key doesnt exist in the initial form
      defaultValue: 'some value',

      // validate method to validate the value
      validate: (value) => {
        if (value !== 'some value') return 'some error'
      },

      // Validates value for required on submit, if true
      required: true,

      // Message to show if the field is required and value is empty
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
