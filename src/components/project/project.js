import './project.css';

import * as firebase from 'firebase/app';
import NotifyService from '../../services/notify.service';
import { clearEventListeners, createProjectModal, toggleLoading } from '../../util/dom-helper.service';
import { ItemTypeEnum, NotificationTypeEnum } from '../../enums/enums';
import { hash } from '../../util/hash.service';

export default class Project {
    constructor(id, title, content, type, updateProjectHandler, deleteProjectHandler) {
        this.updateProjectCallback = updateProjectHandler;
        this.deleteProjectCallback = deleteProjectHandler;
        this._id = id;
        this.title = title;
        this.content = content;
        this.type = type;
        this.projectHTML = null;
        this.editButton = null;
        this.deleteButton = null;
        this.switchButton = null;

        this.createProjectHTML();
    }

    createProjectHTML() {
        this.projectHTML = document.createElement('li');
        this.projectHTML.id = hash(this._id);
        this.projectHTML.classList.add('card');
        this.projectHTML.draggable = true;

        const container = document.createElement('div');
        container.classList.add('flex', 'align-center', 'justify-between');
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('flex', 'align-center', 'justify-end');

        const title = document.createElement('h3');
        title.textContent = this.title;
        container.insertAdjacentElement('afterbegin', title);
        container.insertAdjacentElement('beforeend', buttonContainer);
        this.projectHTML.insertAdjacentElement('afterbegin', container);

        const content = document.createElement('p');
        content.textContent = this.content;
        this.projectHTML.insertAdjacentElement('beforeend', content);

        this.editButton = document.createElement('span');
        this.editButton.id = 'edit-button';
        this.editButton.classList.add('material-icons');
        this.editButton.innerText = 'edit';
        this.editButton.addEventListener('click', this.edit.bind(this));
        buttonContainer.insertAdjacentElement('beforeend', this.editButton);

        this.deleteButton = document.createElement('span');
        this.deleteButton.id = 'delete-button';
        this.deleteButton.classList.add('material-icons');
        this.deleteButton.innerText = 'delete';
        this.deleteButton.addEventListener('click', this.deleteProjectCallback.bind(this, this));
        buttonContainer.insertAdjacentElement('beforeend', this.deleteButton);

        this.switchButton = document.createElement('button');
        this.switchButton.id = 'switch-button';
        this.switchButton.classList.add('switch');
        this.switchButton.addEventListener('click', this.updateProjectCallback.bind(null, this._id));
        this.type == ItemTypeEnum.active() ? this.switchButton.textContent = 'Finish' : this.switchButton.textContent = 'Activate';
        this.projectHTML.insertAdjacentElement('beforeend', this.switchButton);

        this.connectDragEvents();
    }

    connectDragEvents() {
        this.projectHTML.addEventListener('dragstart', event => {
            event.dataTransfer.setData('text/plain', this._id);
            event.dataTransfer.effectAllowed = 'move';
        });
    }

    updateHandlers(updateProjectHandler, deleteProjectHandler) {
        this.updateProjectCallback = updateProjectHandler;
        this.deleteProjectCallback = deleteProjectHandler;

        this.switchButton = clearEventListeners(this.switchButton);
        this.switchButton.addEventListener('click', this.updateProjectCallback.bind(null, this._id));

        this.deleteButton = clearEventListeners(this.deleteButton);
        this.deleteButton.addEventListener('click', this.deleteProjectCallback.bind(this, this));

        this.type == ItemTypeEnum.active() ? this.switchButton.textContent = 'Finish' : this.switchButton.textContent = 'Activate';
    }

    edit() {
        if (!this.editProjectModal) {
            import('../modal/modal.js').then(module => {
                this.editProjectModal = new module.default(createProjectModal('Edit project'));
                this.editProjectModal.open({ title: this.title, content: this.content });

                this.editProjectModal.addEventListener('confirm', this.update.bind(this));
            });
        } else {
            this.editProjectModal.open({ title: this.title, content: this.content });
        }
    }

    update(project) {
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

        let hasTitleChange = false;
        if (this.title != title) {
            hasTitleChange = true;
            this.title = title;
        }

        let hasContentChange = false;
        if (this.content != content) {
            this.content = content;
            hasContentChange = true;
        }

        if (!hasTitleChange && !hasContentChange) {
            this.editProjectModal.hide();
        } else {
            toggleLoading(true);

            const ref = this.type == ItemTypeEnum.active() ? '/active-projects' : '/finished-projects';
            firebase.database().ref(ref).child(`${firebase.auth().currentUser.uid}/${this._id}`)
                .set({ title: this.title, content: this.content }).then(() => {
                    if (hasTitleChange) {
                        this.projectHTML.querySelector('h3').textContent = this.title;
                    }
                    if (hasContentChange) {
                        this.projectHTML.querySelector('p').textContent = this.content;
                    }
                    toggleLoading(false);
                    this.editProjectModal.hide();
                    NotifyService.displayNotification(NotificationTypeEnum.info(), 'Successfully saved changes!');
                }).catch(error => {
                    toggleLoading(false);
                    NotifyService.displayNotification(NotificationTypeEnum.error(), error.message);
                });
        }
    }

    removeProject() {
        this.editButton = clearEventListeners(this.editButton);
        this.deleteButton = clearEventListeners(this.deleteButton);
        this.switchButton = clearEventListeners(this.switchButton);
        if (this.editProjectModal) {
            this.editProjectModal.removeEventListeners();
            this.editProjectModal = clearEventListeners(this.editProjectModal);
        }

        this.projectHTML = clearEventListeners(this.projectHTML);

        this.projectHTML.remove();
        this._id = null;
    }
}