const { isValidEmail, isValidPassword } = require('./input-validation.service');

test('should validate email', () => {
    const testInputs = ['t@', '@mail', 't@mail', 'tmail', 't@.com', '@mail.com', null, undefined, ''];
   
    for (let index = 0; index < testInputs.length; index++) {
        expect(isValidEmail(testInputs[index])).toBe(false);
    }

    expect(isValidEmail('t@email.com')).toBe(true);
});

test('should validate password', () => {
    const testInputs = ['', null, undefined, 'test'];
   
    for (let index = 0; index < testInputs.length; index++) {
        expect(isValidPassword(testInputs[index])).toBe(false);
    }

    expect(isValidPassword('password')).toBe(true);
});