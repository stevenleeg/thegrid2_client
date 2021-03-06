var Grid = function(canvas, sx, sy, owner, colors, style) {
    this.r = 32;
    this.padding = 128;
    this.x = parseInt(sx);
    this.y = parseInt(sy);
    canvas.width(this.padding + (sx * (this.r - 2) * 2) + (this.r) + 2);
    canvas.height(this.padding + (sy * (this.r - 6) * 2) + (this.r / 2) - 3);
    this.canvas = new Raphael(canvas.get(0), canvas.width(), canvas.height());
    this.grid = {};
    this.place_mode = false;
    this.place_type = null;
    this.hover = null;
    this.evt_callbacks = [];
    this.evt_filters = {};
    this.colors = colors;
    this.style = style;
    this.owner = owner;

    EventEmitter.apply(this);

    this.render = function() {
        var coord;
        for(var x = 0; x < sx; x++) {
            this.grid[x] = {};
            for(var y = 0; y < sy; y++) {
                coord = this.translate(x, y);
                this.grid[x][y] = this.canvas.hexagon(
                        coord[0], 
                        coord[1], 
                        this.r
                    );
                this.grid[x][y].rotate(30).attr({fill: "#FFF", stroke: "#969696"})
                    .data("coord", x + "_" + y)
                    .data("grid", this)
                    .mousedown(Coord.mousedown)
                    .mouseup(Coord.mouseup)
                    .mouseover(Coord.mouseover)
                    .mouseout(Coord.mouseout);
            }
        }

        // Setup modify callbacks
        for(tile in TileProps) {
            if(TileProps[tile]['events'] != undefined) {
                for(evt in TileProps[tile]['events']) {
                    this.registerEventCallback(TileProps[tile]['events'][evt]);
                }
            }
        }
    }

    // Translates an x, y into a set of actual coordinates
    this.translate = function(x, y) {
        var xoffset;

        if(y % 2 == 1) xoffset = this.r - 2;
        else xoffset = 0;

        return [
            (this.padding / 2) + (x * (this.r - 2) * 2) + this.r + xoffset,
            (this.padding / 2) + (y * (this.r - 6) * 2) + this.r
        ];
    }
    
    // Loads a json object into the grid
    this.load = function(coords) {
        var coord, selected;
        this.setGlobalFilter("grid.loaded", false);
        for(coord in coords) {
            selected = this.get(coord);
            selected.setOwner(coords[coord]['player']);
            selected.setType(coords[coord]['type']);
            selected.setHealth(coords[coord]['health']);
            if(coords[coord]['rot'] != null) selected.rotate(parseInt(coords[coord]['rot']), true);
        }

        this.setGlobalFilter("grid.loaded", true);
        for(coord in coords) {
            this.sendEventCallback({
                coord: this.get(coord),   
                filter: { type: coords[coord]['type'] }
            }, "grid.load.tiles");
        }
    }
    //
    // Gets a coordinate on the grid
    this.get = function(x, y) {
        return new Coord(this, x, y);
    }

    // Sets the grid up for placing a tile
    this.placeMode = function(type) {
        this.place_type = type;
        this.place_mode = true;

        if(this.hover == null || this.hover == undefined) return;
        if(PlaceCheck[this.place_type](this, this.hover)) {
            this.hover.elem.attr({fill: this.style['place_good']});
            this.hover.setData("place", true);
        } else {
            this.hover.elem.attr({fill: this.style['place_bad']});
        }
    }

    this.normalMode = function() {
        if(this.hover != null) {
            if(this.hover.getData("player") != undefined)
                this.hover.elem.attr({fill: this.colors[this.hover.getData("player")]});
            else
                this.hover.elem.attr({fill: this.style['coord']});
        }

        this.place_type = 0;
        this.place_mode = false;
        this.emit("exitPlacemode");
    }

    // Registers a function to be called every time a
    // tile is modified. Used especially with shields.
    this.registerEventCallback = function(callback) {
        this.evt_callbacks.push(callback);
    }

    // Called by modifying functions
    // Goes through and notifies all registered callbacks
    // that a coordinate has changed. Evt is the event type
    // id. It has three possible values:
    // 0: Remove
    // 1: Add/Modify
    this.sendEventCallback = function(data, evt) {
        var selected;
        var filter_good = true;
        for(i in this.evt_callbacks) {
            selected = this.evt_callbacks[i];
            if(selected['when'].indexOf(evt) == -1) continue;

            // Add global filters
            if(data['filter'] == undefined) data['filter'] = this.evt_filters;
            else for(var key in this.evt_filters) { data['filter'][key] = this.evt_filters[key]; }
            
            if(selected['filter'] != undefined && data['filter'] != undefined) {
                for(i in selected['filter']) {
                    if(selected['filter'][i] != data['filter'][i])
                        filter_good = false;
                }
            }

            if(filter_good) selected['cb'](data, evt);
        }
    }

    // Registers a filter that is added to all events
    this.setGlobalFilter = function(name, val) {
        this.evt_filters[name] = val;
    }

    this.showMenu = function(coord) {
        console.log("To be implemented");
    }

    this.hideMenu = function(coord) {
        console.log("To be implemented");
    }
}

Grid.prototype = EventEmitter.extend();

Grid.defaultCheck = function(grid, coord) {
    if(coord.isOwnedBy(grid.owner) && coord.getType() == 1) return true;
    else return false;
}
