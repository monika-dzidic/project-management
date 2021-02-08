exports.createInputElement = (name) => {
    const input = document.createElement('input');
    input.id = name;
    input.name = name;
    input.placeholder = name[0].toUpperCase() + name.substring(1);
    input.autocomplete = 'off';
    if (name === 'email') input.type = 'email';
    else if (name === 'password') input.type = 'password';
    return input;
}

exports.createButtonElement = (name) => {
    const button = document.createElement('button');
    button.id = name;
    button.name = name;
    button.textContent = name.toUpperCase();
    return button;
}

exports.toggleLoading = (loading) => {
    if (loading) {
        const loadingBar = document.createElement('div');
        loadingBar.classList.add('loader');
        toggleOverlay(loading, { component: loadingBar })
    } else {
        const loadingBar = document.querySelector('.loader');
        if (loadingBar) loadingBar.remove();
        toggleOverlay(loading)
    }
}

const backdropClickHandler = (_, child) => {
    if (child && child.target.className == 'overlay') {
        toggleOverlay(false, { component: child, backdropClick: true })
    }
}

const toggleOverlay = (loading, options = undefined) => {
    if (loading) {
        document.body.style.overflow = 'hidden';
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        if (options && options.backdropClick) overlay.addEventListener('click', backdropClickHandler.bind(this, options.component))
        if (options && options.component) overlay.append(options.component);
        document.body.append(overlay);
    } else {
        document.body.style.overflow = '';
        const overlays = document.querySelectorAll('.overlay');
        if (options && options.backdropClick) overlays[overlays.length - 1].removeEventListener('click', backdropClickHandler)
        if (overlays.length) overlays[overlays.length - 1].remove();
    }
};

exports.toggleOverlay = toggleOverlay; 