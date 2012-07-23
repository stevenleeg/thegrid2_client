/*
 * Game object
 * This class handles interaction with the server and user modifying a Grid
 * object as it works.
 */
var Game = function(socket, grid) {
    var self = this;

    self.socket = socket;
    self.grid = grid;

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

    // Assign local listeners
    self.grid.on("placeTile", self.lPlaceTile);
    
    // Now that we're all set up, let's get the initial grid data.
    self.socket.trigger("g.getDump");
}
