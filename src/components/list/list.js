import './list.css';

import * as firebase from 'firebase/app';
import NotifyService from '../../services/notify.service';
import Modal from '../modal/modal';
import Project from '../project/project';
import { clearEventListeners, createProjectModal, insertElement, toggleLoading } from '../../util/dom-helper.service';
import { ItemTypeEnum, NotificationTypeEnum } from '../../enums/enums';
import { hash } from '../../util/hash.service';

export default class List {

    constructor(type) {
        this.projectType = type;
        this.projectType == ItemTypeEnum.active() ? this._ref = '/active-projects' : this._ref = '/finished-projects';
        this._projects = new Map();
        this.switchCallback = null;

        if (this.projectType == ItemTypeEnum.active()) {
            this.newProjectModal = new Modal(createProjectModal('Add new project'));
            this.newProjectModal.addEventListener('confirm', this.validateProjectEdit.bind(this));
        }
    }

    setSwitchHandlerFunction(switchHandlerFunction) {
        this.switchCallback = switchHandlerFunction;
    }

    getProjects() {
        return new Promise((resolve, reject) => {
            firebase.database().ref(`${this._ref}/${firebase.auth().currentUser.uid}`).once('value').then(response => {
                const projects = response.val();
                for (const key in projects) {
                    const project = new Project(key, projects[key].title, projects[key].content, this.projectType, this.updateProject.bind(this), this.deleteProject.bind(this));
                    this._projects.set(project._id, project);
                }

                this.createSection();
                resolve();
            }, error => {
                reject(error);
            });
        });
    }

    createSection() {
        if (!this.section) {
            this.section = document.createElement('section');
            const header = document.createElement('header');
            const h2 = document.createElement('h2');

            if (this.projectType == ItemTypeEnum.active()) {
                h2.textContent = 'Active projects';
                header.insertAdjacentElement('beforeend', this.createAddProjectIcon());
            } else {
                h2.textContent = 'Finished projects';
            }

            header.insertAdjacentElement('afterbegin', h2);
            this.section.insertAdjacentElement('afterbegin', header);
        }

        this._projects.size > 0 ? this.createList() : this.createMessage();

        this.connectDragEvents();
    }

    connectDragEvents() {
        this.section.addEventListener('dragenter', event => {
            if (event.dataTransfer.types[0] === 'text/plain') {
                const projectList = this.section.querySelector('ul');
                if (projectList) {
                    projectList.classList.add('droppable');
                }
            }
        });

        this.section.addEventListener('dragover', event => {
            if (event.dataTransfer.types[0] === 'text/plain') {
                event.preventDefault();
            }
        });

        this.section.addEventListener('dragleave', event => {
            const listId = this.projectType == ItemTypeEnum.active() ? 'active-projects-list' : 'finished-projects-list';
            const projectList = this.section.querySelector('ul');
            if (event.relatedTarget && event.relatedTarget.closest(`#${listId}`) !== projectList) {
                projectList.classList.remove('droppable');
            }
        });

        this.section.addEventListener('drop', event => {
            const projectList = this.section.querySelector('ul');
            if (projectList) {
                projectList.classList.remove('droppable');
            }

            const projectId = event.dataTransfer.getData('text/plain');
            if (this._projects.has(projectId)) { return; }
            const projectHash = hash(projectId);
            document.getElementById(`${projectHash}`).querySelector('#switch-button').click();
        });
    }

    createAddProjectIcon() {
        if (!this.addProjectIcon) {
            this.addProjectIcon = document.createElement('span');
            this.addProjectIcon.id = 'add-project';
            this.addProjectIcon.classList.add('material-icons');
            this.addProjectIcon.textContent = 'add_circle';
        }
        this.addProjectIcon.addEventListener('click', this.newProjectModal.open.bind(this.newProjectModal));
        return this.addProjectIcon;
    }

    createMessage() {
        const h4 = document.createElement('h4');
        this.projectType == ItemTypeEnum.active() ? h4.textContent = 'No active projects.' : h4.textContent = 'No finished projects.';
        this.section.insertAdjacentElement('beforeend', h4);
    }

    createList() {
        const projectList = document.createElement('ul');
        projectList.id = this.projectType == ItemTypeEnum.active() ? 'active-projects-list' : 'finished-projects-list';
        for (const project of this._projects.values()) {
            insertElement(project.projectHTML, projectList);
        }
        this.section.insertAdjacentElement('beforeend', projectList);
    }

    validateProjectEdit(project) {
        const title = project.detail.get('title');
        if (!title.length) {
            NotifyService.displayNotification(NotificationTypeEnum.error(), 'Title is required');
            return;
        }

        const content = project.detail.get('content');
        if (!content.length) {
            NotifyService.displayNotification(NotificationTypeEnum.error(), 'Content is required');
            return;
        }

        this.addProject({ title, content }, true);
    }

    addProject(project, isNewProject) {
        toggleLoading(true);

        const newId = firebase.database().ref(this._ref).child(`${firebase.auth().currentUser.uid}`).push({ title: project.title, content: project.content }).key;
        if (newId) {
            if (this._projects.size == 0) {
                this.removeMessage();
            }

            if (isNewProject) {
                project = new Project(newId, project.title, project.content, this.projectType, this.updateProject.bind(this), this.deleteProject.bind(this));
                this.newProjectModal.hide();
                NotifyService.displayNotification(NotificationTypeEnum.info(), 'Successfully added new project!');
            } else {
                project._id = newId;
                project.projectHTML.id = hash(newId);
                project.type = this.projectType;
                NotifyService.displayNotification(NotificationTypeEnum.info(), 'Successfully updated project!');
            }

            this._projects.set(project._id, project);
            if (this._projects.size == 1) {
                this.createList();
            } else {
                insertElement(project.projectHTML, this.section.querySelector('ul'));
            }
            if (!isNewProject) {
                project.updateHandlers(this.updateProject.bind(this), this.deleteProject.bind(this));
            }
            toggleLoading(false);
        } else {
            toggleLoading(false);
            NotifyService.displayNotification(NotificationTypeEnum.error(), 'Failed :( ');
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
            NotifyService.displayNotification(NotificationTypeEnum.info(), 'Successfully updated project!');
        }).catch(error => {
            toggleLoading(false);
            NotifyService.displayNotification(NotificationTypeEnum.error(), error.message);
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
            NotifyService.displayNotification(NotificationTypeEnum.info(), 'Successfully deleted project!');
        }).catch(error => {
            toggleLoading(false);
            NotifyService.displayNotification(NotificationTypeEnum.error(), error.message);
        });
    }

    removeSection() {
        if (this.addProjectIcon) {
            this.addProjectIcon = clearEventListeners(this.addProjectIcon);
        }

        if (this.newProjectModal) {
            this.newProjectModal.removeEventListeners();
            this.newProjectModal = clearEventListeners(this.newProjectModal);
        }

        for (const project in this._projects.values()) {
            project.removeProject();
        }

        this.section = clearEventListeners(this.section);
        this._projects = null;
    }

    removeList() {
        const projectList = this.section.querySelector('ul');
        if (projectList) {
            projectList.remove();
        }
    }

    removeMessage() {
        const message = this.section.querySelector('h4');
        if (message) {
            message.remove();
        }
    }
}