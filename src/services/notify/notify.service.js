import { NotificationTypeEnum } from "../../enums/enums";

const NotifyService = (function () {
    let instance = null;
    let HTMLElement = null;
    let currentNotificationTimeout = null;

    function createInstance() {
        var object = {
            isCreated: true,
            timeout: 5000
        };
        return object;
    }

    function createHTML() {
        const object = document.createElement('div');
        object.classList.add('notification');
        return object;
    }

    return {
        initializeService() {
            if (!instance) {
                instance = createInstance();
            }
            if (!HTMLElement) {
                HTMLElement = createHTML();
            }
            return this;
        },

        displayNotification(type, message) {
            if (!instance) {
                return;
            }

            if (currentNotificationTimeout) {
                HTMLElement.classList.remove('fade');
                HTMLElement.remove();
                clearTimeout(currentNotificationTimeout);
                currentNotificationTimeout = null;
            }

            HTMLElement.textContent = message;
            document.body.insertAdjacentElement('afterbegin', HTMLElement);
            if (type === NotificationTypeEnum.info()) {
                HTMLElement.classList.remove('error');
                HTMLElement.classList.add('info');
                HTMLElement.insertAdjacentHTML('beforeend', '<span class="material-icons">info</span>');
            } else if (type == NotificationTypeEnum.error()) {
                HTMLElement.classList.remove('info');
                HTMLElement.classList.add('error');
                HTMLElement.insertAdjacentHTML('beforeend', '<span class="material-icons">error</span>')
            }

            setTimeout(() => {
                HTMLElement.classList.add('fade');
            }, 0);

            currentNotificationTimeout = setTimeout(() => {
                HTMLElement.classList.remove('fade');
                HTMLElement.remove();
            }, instance.timeout);
        }
    }
})();

export default NotifyService;