/*style*/
import '../assets/styles/app.css';
import 'material-icons/iconfont/material-icons.css';
import 'typeface-montserrat';

/*services*/
import { useFirebase } from './firebase/index';
import AuthService from './services/auth/auth.service';
import NotifyService from './services/notify/notify.service';
import { toggleLoading } from './util/dom-helper/dom-helper.service';

import Header from './components/header/header';
import Modal from './components/modal/modal';
import { ItemTypeEnum } from './enums/enums';

class App {
    init() {
        useFirebase();
        toggleLoading(true);
        NotifyService.initializeService();
        this.authService = new AuthService(this.loggedInHandler.bind(this));
        document.body.insertAdjacentElement('afterbegin', document.createElement('app-header'))
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
        this.activeProjects = new List(ItemTypeEnum.active);
        this.finishedProjects = new List(ItemTypeEnum.finished);

        Promise.all([this.activeProjects.getProjects(), this.finishedProjects.getProjects()]).then(() => {
            this.activeProjects.setSwitchHandlerFunction(this.finishedProjects.addProject.bind(this.finishedProjects));
            this.finishedProjects.setSwitchHandlerFunction(this.activeProjects.addProject.bind(this.activeProjects));

            const projectContainer = document.createElement('div');
            projectContainer.id = 'projects-container';

            projectContainer.append(this.activeProjects.section);
            projectContainer.append(this.finishedProjects.section);
            document.body.querySelector('app-header').insertAdjacentElement('afterend', projectContainer)

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

customElements.define('app-modal', Modal);
customElements.define('app-header', Header);
new App().init();