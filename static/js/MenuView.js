var MenuView = function(context) {
    this.tpl = "menu.html";
    this.server = null;
    this.socket = null;

    this.onLoad = function() {
        // Hide the menu items we don't need.
        $("#menu_items_join").css('visibility', 'hidden');

        // Events
        $("#menu_items_connect_submit").on("click", this, this.onConnect);
        $("#menu_items_connect").on("click", this, this.onShowBoxConnect);
        $("#menu_items_join").on("click", this, this.onShowBoxJoin);
    }

    this.selectServer = function(val) {
        var other = $("#menu_items_connect_other");
        $("#menu_items_connect_invalid").fadeOut();
        if(val == "other") {
            other.slideDown();
            other.val("");
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
        that.game_list = new BaseUI.List($("#box_join_list"), "box_join_val", that.selectGame);
        that.socket.on("m.newGrid", this.onNewGrid);
        that.socket.trigger("g.getGrids");
    }

    // Called every time a new server is added to the list
    this.onNewGrid = function(grid) {
        alert(this.socket);
        this.game_list.addItem([grid.name], grid.id);
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

            $("#menu_items_join").css('visibility', 'visible').hide().fadeIn();
        });
        // Set a temporary error handler for closing
        that.socket.socket.onclose = function() {
            $("#menu_items_connect_invalid").fadeIn();
        };
    }
}
