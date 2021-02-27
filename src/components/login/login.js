import './login.css';

import NotifyService from '../../services/notify/notify.service';
import AuthService from '../../services/auth/auth.service';
import ModalService from '../../services/modal/modal.service';
import { createButtonElement, createInputElement, toggleLoading } from '../../util/dom-helper/dom-helper.service';
import { EventTypeEnum, NotificationTypeEnum, ProviderEnum } from '../../enums/enums';

class Login {
    constructor() {
        this.authService = new AuthService(this.handleButtons.bind(this));
        this.svgSrcs = new Map();
    }

    async getSVGs() {
        const googleSVG = import('../../../assets/images/google.svg');
        const gitHubSVG = import('../../../assets/images/github.svg');
        const facebookSVG = import('../../../assets/images/facebook.svg');

        return await Promise.all([googleSVG, gitHubSVG, facebookSVG]).then(svgs => {
            this.svgSrcs.set(ProviderEnum.Google, svgs[0].default);
            this.svgSrcs.set(ProviderEnum.GitHub, svgs[1].default);
            this.svgSrcs.set(ProviderEnum.Facebook, svgs[2].default);
        });
    }

    async handleButtons(loggedIn) {
        if (!this.svgSrcs.size) await this.getSVGs();
        loggedIn ? this.removeLoginButtons() : this.createLoginButtons();
    }

    createLoginButtons() {
        if (!this.loginButtonsContainer) {
            this.loginButtonsContainer = document.createElement('div');
            this.loginButtonsContainer.id = 'login-container';
        }

        /*email login*/
        if (!this.emailButton) {
            this.emailButton = document.createElement('button');
            this.emailButton.id = 'email';
            this.emailButton.classList.add('btn-accent', 'social-login');
            this.emailButton.innerText = 'Login with Email';
            this.emailButton.insertAdjacentHTML('afterbegin', '<span class="material-icons">email</span>');
            this.toggleLoginFormHandler = this.openModal.bind(this)
        }
        this.emailButton.addEventListener('click', this.toggleLoginFormHandler);

        /*google login*/
        if (!this.googleButton) {
            this.googleButton = document.createElement('button');
            this.googleButton.id = 'google';
            this.googleButton.classList.add('btn-accent', 'social-login');
            this.googleButton.innerText = 'Login with Google';
            const googleSVG = document.createElement('img');
            googleSVG.src = this.svgSrcs.get(ProviderEnum.Google);
            googleSVG.alt = 'Google';
            googleSVG.style.height = '1.5625rem';
            googleSVG.style.width = '1.5625rem';
            this.googleButton.insertAdjacentElement('afterbegin', googleSVG);
            this.loginWithGoogleHandler = this.authService.loginWithProvider.bind(this.authService, ProviderEnum.Google);
        }
        this.googleButton.addEventListener('click', this.loginWithGoogleHandler);

        /*github login*/
        if (!this.gitHubButton) {
            this.gitHubButton = document.createElement('button');
            this.gitHubButton.id = 'github';
            this.gitHubButton.classList.add('btn-accent', 'social-login');
            this.gitHubButton.innerText = 'Login with GitHub';
            const gitHubSVG = document.createElement('img');
            gitHubSVG.src = this.svgSrcs.get(ProviderEnum.GitHub);
            gitHubSVG.alt = 'Login with GitHub';
            gitHubSVG.style.height = '1.5625rem';
            gitHubSVG.style.width = '1.5625rem';
            this.gitHubButton.insertAdjacentElement('afterbegin', gitHubSVG);
            this.loginWithGitHubHandler = this.authService.loginWithProvider.bind(this.authService, ProviderEnum.GitHub);
        }
        this.gitHubButton.addEventListener('click', this.loginWithGitHubHandler);

        /*facebook login*/
        if (!this.facebookButton) {
            this.facebookButton = document.createElement('button');
            this.facebookButton.id = 'facebook';
            this.facebookButton.classList.add('btn-accent', 'social-login');
            this.facebookButton.innerText = 'Login with Facebook';
            const facebookSVG = document.createElement('img');
            facebookSVG.src = this.svgSrcs.get(ProviderEnum.Facebook);
            facebookSVG.alt = 'Login with Facebook';
            facebookSVG.style.height = '1.5625rem';
            facebookSVG.style.width = '1.5625rem';
            this.facebookButton.insertAdjacentElement('afterbegin', facebookSVG);
            this.loginWithFacebookHandler = this.authService.loginWithProvider.bind(this.authService, ProviderEnum.Facebook);
        }
        this.facebookButton.addEventListener('click', this.loginWithFacebookHandler);

        this.loginButtonsContainer.append(this.emailButton);
        this.loginButtonsContainer.append(this.googleButton);
        this.loginButtonsContainer.append(this.gitHubButton);
        this.loginButtonsContainer.append(this.facebookButton);

        document.body.querySelector('app-header').insertAdjacentElement('afterend', this.loginButtonsContainer);
        toggleLoading(false);
    }

    openModal() {
        const email = createInputElement('email');

        const password = createInputElement('password');

        const loginButton = createButtonElement('login');
        loginButton.setAttribute('actionType', EventTypeEnum.confirm)
        loginButton.setAttribute('isNewUserEvent', false)
        loginButton.classList.add('btn-accent')

        const registerButton = createButtonElement('register');
        registerButton.setAttribute('actionType', EventTypeEnum.confirm)
        registerButton.setAttribute('isNewUserEvent', true)
        registerButton.classList.add('btn-accent')

        ModalService.open(
            'PManagement',
            `<div slot="content">
                ${email.outerHTML}
                ${password.outerHTML}
            </div>
            <div slot="actions">
                ${loginButton.outerHTML}
                ${registerButton.outerHTML}
            </div>
            `, this.submitForm.bind(this));
    }

    submitForm(event) {
        const email = event.detail.inputs[0].value.trim();
        if (!email.length || !/\S+@\S+\.\S+/.test(email)) {
            NotifyService.displayNotification(NotificationTypeEnum.error, 'Invalid email');
            return;
        }

        const password = event.detail.inputs[1].value.trim();
        if (!password.length || password.length < 5) {
            NotifyService.displayNotification(NotificationTypeEnum.error, 'Password is required, at least 5 characters');
            return;
        }

        if (event.detail.target.attributes.isNewUserEvent.value == "true") {
            this.authService.registerWithEmail(email, password).then(() => ModalService.hide());
        } else {
            this.authService.loginWithEmail(email, password).then(() => ModalService.hide());
        }
    }

    removeLoginButtons() {
        this.emailButton.removeEventListener('click', this.toggleLoginFormHandler);
        this.googleButton.removeEventListener('click', this.loginWithGoogleHandler);
        this.gitHubButton.removeEventListener('click', this.loginWithGitHubHandler);
        this.facebookButton.removeEventListener('click', this.loginWithFacebookHandler);
        this.loginButtonsContainer.remove();

        if (this.loginButton) this.loginButton.removeEventListener('click', this.loginFormHandler);

        if (this.registerButton) this.registerButton.removeEventListener('click', this.registerFormHandler);
    }
}

export { Login }