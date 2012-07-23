/*
 * Game object
 * This class handles interaction with the server and user modifying a Grid
 * object as it works.
 */
var Game = function(socket, grid) {
    var self = this;

    self.socket = socket;
    self.grid = grid;

    self.rUpdateCoord = function(data) {
        var coord = self.grid.get(data.coord);
        coord.destroy();

        coord.setType(data.type);
        coord.setOwner(data.player);
        coord.setHealth(data.health);
    }

    self.rSetDump = function(data) {
        self.grid.load(data);
    }

    self.lPlaceTile = function(coord) {
        self.socket.emit("g.placeTile", {
            coord: coord.str,
            type: self.grid.place_type
        });
    }

    // Assign all of the events to their listeners
    self.socket.on("g.updateCoord", self.rUpdateCoord);
    self.socket.on("g.setDump", self.rSetDump);

    self.grid.on("placeTile", self.lPlaceTile);

    self.socket.trigger("g.getDump");
}
