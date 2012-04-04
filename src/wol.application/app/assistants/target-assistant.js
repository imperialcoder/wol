function TargetAssistant(target, targetStore) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.targetStore = targetStore;
	if (Object.isUndefined(target)) {
		this.target = {name: "", macAddress: "", hostName: ""};
		this.update = false;
	} else {
		this.target = target;
		this.index = targetStore.items.indexOf(target);
		this.update = true;
	}
	Mojo.Log.error(this.target.name + ' ' + this.index + ' ' + this.update);
}

TargetAssistant.prototype.toggleOptionalDrawer = function() {
	this.optionalDrawer.mojo.setOpenState(!this.optionalDrawer.mojo.getOpenState());

	if (this.optionalDrawer.mojo.getOpenState() == true)
		this.controller.get("optionalDrawerDividerButton").removeClassName("palm-arrow-closed").addClassName("palm-arrow-expanded");
	else
		this.controller.get("optionalDrawerDividerButton").removeClassName("palm-arrow-expanded").addClassName("palm-arrow-closed");
}

TargetAssistant.prototype.setup = function() {
	this.controller.setupWidget(Mojo.Menu.appMenu, WOLUI.MenuAttrs, WOLUI.MenuModel);
	
	if(WOL.isTouchPad()){
		var menuModel = {

				 visible: true,
				 items: [ 
						{ icon: "back", command: "goBack"}
				 ]
			 }; 

		 this.controller.setupWidget(Mojo.Menu.commandMenu,
			 this.attributes = {
				 spacerHeight: 0,
				 menuClass: 'no-fade'
			 },
			 menuModel
		 )
	};
	
    //this.controller.setupWidget("saveButton", {}, {	"label" : "Save", "buttonClass" : "",	"disabled" : false});	 
	
	this.targetNameModel = { value: this.target.name };
	this.targetMACModel = { value: this.target.macAddress };
	this.targetHostModel = { value: this.target.hostName };
	this.targetPortModel = {value: this.target.hostPort };
	this.controller.setupWidget("targetName", {
		multiline: false, textCase: Mojo.Widget.steModeLowerCase
		}, this.model = this.targetNameModel
	);
	this.controller.setupWidget("targetMAC", { multiline: false }, this.model = this.targetMACModel);
	this.controller.setupWidget("targetHostName", {
		multiline: false, textCase: Mojo.Widget.steModeLowerCase
		}, this.model = this.targetHostModel
	);

	this.controller.setupWidget("targetPort", {
				multiline: false,
				textCase: Mojo.Widget.steModeLowerCase,
				hintText: '9',
				charsAllow: function(charCode) {
					var isValid = (charCode >= 48 && charCode <= 57);  // Only allow 0-9
					if (charCode == 27) {  // 27-Escape is a special case that is also sent by the back gesture so we allow that.
						isValid = True;
					}
					if (!isValid) {
						Mojo.Controller.errorDialog("Port must be numeric.");
					}
					return isValid;
				}
			},
		this.model = this.targetPortModel
	);

	this.controller.setupWidget("optionalDrawer",
		this.attributes = {
			modelProperty: 'open',
			unstyled: true
		},
		this.model = { open: false }
	);

	this.optionalDrawer = this.controller.get("optionalDrawer");
	this.controller.listen(this.controller.get("optionalDrawerDivider"), Mojo.Event.tap, this.toggleOptionalDrawer.bindAsEventListener(this));	
	
	//this.controller.listen(this.controller.get("saveButton"), Mojo.Event.tap, this.handleButtonTap.bindAsEventListener(this));
	
	// if(WOL.isTouchPad()){
		// this.optionalDrawer.adClassName("touchpad");
	// };

	//this.controller.setupWidget("tryButton", {}, { label: "Try Magic Packet", buttonClass: "secondary"});
	//Mojo.Event.listen("tryButton", Mojo.Event.tap, this.handleTry.bind(this));
};

TargetAssistant.prototype.handleButtonTap = function(event){
	
	var port = 9;
	if (!Object.isUndefined(this.targetPortModel.value) && (this.targetPortModel.value != "")) {
		port = parseInt(this.targetPortModel.value);
	}
	target = {
		name: this.targetNameModel.value,
		macAddress: this.targetMACModel.value,
		hostName: this.targetHostModel.value,
		port: port
	};
	
	// Ignore if either name or mac address field is blank.
	if ((target.name === "") || (target.macAddress === "")) {
		return;
	}
	
	Mojo.Log.error(this.target.name + ' ' + this.index + ' ' + this.update);
	
	if(!this.update){
		//insert
		this.targetStore.items.push(target);
	} else {
		//update
		this.targetStore.items[this.index] = target;
	}
	this.targetStore.storeDb();
	this.controller.stageController.popScene();
};

TargetAssistant.prototype.handleTry = function() {
};

TargetAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};


TargetAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	   var port = 9;
	if (!Object.isUndefined(this.targetPortModel.value) && (this.targetPortModel.value != "")) {
		port = parseInt(this.targetPortModel.value);
	}
	target = {
		name: this.targetNameModel.value,
		macAddress: this.targetMACModel.value,
		hostName: this.targetHostModel.value,
		port: port
	};
	
	// Ignore if either name or mac address field is blank.
	if ((target.name === "") || (target.macAddress === "")) {
		return;
	}
		
	if(!this.update){
		//insert
		this.targetStore.items.push(target);
	} else {
		//update
		this.targetStore.items[this.index] = target;
	}
	this.targetStore.storeDb();
};

TargetAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	   this.controller.stopListening(this.controller.get("optionalDrawerDivider"), Mojo.Event.tap, this.toggleOptionalDrawer);
	   //this.controller.stopListening(this.controller.get("saveButton"), Mojo.Event.tap, this.handleButtonTap);
};
