import React, { useState, useCallback } from 'react';
import {  fireEvent, render, waitFor } from '@testing-library/react';
import { useForm, useFormState, useFormContext } from '.';
import { FormData } from './types';

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
const mockRenderCount1 = jest.fn()
const mockRenderCount2 = jest.fn()

let ChildComponent: React.FC = () => {
  mockRenderCount2()
  const formContext = useFormContext()
  mockValidateFn(formContext)

  const [dataA, setDataA] = useFormState<number>('a');
  const [dataB, setDataB, isDirtyB, error] = useFormState<number>('b', {
    validate: v => v >= 4 ? 'Error Message' : '',
    required: true,
    requiredErrorMessage: 'Required'
  });
  useFormState<number>('d');

  const incrementData = useCallback(() => {
    setDataA((v) => (v || 0) + 1);
    setDataB((v) => (v || 0) + 1);
  }, [setDataA, setDataB])

  const decrementData = useCallback(() => {
    setDataA((v) => (v || 0) - 1);
    setDataB((v) => (v || 0) - 1);
  }, [setDataA, setDataB])

  const clear = useCallback(() => {
    setDataA(('' as unknown) as number);
    setDataB(('' as unknown) as number);
  }, [setDataA, setDataB])

  return (
    <>
      <span data-testid="value-a">{dataA}</span>
      <span data-testid="value-b">{dataB}</span>
      <span data-testid="error-b">{error}</span>
      <span data-testid="dirty-b">{'' + isDirtyB}</span>
      <button data-testid="clear-b" onClick={clear}> Clear </button>

      <button data-testid="increment" onClick={incrementData}> Increment </button>
      <button data-testid="decrement" onClick={decrementData}> Decrement </button>
    </>
  )
}
ChildComponent = React.memo(ChildComponent)

