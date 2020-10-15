/*style*/
import '../assets/styles/app.css';
import 'material-icons/iconfont/material-icons.css';
import 'typeface-montserrat';

/*vendor*/
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

/*services*/
import AuthService from './services/auth.service';
import NotifyService from './services/notify.service';
import { toggleLoading } from './util/dom-helper.service';

import { ItemTypeEnum } from './enums/enums';

class App {
    init() {
        toggleLoading(true);

        firebase.initializeApp({
            apiKey: process.env.API_KEY,
            authDomain: process.env.AUTH_DOMAIN,
            databaseURL: process.env.DATABASE_URL,
            projectId: process.env.PROJECT_ID,
            storageBucket: process.env.STORAGE_BUCKET,
            messagingSenderId: process.env.MESSAGING_SENDER_ID,
            appId: process.env.APP_ID
        });

        NotifyService.initializeService();

        this.authService = new AuthService();
        this.authService.setLoginHandlerFunction(this.loggedInHandler.bind(this));

        this.authService.isLoggedIn().then(response => {
            if (response) {
                this.loadHeaderModule();
                this.loadListModule();
            } else {
                this.loadHeaderModule();
                this.loadLoginModule();
            }
        });
    }

    loggedInHandler(loggedIn) {
        if (loggedIn) {
            if (this.loginModule) {
                this.loginModule.removeLoginButtons();
            }
            this.listModule ? this.getLists() : this.loadListModule();
            this.headerModule.createMenuIcon();
        } else {
            this.activeProjects.removeSection();
            this.activeProjects = null;
            this.finishedProjects.removeSection();
            this.finishedProjects = null;
            document.getElementById('projects-container').remove();

            this.loginModule ? this.loginModule.createLoginButtons() : this.loadLoginModule();
            this.headerModule.removeMenuIcon();
        }
    }

    async loadListModule() {
        this.listModule = await import('./components/list.js');
        this.getLists();
    }

    getLists() {
        this.activeProjects = new this.listModule.default(ItemTypeEnum.active());
        this.finishedProjects = new this.listModule.default(ItemTypeEnum.finished());

        const getActiveProjects = this.activeProjects.getProjects();
        const getFinishedProjects = this.finishedProjects.getProjects();

        Promise.all([getActiveProjects, getFinishedProjects]).then(() => {
            const projectContainer = document.createElement('div');
            projectContainer.id = 'projects-container';
            projectContainer.insertAdjacentElement('afterbegin', this.activeProjects.section);
            projectContainer.insertAdjacentElement('beforeend', this.finishedProjects.section);

            this.activeProjects.setSwitchHandlerFunction(this.finishedProjects.addProject.bind(this.finishedProjects));
            this.finishedProjects.setSwitchHandlerFunction(this.activeProjects.addProject.bind(this.activeProjects));

            document.body.insertAdjacentElement('beforeend', projectContainer);

            toggleLoading(false);
        });
    }

    async loadLoginModule() {
        this.loginModule = new (await import('./components/login.js')).default(this.authService);
        this.loginModule.getSVGs();
    }

    async loadHeaderModule() {
        this.headerModule = new (await import('./components/header.js')).default(this.authService);
    }
}

new App().init();