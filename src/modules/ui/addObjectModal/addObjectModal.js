import { api, track } from 'lwc';
import LightningModal from 'lightning/modal';

export default class AddObjectModal extends LightningModal {

    // Colors already assigned to existing timeline objects — passed via open()
    @api usedColors = [];

    @track selectedObject  = '';
    @track selectedColorClass = 'my-dot-gray';
    @track colorPickerOpen = false;
    @track objectDropdownOpen = false;
    @track dateField = '';
    @track relationshipField = '';
    @track visibleByDefault = true;

    objectChoices = [
        { value: 'LifeEvent',       label: 'Life Event',        apiName: 'FinServ__LifeEvent__c',       defaultColorClass: 'my-dot-blue'   },
        { value: 'FinancialGoal',   label: 'Financial Goal',    apiName: 'FinServ__FinancialGoal__c',   defaultColorClass: 'my-dot-orange' },
        { value: 'FinancialProd',   label: 'Financial Product', apiName: 'FinServ__FinancialAccount__c',defaultColorClass: 'my-dot-green'  },
        { value: 'Opportunity',     label: 'Opportunity',       apiName: 'Opportunity',                 defaultColorClass: 'my-dot-purple' },
        { value: 'Case',            label: 'Case',              apiName: 'Case',                        defaultColorClass: 'my-dot-purple' },
        { value: 'Task',            label: 'Task',              apiName: 'Task',                        defaultColorClass: 'my-dot-yellow' },
        { value: 'Event',           label: 'Event',             apiName: 'Event',                       defaultColorClass: 'my-dot-red'    },
        { value: 'Lead',            label: 'Lead',              apiName: 'Lead',                        defaultColorClass: 'my-dot-orange' },
        { value: 'Contact',         label: 'Contact',           apiName: 'Contact',                     defaultColorClass: 'my-dot-blue'   },
        { value: 'CampaignMember',  label: 'Campaign Member',   apiName: 'CampaignMember',              defaultColorClass: 'my-dot-teal'   },
    ];

    colorPalette = [
        { id: 'c1', colorClass: 'my-dot-blue',   label: 'Blue',   btnClass: 'my-color-swatch my-dot-blue'   },
        { id: 'c2', colorClass: 'my-dot-orange', label: 'Orange', btnClass: 'my-color-swatch my-dot-orange' },
        { id: 'c3', colorClass: 'my-dot-green',  label: 'Green',  btnClass: 'my-color-swatch my-dot-green'  },
        { id: 'c4', colorClass: 'my-dot-purple', label: 'Purple', btnClass: 'my-color-swatch my-dot-purple' },
        { id: 'c5', colorClass: 'my-dot-red',    label: 'Red',    btnClass: 'my-color-swatch my-dot-red'    },
        { id: 'c6', colorClass: 'my-dot-teal',   label: 'Teal',   btnClass: 'my-color-swatch my-dot-teal'   },
        { id: 'c7', colorClass: 'my-dot-yellow', label: 'Yellow', btnClass: 'my-color-swatch my-dot-yellow' },
        { id: 'c8', colorClass: 'my-dot-navy',   label: 'Navy',   btnClass: 'my-color-swatch my-dot-navy'   },
    ];

    dateFieldOptions = [
        { label: 'EventDate',   value: 'EventDate'   },
        { label: 'TargetDate',  value: 'TargetDate'  },
        { label: 'OpenDate',    value: 'OpenDate'    },
        { label: 'CloseDate',   value: 'CloseDate'   },
        { label: 'BirthDate',   value: 'BirthDate'   },
        { label: 'CreatedDate', value: 'CreatedDate' },
    ];

    relationshipFieldOptions = [
        { label: 'AccountId \u2014 Account', value: 'AccountId' },
        { label: 'ContactId \u2014 Contact', value: 'ContactId' },
        { label: 'OwnerId \u2014 Owner',     value: 'OwnerId'   },
    ];

    get selectedObjData() {
        return this.objectChoices.find(o => o.value === this.selectedObject) || null;
    }

    get selectedSwatchClass() {
        return `my-swatch-dot ${this.selectedColorClass}`;
    }

    // Colors already in use are hidden from the palette
    get availableColors() {
        return this.colorPalette.filter(c => !this.usedColors.includes(c.colorClass));
    }

    get objPickerClass() {
        return `my-obj-picker${this.selectedObject ? ' my-obj-picker_active' : ''}`;
    }

    get objLabelClass() {
        return this.selectedObject ? 'my-obj-label' : 'my-obj-label my-obj-label_placeholder';
    }

    get selectedObjectDisplayLabel() {
        if (!this.selectedObject) return '\u2014 Choose a Salesforce object \u2014';
        return this.selectedObjData ? this.selectedObjData.label : this.selectedObject;
    }

    get objectApiName() {
        return this.selectedObjData ? this.selectedObjData.apiName : '';
    }

    get isFieldsDisabled() {
        return !this.selectedObject;
    }

    get isAddDisabled() {
        return !this.selectedObject;
    }

    // ── Handlers ──

    handleColorPickerToggle(event) {
        event.preventDefault();
        this.colorPickerOpen = !this.colorPickerOpen;
        this.objectDropdownOpen = false;
    }

    handleSelectColor(event) {
        event.preventDefault();
        this.selectedColorClass = event.currentTarget.dataset.colorClass;
        this.colorPickerOpen = false;
    }

    handleObjectDropdownToggle(event) {
        event.preventDefault();
        this.objectDropdownOpen = !this.objectDropdownOpen;
        this.colorPickerOpen = false;
    }

    handleSelectObject(event) {
        event.preventDefault();
        this.selectedObject    = event.currentTarget.dataset.value;
        this.objectDropdownOpen = false;
        const obj = this.objectChoices.find(o => o.value === this.selectedObject);
        if (obj) this.selectedColorClass = obj.defaultColorClass;
    }

    handleDateFieldChange(event)        { this.dateField = event.detail.value; }
    handleRelationshipFieldChange(event){ this.relationshipField = event.detail.value; }
    handleVisibleChange(event)          { this.visibleByDefault = event.target.checked; }

    handleCancel()  { this.close(null); }

    handleAddObject() {
        if (!this.selectedObject) return;
        this.close({
            label:      this.selectedObjData.label,
            colorClass: this.selectedColorClass,
            visible:    this.visibleByDefault,
        });
    }
}
