// Serial Port
const SerialPort = require('serialport');
const Delimiter = require('@serialport/parser-delimiter');

let port = new SerialPort("xx",{
    autoOpen:false
});

let parser = port.pipe(new Delimiter({ delimiter: '\n' }));

module.exports.open = function (Name) {
    if(port.isOpen){
        console.log("closing");
        port.close();
    }

    console.log("openinig "+Name);
    port = new SerialPort(Name, {
        baudRate: 9600
    });

    port.on("open",function () {
        parser.on('data', function (data){
            exports.rec(data.toString("UTF-8"));
        });
        exports.opened();
    });

    parser = port.pipe(new Delimiter({ delimiter: '\n' }));
};

module.exports.rec = function (data) {
    console.log(data);
};

module.exports.write = function (data) {
    port.write("\x02"+data+"\x03");
};

module.exports.opened = function () {
    console.log("com opened");
};

module.exports.isOpen = function () {
    return port.isOpen();
};
module.exports.list = function (callback) {
    var portsList = [];

    SerialPort.list((err, ports) => {
        ports.forEach((port) => {
            portsList.push(port.comName);
        });

       callback(portsList);
    });
};
