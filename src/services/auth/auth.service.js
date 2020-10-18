import * as firebase from 'firebase/app';
import NotifyService from '../notify/notify.service';
import { NotificationTypeEnum, ProviderEnum } from '../../enums/enums';
import { toggleLoading } from '../../util/dom-helper/dom-helper.service';

export default class AuthService {
    constructor() { }

    setLoginHandlerFunction(loginHandler) {
        this.loginCallback = loginHandler;
    }

    isLoggedIn() {
        return new Promise((resolve, reject) => {
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    this.loggedIn = true;
                    if (user.photoURL) {
                        this.photoURL = user.photoURL;
                    }
                } else {
                    this.loggedIn = false;
                }
                resolve(user);
            }, error => {
                reject(error);
            });
        });
    }

    handleLogin() {
        this.loggedIn = true;
        this.loginCallback(this.loggedIn);
    }

    handleError(error) {
        NotifyService.displayNotification(NotificationTypeEnum.error(), error.message)
        toggleLoading(false);
    }

    loginWithEmail(email, password) {
        toggleLoading(true);

        firebase.auth().signInWithEmailAndPassword(email, password).then(response => {
            this.photoURL = response.photoURL;
            this.handleLogin();
        }, error => {
            this.handleError(error);
        });
    }

    registerWithEmail(email, password) {
        toggleLoading(true);

        firebase.auth().createUserWithEmailAndPassword(email, password).then(response => {
            this.photoURL = response.user.photoURL;
            this.handleLogin();
        }, error => {
            this.handleError(error);
        });
    }

    loginWithProvider(providerId) {
        let provider = null;
        switch (providerId) {
            case ProviderEnum.Google(): {
                if (!this.googleProvider) {
                    this.googleProvider = new firebase.auth.GoogleAuthProvider();
                }
                provider = this.googleProvider;
                break;
            }
            case ProviderEnum.GitHub(): {
                if (!this.gitHubProvider) {
                    this.gitHubProvider = new firebase.auth.GithubAuthProvider();
                }
                provider = this.gitHubProvider;
                break;
            }
            case ProviderEnum.Facebook(): {
                if (!this.facebookProvider) {
                    this.facebookProvider = new firebase.auth.FacebookAuthProvider();
                }
                provider = this.facebookProvider;
                break;
            }
        }

        if (provider) {
            toggleLoading(true);

            firebase.auth().signInWithPopup(provider).then(response => {
                this.photoURL = response.user.photoURL;
                this.handleLogin();
            }, error => {
                this.handleError(error);
            });
        }
    }

    signOut() {
        toggleLoading(true);

        return new Promise((resolve, reject) => {
            firebase.auth().signOut().then(() => {
                this.loggedIn = false;
                this.loginCallback(this.loggedIn);
                resolve();
            }, error => {
                this.handleError(error);
                reject();
            });
        });
    }
}