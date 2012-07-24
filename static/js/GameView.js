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
    this.type_selected = null;
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

        // General clicking events
        $(".game_menu_item").on("click", self.onClickType);
        $(".game_menu_popover_section tr").on("click", self.onClickTile);
        $("#game_menu_placemode").on("click", self.onClickPlacemode).hide();
        
        // Replicating those click events with key combos
        self.setupKeys();

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

        // Events from the grid
        self.grid.on("exitPlacemode", self.exitPlacemode);
    }

    // Sets up all key events
    self.setupKeys = function() {
        $(document).bind("keydown", "esc", function() {
            if($("#game_menu_popover").is(":visible"))
                $("#ui_screen").click();
            else if(self.grid.place_mode)
                $("#game_menu_placemode").click();
        });
        $(document).bind("keypress", "a", function() {
            $("#game_menu_attack").click();
        });
        $(document).bind("keypress", "c", function() {
            if($("#game_menu_popover_attack").is(":visible"))  
                $("tr[places=10]").click();
        })
        $(document).bind("keypress", "d", function() {
            if(self.type_selected == "attack")  
                $("tr[places=6]").click();
            else if(self.type_selected == "defend")  
                $("tr[places=8]").click();
            else 
                $("#game_menu_defend").click();
        });
        $(document).bind("keypress", "g", function() {
            $("#game_menu_general").click();
        });
        $(document).bind("keypress", "h", function() {
            if(self.type_selected == "general")  
                $("tr[places=5]").click();
        })
        $(document).bind("keypress", "h", function() {
            if(self.type_selected == "attack")  
                $("tr[places=4]").click();
        })
        $(document).bind("keypress", "m", function() {
            if(self.type_selected == "general")  
                $("tr[places=3]").click();
        })
        $(document).bind("keypress", "s", function() {
            if(self.type_selected == "defend")  
                $("tr[places=9]").click();
        })
        $(document).bind("keypress", "t", function() {
            if(self.type_selected == "general")  
                $("tr[places=1]").click();
        })
        $(document).bind("keypress", "w", function() {
            if(self.type_selected == "defend")  
                $("tr[places=7]").click();
        })
    }
    // Called when a tile type menu is clicked
    self.onClickType = function(e) {
        $("#game_menu_popover").css("left", parseInt($(this).attr("move")));

        if(e.which != undefined) {
            $(".game_menu_popover_section").hide();
            BaseUI.showWithScreen("#game_menu_popover", true);
            $("#game_menu_popover_" + $(this).attr("opens")).show();
        } else {
            $(this).addClass("selected");
            self.type_selected = $(this).attr("opens");
        }
    }

    // Called when a tile type is clicked in the menu
    self.onClickTile = function(e) {
        var type = $(this).attr("places");
        self.grid.placeMode(type);
        BaseUI.hideWithScreen("#game_menu_popover");
        $("#game_menu_tiletypes .selected").removeClass("selected");
        $("#game_menu_tiletypes").hide();

        var placemode = $("#game_menu_placemode").show();
        placemode.children("i").attr("class", $(this).children("td:first-child").children("i").attr("class"));
        placemode.children("span").text($(this).children("td:nth-child(2)").text());
    }

    // Called when a user presses esc or clicks placemode
    self.onClickPlacemode = function() {
        self.grid.normalMode();
    }
    // Called when placemode is exited
    self.exitPlacemode = function() {
        $("#game_menu_tiletypes").show();
        $("#game_menu_placemode").hide();
        $("#game_menu_tiletypes .selected").removeClass("selected");
        self.type_selected = null;
    }
}
