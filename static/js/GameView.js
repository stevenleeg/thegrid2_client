var GameView = function(context) {
    this.tpl = "game.html";
    this.socket = context.socket;
    this.grid_data = context.grid_data;
    this.style = {
        blue: "#10A1FF",
        dark: "#1D1D1D",
        coord: "#FFF",
        coord_natural: "#F0F3F6",
        place_good: "#2BE671",
        place_bad: "#FF4A37",
        health_poor: "#FEBE07",
        health_good: "#3FCD45",
        health_bad: "#FF401C"
    }
    var self = this;
    
    self.onLoad = function() {
        if($.cookie("disable_fs") == undefined) {
            setTimeout(function() {
                $(".game_fullscreen_request").fadeIn(500);
            }, 1000);
        }

        // Activated when the "full screen" link is pressed
        $("#activate_fs").on("click", function() {
            $("body")[0].webkitRequestFullScreen();
            $(".game_fullscreen_request").fadeOut();
        });
        // Acivated when the X on the bar is clicked
        $("#activate_fs_close").on("click", function() {
            $(".game_fullscreen_request").fadeOut();
            $.cookie("disable_fs", true, {expires: 1});
        });
        // Activated when the menu button is clicked
        $("#activate_menu").on("click", function() {
           BaseUI.showWithScreen("#game_popover_menu"); 
        });

        $(".game_menu_item").on("click", self.onClickType);
        $(".game_menu_popover_section tr").on("click", self.onClickTile);

        // Start up the grid
        self.grid = new Grid(
            $("#grid"), 
            16, 16, 
            self.grid_data.pid, 
            self.grid_data.colors, 
            self.style
        );
        self.grid.render();

        // And setup a game
        self.game = new Game(self.socket, self.grid);

        // Scroll the grid a little
        $("#grid_container").scrollTop(50).scrollLeft(50);
    }

    // Called when a tile type menu is clicked
    self.onClickType = function() {
        $("#game_menu_popover").css("left", parseInt($(this).attr("move")));
        BaseUI.showWithScreen("#game_menu_popover", true);
        $(".game_menu_popover_section").hide();
        $("#game_menu_popover_" + $(this).attr("opens")).show();
    }

    // Called when a tile type is clicked in the menu
    self.onClickTile = function() {
        var type = $(this).attr("places");
        self.grid.placeMode(type);
        BaseUI.hideWithScreen("#game_menu_popover");
    }
}
