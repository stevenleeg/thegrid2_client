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
        var that, list;
        that = e.data;

        // Display the box
        BaseUI.showWithScreen($("#box_join"));

        // Disable the join button
        $("#box_join_submit").prop("disabled", true);

        // Create the list
        that.game_list = new BaseUI.List($("#box_join_list"), "box_join_val", that.selectGrid);
        that.socket.on("m.newGrid", that.onNewGrid);
        that.socket.trigger("m.getGrids");
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
    }
}
