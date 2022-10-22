import React, { useState } from 'react';
import { fireEvent, render } from '@testing-library/react';
import { useForm, useFormState, useFormContext } from '.';

const fireClick = (element) => fireEvent(
  element,
  new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
  }),
);

const initialFormData = { b: 2 };
const mockSuccessFn = jest.fn()
const mockErrorFn = jest.fn()
const mockValidateFn = jest.fn()

const ChildComponent: React.FC = () => {
  const formContext = useFormContext()
  mockValidateFn(formContext)

  const [dataA, setDataA] = useFormState<number>('a');
  const [dataB, setDataB, , error] = useFormState<number>('b', {
    validate: v => v >= 4 ? 'Error Message' : '',
    required: true,
    requiredErrorMessage: 'Required'
  });

  const incrementData = () => {
    setDataA((v) => (v || 0) + 1);
    setDataB((v) => (v || 0) + 1);
  }

  const decrementData = () => {
    setDataA((v) => (v || 0) - 1);
    setDataB((v) => (v || 0) - 1);
  }

  const clear = () => {
    setDataA(('' as unknown) as number);
    setDataB(('' as unknown) as number);
  }

  return (
    <>
      <span data-testid="value-a">{dataA}</span>

      <span data-testid="value-b">{dataB}</span>
      <span data-testid="error-b">{error}</span>
      <button data-testid="clear-b" onClick={clear}> Clear </button>

      <button data-testid="increment" onClick={incrementData}> Increment </button>
      <button data-testid="decrement" onClick={decrementData}> Decrement </button>
    </>
  )
}

const TestComponent = ({ throwError = false }: { throwError?: boolean }) => {
  const [data, setData] = useState(initialFormData);
  const { isFormDirty, hasErrors, errors, handleSubmit, clearForm, FormProvider } = useForm(data);

  const [field, setField] = useFormState<number>('c', {
    defaultValue: 0,
    provider: throwError ? undefined : FormProvider
  });

  const change = () => {
    setData({ b: 1 })
  }

  const changeC = () => {
    setField(5)
  }

  const submit = () => {
    handleSubmit(mockSuccessFn, mockErrorFn)
  };

  return (
    <>
      <button data-testid="change" onClick={change}> Change </button>

      <button data-testid="change-c" onClick={changeC}> Change </button>
      <span data-testid="value-c">{field}</span>

      <span data-testid="errors">{'' + hasErrors}</span>
      <span data-testid="errors-b">{errors.b}</span>

      <button data-testid="submit" disabled={!isFormDirty} onClick={submit}> Submit </button>
      <button data-testid="clear" disabled={!isFormDirty} onClick={clearForm}> Clear </button>

      <FormProvider>
        <ChildComponent />
      </FormProvider>
    </>
  )
}

const makeGetElement = (container: HTMLElement) => {
  return function <T extends HTMLElement>(testId: string): T | null {
    return container.querySelector<T>(`[data-testid="${testId}"]`);
  }
}

