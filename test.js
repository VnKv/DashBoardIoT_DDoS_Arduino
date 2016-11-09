var topology = require('fully-connected-topology');
var jsonStream = require('duplex-json-stream'); 
var streamSet = require('stream-set')
var me = process.argv[2];
var friends = process.argv.slice(3);

var swarm = topology(me,friends);
var streams = streamSet(); 

swarm.on('connection',function(friend){
	console.log('new connection');
	friend = jsonStream(friend);
	streams.add(friend);
	friend.on('data',function(data){
		console.log(data);
		console.log(data.username + ">" + data.message);
	});
});

process.stdin.on('data',function(data){
	streams.forEach(function(friend){
		console.log(friend);
		friend.write({username: me, message: data.toString().trim() });
	})
})