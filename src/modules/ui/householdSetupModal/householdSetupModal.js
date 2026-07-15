import LightningModal from 'lightning/modal';
import { track } from 'lwc';
import OrgImpactModal from 'ui/orgImpactModal';
import AddObjectModal from 'ui/addObjectModal';

export default class HouseholdSetupModal extends LightningModal {
    // ── Section 1.1 state ──
    @track activeSection = '1.1';
    @track groupMembershipEnabled = true;
    @track contextDefinitionsEnabled = true;

    // ── Section 1.2 state ──
    @track personAccountsExpanded = false;
    @track contactsExpanded = false;
    @track recordTypeExpanded = false;
    @track orgImpactModalViewed = false;   // true after user opens+closes org impact modal
    @track orgImpactAcknowledged = false;  // true after user checks the checkbox
    @track personAccountsEnabled = false;
    @track contactsToMultipleEnabled = false;

    // ── Section visibility getters ──
    get isSection11() { return this.activeSection === '1.1'; }
    get isSection12() { return this.activeSection === '1.2'; }
    get isSection13() { return this.activeSection === '1.3'; }
    get isSection14() { return this.activeSection === '1.4'; }
    get isSection21() { return this.activeSection === '2.1'; }
    get isSection22() { return this.activeSection === '2.2'; }
    get isSection31() { return this.activeSection === '3.1'; }
    get isSection32() { return this.activeSection === '3.2'; }

    // ── Nav item class getters ──
    _navClass(section) {
        return `my-nav-sub-item${this.activeSection === section ? ' my-nav-sub-item_active' : ''}`;
    }

    get navClass11() { return this._navClass('1.1'); }
    get navClass12() { return this._navClass('1.2'); }
    get navClass13() { return this._navClass('1.3'); }
    get navClass14() { return this._navClass('1.4'); }
    get navClass21() { return this._navClass('2.1'); }
    get navClass22() { return this._navClass('2.2'); }
    get navClass31() { return this._navClass('3.1'); }
    get navClass32() { return this._navClass('3.2'); }

    // ── Stepper: active group ──
    get activeGroup() {
        return this.activeSection.charAt(0);
    }

    get isGroup1Active() { return this.activeGroup === '1'; }
    get isGroup2Active() { return this.activeGroup === '2'; }
    get isGroup3Active() { return this.activeGroup === '3'; }

    _sectionItems = {
        '1': ['1.1', '1.2', '1.3', '1.4'],
        '2': ['2.1', '2.2'],
        '3': ['3.1', '3.2']
    };

    get activeSectionBadge() {
        const group = this.activeGroup;
        const items = this._sectionItems[group];
        const pos = items.indexOf(this.activeSection) + 1;
        return `${pos}/${items.length}`;
    }

    _stepCircleClass(group) {
        return `my-step-circle${this.activeGroup === group ? ' my-step-circle_active' : ''}`;
    }

    get step1CircleClass() { return this._stepCircleClass('1'); }
    get step2CircleClass() { return this._stepCircleClass('2'); }
    get step3CircleClass() { return this._stepCircleClass('3'); }

    _stepLabelClass(group) {
        return `my-step-label${this.activeGroup === group ? ' my-step-label_active' : ''}`;
    }

    get step1LabelClass() { return this._stepLabelClass('1'); }
    get step2LabelClass() { return this._stepLabelClass('2'); }
    get step3LabelClass() { return this._stepLabelClass('3'); }

    // ── Section 1.2: accordion chevron icons ──
    get personAccountsChevron() {
        return this.personAccountsExpanded ? 'utility:chevrondown' : 'utility:chevronright';
    }

    get contactsChevron() {
        return this.contactsExpanded ? 'utility:chevrondown' : 'utility:chevronright';
    }

    get recordTypeChevron() {
        return this.recordTypeExpanded ? 'utility:chevrondown' : 'utility:chevronright';
    }

    // ── Section 1.2: disabled/warning state ──
    get isPersonAccountsToggleDisabled() {
        return !this.orgImpactAcknowledged;
    }

    get isOrgImpactCheckboxDisabled() {
        return !this.orgImpactModalViewed;
    }

    get showPersonAccountsWarning() {
        return !this.orgImpactAcknowledged;
    }

    // ── Navigation handler ──
    handleNavClick(event) {
        event.preventDefault();
        this.activeSection = event.currentTarget.dataset.section;
    }

    handleGroupClick(event) {
        const group = event.currentTarget.dataset.group;
        const sections = this._sectionItems[group];
        if (sections && sections.length) {
            this.activeSection = sections[0];
        }
    }

    // ── Section 1.1 handlers ──
    handleGroupMembershipChange(event) {
        this.groupMembershipEnabled = event.target.checked;
    }

