function AboutAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

AboutAssistant.prototype.versionResponse = function (response) {
  if (response.success === true) {
		this.controller.get('serviceVersion').innerHTML = response.version;
  } else {
		Mojo.Controller.errorDialog("Could not get service version.\n" + response.errorText);
  }
};

AboutAssistant.prototype.setup = function() {
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, {});
	this.controller.get("appVersion").innerHTML = Mojo.Controller.appInfo.version;
	
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

	// Make a call to get the version.
	this.controller.serviceRequest("palm://com.thebitguru.wol.service", {
		method: "version",
		parameters: {},
		onSuccess: this.versionResponse.bind(this),
		onFailure: function (repsonse) {
			Mojo.Controller.errorDialog("Sorry, the service call failed: " + repsonse.errorText);
		}.bind(this)
	});
};

AboutAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};


AboutAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

AboutAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
