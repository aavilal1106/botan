var express = require('express');
var http = require('http');
var botan = require('./botan');
var app = express();
var server = http.createServer(app);
app.set('port', process.env.PORT || 4000);

/*
app.get('/save-user/:key', function(req, res) {
	var database = admin.database();
	var ref = database.ref('users');
	ref.push(req.params.key);
	res.send('{"status": 0}');
});
*/

/* Start server */
server.listen(app.get('port'), function (){
  console.log('Botan is running on port %d', app.get('port'));
	botan.run();
});

module.exports = app;