    handleContextDefinitionsChange(event) {
        this.contextDefinitionsEnabled = event.target.checked;
    }

    handleConsiderationsClick(event) {
        event.preventDefault();
    }

    // ── Section 1.2 accordion handlers ──
    handleTogglePersonAccounts() {
        this.personAccountsExpanded = !this.personAccountsExpanded;
    }

    handleToggleContacts() {
        this.contactsExpanded = !this.contactsExpanded;
    }

    handleToggleRecordType() {
        this.recordTypeExpanded = !this.recordTypeExpanded;
    }

    // ── Org Impact flow ──
    handleReviewOrgImpact(event) {
        event.preventDefault();
        OrgImpactModal.open({ label: 'Org Impact Acknowledgement' }).then(() => {
            this.orgImpactModalViewed = true;
        });
    }

    handleOrgImpactCheckbox(event) {
        this.orgImpactAcknowledged = event.target.checked;
        if (!this.orgImpactAcknowledged) {
            this.personAccountsEnabled = false;
        }
    }

    handlePersonAccountsToggle(event) {
        this.personAccountsEnabled = event.target.checked;
    }

    handleViewPermissions(event) {
        event.preventDefault();
    }

    handleContactsToMultipleToggle(event) {
        this.contactsToMultipleEnabled = event.target.checked;
    }

    handleContactsLearnMore(event) {
        event.preventDefault();
    }

    // ── Section 1.3: Permission set dropdown ──
    @track permSetDropdownOpen = false;
    @track selectedPermSet = 'fsc-extension';
    @track activePermTab = 'assigned';

    _permSets = [
        { value: 'fsc-extension', label: 'Financial Services Cloud Extension', assigned: 2, description: "Allows the user to access Financial Services Cloud features delivered after Spring '20." },
        { value: 'fsc-sales', label: 'FSC Sales', assigned: 3, description: 'Provides access to FSC Sales features and capabilities.' },
        { value: 'fsc-service', label: 'FSC Service', assigned: 1, description: 'Provides access to FSC Service features and capabilities.' },
        { value: 'fsc-comprehensive', label: 'Financial Services Cloud Comprehensive', assigned: 1, description: 'Full access to all Financial Services Cloud features.' },
        { value: 'fsc-foundations', label: 'Financial Services Cloud Foundations', assigned: 2, description: 'Core Financial Services Cloud foundational features.' },
    ];

    get selectedPermSetObj() {
        return this._permSets.find(p => p.value === this.selectedPermSet) || this._permSets[0];
    }

    get selectedPermSetLabel() {
        return this.selectedPermSetObj.label;
    }

    get selectedPermSetDescription() {
        return this.selectedPermSetObj.description;
    }

    get permHeaderSubtext() {
        return `${this._permData.length} assigned · 28 available`;
    }

    get permSetOptions() {
        return this._permSets.map(p => ({
            value: p.value,
            label: p.label,
            assignedLabel: `${p.value === this.selectedPermSet ? this._permData.length : p.assigned} assigned`,
            cssClass: `my-dropdown-item${p.value === this.selectedPermSet ? ' my-dropdown-item_selected' : ''}`,
        }));
    }

    handlePermSetDropdown(event) {
        event.preventDefault();
        this.permSetDropdownOpen = !this.permSetDropdownOpen;
    }

    handleSelectPermSet(event) {
        this.selectedPermSet = event.currentTarget.dataset.value;
        this.permSetDropdownOpen = false;
    }

    handlePermTabSelect(event) {
        this.activePermTab = event.detail.value;
    }

    // ── Section 1.3: Assigned Users datatable ──
    @track permSearchTerm = '';
    @track _permData = [
        { id: 'u2', rowNum: 1, fullName: 'nk dc admin', username: 'nk.dc.admin@example.com', profile: 'System Admin DC' },
        { id: 'u3', rowNum: 2, fullName: 'Admin User', username: 'admin@example.com', profile: 'System Administrator' },
    ];

    permColumns = [
        { label: '#', fieldName: 'rowNum', type: 'number', initialWidth: 60, cellAttributes: { alignment: 'left' } },
        { label: 'Full Name', fieldName: 'fullName', type: 'text' },
        { label: 'Username', fieldName: 'username', type: 'text' },
        { label: 'Profile', fieldName: 'profile', type: 'text' },
    ];

    get filteredPermData() {
        if (!this.permSearchTerm) return this._permData;
        const term = this.permSearchTerm.toLowerCase();
        return this._permData.filter(row =>
            row.fullName.toLowerCase().includes(term) ||
            row.username.toLowerCase().includes(term) ||
            row.profile.toLowerCase().includes(term)
        );
    }

