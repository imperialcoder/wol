WOLUI = {};
WOLUI.MenuAttrs = { omitDefaultItems: true };
WOLUI.MenuModel = {
	visible: true,
	items: [
		{label: "About Wake-on-LAN...", command: "aboutApp"}
	]
};


WOL = {};
WOL.isTouchPad = function(){
	if(Mojo.Environment.DeviceInfo.modelNameAscii.indexOf("ouch")>-1) {return true;}
	if(Mojo.Environment.DeviceInfo.screenWidth==1024){ return true; }
	if(Mojo.Environment.DeviceInfo.screenHeight==1024){ return true; }
	return false;
};


function StageAssistant() {
	this.targetStore = new TargetStore();
}

StageAssistant.prototype.setup = function() {
	this.targetStore.loadDb(function() {
		this.controller.pushScene('main', this.targetStore);
	}.bind(this));
};

StageAssistant.prototype.handleCommand = function(event) {
	if (event.type == Mojo.Event.command) {
		switch(event.command) {
			case "aboutApp":
				this.controller.pushScene('about');
				break;
			case 'goBack':
				this.controller.popScene();
				break;
		}
	}
};
