import './list.css';

import * as firebase from 'firebase/app';
import NotifyService from '../../services/notify/notify.service';
import ModalService from '../../services/modal/modal.service';
import Project from '../project/project';
import { createInputElement, toggleLoading } from '../../util/dom-helper/dom-helper.service';
import { ItemTypeEnum, NotificationTypeEnum } from '../../enums/enums';
import { hash } from '../../util/hash/hash.service';

class List {

    constructor(type) {
        this.projectType = type;
        this.projectType == ItemTypeEnum.active ? this._ref = '/active-projects' : this._ref = '/finished-projects';
        this._projects = new Map();
    }

    setSwitchHandlerFunction(switchHandlerFunction) {
        this.switchCallback = switchHandlerFunction;
    }

    async getProjects() {
        const response = await firebase.database().ref(`${this._ref}/${firebase.auth().currentUser.uid}`).once('value');
        const projects = response.val();
        for (const key in projects) {
            const project = new Project(key, projects[key].title, projects[key].content, this.projectType, this.updateProject.bind(this), this.deleteProject.bind(this));
            this._projects.set(project._id, project);
        }
        this.createSection();
    }

    createSection() {
        this.section = document.createElement('section');
        const header = document.createElement('header');
        const h2 = document.createElement('h2');
        header.append(h2);

        if (this.projectType == ItemTypeEnum.active) {
            h2.textContent = 'Active projects';
            header.append(this.createAddProjectIcon());
        } else {
            h2.textContent = 'Finished projects';
        }

        this.section.append(header);
        this._projects.size > 0 ? this.createList() : this.createMessage();
        this.connectDragEvents();
    }

    connectDragEvents() {
        this.dragEnterHandler = event => {
            if (event.dataTransfer.types[0] === 'text/plain') {
                const projectList = this.section.querySelector('ul');
                if (projectList) {
                    projectList.classList.add('droppable');
                }
            }
        };
        this.section.addEventListener('dragenter', this.dragEnterHandler.bind(this));

        this.dragOverHandler = event => {
            if (event.dataTransfer.types[0] === 'text/plain') {
                event.preventDefault();
            }
        };
        this.section.addEventListener('dragover', this.dragOverHandler.bind(this));

        this.dragLeaveHandler = event => {
            const listId = this.projectType == ItemTypeEnum.active ? 'active-projects-list' : 'finished-projects-list';
            const projectList = this.section.querySelector('ul');
            if (event.relatedTarget && event.relatedTarget.closest(`#${listId}`) !== projectList) {
                projectList.classList.remove('droppable');
            }
        };
        this.section.addEventListener('dragleave', this.dragLeaveHandler.bind(this));

        this.dropHandler = event => {
            const projectList = this.section.querySelector('ul');
            if (projectList) {
                projectList.classList.remove('droppable');
            }

            const projectId = event.dataTransfer.getData('text/plain');
            if (this._projects.has(projectId)) { return; }
            const projectHash = hash(projectId);
            document.getElementById(`${projectHash}`).querySelector('#switch-button').click();
        };
        this.section.addEventListener('drop', this.dropHandler.bind(this));
    }

    createAddProjectIcon() {
        if (!this.addProjectIcon) {
            this.addProjectIcon = document.createElement('span');
            this.addProjectIcon.id = 'add-project';
            this.addProjectIcon.classList.add('material-icons');
            this.addProjectIcon.textContent = 'add_circle';
            this.openModalHandler = this.openModal.bind(this);
        }
        this.addProjectIcon.addEventListener('click', this.openModalHandler);
        return this.addProjectIcon;
    }

    openModal() {
        ModalService.open(
            'New project',
            `<div slot="content">
                ${createInputElement('title').outerHTML}
                ${createInputElement('content').outerHTML}
            </div>`,
            this.validateNewProject.bind(this));
    }

    createMessage() {
        const h4 = document.createElement('h4');
        this.projectType == ItemTypeEnum.active ? h4.textContent = 'No active projects.' : h4.textContent = 'No finished projects.';
        this.section.append(h4);
    }

