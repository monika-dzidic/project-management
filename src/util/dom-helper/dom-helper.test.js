const { createInputElement, createButtonElement, toggleLoading } = require('./dom-helper.service');

test('should create HTML input with attributes', () => {
  const testInputs = ['test', 'email', 'password'];
  testInputs.forEach((test) => {
    const input = createInputElement(test);
    expect(input).toBeDefined();
    expect(input instanceof HTMLInputElement).toBe(true);
    expect(input.id).toBe(test);
    expect(input.name).toBe(test);
    expect(input.placeholder).toBe(test[0].toUpperCase() + test.substring(1));
    expect(input.autocomplete).toBe('off');
    if (test === 'password' || test === 'email') expect(input.type).toBeDefined();
    else expect(input.type).toBe('text');
  });
});

test('should create HTML button with attributes', () => {
  const testInputs = ['test'];
  testInputs.forEach((test) => {
    const button = createButtonElement(test);
    expect(button).toBeDefined();
    expect(button instanceof HTMLButtonElement).toBe(true);
    expect(button.id).toBe(test);
    expect(button.name).toBe(test);
    expect(button.textContent).toBe(test.toUpperCase());
  });
});

test('should toggle loading', () => {
  toggleLoading(true);
  expect(document.querySelector('.overlay')).toBeDefined();
  expect(document.querySelector('.loader')).toBeDefined();

  toggleLoading(false);
  expect(document.querySelector('.overlay')).toBeNull();
  expect(document.querySelector('.loader')).toBeNull();
});
