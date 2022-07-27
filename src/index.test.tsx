import React, { useState } from 'react';
import { fireEvent, render } from '@testing-library/react';

import { FormProvider, useFormState, useFormContext } from '.';

const fireClick = (element) => fireEvent(
  element,
  new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
  }),
);

const initialFormData = { b: 2 };

const ChildComponent: React.FC = () => {
  const [data, setData, error] = useFormState<number>('b', {
    validate: v => v >= 4 ? 'Error Message' : '',
    required: true,
    requiredErrorMessage: 'Required'
  });
  const [data2, setData2] = useFormState<number>('a');

  const incrementData = () => {
    setData((v) => (v || 0) + 1);
    setData2((v) => (v || 0) + 1);
  }

  const decrementData = () => {
    setData((v) => (v || 0) - 1);
    setData2((v) => (v || 0) - 1);
  }

  const clear = () => {
    setData(('' as unknown) as number);
    setData2(('' as unknown) as number);
  }

  return (
    <>
      <span data-testid="value">{data}</span>
      <span data-testid="value2">{data2}</span>
      <span data-testid="error">{error}</span>
      <button data-testid="increment" onClick={incrementData}> Increment </button>
      <button data-testid="decrement" onClick={decrementData}> Decrement </button>
      <button data-testid="clear-field" onClick={clear}> Clear </button>
    </>
  )
}

const TestComponent = () => {
  const { isFormDirty, markFormPristine, hasErrors, errors, isFormValid } = useFormContext();

  const submit = () => {
    if (isFormValid()) {
      markFormPristine(true);
    }
  };

  const clear = () => {
    markFormPristine();
  };

  return (
    <>
      <span data-testid="errors">{'' + hasErrors}</span>
      <span data-testid="errors-b">{errors.b}</span>
      <button data-testid="submit" disabled={!isFormDirty} onClick={submit}> Submit </button>
      <button data-testid="clear" disabled={!isFormDirty} onClick={clear}> Clear </button>
      <ChildComponent />
    </>
  )
}

const WrappedTestComponent = () => {
  const [data, setData] = useState(initialFormData);
  const change = () => {
    setData({ b: 1 })
  }

  return (
    <FormProvider data={data}>
      <TestComponent />
      <button data-testid="change" onClick={change}> Change </button>
    </FormProvider>
  )
};

