# react-form
A context based react form. Supports Dirty check, validation, reset and save functionalities of form

### Installation
```
 npm i --save @avcs/react-form
```

### Usage
You need following 3 entities for using react-form, `FormContainer`, `Form` and `FormField`.

> You can combine the `Form` and `FormField` entities inside a single component if necessary.
> For this example we will create separate components for both.

##### FormContainer
You can provide initial form data in this entity. This entity should wrap all `Form` and `FormField` entities related to this form.

```
// FormContainer.tsx
 import { FormProvider } from '@avcs/react-form';

const FormContainer = () => {
  const [form, setForm] = useState({});
  
  return (
    <FormProvider data={form}>
      <Form />
    </FormProvider>
  );
};

```

#### Form
You can handle your submit, reset, dirty check and global validation in this entity
