import { LightningElement, track } from 'lwc';
import HouseholdSetupModal from 'ui/householdSetupModal';

export default class HouseholdSetup extends LightningElement {
    @track isHouseholdExpanded = true;
    @track activeNavItem = 'general-settings';
    @track nextGenEnabled = true;
    @track selectedVersion = 'standard';

    versionOptions = [
        { label: 'Managed Package', value: 'managed-package' },
        { label: 'Standard', value: 'standard' },
    ];

    get isHouseholdExpandedStr() {
        return this.isHouseholdExpanded ? 'true' : 'false';
    }

    get chevronIcon() {
        return this.isHouseholdExpanded ? 'utility:chevrondown' : 'utility:chevronright';
    }

    get generalSettingsItemClass() {
        return this._navItemClass('general-settings');
    }

    get generalSettingsAriaCurrent() {
        return this.activeNavItem === 'general-settings' ? 'page' : null;
    }

    _navItemClass(item) {
        return `slds-nav-vertical__item${this.activeNavItem === item ? ' slds-is-active' : ''}`;
    }

    handleToggleHousehold(event) {
        event.preventDefault();
        this.isHouseholdExpanded = !this.isHouseholdExpanded;
    }

    handleNavClick(event) {
        event.preventDefault();
        this.activeNavItem = event.currentTarget.dataset.item;
    }

    handleNextGenToggle(event) {
        this.nextGenEnabled = event.target.checked;
    }

    handleVersionChange(event) {
        this.selectedVersion = event.detail.value;
    }

    handleSetupHousehold() {
        HouseholdSetupModal.open({ size: 'large', label: 'Set Up Household' });
    }
}
