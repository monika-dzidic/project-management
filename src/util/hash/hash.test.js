const { hash } = require('./hash.service');

test('should output hashed item', () => {
  const testInputs = ['test', 'null', 1234567, 0, '2345678', null, undefined, ''];

  for (let index = 0; index < testInputs.length; index++) {
    const result = hash(testInputs[index]);
    expect(result).not.toBeNull();
    expect(result).toBeDefined();
    expect(result).not.toBe(testInputs[index]);
  }
});
