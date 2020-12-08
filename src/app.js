/*style*/
import '../assets/styles/app.css';
import 'material-icons/iconfont/material-icons.css';
import 'typeface-montserrat';

/*vendor*/
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

/*services*/
import AuthService from './services/auth/auth.service';
import NotifyService from './services/notify/notify.service';
import { toggleLoading } from './util/dom-helper/dom-helper.service';

import { ItemTypeEnum } from './enums/enums';
import Header from './components/header/header';

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

        this.authService = new AuthService(this.loggedInHandler.bind(this));
        this.header = new Header();
        this.header.createHeader();
    }

    loggedInHandler(loggedIn) {
        if (loggedIn) {
            this.getLists();
        } else {
            this.removeLists();
            this.loadLoginModule();
        }
    }

    async getLists() {
        const List = await (await import('./components/list/list.js')).default;
        this.activeProjects = new List(ItemTypeEnum.active());
        this.finishedProjects = new List(ItemTypeEnum.finished());

        Promise.all([this.activeProjects.getProjects(), this.finishedProjects.getProjects()]).then(() => {
            this.activeProjects.setSwitchHandlerFunction(this.finishedProjects.addProject.bind(this.finishedProjects));
            this.finishedProjects.setSwitchHandlerFunction(this.activeProjects.addProject.bind(this.activeProjects));

            const projectContainer = document.createElement('div');
            projectContainer.id = 'projects-container';

            projectContainer.append(this.activeProjects.section);
            projectContainer.append(this.finishedProjects.section);
            document.body.append(projectContainer)

            toggleLoading(false);
        });
    }

    removeLists() {
        if (this.activeProjects || this.finishedProjects) {
            this.activeProjects.removeSection();
            this.activeProjects = null;
            this.finishedProjects.removeSection();
            this.finishedProjects = null;
            document.getElementById('projects-container').remove();
        }
    }

    async loadLoginModule() {
        import('./components/login/login.js').then(module => {
            if (!this.login) {
                this.login = new module.default();
            }
        })
    }
}

new App().init();