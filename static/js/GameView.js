var GameView = function(context) {
    this.tpl = "game.html";
    this.socket = context.socket;
    var that = this;
    
    this.onLoad = function() {
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
        $("#game_menu_general").on("click", function() {
            $("#game_menu_popover").css("left", 15);
            BaseUI.showWithScreen("#game_menu_popover", true);
            $(".game_menu_popover_section").hide();
            $("#game_menu_popover_general").show();
        });
        $("#game_menu_attack").on("click", function() {
            $("#game_menu_popover").css("left", 115);
            BaseUI.showWithScreen("#game_menu_popover", true);
            $(".game_menu_popover_section").hide();
            $("#game_menu_popover_attack").show();
        });
        $("#game_menu_defend").on("click", function() {
            $("#game_menu_popover").css("left", 215);
            BaseUI.showWithScreen("#game_menu_popover", true);
            $(".game_menu_popover_section").hide();
            $("#game_menu_popover_defend").show();
        });

        this.grid = new Grid($("#grid"), 16, 16);
        this.grid.render();

        // Scroll the grid a little
        $("#grid_container").scrollTop(50).scrollLeft(50);
    }
}
