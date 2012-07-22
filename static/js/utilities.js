//
// Used to manage templates being
//
var ViewController = function(el) {
    this.current = null;
    this.el = el;
    this.first = true;

    //
    // Loads a Controller object into the main area (#content)
    //
    this.load = function(controller, context) {
        var temp, id, that;

        this.current = new controller(context);
        that = this;
        id = this.el.attr("id");

        // Load the template into a temporary place on the DOM
        temp = $("<div id=" + id + "2></div>").hide();
        this.el.after(temp);

        temp.load("/static/tpl/" + this.current.tpl, function() {
            // This is the first view being loaded so we don't need to bother
            // with fading in (this makes loading seem a bit faster)
            if(that.first) {
                el.remove();
                temp.attr("id", id).show();
                that.el = temp;
                if(that.current.onLoad != undefined) that.current.onLoad();
                if(that.current.postFade != undefined) that.current.postFade();
                that.first = false;
                return;
            }

            that.el.fadeOut(250, function() {
                // Remove the old container and change temp's id
                // to match the old's
                that.el.remove();
                temp.attr("id", id);
                that.el = temp;
                if(that.current.onLoad != undefined) that.current.onLoad(context);

                that.el.fadeIn(250, function() {
                    if(that.current.postFade != undefined) that.current.postFade(context);
                });
            });
        });
    }
}

var BaseUI = (function() {
    // List container element
    // element: The element of the list container
    // callback: The function to be called whenever an item
    // is selected. function(val)
    var List = function(element, valid, callback) {
        if(callback == undefined) callback = function() {};

        this.el = $(element);
        this.callback = callback;
        this.table = this.el.children("table");
        // Make sure we're dealing with a blank table
        this.table.html("");
        this.text = this.el.children(".ui_list_text");
        this.text.show();

        // Create a hidden form element
        this.value = $("<input type='hidden' id='"+ valid +"' value='' />").appendTo(this.el);

        function clickItem(e) {
            if($(this).hasClass("selected")) {
                $(this).removeClass("selected");
                $(this).data("list").callback(null);
                e.data.value.val(null);
            } else {
                $(this).siblings(".selected").removeClass("selected");
                $(this).addClass("selected");
                e.data.value.val($(this).data("value"));
                $(this).data("list").callback(e.data.value.val());
            }
        }

        this.addItem = function(item, value) {
            this.text.hide();
            var str = "<tr>";
            if(typeof item == "string")
                str += "<td>" + item + "</td>";
            else {
                for(var i in item) {
                    str += "<td>" + item[i] + "</td>";
                };
            }
            str += "</tr>";
            var el = $(str);
            el.on("click", this, clickItem);
            el.data("value", value);
            el.data("list", this);
            this.table.append(el);
        }

        this.setText = function(val) {
            this.text.text(val);
        }
    }

    var showWithScreen = function(el, invisible_screen) {
        $(el).fadeIn(250);
        $("#ui_screen")
            .data("el", el)
            .on("click", function() {
                $(this).fadeOut();
                $($(this).data("el")).fadeOut();
            });
        if(invisible_screen)
            $("#ui_screen").show().css("opacity", "0");
        else
            $("#ui_screen").fadeIn();
    }

    var hideWithScreen = function(el) {
        $(el).fadeOut(250);
        $("#ui_screen")
            .fadeOut(250)
            .off("click")
            .data("el", undefined);
    }

    return {
        List: List,
        hideWithScreen: hideWithScreen,
        showWithScreen: showWithScreen
    }
})();

var Socket = function(server, open_callback) {
    this.server = server;
    this.events = {};
    var that = this;

    // Attempt to connect
    this.socket = new WebSocket("ws://" + server + "/api/socket", "grid-1.0");

    this.emit = function(event, data) {
        var send = {};
        if(data == undefined) data = {};

        if(DEBUG)
            console.log("Sent event: " + event);

        send.e = event;
        send.data = data;
        this.socket.send(JSON.stringify(send));
    }

    this.trigger = function(event, data) {
        that.emit(event, data);
    }

    this.onMessage = function(evt) {
        // TODO: Catch bad JSON
        data = JSON.parse(evt.data);
        if(DEBUG)
            console.log("Recieved event: " + data.e);
        if(data.e != undefined)
            that.localTrigger(data.e, data.data);
    }

    this.onClose = function(evt) {
        return;
    }

    //
    // Triggers a registered event
    //
    this.localTrigger = function(event, data) {
        if(this.events[event] == undefined) return;
        for(var i in this.events[event]) {
            this.events[event][i](data);
        }
    }

    //
    // Registers an event to a callback
    //
    this.on = function(event, callback, remote) {
        if(this.events[event] == undefined)
            this.events[event] = [];
        // This registers the event with the server
        if(remote)
            this.trigger("r.sub", { e: event});

        this.events[event].push(callback);
    }

    //
    // Returns true or false based on whether or not
    // the socket is connected
    //
    this.isConnected = function() {
        return this.socket.readyState == this.socket.OPEN;
    }

    //
    // Shortcut to close the socket
    //
    this.close = function() {
        this.socket.close();
    }

    this.socket.onopen = open_callback;
    this.socket.onerror = open_callback;
    this.socket.onmessage = this.onMessage;
    this.socket.onclose = this.onClose;
};

/*
 * Used for general event handling
 */
var EventManager = new EventEmitter();