    get permItemCount() {
        const count = this.filteredPermData.length;
        return `${count} item${count !== 1 ? 's' : ''}`;
    }

    handlePermSearch(event) {
        this.permSearchTerm = event.target.value;
    }

    // ── Section 1.3: All Users table ──
    @track allUsersSearchTerm = '';
    @track _allUsersData = [
        { id: 'u1', fullName: 'Leo Park', username: 'leo.park@example.com', profile: 'Community Plus Clone', isAssigned: false, isSelected: false },
        { id: 'u2', fullName: 'nk dc admin', username: 'nk.dc.admin@example.com', profile: 'System Admin DC', isAssigned: true, isSelected: true },
        { id: 'u3', fullName: 'Admin User', username: 'admin@example.com', profile: 'System Administrator', isAssigned: true, isSelected: true },
        { id: 'u4', fullName: 'New Fin Advisor', username: 'fin.advisor@example.com', profile: 'Standard user clone', isAssigned: false, isSelected: false },
        { id: 'u5', fullName: 'Jane Doe', username: 'jane.doe@example.com', profile: 'Standard user clone', isAssigned: false, isSelected: false },
        { id: 'u6', fullName: 'Mark Singh', username: 'mark.singh@example.com', profile: 'Standard user clone', isAssigned: false, isSelected: false },
        { id: 'u7', fullName: 'Riya Patel', username: 'riya.patel@example.com', profile: 'Standard user clone', isAssigned: false, isSelected: false },
        { id: 'u8', fullName: 'Laura Martin', username: 'laura.martin@example.com', profile: 'System Administrator', isAssigned: false, isSelected: false },
        { id: 'u9', fullName: 'Tom Chen', username: 'tom.chen@example.com', profile: 'Standard user clone', isAssigned: false, isSelected: false },
        { id: 'u10', fullName: 'Sara Blake', username: 'sara.blake@example.com', profile: 'Community Plus Clone', isAssigned: false, isSelected: false },
        { id: 'u11', fullName: 'Alex Johnson', username: 'alex.j@example.com', profile: 'Standard user clone', isAssigned: false, isSelected: false },
        { id: 'u12', fullName: 'Maria Garcia', username: 'maria.g@example.com', profile: 'Community Plus Clone', isAssigned: false, isSelected: false },
    ];

    get filteredAllUsersData() {
        if (!this.allUsersSearchTerm) return this._allUsersData;
        const term = this.allUsersSearchTerm.toLowerCase();
        return this._allUsersData.filter(u =>
            u.fullName.toLowerCase().includes(term) ||
            u.username.toLowerCase().includes(term) ||
            u.profile.toLowerCase().includes(term)
        );
    }

    get allUsersTotalCount() {
        return this._allUsersData.length;
    }

    get allUsersNewlySelectedCount() {
        return this._allUsersData.filter(u => u.isSelected && !u.isAssigned).length;
    }

    get isAssignDisabled() {
        return this.allUsersNewlySelectedCount === 0;
    }

    handleAllUsersSearch(event) {
        this.allUsersSearchTerm = event.target.value;
    }

    handleUserCheckbox(event) {
        const userId = event.currentTarget.dataset.id;
        this._allUsersData = this._allUsersData.map(u =>
            u.id === userId ? { ...u, isSelected: event.target.checked } : u
        );
    }

    handleAssignSelected() {
        const toAssign = this._allUsersData.filter(u => u.isSelected && !u.isAssigned);
        // Add to assigned datatable
        const updated = [...this._permData];
        toAssign.forEach(u => {
            updated.push({ id: u.id, rowNum: updated.length + 1, fullName: u.fullName, username: u.username, profile: u.profile });
        });
        this._permData = updated.map((row, i) => ({ ...row, rowNum: i + 1 }));
        // Mark as assigned in all-users list
        this._allUsersData = this._allUsersData.map(u =>
            toAssign.find(ta => ta.id === u.id) ? { ...u, isAssigned: true } : u
        );
        // Switch to Assigned Users tab
        this.activePermTab = 'assigned';
    }

    // ── Section 1.4: ACR Roles ──
    @track isAddingAcrRole = false;
    @track newAcrLabel = '';
    @track _acrRoles = [
        { id: 'acr1', label: 'Primary Member', apiName: 'Primary_Member' },
        { id: 'acr2', label: 'Dependent', apiName: 'Dependent' },
        { id: 'acr3', label: 'Spouse', apiName: 'Spouse' },
        { id: 'acr4', label: 'Trustee', apiName: 'Trustee' },
        { id: 'acr5', label: 'Beneficiary', apiName: 'Beneficiary' },
        { id: 'acr6', label: 'Child', apiName: 'Child' },
    ];

