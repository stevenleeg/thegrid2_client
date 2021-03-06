/*
 * Game object
 * This class handles interaction with the server and user modifying a Grid
 * object as it works.
 */
var Game = function(socket, grid, view) {
    var self = this;

    self.socket = socket;
    self.grid = grid;
    self.view = view;

    /*
     * Remote events
     * These are events monitored on the socket. When they are triggered
     * we attempt to process the data.
     */

    // Receives a coordinate and updates it on the grid
    self.rUpdateCoord = function(data) {
        var coord = self.grid.get(data.coord);
        coord.destroy();

        coord.setType(data.type);
        coord.setOwner(data.player);
        coord.setHealth(data.health);
    }

    // Called when the server sets our territory
    self.rSetTerritory = function(data) {
        self.view.setTerritory(data.tused, data.tlim);
    }

    // Called when the server sets our cash
    self.rSetCash = function(data) {
        self.view.setCash(data.cash);
    }
    
    self.rSetIncome = function(data) {
        self.view.setIncome(data.income);
    }

    // Receives a grid dump and sets it on the grid
    self.rSetDump = function(data) {
        self.grid.load(data);
    }

    /*
     * Local events
     * These are events monitored on the client side. When they are triggered
     * we send them to the server.
     */

    // Called when a tile is placed. Sends it to the server.
    self.lPlaceTile = function(coord) {
        self.socket.emit("g.placeTile", {
            coord: coord.str,
            type: self.grid.place_type
        });

        self.grid.normalMode();
    }

    // Assign remote listeneres
    self.socket.on("g.updateCoord", self.rUpdateCoord);
    self.socket.on("g.setDump", self.rSetDump);
    self.socket.on("g.setCash", self.rSetCash);
    self.socket.on("g.setTerritory", self.rSetTerritory);
    self.socket.on("g.setIncome", self.rSetIncome);

    // Assign local listeners
    self.grid.on("placeTile", self.lPlaceTile);
    
    // Now that we're all set up, let's get the initial grid data.
    self.socket.trigger("g.getDump");
}
