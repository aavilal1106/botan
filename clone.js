var axios = require('axios');
var fs = require('fs');
module.exports = {
  run : function() {
    tick();
    var book = '';
    function tick() {
      axios.get('https://api.bitso.com/v3/ticker/?book=xrp_mxn')
    	.then(function (response) {
        var payload = response.data.payload;
        console.log(' ASK: ', payload.ask, ' BID: ', payload.bid, ' DIFF: ', payload.ask - payload.bid);
        var txt = payload.created_at + ';' + payload.ask + ';' + payload.bid + ';' + (payload.ask - payload.bid) + '\n';
        fs.appendFile('ops.log', txt, function(err) {
            if(err) {
                return console.log(err);
            }

            setTimeout(function() {
              tick();
            }, 500);
        });

    	})
    	.catch(function(error) {
    		console.log('ERROR');
        setTimeout(function() {
          tick();
        }, 500);
    	});
    }
  }
}