describe('E2E Tests', () => {
  it('Dirty workflow onChange', () => {
    const { container } = render(<TestComponent />);
    const getElement = makeGetElement(container)

    expect(getElement<HTMLButtonElement>('submit')?.disabled).toBe(true)
    expect(getElement<HTMLButtonElement>('clear')?.disabled).toBe(true)
    expect(getElement('value-b')?.innerHTML).toBe('2')


    fireClick(getElement('increment'));
    expect(getElement<HTMLButtonElement>('submit')?.disabled).toBe(false)
    expect(getElement<HTMLButtonElement>('clear')?.disabled).toBe(false)
    expect(getElement('value-b')?.innerHTML).toBe('3')


    fireClick(getElement('change'));
    expect(getElement<HTMLButtonElement>('submit')?.disabled).toBe(true)
    expect(getElement<HTMLButtonElement>('clear')?.disabled).toBe(true)
    expect(getElement('value-b')?.innerHTML).toBe('1')
  });

  it('Dirty workflow onSubmit', () => {
    const { container } = render(<TestComponent />);
    const getElement = makeGetElement(container)

    expect(getElement<HTMLButtonElement>('submit')?.disabled).toBe(true)
    expect(getElement<HTMLButtonElement>('clear')?.disabled).toBe(true)
    expect(getElement('value-b')?.innerHTML).toBe('2')

    fireClick(getElement('increment'));
    expect(getElement<HTMLButtonElement>('submit')?.disabled).toBe(false)
    expect(getElement<HTMLButtonElement>('clear')?.disabled).toBe(false)
    expect(getElement('value-b')?.innerHTML).toBe('3')


    fireClick(getElement('submit'));
    expect(getElement<HTMLButtonElement>('submit')?.disabled).toBe(true)
    expect(getElement<HTMLButtonElement>('clear')?.disabled).toBe(true)
    expect(getElement('value-b')?.innerHTML).toBe('3')
  });

  it('Dirty workflow onClear', () => {
    const { container } = render(<TestComponent />);
    const getElement = makeGetElement(container)

    expect(getElement<HTMLButtonElement>('submit')?.disabled).toBe(true)
    expect(getElement<HTMLButtonElement>('clear')?.disabled).toBe(true)
    expect(getElement('value-b')?.innerHTML).toBe('2')


    fireClick(getElement('increment'));
    expect(getElement<HTMLButtonElement>('submit')?.disabled).toBe(false)
    expect(getElement<HTMLButtonElement>('clear')?.disabled).toBe(false)
    expect(getElement('value-b')?.innerHTML).toBe('3')


    fireClick(getElement('clear'));
    expect(getElement<HTMLButtonElement>('submit')?.disabled).toBe(true)
    expect(getElement<HTMLButtonElement>('clear')?.disabled).toBe(true)
    expect(getElement('value-b')?.innerHTML).toBe('2')
  });

  it('Validation Error Workflow', () => {
    const { container } = render(<TestComponent />);
    const getElement = makeGetElement(container)

    fireClick(getElement('increment'));
    fireClick(getElement('increment'));
    expect(getElement('value-b')?.innerHTML).toBe('4')
    expect(getElement('error-b')?.innerHTML).toBe('Error Message')
    expect(getElement('errors')?.innerHTML).toBe('true')
    expect(getElement('errors-b')?.innerHTML).toBe('Error Message')

    fireClick(getElement('decrement'));
    expect(getElement('value-b')?.innerHTML).toBe('3')
    expect(getElement('error-b')?.innerHTML).toBe('')
    expect(getElement('errors')?.innerHTML).toBe('false')
    expect(getElement('errors-b')?.innerHTML).toBe('')
  });

  it('Required Error workflow', () => {
    const { container } = render(<TestComponent />);
    const getElement = makeGetElement(container)

    fireClick(getElement('clear-b'));
    expect(getElement('value-b')?.innerHTML).toBe('')
    expect(getElement('error-b')?.innerHTML).toBe('')
    expect(getElement('errors')?.innerHTML).toBe('false')
    expect(getElement('errors-b')?.innerHTML).toBe('')

    fireClick(getElement('submit'));
    expect(getElement('value-b')?.innerHTML).toBe('')
    expect(getElement('error-b')?.innerHTML).toBe('Required')
    expect(getElement('errors')?.innerHTML).toBe('true')
    expect(getElement('errors-b')?.innerHTML).toBe('Required');

    fireClick(getElement('increment'));
    expect(getElement('value-b')?.innerHTML).toBe('1')
    expect(getElement('error-b')?.innerHTML).toBe('')
    expect(getElement('errors')?.innerHTML).toBe('false')
    expect(getElement('errors-b')?.innerHTML).toBe('')

    fireClick(getElement('clear-b'));
    expect(getElement('value-b')?.innerHTML).toBe('')
    expect(getElement('error-b')?.innerHTML).toBe('Required')
    expect(getElement('errors')?.innerHTML).toBe('true')
    expect(getElement('errors-b')?.innerHTML).toBe('Required');
  });

  it('Submit, Error and Context workflows', async () => {
    jest.clearAllMocks()
    const { container } = render(<TestComponent />);
    const getElement = makeGetElement(container);
    expect(mockValidateFn).toHaveBeenCalledWith({
      clearForm: expect.any(Function),
      errors: {},
      formData: { b: 2 },
      handleSubmit: expect.any(Function),
      hasErrors: false,
      isFormDirty: false,
    })

    // required error
    jest.clearAllMocks()
    fireClick(getElement('clear-b'))
    fireClick(getElement('submit'));
    expect(mockSuccessFn).not.toHaveBeenCalled()
    expect(mockErrorFn).toHaveBeenCalledWith({ b: 'Required' })

    // succesful submit
    jest.clearAllMocks()
    fireClick(getElement('clear'));
    fireClick(getElement('increment'));
    fireClick(getElement('submit'));
    expect(mockSuccessFn).toHaveBeenCalledWith({ a: 1, b: 3 })
    expect(mockErrorFn).not.toHaveBeenCalled()

    // validation error
    jest.clearAllMocks()
    fireClick(getElement('increment'));
    fireClick(getElement('submit'));
    expect(mockSuccessFn).not.toHaveBeenCalled()
    expect(mockErrorFn).toHaveBeenCalledWith({ b: 'Error Message' })
  });

  it('Field without Provider', () => {
    jest.clearAllMocks()
    const { container } = render(<TestComponent />);
    const getElement = makeGetElement(container);


    expect(getElement('value-c')?.innerHTML).toBe('0')

    fireClick(getElement('change-c'));
    expect(getElement('value-c')?.innerHTML).toBe('5')

    fireClick(getElement('submit'));
    expect(mockSuccessFn).toHaveBeenCalledWith({ b: 2, c: 5 })
  });

  it('Should throw error', () => {
    expect(() => render(<TestComponent throwError />)).toThrow()
  });
});
