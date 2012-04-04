var TargetStore = Class.create ({
	initialize: function() {
		this.items = [];
		this.postLoadFunction = null;
	},
	
	// loadDb - loads database.
	loadDb: function(postLoadFunction)  {
		this.postLoadFunction = postLoadFunction;
		this.db = new Mojo.Depot({name: "targetDb", version: 1, replace: false},
			this.dbLoaded.bind(this),
			function(result) {
				this.items = [];
				Mojo.Log.warn("Cannot open targets database: ", result);
			}.bind(this)
		);
	},


	// dbLoaded: Called when the database is loaded.
	dbLoaded: function() {
		this.db.get("targets", this.itemsLoaded.bind(this),
			function () {
				this.items = [];
				Mojo.Log.warn("Could not get the database record.");
			}.bind(this)
		);
	},
	

	itemsLoaded: function(results) {
			if (Object.toJSON(results) == "{}" || results === null) { 
					Mojo.Log.warn("Got empty or null list from DB.");
					this.items = [];
			} else {
					this.items = results;
			}
			if (!Object.isUndefined(this.postLoadFunction) && (this.postLoadFunction !== null)) {
				this.postLoadFunction();
			}
	},
	
	storeDb: function() {
		this.db.add("targets", this.items,
				function() {
					Mojo.Log.info("Targets saved.");
				}, 
				function() {
					Mojo.Log.warn("Targets save failed!");
				}
		);
	}
});
    
