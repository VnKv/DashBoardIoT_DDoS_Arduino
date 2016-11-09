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
var request = require('request');
var io = require('socket.io-client')('http://localhost:3000');

/*server.listen(port, function() {  
    console.log('Servidor corriendo en http://localhost:' + port);
});*/

setInterval(post_Request,delay);

io.on("arduinos",function(data){
    console.log(data);
    //Start Lead Election
    var lead = getLead(data.arduinos);
    console.log(lead);
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

function getLead(arduinos){
    var max = 0;
    var index = 0; 
    for (var i = arduinos.length - 1; i >= 0; i--) {
        if(arduinos[i].number_process > max){
            index = i;
            max = arduinos[i].number_process;
        }
    }
    return arduinos[index];
}
