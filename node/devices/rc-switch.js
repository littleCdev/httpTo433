const fs = require('fs');
const util = require('util');

const DEVICENAME = "rc-switch";
let Serial = null;

let data = {
    state:      "off",
    name:       "",
    on:         "",
    off:        "",
    device:     DEVICENAME
};

module.exports = function(config,serial) {
    if(config !== undefined){
        data.name = config.name;
        data.on = config.on;
        data.off = config.off;
        data.sta = config.state;
    }
    if(serial !== undefined)
        Serial = serial;

};
module.exports.clear = function () {
    data.name = "";
    data.on ="";
    data.off = "";
    data.state = "off";
    data.device = DEVICENAME;
};

module.exports.setName = function (name) {
    data.name = name;
};
module.exports.setOn = function (On) {
    data.on = on;
};
module.exports.setOff = function (Off) {
    data.off = Off;
};

module.exports.save = function () {
    console.log("saving:");
    console.log(data);
    fs.writeFileSync('./configs/'+data.name+".json",  JSON.stringify(data) , 'utf-8');
};

module.exports.switchOn = function (Serial) {

};
module.exports.switchOff = function (Serial) {
    Serial.write(data.off);
};

module.exports.processRequest = function(req,res){
    console.log(req.url);
    if(req.url.endsWith("/switch-off")){
        Serial.write(data.off);
        data.state = "off";
        this.save();
        res.send("ok");
    }else
    if(req.url.endsWith("/switch-on")){
        Serial.write(data.on);
        data.state = "on";
        this.save();
        res.send("ok");
    }else
    if(req.url.endsWith("/switch-state")){
        res.send(data.state);
    }else
    if(req.url.endsWith("/set")){
        console.log(req.body);
        data.on = req.body.on;
        data.off = req.body.off;
        module.exports.save();
        res.send("ok");
    }else {
        res.render("rc-switch",data);
    }

};

module.exports.changeState = function (income) {
    if(income.toLowerCase() === data.on && data.state !== "on"){
        console.log("changed state to on");
        data.state = "on";
        module.exports.save();
    }else  if(income.toLowerCase() === data.off && data.state !== "off"){
        console.log("changed state to off");
        data.state = "off";
        module.exports.save();
    }
};