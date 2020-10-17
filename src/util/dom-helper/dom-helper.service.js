export function clearEventListeners(element) {
    const clonedElement = element.cloneNode(true);
    element.replaceWith(clonedElement);
    return clonedElement;
}

export function insertElement(element, destination) {
    destination.append(element);
    element.scrollIntoView({ behavior: 'smooth' });
}

export function createProjectModal(title) {
    const h2 = document.createElement('h2');
    if (title) {
        h2.textContent = title;
    } else {
        h2.textContent = 'PManagement';
    }

    const titleInput = document.createElement('input');
    titleInput.name = 'title';
    titleInput.placeholder = 'Title';
    titleInput.autocomplete = 'off';

    const contentInput = document.createElement('input');
    contentInput.name = 'content';
    contentInput.placeholder = 'Content';
    contentInput.autocomplete = 'off';

    return [h2, titleInput, contentInput];
}

export function toggleLoading(loading) {
    if (loading) {
        document.body.style.pointerEvents = 'none';
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        const loadingBar = document.createElement('div');
        loadingBar.classList.add('loader');
        document.body.insertAdjacentElement('afterbegin', overlay);
        overlay.insertAdjacentElement('afterbegin', loadingBar);
    } else {
        document.body.style.pointerEvents = '';
        const loadingBar = document.querySelector('.loader');
        if (loadingBar) {
            loadingBar.remove();
        }

        const overlay = document.querySelector('.overlay');
        if (overlay) {
            overlay.remove();
        }
    }
}