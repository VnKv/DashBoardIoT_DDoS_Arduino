var id = process.argv[2];
//console.log(id);
var ip = process.argv[3]
//console.log(ip)
var port = process.argv[4];
//console.log(port);
var number_process = process.argv[5]

var delay = 1000;

var express = require('express');  
var app = express();  
var server = require('http').Server(app);  
var io = require('socket.io')(server);
var coordinador = require('socket.io-client')('http://localhost:3000');
var request = require('request');
var sockets;
var OK = false;
var lead;

setInterval(post_Request,delay);

io.on('connection', function(socket) {  
  socket.on('listen', function(data) {
    console.log(data);
    if(data == "OK"){
        OK = true;
    }
    if(data.lead == 0){
        responseOK(sockets,data.number_process)
    }else if(data.lead == 1){
        lead = getSocket(sockets,data.number_process);
        lead.socket.emit('listen',"Hola lider");
    }
  });
});

coordinador.on("arduinos",function(data){
    sockets = createSockets(data);
    leadBroadcast(sockets);
    setTimeout(function(){
        if(OK == false){
            console.log("YO SOY EL LIDER");
            leadAdvert(sockets);
        }
    },3000);
});

server.listen(port, function() {  
    console.log('Servidor corriendo en http://localhost:' + port);
});

function post_Request(){
    request({
        url: 'http://localhost:3000',
        method: 'POST',
        json: {"id" : id,
                "number_process": number_process,
                "datetime" : getDateTime(),
                "data": { 
                    "sensor1": random(0,20,5), 
                    "sensor2": random(0,20,5)
                },
                "ip": ip,
                "port": port
            }
        }, function(error, response, body){
            if(body != null){        
                delay = body.delay;
                console.log(delay)
            }
    });
}

function random(low, high, step) {
    return Math.floor(Math.random() * (high - low + 1) + low) * step;
}

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + ":" + hour + ":" + min + ":" + sec;
}

function responseOK(sockets,number_process){ 
    for (var i = sockets.length - 1; i >= 0; i--) {
        if(sockets[i].number_process == number_process){
            sockets[i].socket.emit('listen',"OK");
        }
    }
}

function createSockets(arduinos){
    var io_sockets = [];
    for (var i = arduinos.length - 1; i >= 0; i--) {
        var io_socket = require('socket.io-client')('http://' + arduinos[i].ip + ":" + arduinos[i].port);
        io_sockets.push({number_process: arduinos[i].number_process, socket: io_socket});
    }
    return io_sockets;
}

function leadBroadcast(sockets){
    for (var i = sockets.length - 1; i >= 0; i--) {
        if(sockets[i].number_process > number_process){
            sockets[i].socket.emit('listen',{number_process: number_process, lead: 0});    
        }
    }
}

function leadAdvert(sockets){
    for (var i = sockets.length - 1; i >= 0; i--) {
        sockets[i].socket.emit('listen',{number_process: number_process, lead: 1});    
    }
}

function getSocket(sockets,number_process){
     for (var i = sockets.length - 1; i >= 0; i--) {
        if(sockets[i].number_process == number_process){
            return sockets[i];
        }
    }
    return null;
}

