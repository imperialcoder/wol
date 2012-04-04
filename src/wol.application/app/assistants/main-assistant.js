function MainAssistant(targetStore) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.targetStore = targetStore;
}

MainAssistant.prototype.sendWOLResponse = function (response) {
  if (response.success === true) {
	  Mojo.Controller.getAppController().showBanner("Magic packet sent.", {});
  } else {
		Mojo.Controller.errorDialog(response.error);
  }
};

MainAssistant.prototype.sendWOL = function(value) {
  if (value == "yes") {
		this.controller.serviceRequest("palm://com.thebitguru.wol.service", {
			method: "sendWoL",
			parameters: {macAddress: this.choosenItem.macAddress, broadcastIP: this.choosenItem.hostName.strip(),
				port: this.choosenItem.port},
			onSuccess: this.sendWOLResponse.bind(this),
			onFailure: function (repsonse) {
				Mojo.controller.errorDialog("Sorry, the service call failed.");
			}.bind(this)
		});
	}
};

// This is called in response to the "getstatus" service call in handleListTap.
// Once we get the connection info then we present a dialog box confirming the action.
MainAssistant.prototype.connectionInfoReceived = function(response) {
  this.controller.showAlertDialog({
    onChoose: this.sendWOL.bind(this),
    title: "Send magic packet?",
    message: "Are you sure you want to send the magic packet?",
    choices: [
      {label: "Yes", value: "yes", type: "affirmative"},
      {label: "Cancel", value: "no", type: "dismiss"}
    ]
  });
};

MainAssistant.prototype.handleListTap = function(listTapEvent) {
  var item = listTapEvent.item;
  this.choosenItem = item;
  
  this.controller.serviceRequest("palm://com.palm.connectionmanager", {
    method: "getstatus", parameters: {}, onSuccess: this.connectionInfoReceived.bind(this)
  });
};


MainAssistant.prototype.handleListHold = function(event) {
	if(event.type === Mojo.Event.hold) 
		event.preventDefault();
	
	var name = event.srcElement.up(".palm-row").childNodes[1].childNodes[1].innerHTML;
	var selectedTarget = '';
	
	for(var i=0; i<this.targetStore.items.length; i++) {
        if (this.targetStore.items[i].name == name) {
			selectedTarget = this.targetStore.items[i];
			break;
		}
	}	
	this.controller.stageController.pushScene("target", selectedTarget, this.targetStore);
};

MainAssistant.prototype.handleAddTarget = function(event) {
	this.controller.stageController.pushScene("target", undefined, this.targetStore);
};

MainAssistant.prototype.handleDeleteTarget = function(event) {
	var deleteIndex = this.targetStore.items.indexOf(event.item);
	this.targetStore.items.splice(deleteIndex, 1);
	this.targetStore.storeDb();
};

// Dynamically sets the host and ports for display in the item template.
MainAssistant.prototype.setHostAndPort = function(propertyValue, model) {
	model.hostAndPortDisplay = "block";
	// For backwards compatibility.
	if (Object.isUndefined(model.port)) {
		model.port = 9;
	}
	
	if (Object.isUndefined(model.hostName) || (model.hostName == "") || (model.hostName == "255.255.255.255")) {
		model.hostName = "255.255.255.255";
		model.hostAndPort = "Local LAN on port " + model.port;
	} else {
		model.hostAndPort = model.hostName + ", port " + model.port;
		model.hostAndPortDisplay = "block";
	}
}

MainAssistant.prototype.setup = function() {
  /* this function is for setup tasks that have to happen when the scene is first created */
  
	this.targetListModel = { items: this.targetStore.items };
	
  this.controller.setupWidget("targetList",
      this.attributes = {
        itemTemplate: "main/target-row_template",
		addItemLabel: $L("Add..."),
        swipeToDelete: true,
        reorderable: false,
		formatters: { hostAndPortDisplay: this.setHostAndPort.bind(this) }
      },
      this.model = this.targetListModel
  );
  	
	this.controller.setupWidget(Mojo.Menu.appMenu, WOLUI.MenuAttrs, WOLUI.MenuModel);

	this.controller.listen('targetList', Mojo.Event.hold, this.handleListHold.bindAsEventListener(this));
	this.controller.listen('targetList', Mojo.Event.listTap, this.handleListTap.bindAsEventListener(this));
	this.controller.listen('targetList', Mojo.Event.listAdd, this.handleAddTarget.bindAsEventListener(this));
	this.controller.listen('targetList', Mojo.Event.listDelete, this.handleDeleteTarget.bindAsEventListener(this));
};

MainAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	this.controller.modelChanged(this.targetListModel);
};

MainAssistant.prototype.deactivate = function(event) {
};

MainAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening('targetList', Mojo.Event.hold, this.handleListHold);
	this.controller.stopListening('targetList', Mojo.Event.listTap, this.handleListTap);
	this.controller.stopListening('targetList', Mojo.Event.listAdd, this.handleAddTarget);
	this.controller.stopListening('targetList', Mojo.Event.listDelete, this.handleDeleteTarget);
};
