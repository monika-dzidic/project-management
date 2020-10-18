import './header.css';

export default class Header {
    constructor(authService) {
        this.authService = authService
        this.createHeader();

        if (this.authService.loggedIn) {
            this.createMenuIcon();
        }
    }

    createHeader() {
        this.header = document.createElement('header');
        const h1 = document.createElement('h1');
        h1.textContent = 'PManagement';
        this.header.append(h1);
        document.body.append(this.header);
    }

    createMenuIcon() {
        this.logoutHandler = this.logoutUser.bind(this);
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

    logoutUser() {
        this.authService.signOut().then(() => this.removeMenuIcon());
    }
}