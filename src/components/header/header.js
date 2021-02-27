import AuthService from '../../services/auth/auth.service';

const headerTemplate = `
<style>
header {
    background-color: var(--dark-primary);
    color: var(--text-primary);
    padding: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

img#menu {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
}

#logout {
    font-size: 2rem;
}
</style>
<h1>PManagement</h1>
`;

export default class Header extends HTMLElement {
  constructor() {
    super();
    this.authService = new AuthService(this.createMenuIcon.bind(this));
  }

  connectedCallback() {
    this._render();
  }

  _render() {
    const header = document.createElement('header');
    header.innerHTML = headerTemplate;
    this.append(header);
  }

  createMenuIcon(isLoggedIn) {
    if (!this.logoutHandler) this.logoutHandler = this.authService.signOut.bind(this);
    if (isLoggedIn) {
      this.authService.photoURL ? this.createUserIcon() : this.createLogoutButton();
    } else {
      this.removeMenuIcon();
    }
  }

  createUserIcon() {
    this.userIcon = document.createElement('img');
    this.userIcon.id = 'menu';
    this.userIcon.src = this.authService.photoURL;
    this.userIcon.addEventListener('click', this.logoutHandler);
    this.querySelector('header').append(this.userIcon);
  }

  createLogoutButton() {
    this.logoutButton = document.createElement('span');
    this.logoutButton.id = 'logout';
    this.logoutButton.classList.add('material-icons');
    this.logoutButton.innerText = 'exit_to_app';
    this.logoutButton.addEventListener('click', this.logoutHandler);
    this.querySelector('header').append(this.logoutButton);
  }

  removeMenuIcon() {
    if (this.userIcon) {
      this.userIcon.removeEventListener('click', this.logoutHandler);
      this.userIcon.remove();
      this.userIcon = null;
    }

    if (this.logoutButton) {
      this.logoutButton.removeEventListener('click', this.logoutHandler);
      this.logoutButton.remove();
      this.logoutButton = null;
    }
  }
}