    get acrValuesBadge() {
        return `${this._acrRoles.length} values`;
    }

    get newAcrApiName() {
        if (!this.newAcrLabel) return '';
        return this.newAcrLabel.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    }

    handleLearnMoreAcr(event) { event.preventDefault(); }

    handleShowAddAcrRole(event) {
        event.preventDefault();
        this.isAddingAcrRole = true;
    }

    handleCancelAcrRole() {
        this.isAddingAcrRole = false;
        this.newAcrLabel = '';
    }

    handleNewAcrLabelChange(event) {
        this.newAcrLabel = event.target.value;
    }

    handleAddAcrRole() {
        if (!this.newAcrLabel.trim()) return;
        this._acrRoles = [
            ...this._acrRoles,
            { id: `acr${Date.now()}`, label: this.newAcrLabel.trim(), apiName: this.newAcrApiName },
        ];
        this.isAddingAcrRole = false;
        this.newAcrLabel = '';
    }

    // ── Section 1.4: Party Role Relationships ──
    @track isAddingPartyRole = false;
    @track newPartyLabel = '';
    @track newPartyInverseLabel = '';
    @track newPartyType = 'AAR';
    @track _partyRoles = [
        { id: 'g1', isGroupHeader: true, groupLabel: 'CONTACT\u2013CONTACT (CCR)', rowClass: 'my-group-header-row' },
        { id: 'pr1', isGroupHeader: false, label: 'Husband', type: 'CCR', inverseLabel: 'Wife', typeBadgeClass: 'my-ccr-badge', rowClass: '' },
        { id: 'pr2', isGroupHeader: false, label: 'Spouse', type: 'CCR', inverseLabel: 'Spouse', typeBadgeClass: 'my-ccr-badge', rowClass: '' },
        { id: 'pr3', isGroupHeader: false, label: 'Brother', type: 'CCR', inverseLabel: 'Sister', typeBadgeClass: 'my-ccr-badge', rowClass: '' },
        { id: 'pr4', isGroupHeader: false, label: 'Grandparent', type: 'CCR', inverseLabel: 'Grandchild', typeBadgeClass: 'my-ccr-badge', rowClass: '' },
        { id: 'pr5', isGroupHeader: false, label: 'Lawyer', type: 'CCR', inverseLabel: 'Client', typeBadgeClass: 'my-ccr-badge', rowClass: '' },
        { id: 'pr6', isGroupHeader: false, label: 'Accountant', type: 'CCR', inverseLabel: 'Client', typeBadgeClass: 'my-ccr-badge', rowClass: '' },
        { id: 'pr7', isGroupHeader: false, label: 'Executor', type: 'CCR', inverseLabel: 'Heir', typeBadgeClass: 'my-ccr-badge', rowClass: '' },
        { id: 'pr8', isGroupHeader: false, label: 'Child', type: 'CCR', inverseLabel: 'Parent', typeBadgeClass: 'my-ccr-badge', rowClass: '' },
        { id: 'g2', isGroupHeader: true, groupLabel: 'ACCOUNT\u2013ACCOUNT (AAR)', rowClass: 'my-group-header-row' },
        { id: 'pr9',  isGroupHeader: false, label: 'Trust', type: 'AAR', inverseLabel: 'Owner', typeBadgeClass: 'my-aar-badge', rowClass: '' },
        { id: 'pr10', isGroupHeader: false, label: 'Owner', type: 'AAR', inverseLabel: 'Holding', typeBadgeClass: 'my-aar-badge', rowClass: '' },
        { id: 'pr11', isGroupHeader: false, label: 'Parent Company', type: 'AAR', inverseLabel: 'Subsidiary', typeBadgeClass: 'my-aar-badge', rowClass: '' },
        { id: 'pr12', isGroupHeader: false, label: 'Household', type: 'AAR', inverseLabel: 'Family Office', typeBadgeClass: 'my-aar-badge', rowClass: '' },
        { id: 'pr13', isGroupHeader: false, label: 'Lender', type: 'AAR', inverseLabel: 'Borrower', typeBadgeClass: 'my-aar-badge', rowClass: '' },
        { id: 'pr14', isGroupHeader: false, label: 'Custodian', type: 'AAR', inverseLabel: 'Beneficiary', typeBadgeClass: 'my-aar-badge', rowClass: '' },
        { id: 'pr15', isGroupHeader: false, label: 'Employer', type: 'AAR', inverseLabel: 'Employee', typeBadgeClass: 'my-aar-badge', rowClass: '' },
    ];

    partyTypeOptions = [
        { label: 'CCR \u2014 Contact\u2013Contact', value: 'CCR' },
        { label: 'AAR \u2014 Account\u2013Account', value: 'AAR' },
    ];

