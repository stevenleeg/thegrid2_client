// General storage of data
window.Main = {};
window.DEBUG = true;


$(document).ready(function() {
    $.ajaxSetup({ cache: false });
    $.fx.speeds._default = 100;

    // Decide what to load
    Main.view_controller = new ViewController($("#content"));
    Main.view_controller.load(MenuView);
});

$(window).unload(function() {
    if(Main.view_controller.current.socket != undefined)
        Main.view_controller.current.socket.close()
});
