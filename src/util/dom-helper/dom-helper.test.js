const { createProjectModal, toggleLoading } = require('./dom-helper.service');

test('should create modal for project with title and two inputs', () => {
    const modal1 = createProjectModal();
    expect(modal1[0].textContent).toBe('PManagement');

    expect(modal1[1]).not.toBe(undefined);
    expect(modal1[1].name).toBe('title');
    expect(modal1[1].placeholder).toBe('Title');
    expect(modal1[1].autocomplete).toBe('off');

    expect(modal1[2]).not.toBe(undefined);
    expect(modal1[2].name).toBe('content');
    expect(modal1[2].placeholder).toBe('Content');
    expect(modal1[2].autocomplete).toBe('off');

    const title = 'Test';
    const modal2 = createProjectModal(title);
    expect(modal2[0].textContent).toBe(title);
    expect(modal2.length).toBe(3);
});

test('should toggle loading', () => {
    toggleLoading(true);
    expect(document.querySelector('.overlay')).toBeDefined();
    expect(document.querySelector('.loader')).toBeDefined();

    toggleLoading(false);
    expect(document.querySelector('.overlay')).toBeNull();
    expect(document.querySelector('.loader')).toBeNull();
});