    get partyValuesBadge() {
        return `${this._partyRoles.filter(r => !r.isGroupHeader).length} values`;
    }

    handleLearnMoreParty(event) { event.preventDefault(); }

    handleShowAddPartyRole(event) {
        event.preventDefault();
        this.isAddingPartyRole = true;
    }

    handleCancelPartyRole() {
        this.isAddingPartyRole = false;
        this.newPartyLabel = '';
        this.newPartyInverseLabel = '';
        this.newPartyType = 'AAR';
    }

    handleNewPartyLabelChange(event) { this.newPartyLabel = event.target.value; }
    handleNewPartyInverseLabelChange(event) { this.newPartyInverseLabel = event.target.value; }
    handleNewPartyTypeChange(event) { this.newPartyType = event.detail.value; }

    handleAddPartyRole() {
        if (!this.newPartyLabel.trim() || !this.newPartyInverseLabel.trim()) return;
        const badgeClass = this.newPartyType === 'CCR' ? 'my-ccr-badge' : 'my-aar-badge';
        this._partyRoles = [
            ...this._partyRoles,
            { id: `pr${Date.now()}`, isGroupHeader: false, label: this.newPartyLabel.trim(), type: this.newPartyType, inverseLabel: this.newPartyInverseLabel.trim(), typeBadgeClass: badgeClass, rowClass: '' },
        ];
        this.isAddingPartyRole = false;
        this.newPartyLabel = '';
        this.newPartyInverseLabel = '';
        this.newPartyType = 'AAR';
    }

    // ── Section 2.1: New Member Settings ──
    @track newMemberAcc1Expanded = true;
    @track newMemberAcc2Expanded = true;
    @track contactFieldsOpen = false;
    @track acrFieldsOpen = false;

    @track _contactFields = [
        { id: 'cf1', label: 'Salutation', isSelected: true },
        { id: 'cf2', label: 'First Name', isSelected: true },
        { id: 'cf3', label: 'Last Name', isSelected: true },
        { id: 'cf4', label: 'Phone', isSelected: true },
        { id: 'cf5', label: 'Email', isSelected: false },
        { id: 'cf6', label: 'Title', isSelected: false },
        { id: 'cf7', label: 'Department', isSelected: false },
        { id: 'cf8', label: 'Birthdate', isSelected: false },
    ];

    @track _acrFields = [
        { id: 'af1', label: 'Account Name', isSelected: true },
        { id: 'af2', label: 'Phone', isSelected: true },
        { id: 'af3', label: 'Parent Account', isSelected: true },
        { id: 'af4', label: 'Industry', isSelected: false },
        { id: 'af5', label: 'Type', isSelected: false },
        { id: 'af6', label: 'Website', isSelected: false },
        { id: 'af7', label: 'Billing City', isSelected: false },
        { id: 'af8', label: 'Billing State', isSelected: false },
        { id: 'af9', label: 'Annual Revenue', isSelected: false },
    ];

    get newMemberAcc1Chevron() { return this.newMemberAcc1Expanded ? 'utility:chevrondown' : 'utility:chevronright'; }
    get newMemberAcc2Chevron() { return this.newMemberAcc2Expanded ? 'utility:chevrondown' : 'utility:chevronright'; }

    get selectedContactFieldPills() { return this._contactFields.filter(f => f.isSelected); }
    get selectedAcrFieldPills()     { return this._acrFields.filter(f => f.isSelected); }

    get contactFieldsSelectedLabel() {
        const n = this.selectedContactFieldPills.length;
        return `${n} option${n !== 1 ? 's' : ''} selected`;
    }

    get acrFieldsSelectedLabel() {
        const n = this.selectedAcrFieldPills.length;
        return `${n} option${n !== 1 ? 's' : ''} selected`;
    }

    handleToggleNewMemberAcc1() { this.newMemberAcc1Expanded = !this.newMemberAcc1Expanded; }
    handleToggleNewMemberAcc2() { this.newMemberAcc2Expanded = !this.newMemberAcc2Expanded; }

    handleContactFieldsDropdown(event) { event.preventDefault(); this.contactFieldsOpen = !this.contactFieldsOpen; }
    handleAcrFieldsDropdown(event)     { event.preventDefault(); this.acrFieldsOpen = !this.acrFieldsOpen; }

    handleContactObjectClick(event)    { event.preventDefault(); }
    handleAcrObjectClick(event)        { event.preventDefault(); }

    handleContactFieldCheck(event) {
        const id = event.currentTarget.dataset.id;
        this._contactFields = this._contactFields.map(f =>
            f.id === id ? { ...f, isSelected: event.target.checked } : f
        );
    }

