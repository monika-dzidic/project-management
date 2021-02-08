import { EventTypeEnum } from "../../enums/enums";
import { toggleOverlay } from "../../util/dom-helper/dom-helper.service";

const ModalService = (function () {
    return {
        open(title, template, confirmCallback = undefined, cancelCallback = undefined) {
            if (document.body.querySelector('app-modal')) return;

            const modal = document.createElement('app-modal');
            modal.id = 'app-modal';
            modal.title = title;
            modal.innerHTML = template;

            modal.addEventListener(EventTypeEnum.confirm, data => confirmCallback(data));
            modal.addEventListener(EventTypeEnum.cancel, () => {
                if (cancelCallback) cancelCallback();
                this.hide(modal, true);
            })

            toggleOverlay(true, { component: modal, backdropClick: true });
            return modal;
        },

        hide(component = undefined, backdropClick = undefined) {
            toggleOverlay(false, { component, backdropClick })
        }
    }
})();

export default ModalService;