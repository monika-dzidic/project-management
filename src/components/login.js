import NotifyService from '../services/notify.service';
import { clearEventListeners, toggleLoading } from '../util/dom-helper.service';
import { isValidEmail, isValidPassword } from "../util/input-validation.service";
import { NotificationTypeEnum } from '../enums/enums';

export default class Login {
    constructor(authService) {
        this.authService = authService;
        this.svgSrcs = [];
        this.emailLoginForm = null;
        this.emailButton = null;
        this.emailInput = null;
        this.passwordInput = null;
        this.loginButton = null;
        this.registerButton = null;
        this.googleButton = null;
        this.gitHubButton = null;
        this.facebookButton = null;
    }

    async getSVGs() {
        const googleSVG = import('../../assets/images/google.svg');
        const gitHubSVG = import('../../assets/images/github.svg');
        const facebookSVG = import('../../assets/images/facebook.svg');

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
        }
        this.emailButton.addEventListener('click', this.toggleLoginForm.bind(this));

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
        }
        this.googleButton.addEventListener('click', this.authService.loginWithGoogle.bind(this.authService));

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
        }
        this.gitHubButton.addEventListener('click', this.authService.loginWithGitHub.bind(this.authService));

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
        }
        this.facebookButton.addEventListener('click', this.authService.loginWithFacebook.bind(this.authService));

        this.loginButtonsContainer.insertAdjacentElement('beforeend', this.emailButton);
        this.loginButtonsContainer.insertAdjacentElement('beforeend', this.googleButton);
        this.loginButtonsContainer.insertAdjacentElement('beforeend', this.gitHubButton);
        this.loginButtonsContainer.insertAdjacentElement('beforeend', this.facebookButton);

        document.body.insertAdjacentElement('beforeend', this.loginButtonsContainer);
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
            }
            this.loginButton.addEventListener('click', this.submitForm.bind(this, 'login'));

            if (!this.registerButton) {
                this.registerButton = document.createElement('button');
                this.registerButton.id = 'register';
                this.registerButton.textContent = 'Register';
            }
            this.registerButton.addEventListener('click', this.submitForm.bind(this, 'register'));

            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('flex', 'align-center', 'justify-center');
            buttonContainer.insertAdjacentElement('afterbegin', this.loginButton);
            buttonContainer.insertAdjacentElement('beforeend', this.registerButton);

            this.emailLoginForm.insertAdjacentElement('afterbegin', this.emailInput);
            this.emailLoginForm.insertAdjacentElement('beforeend', this.passwordInput);
            this.emailLoginForm.insertAdjacentElement('beforeend', buttonContainer);

            document.body.insertAdjacentElement('beforeend', this.emailLoginForm);
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
        this.emailButton = clearEventListeners(this.emailButton);
        this.googleButton = clearEventListeners(this.googleButton);
        this.gitHubButton = clearEventListeners(this.gitHubButton);
        this.facebookButton = clearEventListeners(this.facebookButton);
        this.loginButtonsContainer.remove();
        
        if (this.loginButton) {
            this.loginButton = clearEventListeners(this.loginButton);
        }

        if (this.registerButton) {
            this.registerButton = clearEventListeners(this.registerButton);
        }

        if (this.emailLoginForm) {
            this.emailLoginForm.remove();
            this.emailLoginForm = null;
        }
    }
}