    createList() {
        const projectList = document.createElement('ul');
        projectList.id = this.projectType == ItemTypeEnum.active ? 'active-projects-list' : 'finished-projects-list';
        for (const project of this._projects.values()) {
            projectList.append(project.projectHTML);
            project.projectHTML.scrollIntoView({ behavior: 'smooth' });
        }
        this.section.append(projectList);
    }

    validateNewProject(event) {
        const title = event.detail[0].value.trim();
        if (!title.length) {
            NotifyService.displayNotification(NotificationTypeEnum.error, 'Title is required');
            return;
        }

        const content = event.detail[1].value.trim();
        if (!content.length) {
            NotifyService.displayNotification(NotificationTypeEnum.error, 'Content is required');
            return;
        }

        this.addProject({ title, content }, true);
    }

    addProject(project, isNewProject) {
        toggleLoading(true);

        const newId = firebase.database().ref(this._ref).child(`${firebase.auth().currentUser.uid}`).push({ title: project.title, content: project.content }).key;
        if (newId) {
            if (this._projects.size == 0) this.removeMessage();

            if (isNewProject) {
                project = new Project(newId, project.title, project.content, this.projectType, this.updateProject.bind(this), this.deleteProject.bind(this));
                ModalService.hide();
                NotifyService.displayNotification(NotificationTypeEnum.info, 'Successfully added new project!');
            } else {
                project._id = newId;
                project.projectHTML.id = hash(newId);
                project.type = this.projectType;
                NotifyService.displayNotification(NotificationTypeEnum.info, 'Successfully updated project!');
            }

            this._projects.set(project._id, project);
            if (this._projects.size == 1) {
                this.createList();
            } else {
                this.section.querySelector('ul').append(project.projectHTML);
                project.projectHTML.scrollIntoView({ behavior: 'smooth' });
            }
            if (!isNewProject) project.updateHandlers(this.updateProject.bind(this), this.deleteProject.bind(this));
            toggleLoading(false);
        } else {
            toggleLoading(false);
            NotifyService.displayNotification(NotificationTypeEnum.error, 'Failed :( ');
        }
    }

    updateProject(projectId) {
        toggleLoading(true);

        firebase.database().ref(this._ref).child(`${firebase.auth().currentUser.uid}/${projectId}`).remove().then(() => {
            const draggedProject = this._projects.get(projectId);
            draggedProject.projectHTML.remove();
            this.switchCallback(draggedProject);

            this._projects.delete(projectId);
            if (this._projects.size == 0) {
                this.removeList();
                this.createMessage();
            }
            toggleLoading(false);
            NotifyService.displayNotification(NotificationTypeEnum.info, 'Successfully updated project!');
        }).catch(error => {
            toggleLoading(false);
            NotifyService.displayNotification(NotificationTypeEnum.error, error.message);
        });
    }

    deleteProject(project) {
        toggleLoading(true);

        firebase.database().ref(this._ref).child(`${firebase.auth().currentUser.uid}/${project._id}`).remove().then(() => {
            this._projects.delete(project._id);
            project.removeProject();
            if (this._projects.size == 0) {
                this.removeList();
                this.createMessage();
            }
            toggleLoading(false);
            NotifyService.displayNotification(NotificationTypeEnum.info, 'Successfully deleted project!');
        }).catch(error => {
            toggleLoading(false);
            NotifyService.displayNotification(NotificationTypeEnum.error, error.message);
        });
    }

    removeSection() {
        if (this.addProjectIcon) this.addProjectIcon.removeEventListener('click', this.openModalHandler);

        for (const project of this._projects.values()) {
            project.removeProject();
        }

        this.section.removeEventListener('dragenter', this.dragEnterHandler);
        this.section.removeEventListener('dragover', this.dragOverHandler);
        this.section.removeEventListener('dragleave', this.dragLeaveHandler);
        this.section.removeEventListener('drop', this.dropHandler);

        this._projects = null;
    }

    removeList() {
        const projectList = this.section.querySelector('ul');
        if (projectList) projectList.remove();
    }

    removeMessage() {
        const message = this.section.querySelector('h4');
        if (message) message.remove();
    }
}

export { List }