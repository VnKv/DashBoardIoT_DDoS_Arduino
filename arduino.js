var id = process.argv[2];
//console.log(id);
var ip = process.argv[3]
//console.log(ip)
var port = process.argv[4];
//console.log(port);
var number_process = process.argv[5]

var express = require('express');  
var app = express();  
var server = require('http').Server(app);  
var io = require('socket.io')(server);
var coordinador = require('socket.io-client')('http://localhost:3000');
var request = require('request');
var sockets;
var OK = false;
var lead_OK = false;
var lead = null;
var server_to_attack = null;

setInterval(post_Request,1000);
setInterval(keepAlive,1000)
setInterval(attacking,1000)

io.on('connection', function(socket) {  
  socket.on('listen', function(data) {
    //console.log(data);
    if(data.type_message == "OK"){
        OK = true;
    }else if(data.type_message == "leadOff"){
        response(sockets,data.number_process,{type_message: "OK"});
    }else if(data.type_message == "leadOn"){
        lead = getSocket(sockets,data.number_process);
        lead.socket.emit('listen',"Hola lider");
    }else if(data.type_message == "keepAlive"){
        response(sockets,data.number_process,{type_message: "keepAliveResponse"});
    }else if(data.type_message == "keepAliveResponse"){
        lead_OK = true;
    }else if(data.type_message == "attack"){
        server_to_attack = data.server;
    }
  });
});

coordinador.on('arduinos',function(data){
    sockets = createSockets(data);
    startAlgorithm();
});

coordinador.on('attack_list',function(data){
    console.log(data);
    if(lead.number_process == number_process){
        var server = randomServer(data);
        startAttack(sockets,server);
    }

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
    });
}

function simple_Post(){
    request({
        url: "http://" + server_to_attack.ip + ":" + server_to_attack.port,
        method: 'POST',
        json: {
                "Saludo" : "Hello World",
              }
        }, function(error, response, body){
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

function startAlgorithm(){
    findLead(sockets);
    OK = false;
    setTimeout(function(){
        if(OK == false){
            console.log("YO SOY EL LIDER");
            leadMessage(sockets,{type_message: "leadOn", number_process: number_process});
            if(server_to_attack != null){
               startAttack(sockets,server_to_attack); 
            }
        }
    },3000);
}

function response(sockets,number_process,message){ 
    for (var i = sockets.length - 1; i >= 0; i--) {
        if(sockets[i].number_process == number_process){
            sockets[i].socket.emit('listen',message);
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

function findLead(sockets){
    for (var i = sockets.length - 1; i >= 0; i--) {
        if(sockets[i].number_process > number_process){
            sockets[i].socket.emit('listen',{type_message: "leadOff", number_process: number_process});    
        }
    }
}

function leadMessage(sockets,message){
    for (var i = sockets.length - 1; i >= 0; i--) {
        sockets[i].socket.emit('listen',message);    
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

function keepAlive(){
    if(lead != null){
        lead.socket.emit('listen',{type_message: "keepAlive", number_process: number_process});
        lead_OK = false;
        setTimeout(function(){
            if(lead_OK == false){
                console.log("Lead is Dead")
                coordinador.emit('remove',{number_process: lead.number_process})
                lead = null;
                startAlgorithm();
            }
        },500);
    }
}

function startAttack(sockets,server_attack){
    console.log(server_attack);
    console.log("attack: " + server_attack.ip + server_attack.port);
    leadMessage(sockets,{type_message: "attack", server: server_attack})
}

function attacking(){
    if(server_to_attack != null){
        simple_Post();
    }
}

function randomServer(servers){
    var indice = random(0,servers.length - 1, 1)
    return servers[indice];
}