const TestComponent = ({ throwError = false, renderCount = false }: { throwError?: boolean, renderCount?: boolean }) => {
  mockRenderCount1()
  const [data, setData] = useState(initialFormData);

  const [errors, setErrors] = useState<FormData>({});
  const [hasErrors, setHasErrors] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);

  const onErrorChange = useCallback(({ hasErrors, errors }) => {
    setHasErrors(hasErrors)
    setErrors(errors)
  }, [])

  const onFormChange = useCallback(({ isDirty, formData }) => {
    setIsFormDirty(isDirty)
  }, [])

  const { handleSubmit, clearForm, FormProvider } = useForm({
    formData: data,
    onErrorChange: renderCount ? undefined : onErrorChange,
    onFormChange: renderCount ? undefined : onFormChange,
  });

  const [field, setField, isFieldDirty] = useFormState<number>('c', {
    defaultValue: 0,
    provider: throwError ? undefined : FormProvider
  });

  const change = () => {
    setData({ b: 1 })
  }

  const changeC = () => {
    setField(c => c + 5)
  }

  const submit = () => {
    handleSubmit(mockSuccessFn, mockErrorFn)
  };

  return (
    <>
      <button data-testid="change" onClick={change}> Change </button>

      <button data-testid="change-c" onClick={changeC}> Change </button>
      <span data-testid="value-c">{field}</span>
      <span data-testid="dirty-c">{'' + isFieldDirty}</span>

      <span data-testid="errors">{'' + hasErrors}</span>
      <span data-testid="errors-b">{errors.b}</span>

      <span data-testid="dirty">{'' + isFormDirty}</span>
      <button data-testid="submit" onClick={submit}> Submit </button>
      <button data-testid="clear" onClick={clearForm}> Clear </button>

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
  it('Dirty workflow onChange', async () => {
    const { container } = render(<TestComponent />);
    const getElement = makeGetElement(container)

    expect(getElement('dirty')?.innerHTML).toBe('false')
    expect(getElement('dirty-b')?.innerHTML).toBe('false')
    expect(getElement('value-b')?.innerHTML).toBe('2')


    fireClick(getElement('increment'));
    expect(getElement('dirty')?.innerHTML).toBe('true')
    expect(getElement('dirty-b')?.innerHTML).toBe('true')
    expect(getElement('value-b')?.innerHTML).toBe('3')


    fireClick(getElement('change'));
    expect(getElement('dirty')?.innerHTML).toBe('false')
    expect(getElement('dirty-b')?.innerHTML).toBe('false')
    expect(getElement('value-b')?.innerHTML).toBe('1')
  });

  it('Dirty workflow onSubmit', async () => {
    const { container } = render(<TestComponent />);
    const getElement = makeGetElement(container)

    expect(getElement('dirty')?.innerHTML).toBe('false')
    expect(getElement('dirty-b')?.innerHTML).toBe('false')
    expect(getElement('value-b')?.innerHTML).toBe('2')

    fireClick(getElement('increment'))
    expect(getElement('dirty')?.innerHTML).toBe('true')
    expect(getElement('dirty-b')?.innerHTML).toBe('true')
    expect(getElement('value-b')?.innerHTML).toBe('3')


    fireClick(getElement('submit'));
    await waitFor(() => {
      expect(getElement('dirty')?.innerHTML).toBe('false')
      expect(getElement('dirty-b')?.innerHTML).toBe('false')
      expect(getElement('value-b')?.innerHTML).toBe('3')
    })
  });

  it('Dirty workflow onClear', async () => {
    const { container } = render(<TestComponent />);
    const getElement = makeGetElement(container)

    expect(getElement('dirty')?.innerHTML).toBe('false')
    expect(getElement('dirty-b')?.innerHTML).toBe('false')
    expect(getElement('value-b')?.innerHTML).toBe('2')


    fireClick(getElement('increment'));
    expect(getElement('dirty')?.innerHTML).toBe('true')
    expect(getElement('dirty-b')?.innerHTML).toBe('true')
    expect(getElement('value-b')?.innerHTML).toBe('3')

    fireClick(getElement('clear'));
    expect(getElement('dirty')?.innerHTML).toBe('false')
    expect(getElement('dirty-b')?.innerHTML).toBe('false')
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

  it('Required Error workflow', async () => {
    const { container } = render(<TestComponent />);
    const getElement = makeGetElement(container)

    fireClick(getElement('clear-b'));
    expect(getElement('value-b')?.innerHTML).toBe('')
    expect(getElement('error-b')?.innerHTML).toBe('')
    expect(getElement('errors')?.innerHTML).toBe('false')
    expect(getElement('errors-b')?.innerHTML).toBe('')

    fireClick(getElement('submit'));
    await waitFor(() => {
      expect(getElement('value-b')?.innerHTML).toBe('')
      expect(getElement('error-b')?.innerHTML).toBe('Required')
      expect(getElement('errors')?.innerHTML).toBe('true')
      expect(getElement('errors-b')?.innerHTML).toBe('Required');
    })

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
      handleSubmit: expect.any(Function),
    })

    // required error
    jest.clearAllMocks()
    fireClick(getElement('clear-b'))
    fireClick(getElement('submit'));
    await waitFor(() => {
      expect(mockSuccessFn).not.toHaveBeenCalled()
      expect(mockErrorFn).toHaveBeenCalledWith({ b: 'Required' })
    })

    // succesful submit
    jest.clearAllMocks()
    fireClick(getElement('clear'));
    fireClick(getElement('increment'));
    fireClick(getElement('submit'));
    await waitFor(async () => {
      expect(mockSuccessFn).toHaveBeenCalledWith({ a: 1, b: 3 })
      expect(mockErrorFn).not.toHaveBeenCalled()

      // validation error
      jest.clearAllMocks()
      fireClick(getElement('increment'))
      fireClick(getElement('submit'));
      await waitFor(() => {
        expect(mockSuccessFn).not.toHaveBeenCalled()
        expect(mockErrorFn).toHaveBeenCalledWith({ b: 'Error Message' })
      })
    })
  });

  it('Field without Provider', async () => {
    jest.clearAllMocks()
    const { container } = render(<TestComponent />);
    const getElement = makeGetElement(container);


    expect(getElement('value-c')?.innerHTML).toBe('0')

    fireClick(getElement('change-c'));
    expect(getElement('value-c')?.innerHTML).toBe('5')

    fireClick(getElement('submit'));
    await waitFor(() => {
      expect(mockSuccessFn).toHaveBeenCalledWith({ b: 2, c: 5 })
    })
  });

  it('Should throw error', () => {
    expect(() => render(<TestComponent throwError />)).toThrow()
  });
});