    handleAcrFieldCheck(event) {
        const id = event.currentTarget.dataset.id;
        this._acrFields = this._acrFields.map(f =>
            f.id === id ? { ...f, isSelected: event.target.checked } : f
        );
    }

    handleRemoveContactField(event) {
        event.preventDefault();
        const id = event.currentTarget.dataset.id;
        this._contactFields = this._contactFields.map(f =>
            f.id === id ? { ...f, isSelected: false } : f
        );
    }

    handleRemoveAcrField(event) {
        event.preventDefault();
        const id = event.currentTarget.dataset.id;
        this._acrFields = this._acrFields.map(f =>
            f.id === id ? { ...f, isSelected: false } : f
        );
    }

    // ── Section 2.2: Household Settings ──
    @track hhAcc1Expanded = true;
    @track hhAcc2Expanded = true;
    @track accountFieldsOpen = false;
    @track prgFieldsOpen = false;

    @track _accountFields = [
        { id: 'hf1', label: 'Name', isSelected: true },
        { id: 'hf2', label: 'Phone', isSelected: false },
        { id: 'hf3', label: 'Website', isSelected: false },
        { id: 'hf4', label: 'Industry', isSelected: false },
        { id: 'hf5', label: 'Type', isSelected: false },
        { id: 'hf6', label: 'Billing City', isSelected: false },
        { id: 'hf7', label: 'Billing State', isSelected: false },
        { id: 'hf8', label: 'Annual Revenue', isSelected: false },
    ];

    @track _prgFields = [
        { id: 'pf1', label: 'Name', isSelected: false },
        { id: 'pf2', label: 'Type', isSelected: false },
        { id: 'pf3', label: 'Status', isSelected: false },
        { id: 'pf4', label: 'Start Date', isSelected: false },
        { id: 'pf5', label: 'End Date', isSelected: false },
        { id: 'pf6', label: 'Description', isSelected: false },
    ];

    get hhAcc1Chevron() { return this.hhAcc1Expanded ? 'utility:chevrondown' : 'utility:chevronright'; }
    get hhAcc2Chevron() { return this.hhAcc2Expanded ? 'utility:chevrondown' : 'utility:chevronright'; }

    get selectedAccountFieldPills() { return this._accountFields.filter(f => f.isSelected); }
    get selectedPrgFieldPills()     { return this._prgFields.filter(f => f.isSelected); }

    get accountFieldsSelectedLabel() {
        const n = this.selectedAccountFieldPills.length;
        return `${n} option${n !== 1 ? 's' : ''} selected`;
    }

    get prgFieldsSelectedLabel() {
        const n = this.selectedPrgFieldPills.length;
        return `${n} option${n !== 1 ? 's' : ''} selected`;
    }

    handleToggleHhAcc1() { this.hhAcc1Expanded = !this.hhAcc1Expanded; }
    handleToggleHhAcc2() { this.hhAcc2Expanded = !this.hhAcc2Expanded; }

    handleAccountFieldsDropdown(event) { event.preventDefault(); this.accountFieldsOpen = !this.accountFieldsOpen; }
    handlePrgFieldsDropdown(event)     { event.preventDefault(); this.prgFieldsOpen = !this.prgFieldsOpen; }

    handleAccountObjectClick(event)    { event.preventDefault(); }
    handlePrgObjectClick(event)        { event.preventDefault(); }

    handleAccountFieldCheck(event) {
        const id = event.currentTarget.dataset.id;
        this._accountFields = this._accountFields.map(f =>
            f.id === id ? { ...f, isSelected: event.target.checked } : f
        );
    }

    handlePrgFieldCheck(event) {
        const id = event.currentTarget.dataset.id;
        this._prgFields = this._prgFields.map(f =>
            f.id === id ? { ...f, isSelected: event.target.checked } : f
        );
    }

    handleRemoveAccountField(event) {
        event.preventDefault();
        const id = event.currentTarget.dataset.id;
        this._accountFields = this._accountFields.map(f =>
            f.id === id ? { ...f, isSelected: false } : f
        );
    }

    handleRemovePrgField(event) {
        event.preventDefault();
        const id = event.currentTarget.dataset.id;
        this._prgFields = this._prgFields.map(f =>
            f.id === id ? { ...f, isSelected: false } : f
        );
    }

    // ── Section 3.1: Objects in Timeline ──
    @track timelineSearchTerm = '';
    @track activeTimelineMenu = null;
    @track _timelineObjects = [
        { id: 'tl1', num: 1, label: 'Life Event',        dotClass: 'my-dot my-dot-blue',   visible: true  },
        { id: 'tl2', num: 2, label: 'Financial Goal',    dotClass: 'my-dot my-dot-orange', visible: true  },
        { id: 'tl3', num: 3, label: 'Financial Product', dotClass: 'my-dot my-dot-green',  visible: true  },
        { id: 'tl4', num: 4, label: 'Opportunity',       dotClass: 'my-dot my-dot-purple', visible: false },
    ];

