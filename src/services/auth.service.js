import * as firebase from 'firebase/app';
import NotifyService from './notify.service';
import { NotificationTypeEnum } from '../enums/enums';
import { toggleLoading } from '../util/dom-helper.service';

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

    loginWithGoogle() {
        toggleLoading(true);

        if (!this.googleProvider) {
            this.googleProvider = new firebase.auth.GoogleAuthProvider();
        }

        firebase.auth().signInWithPopup(this.googleProvider).then(response => {
            this.photoURL = response.user.photoURL;
            this.handleLogin();
        }, error => {
            this.handleError(error);
        });
    }

    loginWithGitHub() {
        toggleLoading(true);

        if (!this.githubProvider) {
            this.githubProvider = new firebase.auth.GithubAuthProvider();
        }

        firebase.auth().signInWithPopup(this.githubProvider).then(response => {
            this.photoURL = response.user.photoURL;
            this.handleLogin();
        }, error => {
            this.handleError(error);
        });
    }

    loginWithFacebook() {
        toggleLoading(true);

        if (!this.facebookProvider) {
            this.facebookProvider = new firebase.auth.FacebookAuthProvider();
        }

        firebase.auth().signInWithPopup(this.facebookProvider).then(response => {
            this.photoURL = response.user.photoURL;
            this.handleLogin();
        }, error => {
            this.handleError(error);
        });
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