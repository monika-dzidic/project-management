import AuthService from '../../services/auth/auth.service';
import './header.css';

export default class Header {
    constructor() {
        this.authService = new AuthService(this.createMenuIcon.bind(this));
    }

    createHeader() {
        this.header = document.createElement('header');
        const h1 = document.createElement('h1');
        h1.textContent = 'PManagement';
        this.header.append(h1);
        document.body.append(this.header);
    }

    createMenuIcon(isLoggedIn) {
        if (!this.logoutHandler) {
            this.logoutHandler = this.authService.signOut.bind(this);
        }
        if (isLoggedIn) {
            if (this.authService.photoURL) {
                this.createUserIcon();
            } else {
                this.createLogoutButton();
            }
        } else {
            this.removeMenuIcon();
        }
    }

    createUserIcon() {
        this.userIcon = document.createElement('img');
        this.userIcon.id = 'menu';
        this.userIcon.src = this.authService.photoURL;
        this.userIcon.addEventListener('click', this.logoutHandler);
        this.header.append(this.userIcon);
    }

    createLogoutButton() {
        this.logoutButton = document.createElement('span');
        this.logoutButton.id = 'logout';
        this.logoutButton.classList.add('material-icons');
        this.logoutButton.innerText = 'exit_to_app';
        this.logoutButton.addEventListener('click', this.logoutHandler);
        this.header.append(this.logoutButton);
    }

    removeMenuIcon() {
        if (this.userIcon) {
            this.userIcon.removeEventListener('click', this.logoutHandler)
            this.userIcon.remove();
            this.userIcon = null;
        }

        if (this.logoutButton) {
            this.logoutButton.removeEventListener('click', this.logoutHandler)
            this.logoutButton.remove();
            this.logoutButton = null;
        }
    }
}