    get timelineObjectCount() {
        const n = this._timelineObjects.length;
        return `${n} object${n !== 1 ? 's' : ''}`;
    }

    get filteredTimelineObjects() {
        const term = this.timelineSearchTerm.toLowerCase();
        const list = term
            ? this._timelineObjects.filter(o => o.label.toLowerCase().includes(term))
            : this._timelineObjects;
        return list.map(obj => ({
            ...obj,
            rowClass: `slds-hint-parent my-timeline-row${this.activeTimelineMenu === obj.id ? ' my-timeline-row_active' : ''}`,
            isMenuOpen: this.activeTimelineMenu === obj.id,
            menuBtnClass: `my-row-menu-btn${this.activeTimelineMenu === obj.id ? ' my-row-menu-btn_active' : ''}`,
        }));
    }

    handleTimelineSearch(event)  { this.timelineSearchTerm = event.target.value; }

    handleTimelineToggle(event) {
        const id = event.currentTarget.dataset.id;
        this._timelineObjects = this._timelineObjects.map(o =>
            o.id === id ? { ...o, visible: event.target.checked } : o
        );
    }

    handleTimelineMenu(event) {
        event.preventDefault();
        const id = event.currentTarget.dataset.id;
        this.activeTimelineMenu = this.activeTimelineMenu === id ? null : id;
    }

    handleTimelineEdit(event) {
        event.preventDefault();
        this.activeTimelineMenu = null;
    }

    handleTimelineRemove(event) {
        event.preventDefault();
        const id = event.currentTarget.dataset.id;
        this._timelineObjects = this._timelineObjects
            .filter(o => o.id !== id)
            .map((o, i) => ({ ...o, num: i + 1 }));
        this.activeTimelineMenu = null;
    }

    async handleAddTimelineObject() {
        this.activeTimelineMenu = null;
        // Collect colors already assigned so the palette can hide them
        const usedColors = this._timelineObjects
            .map(o => o.dotClass.split(' ').find(c => c.startsWith('my-dot-')))
            .filter(Boolean);
        const result = await AddObjectModal.open({ size: 'small', label: 'Add Object', usedColors });
        if (result) {
            const newId = `tl${Date.now()}`;
            const num = this._timelineObjects.length + 1;
            this._timelineObjects = [
                ...this._timelineObjects,
                { id: newId, num, label: result.label, dotClass: `my-dot ${result.colorClass}`, visible: result.visible },
            ];
            // Initialise an empty detail-field set for the new object
            this._detailFieldSets = { ...this._detailFieldSets, [newId]: [] };
        }
    }

    // ── Section 3.2: Detail Panel Fields ──
    @track activeDetailTab = 'tl1';
    @track addFieldDropdownOpen = false;

