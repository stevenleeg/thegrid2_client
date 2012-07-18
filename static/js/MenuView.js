/*
 * MenuView - The main view for the menu of the game
 * This file follows a slightly logical pattern. All of the functions
 * (there may be some exceptions in the beginning, but I've tried to 
 * follow it at the end) are in order of how the typical user should
 * navigate through these menus:
 * Connect -> Join/Create -> Lobby/Send to game
 */
var MenuView = function(context) {
    this.tpl = "menu.html";
    this.server = null;
    this.socket = null;
    var that = this;

    this.onLoad = function() {
        // Hide the menu items we don't need.
        $("#menu_items_join").hide();
        $("#menu_items_create").hide();

        // Events
        $("#menu_items_connect_submit").on("click", this, this.onConnect);
        $("#menu_items_connect").on("click", this, this.onShowBoxConnect);
        $("#menu_items_join").on("click", this, this.onShowBoxJoin);
        $("#menu_items_create").on("click", this, this.onShowBoxCreate);
        $("#menu_room_start").on("click", this, this.onStartGame);
    }

    this.selectServer = function(val) {
        var other = $("#menu_items_connect_other");
        $("#menu_items_connect_invalid").fadeOut();
        if(val == "other") {
            other.val("");
            
            // Jumping through hoops due to a crazy bug in chrome I think
            other.slideDown(function() {
                other.hide();
                setTimeout(function() {
                    other.show();
                }, 1);
            });
        } else {
            other.slideUp();
        }
        
        if(val != null && val != "other") $("#menu_items_connect_submit").prop("disabled", false);
        else $("#menu_items_connect_submit").prop("disabled", true);
    }


    /*
    * Events
    */
    
    // Called when "Connect to server" is pressed
    this.onShowBoxConnect = function(e) {
        var that, list;
        
        that = e.data;
        // Display the box (with the screen in the background)
        BaseUI.showWithScreen($("#box_connect"));

        // Disabled the connect button
        $("#menu_items_connect_submit").prop("disabled", true);
        
        // Create a new instance of BaseUI.List
        list = new BaseUI.List($("#box_connect_list"), "box_connect_val", that.selectServer);
        list.addItem("Local testing", "localhost:8080");
        list.addItem("Other", "other");

        // Every time the "other" box changes, update the value of this.server
        $("#menu_items_connect_other").on("keyup", that, that.onOtherServerChange).hide();
    }

    // Called when "Join game" is pressed
    this.onShowBoxJoin = function(e) {
        // Display the box
        BaseUI.showWithScreen($("#box_join"));

        // Disable the join button
        $("#box_join_submit").prop("disabled", true);

        // Create the list
        that.game_list = new BaseUI.List($("#box_join_list"), "box_join_val", that.selectGrid);
        // Some events
        that.socket.on("m.newGrid", that.onNewGrid);
        that.socket.trigger("m.getGrids");
        $("#box_join_submit").on("click", that.onJoin);
    }

    this.selectGrid = function(val) {
        that.gid = val;
        if(val != null)
            $("#box_join_submit").prop("disabled", false);
        else
            $("#box_join_submit").prop("disabled", true);

    }

    // Called every time a new grid is added to the list
    this.onNewGrid = function(grid) {
        that.game_list.addItem([grid.name], grid.id);
    }

    // Called every time the "other" box changes
    this.onOtherServerChange = function(e) {
        if($(this).val().length > 0 ) {
            e.data.server = $(this).val();
            $("#menu_items_connect_submit").prop("disabled", false);
        } else {
            e.data.server = null;
            $("#menu_items_connect_submit").prop("disabled", true);
        }
    }

    // Called when the connect button is clicked
    this.onConnect = function(e) {
        var that = e.data;
        // Close any currently opened socket
        if(that.socket != null) {
            that.socket.socket.onclose = function() {};
            that.socket.close();
        }

        that.server = $("#box_connect_val").val();
        // Open a new socket
        that.socket = new Socket(that.server, function() {
            if(that.socket.isConnected()) {
                $("#menu_items_connect_invalid").fadeOut();
                BaseUI.hideWithScreen($("#box_connect"));
            }
            else {
                $("#menu_items_connect_invalid").fadeIn();
                return;
            }

            $("#menu_items_join").fadeIn();
            $("#menu_items_create").fadeIn();
        });
        // Set a temporary error handler for closing
        that.socket.socket.onclose = function() {
            $("#menu_items_connect_invalid").fadeIn();
        };
    }

    // Called when "create grid" is clicked
    this.onShowBoxCreate = function(e) {
        var that = e.data;

        // Get a list of maps if we need to
        if(that.map_list == undefined) {
            that.map_list = new BaseUI.List($("#box_create_maps"), "box_create_val", that.selectMap);
            that.socket.on("m.newMap", that.onNewMap);
            that.socket.trigger("m.getMaps");
        }

        BaseUI.showWithScreen("#box_create");
        $("#box_create_submit").prop("disabled", true).on("click", that, that.onCreate);
        $("#box_create_name").on("keyup", that.onChangeName);
    };

    // Called every time the server adds a new map
    this.onNewMap = function(map) {
        that.map_list.addItem([map.name, map.size + "x" + map.size], map.id);
    }

    // Called every time a map is selected
    this.selectMap = function(val) {
        if($("#box_create_name").val().length == 0 || val == null)
            return $("#box_create_submit").prop("disabled", true);

        $("#box_create_submit").prop("disabled", false);
    }

    // Called every time the grid name box is changed
    this.onChangeName = function() {
        if($(this).val().length == 0 || $("#box_create_val").val().length == 0)
            return $("#box_create_submit").prop("disabled", true);
        $("#box_create_submit").prop("disabled", false);
    }

    // Called when "create" is pressed
    this.onCreate = function(e) {
        var that = e.data;

        that.socket.on("m.createGridSuccess", that.onCreateSuccess);
        that.socket.trigger("m.createGrid", {
            name: $("#box_create_name").val(),
            map: $("#box_create_val").val()
        });
    }

    // Called when the grid has been created
    this.onCreateSuccess = function(data) {
        BaseUI.hideWithScreen("#box_create");

        that.socket.on("m.joinGridSuccess", that.onJoinSuccess);
        that.socket.on("m.joinGridError", that.onJoinError);
        that.socket.trigger("m.joinGrid", {
            id: data.id
        });
    }

    // Called when the join button is pressed
    this.onJoin = function() {
        var gid;
        gid = parseInt($("#box_join_val").val());
        
        that.socket.on("m.joinGridSuccess", that.onJoinSuccess);
        that.socket.on("m.joinGridError", that.onJoinError);
        that.socket.on("g.startGrid", that.onStartGrid);
        that.socket.trigger("m.joinGrid", { id: gid });
    }

    // Called when there is an error trying to join a grid
    this.onJoinError = function(data) {
        alert(data.error);
    }

    // Called when we recieve the event m.joinGridSuccess
    this.onJoinSuccess = function(data) {
        if(data.active)
            return; // Go to GameView

        BaseUI.hideWithScreen("#box_join");

        // Hide the menu items and show the room UI
        $("#menu_items").fadeOut();
        $("#menu_room").fadeIn();

        // Fill in the slots for players in the game
        for(var i in data.players) {
            $("#menu_room_p" + data.players[i]).css("background", data.colors[data.players[i]]).addClass("joined");
        }
        $("#menu_room_p" + data.pid).text("you");

        // If we have more than one user enable the start button
        if(data.players.length > 1 && data.host == data.pid)
            $("#menu_room_start").prop("disabled", false);
        if(data.host != data.pid)
            $("#menu_room_start").val("waiting");

        // Listen for new players
        that.socket.on("g.addPlayer", that.onNewPlayer);
        that.socket.on("g.delPlayer", that.onDelPlayer);
        that.socket.on("g.newHost", that.onNewHost);

        // Store the data for later
        that.grid_data = data;
    }

    // Called when a new player joins
    this.onNewPlayer = function(data) {
        that.grid_data.players.push(data.pid);
        $("#menu_room_p" + data.pid)
            .css("background", that.grid_data.colors[data.pid])
            .addClass("joined");

        // If we have more than one user enable the start button
        if(that.grid_data.players.length > 1 && that.grid_data.host == that.grid_data.pid)
            $("#menu_room_start").prop("disabled", false);
    }

    // Called when a player leaves
    this.onDelPlayer = function(data) {
        that.grid_data.players.splice(that.grid_data.players.indexOf(data.pid), 1);
        $("#menu_room_p" + data.pid)
            .css("background", "")
            .removeClass("joined");
        
        // If we have more than one user enable the start button
        if(that.grid_data.players.length <= 1 && that.grid_data.host == that.grid_data.pid)
            $("#menu_room_start").prop("disabled", true);
    }

    // Called when the host leaves and the server has to assign
    // a new host pid
    this.onNewHost = function(data) {
        that.grid_data.host = data.pid;
        if(that.grid_data.host == that.grid_data.pid)
            $("#menu_room_start").val("start game");
        if(that.grid_data.players.length > 1 && that.grid_data.host == that.grid_data.pid)
            $("#menu_room_start").prop("disabled", true);
    }
    
    // Called when the "start game" button is pressed
    // TODO: This naming is confusing
    this.onStartGame = function() {
        that.socket.trigger("g.startGrid");
    }

    // Called when the host starts the game
    this.onStartGrid = function() {
        alert("The game has begun!");
    }
}