// add test cases for any faced issues so that they wont be repeated again
// these can be deleted if they are no longer applicable
describe('Known/Faced Issues', () => {
  it('Should still be dirty after 2 simultaneous changes in a field', () => {
    const { container } = render(<TestComponent />);
    const getElement = makeGetElement(container);
    expect(getElement('dirty-c')?.innerHTML).toBe('false')

    fireClick(getElement('change-c'));
    expect(getElement('value-c')?.innerHTML).toBe('5')
    expect(getElement('dirty-c')?.innerHTML).toBe('true')

    fireClick(getElement('change-c'));
    expect(getElement('value-c')?.innerHTML).toBe('10')
    expect(getElement('dirty-c')?.innerHTML).toBe('true')

    fireClick(getElement('change-c'));
    expect(getElement('value-c')?.innerHTML).toBe('15')
    expect(getElement('dirty-c')?.innerHTML).toBe('true')
    expect(getElement<HTMLButtonElement>('submit')?.disabled).toBe(false)
    expect(getElement<HTMLButtonElement>('clear')?.disabled).toBe(false)
  });

  it('Should maintain the render count 1', async () => {
    jest.clearAllMocks()
    const { container } = render(<TestComponent  renderCount/>);
    const getElement = makeGetElement(container);

    expect(mockRenderCount1).toHaveBeenCalledTimes(1)
    expect(mockRenderCount2).toHaveBeenCalledTimes(1)

    fireClick(getElement('clear-b'));
    expect(mockRenderCount1).toHaveBeenCalledTimes(1)
    expect(mockRenderCount2).toHaveBeenCalledTimes(2)

    fireClick(getElement('increment'));
    expect(mockRenderCount1).toHaveBeenCalledTimes(1)
    expect(mockRenderCount2).toHaveBeenCalledTimes(3)

    fireClick(getElement('increment'));
    expect(mockRenderCount1).toHaveBeenCalledTimes(1)
    expect(mockRenderCount2).toHaveBeenCalledTimes(4)

    fireClick(getElement('increment'));
    expect(mockRenderCount1).toHaveBeenCalledTimes(1)
    expect(mockRenderCount2).toHaveBeenCalledTimes(5)


    fireClick(getElement('increment'));
    expect(mockRenderCount1).toHaveBeenCalledTimes(1)
    expect(mockRenderCount2).toHaveBeenCalledTimes(6)

    // error case
    fireClick(getElement('submit'));
    expect(mockRenderCount1).toHaveBeenCalledTimes(1)
    expect(mockRenderCount2).toHaveBeenCalledTimes(6)

    fireClick(getElement('decrement'));
    expect(mockRenderCount1).toHaveBeenCalledTimes(1)
    expect(mockRenderCount2).toHaveBeenCalledTimes(7)

    // success case
    fireClick(getElement('submit'));
    await waitFor(() => {
      expect(mockRenderCount1).toHaveBeenCalledTimes(2)
      expect(mockRenderCount2).toHaveBeenCalledTimes(8)
    })

    fireClick(getElement('decrement'));
    expect(mockRenderCount1).toHaveBeenCalledTimes(2)
    expect(mockRenderCount2).toHaveBeenCalledTimes(9)

    fireClick(getElement('clear'));
    expect(mockRenderCount1).toHaveBeenCalledTimes(3)
    expect(mockRenderCount2).toHaveBeenCalledTimes(10)
  });

  it('Should maintain the render count 2', async () => {
    jest.clearAllMocks()
    const { container } = render(<TestComponent />);
    const getElement = makeGetElement(container);

    expect(mockRenderCount1).toHaveBeenCalledTimes(1)
    expect(mockRenderCount2).toHaveBeenCalledTimes(1)

    fireClick(getElement('clear-b'));
    // form dirty changed from false to true
    expect(mockRenderCount1).toHaveBeenCalledTimes(2)
    expect(mockRenderCount2).toHaveBeenCalledTimes(2)

    fireClick(getElement('increment'));
    expect(mockRenderCount1).toHaveBeenCalledTimes(2)
    expect(mockRenderCount2).toHaveBeenCalledTimes(3)

    fireClick(getElement('increment'));
    expect(mockRenderCount1).toHaveBeenCalledTimes(2)
    expect(mockRenderCount2).toHaveBeenCalledTimes(4)

    fireClick(getElement('increment'));
    expect(mockRenderCount1).toHaveBeenCalledTimes(2)
    expect(mockRenderCount2).toHaveBeenCalledTimes(5)

    fireClick(getElement('increment'));
    // hasError changed from false to true
    expect(mockRenderCount1).toHaveBeenCalledTimes(3)
    expect(mockRenderCount2).toHaveBeenCalledTimes(6)

    // error case
    fireClick(getElement('submit'));
    expect(mockRenderCount1).toHaveBeenCalledTimes(3)
    expect(mockRenderCount2).toHaveBeenCalledTimes(6)

    fireClick(getElement('decrement'));
    // hasError changed from true to false
    expect(mockRenderCount1).toHaveBeenCalledTimes(4)
    expect(mockRenderCount2).toHaveBeenCalledTimes(7)

    // success case
    fireClick(getElement('submit'));
    // formDirty changed from true to false
    await waitFor(() => {
      expect(mockRenderCount1).toHaveBeenCalledTimes(5)
      expect(mockRenderCount2).toHaveBeenCalledTimes(8)
    })

    fireClick(getElement('decrement'));
    // formDirty changed from false to true
    expect(mockRenderCount1).toHaveBeenCalledTimes(6)
    expect(mockRenderCount2).toHaveBeenCalledTimes(9)

    fireClick(getElement('clear'));
    // formDirty changed from true to false
    expect(mockRenderCount1).toHaveBeenCalledTimes(7)
    expect(mockRenderCount2).toHaveBeenCalledTimes(10)
  });
});