    @track _detailFieldSets = {
        tl1: [
            { id: 'lef1',  label: 'Event Type',       dataType: 'Picklist',               isHighlight: true,  isAdded: true  },
            { id: 'lef2',  label: 'Event Date',        dataType: 'Date/Time',              isHighlight: true,  isAdded: true  },
            { id: 'lef3',  label: 'Description',       dataType: 'Long Text Area',         isHighlight: true,  isAdded: true  },
            { id: 'lef4',  label: 'Primary Person',    dataType: 'Master-Detail(Contact)', isHighlight: true,  isAdded: true  },
            { id: 'lef5',  label: 'Owner',             dataType: 'Lookup(User)',           isHighlight: false, isAdded: true  },
            { id: 'lef6',  label: 'Event Location',    dataType: 'Address',                isHighlight: false, isAdded: true  },
            { id: 'lef7',  label: 'Event Name',        dataType: 'Text',                   isHighlight: false, isAdded: false },
            { id: 'lef8',  label: 'Expiration Date',   dataType: 'Date',                   isHighlight: false, isAdded: false },
            { id: 'lef9',  label: 'Expired',           dataType: 'Checkbox',               isHighlight: false, isAdded: false },
            { id: 'lef10', label: 'Related Person',    dataType: 'Lookup(Contact)',        isHighlight: false, isAdded: false },
        ],
        tl2: [
            { id: 'fgf1', label: 'Goal Name',     dataType: 'Text',           isHighlight: true,  isAdded: true  },
            { id: 'fgf2', label: 'Target Amount',  dataType: 'Currency',       isHighlight: true,  isAdded: true  },
            { id: 'fgf3', label: 'Target Date',    dataType: 'Date',           isHighlight: false, isAdded: true  },
            { id: 'fgf4', label: 'Status',         dataType: 'Picklist',       isHighlight: false, isAdded: true  },
            { id: 'fgf5', label: 'Probability',    dataType: 'Percent',        isHighlight: false, isAdded: false },
            { id: 'fgf6', label: 'Notes',          dataType: 'Long Text Area', isHighlight: false, isAdded: false },
        ],
        tl3: [
            { id: 'fpf1', label: 'Product Name',           dataType: 'Text',            isHighlight: true,  isAdded: true  },
            { id: 'fpf2', label: 'Account',                dataType: 'Lookup(Account)', isHighlight: true,  isAdded: true  },
            { id: 'fpf3', label: 'Financial Account Type', dataType: 'Picklist',        isHighlight: false, isAdded: true  },
            { id: 'fpf4', label: 'Balance',                dataType: 'Currency',        isHighlight: false, isAdded: true  },
            { id: 'fpf5', label: 'Open Date',              dataType: 'Date',            isHighlight: false, isAdded: false },
            { id: 'fpf6', label: 'Interest Rate',          dataType: 'Percent',         isHighlight: false, isAdded: false },
        ],
        tl4: [
            { id: 'opf1', label: 'Opportunity Name', dataType: 'Text',           isHighlight: true,  isAdded: true  },
            { id: 'opf2', label: 'Amount',           dataType: 'Currency',       isHighlight: true,  isAdded: true  },
            { id: 'opf3', label: 'Close Date',       dataType: 'Date',           isHighlight: false, isAdded: true  },
            { id: 'opf4', label: 'Stage',            dataType: 'Picklist',       isHighlight: false, isAdded: true  },
            { id: 'opf5', label: 'Lead Source',      dataType: 'Picklist',       isHighlight: false, isAdded: false },
            { id: 'opf6', label: 'Description',      dataType: 'Long Text Area', isHighlight: false, isAdded: false },
        ],
    };

    get detailTabs() {
        return this._timelineObjects.map(obj => ({
            id: obj.id,
            label: obj.label,
            dotClass: obj.dotClass,
            tabClass: `my-detail-tab${this.activeDetailTab === obj.id ? ' my-detail-tab_active' : ''}`,
        }));
    }

    _activeDetailFieldsRaw() {
        return this._detailFieldSets[this.activeDetailTab] || [];
    }

    get highlightCount() {
        return this._activeDetailFieldsRaw().filter(f => f.isAdded && f.isHighlight).length;
    }

    get highlightBadge() {
        return `${this.highlightCount} / 4`;
    }

    get activeDetailFields() {
        const count = this.highlightCount;
        return this._activeDetailFieldsRaw()
            .filter(f => f.isAdded)
            .map(f => ({ ...f, isHighlightDisabled: !f.isHighlight && count >= 4 }));
    }

    get availableFieldsForTab() {
        return this._activeDetailFieldsRaw().filter(f => !f.isAdded);
    }

    get noAvailableFields() {
        return this.availableFieldsForTab.length === 0;
    }

    get addFieldSelectedLabel() {
        return 'Choose a field\u2026';
    }

    handleDetailTabClick(event) {
        event.preventDefault();
        this.activeDetailTab = event.currentTarget.dataset.id;
        this.addFieldDropdownOpen = false;
    }

    handleHighlightToggle(event) {
        const id = event.currentTarget.dataset.id;
        const tab = this.activeDetailTab;
        this._detailFieldSets = {
            ...this._detailFieldSets,
            [tab]: this._detailFieldSets[tab].map(f =>
                f.id === id ? { ...f, isHighlight: event.target.checked } : f
            ),
        };
    }

    handleRemoveDetailField(event) {
        event.preventDefault();
        const id = event.currentTarget.dataset.id;
        const tab = this.activeDetailTab;
        this._detailFieldSets = {
            ...this._detailFieldSets,
            [tab]: this._detailFieldSets[tab].map(f =>
                f.id === id ? { ...f, isAdded: false, isHighlight: false } : f
            ),
        };
    }

    handleAddFieldDropdown(event) {
        event.preventDefault();
        this.addFieldDropdownOpen = !this.addFieldDropdownOpen;
    }

    handleSelectAddField(event) {
        event.preventDefault();
        const id = event.currentTarget.dataset.id;
        const tab = this.activeDetailTab;
        this._detailFieldSets = {
            ...this._detailFieldSets,
            [tab]: this._detailFieldSets[tab].map(f =>
                f.id === id ? { ...f, isAdded: true } : f
            ),
        };
        this.addFieldDropdownOpen = false;
    }

    // ── Footer ──
    handleSaveNext() {
        this.close({ section: this.activeSection });
    }
}
