/*
 * Game object
 * This class handles interaction with the server, modifying a Grid
 * object as it works.
 */
var Game = function(socket, grid) {
    this.socket = socket;
    this.grid = grid;

    var that = this;

    this.updateCoord = function(data) {
        var coord = that.grid.get(data.coord);
        coord.destroy();

        coord.setOwner(data.player);
        coord.setType(data.tile);
        coord.setHealth(data.health);
    }

    this.setDump = function(data) {
        that.grid.load(data);
    }

    // Assign all of the events to their listeners
    this.socket.on("g.updateCoord", this.updateCoord);
    this.socket.on("g.setDump", this.setDump);

    this.socket.trigger("g.getDump");
}