describe('E2E Tests', () => {
  it('Dirty workflow Change', () => {
    const { container } = render(<WrappedTestComponent />);

    expect(container.querySelector<HTMLButtonElement>('[data-testid="submit"]')?.disabled).toBe(true)
    expect(container.querySelector<HTMLButtonElement>('[data-testid="clear"]')?.disabled).toBe(true)
    expect(container.querySelector('[data-testid="value"]')?.innerHTML).toBe('2')


    fireClick(container.querySelector('[data-testid="increment"]'));
    expect(container.querySelector<HTMLButtonElement>('[data-testid="submit"]')?.disabled).toBe(false)
    expect(container.querySelector<HTMLButtonElement>('[data-testid="clear"]')?.disabled).toBe(false)
    expect(container.querySelector('[data-testid="value"]')?.innerHTML).toBe('3')


    fireClick(container.querySelector('[data-testid="change"]'));
    expect(container.querySelector<HTMLButtonElement>('[data-testid="submit"]')?.disabled).toBe(true)
    expect(container.querySelector<HTMLButtonElement>('[data-testid="clear"]')?.disabled).toBe(true)
    expect(container.querySelector('[data-testid="value"]')?.innerHTML).toBe('1')
  });

  it('Dirty workflow Submit', () => {
    const { container } = render(<WrappedTestComponent />);

    expect(container.querySelector<HTMLButtonElement>('[data-testid="submit"]')?.disabled).toBe(true)
    expect(container.querySelector<HTMLButtonElement>('[data-testid="clear"]')?.disabled).toBe(true)
    expect(container.querySelector('[data-testid="value"]')?.innerHTML).toBe('2')


    fireClick(container.querySelector('[data-testid="increment"]'));
    expect(container.querySelector<HTMLButtonElement>('[data-testid="submit"]')?.disabled).toBe(false)
    expect(container.querySelector<HTMLButtonElement>('[data-testid="clear"]')?.disabled).toBe(false)
    expect(container.querySelector('[data-testid="value"]')?.innerHTML).toBe('3')


    fireClick(container.querySelector('[data-testid="submit"]'));
    expect(container.querySelector<HTMLButtonElement>('[data-testid="submit"]')?.disabled).toBe(true)
    expect(container.querySelector<HTMLButtonElement>('[data-testid="clear"]')?.disabled).toBe(true)
    expect(container.querySelector('[data-testid="value"]')?.innerHTML).toBe('3')
  });

  it('Dirty workflow Clear', () => {
    const { container } = render(<WrappedTestComponent />);

    expect(container.querySelector<HTMLButtonElement>('[data-testid="submit"]')?.disabled).toBe(true)
    expect(container.querySelector<HTMLButtonElement>('[data-testid="clear"]')?.disabled).toBe(true)
    expect(container.querySelector('[data-testid="value"]')?.innerHTML).toBe('2')


    fireClick(container.querySelector('[data-testid="increment"]'));
    expect(container.querySelector<HTMLButtonElement>('[data-testid="submit"]')?.disabled).toBe(false)
    expect(container.querySelector<HTMLButtonElement>('[data-testid="clear"]')?.disabled).toBe(false)
    expect(container.querySelector('[data-testid="value"]')?.innerHTML).toBe('3')


    fireClick(container.querySelector('[data-testid="clear"]'));
    expect(container.querySelector<HTMLButtonElement>('[data-testid="submit"]')?.disabled).toBe(true)
    expect(container.querySelector<HTMLButtonElement>('[data-testid="clear"]')?.disabled).toBe(true)
    expect(container.querySelector('[data-testid="value"]')?.innerHTML).toBe('2')
  });

  it('Error Workflow', () => {
    const { container } = render(<WrappedTestComponent />);

    fireClick(container.querySelector('[data-testid="increment"]'));
    fireClick(container.querySelector('[data-testid="increment"]'));
    expect(container.querySelector('[data-testid="value"]')?.innerHTML).toBe('4')
    expect(container.querySelector('[data-testid="error"]')?.innerHTML).toBe('Error Message')
    expect(container.querySelector('[data-testid="errors"]')?.innerHTML).toBe('true')
    expect(container.querySelector('[data-testid="errors-b"]')?.innerHTML).toBe('Error Message')

    fireClick(container.querySelector('[data-testid="decrement"]'));
    expect(container.querySelector('[data-testid="value"]')?.innerHTML).toBe('3')
    expect(container.querySelector('[data-testid="error"]')?.innerHTML).toBe('')
    expect(container.querySelector('[data-testid="errors"]')?.innerHTML).toBe('false')
    expect(container.querySelector('[data-testid="errors-b"]')?.innerHTML).toBe('')
  });

  it('Required Error workflow', () => {
    const { container } = render(<WrappedTestComponent />);

    fireClick(container.querySelector('[data-testid="clear-field"]'));
    expect(container.querySelector('[data-testid="value"]')?.innerHTML).toBe('')
    expect(container.querySelector('[data-testid="error"]')?.innerHTML).toBe('')
    expect(container.querySelector('[data-testid="errors"]')?.innerHTML).toBe('false')
    expect(container.querySelector('[data-testid="errors-b"]')?.innerHTML).toBe('')


    fireClick(container.querySelector('[data-testid="submit"]'));
    expect(container.querySelector('[data-testid="value"]')?.innerHTML).toBe('')
    expect(container.querySelector('[data-testid="error"]')?.innerHTML).toBe('Required')
    expect(container.querySelector('[data-testid="errors"]')?.innerHTML).toBe('true')
    expect(container.querySelector('[data-testid="errors-b"]')?.innerHTML).toBe('Required');


    fireClick(container.querySelector('[data-testid="increment"]'));
    expect(container.querySelector('[data-testid="value"]')?.innerHTML).toBe('1')
    expect(container.querySelector('[data-testid="error"]')?.innerHTML).toBe('')
    expect(container.querySelector('[data-testid="errors"]')?.innerHTML).toBe('false')
    expect(container.querySelector('[data-testid="errors-b"]')?.innerHTML).toBe('')

    fireClick(container.querySelector('[data-testid="clear-field"]'));
    expect(container.querySelector('[data-testid="value"]')?.innerHTML).toBe('')
    expect(container.querySelector('[data-testid="error"]')?.innerHTML).toBe('Required')
    expect(container.querySelector('[data-testid="errors"]')?.innerHTML).toBe('true')
    expect(container.querySelector('[data-testid="errors-b"]')?.innerHTML).toBe('Required');
  });
});
