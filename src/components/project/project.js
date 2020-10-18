import './project.css';

import * as firebase from 'firebase/app';
import NotifyService from '../../services/notify/notify.service';
import { createProjectModal, toggleLoading } from '../../util/dom-helper/dom-helper.service';
import { ItemTypeEnum, NotificationTypeEnum } from '../../enums/enums';
import { hash } from '../../util/hash/hash.service';

export default class Project {
    constructor(id, title, content, type, updateProjectHandler, deleteProjectHandler) {
        this._id = id;
        this.title = title;
        this.content = content;
        this.type = type;
        this.editProjectHandler = this.openModal.bind(this);
        this.deleteProjectHandler = deleteProjectHandler.bind(this, this);
        this.updateProjectHandler = updateProjectHandler.bind(null, this._id);

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
        container.append(title);
        container.append(buttonContainer);
        this.projectHTML.append(container);

        const content = document.createElement('p');
        content.textContent = this.content;
        this.projectHTML.append(content);

        this.editButton = document.createElement('span');
        this.editButton.id = 'edit-button';
        this.editButton.classList.add('material-icons');
        this.editButton.innerText = 'edit';
        this.editButton.addEventListener('click', this.editProjectHandler);
        buttonContainer.append(this.editButton);

        this.deleteButton = document.createElement('span');
        this.deleteButton.id = 'delete-button';
        this.deleteButton.classList.add('material-icons');
        this.deleteButton.innerText = 'delete';
        this.deleteButton.addEventListener('click', this.deleteProjectHandler);
        buttonContainer.append(this.deleteButton);

        this.switchButton = document.createElement('button');
        this.switchButton.id = 'switch-button';
        this.switchButton.classList.add('switch');
        this.switchButton.addEventListener('click', this.updateProjectHandler)
        this.type == ItemTypeEnum.active() ? this.switchButton.textContent = 'Finish' : this.switchButton.textContent = 'Activate';
        this.projectHTML.append(this.switchButton);

        this.connectDragEvents();
    }

    connectDragEvents() {
        this.dragStarHandler = this.transferData.bind(this);
        this.projectHTML.addEventListener('dragstart', this.dragStarHandler);
    }

    transferData(event) {
        event.dataTransfer.setData('text/plain', this._id);
        event.dataTransfer.effectAllowed = 'move';
    }

    updateHandlers(updateProjectHandler, deleteProjectHandler) {
        this.switchButton.removeEventListener('click', this.updateProjectHandler);
        this.updateProjectHandler = updateProjectHandler.bind(null, this._id);
        this.switchButton.addEventListener('click', this.updateProjectHandler);

        this.deleteButton.removeEventListener('click', this.deleteProjectHandler);
        this.deleteProjectHandler = deleteProjectHandler.bind(this, this);
        this.deleteButton.addEventListener('click', this.deleteProjectHandler);

        this.type == ItemTypeEnum.active() ? this.switchButton.textContent = 'Finish' : this.switchButton.textContent = 'Activate';
    }

    openModal() {
        if (!this.editProjectModal) {
            import('../modal/modal.js').then(module => {
                this.editProjectModal = new module.default(createProjectModal('Edit project'));
                this.editProjectModal.open({ title: this.title, content: this.content });

                this.confirmEditProjectHandler = this.validateEditProject.bind(this);
                this.editProjectModal.addEventListener('confirm', this.confirmEditProjectHandler);
            });
        } else {
            this.editProjectModal.open({ title: this.title, content: this.content });
        }
    }

    validateEditProject(project) {
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
            this.update(hasTitleChange, hasContentChange);
        }
    }

    update(hasTitleChange, hasContentChange) {
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

    removeProject() {
        this.switchButton.removeEventListener('click', this.updateProjectHandler);
        this.deleteButton.removeEventListener('click', this.deleteProjectHandler);
        this.editButton.removeEventListener('click', this.editProjectHandler);

        if (this.editProjectModal) {
            this.editProjectModal.removeEventListener('confirm', this.confirmEditProjectHandler);
            this.editProjectModal.removeModalEventListeners();
        }

        this.projectHTML.removeEventListener('dragstart', this.dragStarHandler);

        this.projectHTML.remove();
        this._id = null;
    }
}