import LightningModal from 'lightning/modal';

export default class OrgImpactModal extends LightningModal {
    handleGoToHelp(event) {
        event.preventDefault();
    }

    handleClose() {
        this.close({ reviewed: true });
    }
}
