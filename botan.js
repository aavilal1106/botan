var axios = require('axios');
var fs = require('fs');

/*data*/
var botan_params = {
  currency: 'xrp_mxn'
};

module.exports = {
  run : function() {
    tick();
    function tick() {
      axios.get('https://api.bitso.com/v3/ticker/?book=' + botan_params.currency)
    	.then(function (response) {
        var payload = response.data.payload;
    		console.log('TIME: ', payload.created_at, ' ASK: ', payload.ask, ' BID: ', payload.bid);
        setTimeout(function() {
          tick();
        }, 500);
    	})
    	.catch(function(error) {
    		console.log('ERROR');
        setTimeout(function() {
          tick();
        }, 500);
    	});
    }
    function save_tick() {
      console.log('save_tick');
      money_management();
    }
    function money_management() {
      console.log('money_management 2');
    }
  }
}
