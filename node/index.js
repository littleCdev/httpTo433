const fs = require('fs');
// express httpd
const express = require('express');
const bodyParser = require("body-parser");
const exphbs  = require('express-handlebars');
const app = express();
// websocket
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 1337 });
// Serialport
const Serial = require("./lcSerial");

let Config = require("./lcConfig.json");

// websocket
// Broadcast to all.
wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};
wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(data) {
        // Broadcast to everyone else.
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });
});


// Serial
Serial.open(Config.comport);
Serial.opened = function () {
    console.log("opened Serial");
    wss.broadcast("opened Serial");
};
Serial.rec = function (data) {
//    console.log("Got serial: "+data);
    wss.broadcast("serial: "+data);
    let SerialData = {};
    try{
        SerialData = JSON.parse(data);
    }catch (e) {
        wss.broadcast(e.message);
        return;
    }

    fs.readdirSync("./configs/").forEach(function(file) {
        let stat;
        stat = fs.statSync("" + "./configs/" + file);
        if (!stat.isDirectory() && file.endsWith(".json"))
        {
            let confStr = fs.readFileSync("./configs/"+file);
            let conf = JSON.parse(confStr);
            let dev = require("./devices/"+conf.device+".js");
            dev(conf);
            dev.changeState(SerialData.value);
        }
    });

};

// express webserver
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// static files like css/js are under /static
app.use('/static', express.static('static'));
// use handlebars are template-engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/new/', function (req, res) {
    let aDevices = [];

    fs.readdirSync("./devices/").forEach(function(file) {
        let stat;
        stat = fs.statSync("./devices/" + "/" + file);
        if (!stat.isDirectory() && file.endsWith(".js"))
        {
            aDevices.push(file.replace(".js",""));
        }
    });

    res.render('new-device',
        {
            Devices:aDevices
        });
});
// set a new comport
app.post('/new/', function (req, res) {
    let DeviceType=req.body.Device;
    let DeviceName=req.body.Name;

    console.log(req.body);

    let o = require('./devices/'+DeviceType+".js");
    o.clear();
    console.log(o);

    o.setName(DeviceName);
    o.save();
    res.send("ok");
});


app.all("/device/:NAME/*",function (req,res) {
    let confStr = fs.readFileSync("./configs/"+req.params.NAME+".json");
    let conf = JSON.parse(confStr);
    let dev = require("./devices/"+conf.device+".js");
    dev(conf,Serial);
    dev.processRequest(req,res);
});

app.get('/settings/', function (req, res) {
    Serial.list((list)=>{
        res.render('settings',
            {
                ComPorts:list,
                CurrentComPort:Config.comport
            });
    })
});
// set a new comport
app.post('/settings/port', function (req, res) {
    let PortName=req.body.Port;

    console.log("new com: "+PortName);
    wss.broadcast("new port:"+PortName);
    Serial.open(PortName);
    Config.comport = PortName;
    fs.writeFileSync('./lcConfig.json',  JSON.stringify(Config) , 'utf-8');
    res.send("ok");
});

app.get('/', function (req, res) {
    let Devices = [];
    fs.readdirSync("./configs/").forEach(function(file) {
        let stat;
        stat = fs.statSync("" + "./configs/" + file);
        if (!stat.isDirectory() && file.endsWith(".json"))
        Devices.push(file.replace(".json",""));
    });


    wss.broadcast("HUHU from home!");
         res.render('home',{
             Devices:Devices
    });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});






