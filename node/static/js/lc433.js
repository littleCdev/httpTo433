$(function () {
    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    var connection = new WebSocket('ws://'+location.hostname+':1337');

    connection.onopen = function () {
        // connection is opened and ready to use
    };

    connection.onerror = function (error) {
        // an error occurred when sending/receiving data
    };

    connection.onmessage = function (message) {
        var d = new Date(); // for now
        d.getHours(); // => 9
        d.getMinutes(); // =>  30
        d.getSeconds(); // => 51
        var time = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();

        console.log(message);
        var textArea = $("#textareaCommands");
        textArea.html(time+ " "+message.data+"\n"+textArea.html());
        textArea.scrollTop(textArea.scrollHeight);
    };

    const copyToClipboard = str => {
        const el = document.createElement('textarea');
        el.value = str;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    };

    var deviceName = $("#devicename").val();
    $("#urlstate").val(location.host+"/device/"+deviceName+"/switch-state");
    $("#urloff").val(location.host+"/device/"+deviceName+"/switch-off");
    $("#urlon").val(location.host+"/device/"+deviceName+"/switch-on");


    $(".clipboard").on("click",function (e) {
        e.preventDefault();
        var parentEl = $(this).parent();
        var url = parentEl.find("input").val();
        copyToClipboard(url);
        M.toast({html: "copied url to clipboard!"})
    });

    $("#saveComport").on("click",function (e) {
        e.preventDefault();
        var newPort = $( "#selectNewComPort" ).val();
        $.post( "/settings/port", {
            "Port":newPort
        })
            .done(function( data,status) {
                console.log(data);
                M.toast({html: "Saved port!"})
                //  M.toast({html: 'Saved password'})
            })
            .fail(function (data,status) {
                console.log(data.responseText);
            });
    })
    $("#saveNewDevice").on("click",function (e) {
        e.preventDefault();
        var devicetype = $( "#selectDevice" ).val();
        var name = $("#devicename").val();
        $.post( "/new/", {
            "Device":devicetype,
            "Name":name
        })
            .done(function( data,status) {
                console.log(data);
                window.location.href = "/device/"+name+"/";
            })
            .fail(function (data,status) {
                console.log(data.responseText);
            });
    });

    $("#saveSettings").on("click",function (e) {
        e.preventDefault();
        var name = $("#devicename").val();
        var on = $("#deviceon").val();
        var off = $("#deviceoff").val();
        $.post( "/device/"+name+"/set", {
            "on":on,
            "off":off
        })
            .done(function( data,status) {
                console.log(data);
                M.toast({html: "Saved settings"})

                //  M.toast({html: 'Saved password'})
            })
            .fail(function (data,status) {
                console.log(data.responseText);
            });
    })

});