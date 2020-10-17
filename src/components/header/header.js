import './header.css';

import { clearEventListeners } from '../../util/dom-helper/dom-helper.service';

export default class Header {
    constructor(authService) {
        this.authService = authService
        this.header = null;
        this.userIcon = null;
        this.logoutButton = null; 

        this.createHeader();

        if (this.authService.loggedIn) {
            this.createMenuIcon();
        }
    }

    createHeader() {
        this.header = document.createElement('header');

        const h1 = document.createElement('h1');
        h1.textContent = 'PManagement';

        this.header.insertAdjacentElement('afterbegin', h1);
        document.body.insertAdjacentElement('afterbegin', this.header);
    }

    createMenuIcon() {
        if (this.authService.photoURL) {
            this.createUserIcon();
        } else {
            this.createLogoutButton();
        }
    }

    createUserIcon() {
        this.userIcon = document.createElement('img');
        this.userIcon.id = 'menu';
        this.userIcon.src = this.authService.photoURL;
        this.userIcon.addEventListener('click', this.logoutUser.bind(this));

        this.header.insertAdjacentElement('beforeend', this.userIcon);
    }

    createLogoutButton() {
        this.logoutButton = document.createElement('span');
        this.logoutButton.id = 'logout';
        this.logoutButton.classList.add('material-icons');
        this.logoutButton.innerText = 'exit_to_app';
        this.logoutButton.addEventListener('click', this.logoutUser.bind(this));

        this.header.insertAdjacentElement('beforeend', this.logoutButton);
    }

    removeMenuIcon() {
        if (this.userIcon) {
            this.userIcon = clearEventListeners(this.userIcon);
            this.userIcon.remove();
            this.userIcon = null;
        }

        if (this.logoutButton) {
            this.logoutButton = clearEventListeners(this.logoutButton);
            this.logoutButton.remove();
            this.logoutButton = null;
        }
    }

    logoutUser() {
        this.authService.signOut().then(() => this.removeMenuIcon());
    }
}