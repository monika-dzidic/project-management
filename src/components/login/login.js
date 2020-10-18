import './login.css';

import NotifyService from '../../services/notify/notify.service';
import { toggleLoading } from '../../util/dom-helper/dom-helper.service';
import { isValidEmail, isValidPassword } from "../../util/input-validation/input-validation.service";
import { NotificationTypeEnum, ProviderEnum } from '../../enums/enums';

export default class Login {
    constructor(authService) {
        this.authService = authService;
    }

    async getSVGs() {
        const googleSVG = import('../../../assets/images/google.svg');
        const gitHubSVG = import('../../../assets/images/github.svg');
        const facebookSVG = import('../../../assets/images/facebook.svg');

        await Promise.all([googleSVG, gitHubSVG, facebookSVG]).then(svgs => {
            this.svgSrcs = svgs.map(s => s.default);
            this.createLoginButtons();
        });
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
            this.emailButton.classList.add('social-login');
            this.emailButton.innerText = 'Login with Email';
            this.emailButton.insertAdjacentHTML('afterbegin', '<span class="material-icons">email</span>');
            this.toggleLoginFormHandler = this.toggleLoginForm.bind(this);
        }
        this.emailButton.addEventListener('click', this.toggleLoginFormHandler);

        /*google login*/
        if (!this.googleButton) {
            this.googleButton = document.createElement('button');
            this.googleButton.id = 'google';
            this.googleButton.classList.add('social-login');
            this.googleButton.innerText = 'Login with Google';
            const googleSVG = document.createElement('img');
            googleSVG.src = this.svgSrcs[0];
            googleSVG.alt = 'Login with Google';
            this.googleButton.insertAdjacentElement('afterbegin', googleSVG);
            this.loginWithGoogleHandler = this.authService.loginWithProvider.bind(this.authService, ProviderEnum.Google());
        }
        this.googleButton.addEventListener('click', this.loginWithGoogleHandler);

        /*github login*/
        if (!this.gitHubButton) {
            this.gitHubButton = document.createElement('button');
            this.gitHubButton.id = 'github';
            this.gitHubButton.classList.add('social-login');
            this.gitHubButton.innerText = 'Login with GitHub';
            const gitHubSVG = document.createElement('img');
            gitHubSVG.src = this.svgSrcs[1];
            gitHubSVG.alt = 'Login with GitHub';
            this.gitHubButton.insertAdjacentElement('afterbegin', gitHubSVG);
            this.loginWithGitHubHandler = this.authService.loginWithProvider.bind(this.authService, ProviderEnum.GitHub());
        }
        this.gitHubButton.addEventListener('click', this.loginWithGitHubHandler);

        /*facebook login*/
        if (!this.facebookButton) {
            this.facebookButton = document.createElement('button');
            this.facebookButton.id = 'facebook';
            this.facebookButton.classList.add('social-login');
            this.facebookButton.innerText = 'Login with Facebook';
            const facebookSVG = document.createElement('img');
            facebookSVG.src = this.svgSrcs[2];
            facebookSVG.alt = 'Login with Facebook';
            this.facebookButton.insertAdjacentElement('afterbegin', facebookSVG);
            this.loginWithFacebookHandler = this.authService.loginWithProvider.bind(this.authService, ProviderEnum.Facebook());
        }
        this.facebookButton.addEventListener('click', this.loginWithFacebookHandler);

        this.loginButtonsContainer.append(this.emailButton);
        this.loginButtonsContainer.append(this.googleButton);
        this.loginButtonsContainer.append(this.gitHubButton);
        this.loginButtonsContainer.append(this.facebookButton);

        document.body.append(this.loginButtonsContainer);
        toggleLoading(false);
    }

    toggleLoginForm() {
        if (this.emailLoginForm) {
            document.getElementById(`${this.emailLoginForm.id}`).remove();
            this.emailLoginForm = null;
        } else {
            this.emailLoginForm = document.createElement('div');
            this.emailLoginForm.id = 'login-form';

            if (!this.emailInput) {
                this.emailInput = document.createElement('input');
                this.emailInput.id = 'email';
                this.emailInput.type = 'email';
                this.emailInput.placeholder = 'Email';
            }

            if (!this.passwordInput) {
                this.passwordInput = document.createElement('input');
                this.passwordInput.id = 'password';
                this.passwordInput.type = 'password';
                this.passwordInput.placeholder = 'Password';
            }

            if (!this.loginButton) {
                this.loginButton = document.createElement('button');
                this.loginButton.id = 'login';
                this.loginButton.textContent = 'Login';
                this.loginFormHandler = this.submitForm.bind(this, 'login');
            }
            this.loginButton.addEventListener('click', this.loginFormHandler);

            if (!this.registerButton) {
                this.registerButton = document.createElement('button');
                this.registerButton.id = 'register';
                this.registerButton.textContent = 'Register';
                this.registerFormHandler = this.submitForm.bind(this, 'register');
            }
            this.registerButton.addEventListener('click', this.registerFormHandler);

            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('flex', 'align-center', 'justify-center');
            buttonContainer.append(this.loginButton);
            buttonContainer.append(this.registerButton);

            this.emailLoginForm.append(this.emailInput);
            this.emailLoginForm.append(this.passwordInput);
            this.emailLoginForm.append(buttonContainer);

            document.body.append(this.emailLoginForm);
        }
    }

    submitForm(type) {
        if (!isValidEmail(this.emailInput.value)) {
            NotifyService.displayNotification(NotificationTypeEnum.error(), 'Invalid email');
            return;
        }

        if (!isValidPassword(this.passwordInput.value)) {
            NotifyService.displayNotification(NotificationTypeEnum.error(), 'Password is required, at least 5 characters');
            return;
        }

        if (type == 'login') {
            this.authService.loginWithEmail(this.emailInput.value, this.passwordInput.value);
        } else if (type == 'register') {
            this.authService.registerWithEmail(this.emailInput.value, this.passwordInput.value);
        }
    }

    removeLoginButtons() {
        this.emailButton.removeEventListener('click', this.toggleLoginFormHandler);
        this.googleButton.removeEventListener('click', this.loginWithGoogleHandler);
        this.gitHubButton.removeEventListener('click', this.loginWithGitHubHandler);
        this.facebookButton.removeEventListener('click', this.loginWithFacebookHandler);
        this.loginButtonsContainer.remove();

        if (this.loginButton) {
            this.loginButton.removeEventListener('click', this.loginFormHandler);
        }

        if (this.registerButton) {
            this.registerButton.removeEventListener('click', this.registerFormHandler);
        }

        if (this.emailLoginForm) {
            this.emailLoginForm.remove();
            this.emailLoginForm = null;
        }
    }
}