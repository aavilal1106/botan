var axios = require('axios');
var fs = require('fs');

module.exports = {
  run : function() {

    var book = 'xrp_mxn';
    var max_spread = 0.02;

    var ask_history = [];
    var bid_history = [];
    var pair_spread = false;
    var op_type = '';
    var op_price = 0;
    var op_date = '';
    var txt_order = '';
    var count = 0;
    var profit = 0;
    tick();

    function tick() {
      axios.get('https://api.bitso.com/v3/ticker/?book=' + book)
    	.then(function (response) {
        bot(response.data.payload);
        //var payload = response.data.payload;
        //console.log(' ASK: ', response.data.payload.ask, ' BID: ', response.data.payload.bid, ' DIFF: ', response.data.payload.ask - response.data.payload.bid);
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
    function bot(payload) {
      var spread = payload.ask - payload.bid;
      if (spread <= max_spread) {
        if (pair_spread == false) {
          if (ask_history.length >= 10) {
            ask_history.shift();
            bid_history.shift();
          }
          ask_history.push(payload.ask);
          bid_history.push(payload.bid);
          pair_spread = true;
          if (op_type == 'BUY') {
            //close buy
            profit = op_price - payload.bid;
            txt_order = count + ';' + op_type + ';' + op_date + ';' + op_price + ';' + payload.created_at + ';' + payload.bid + ';' + (profit > 0 ? 'PROFIT' : profit < 0 ? 'LOST' : 'DRAW') + ';' + profit;
            write_order(txt_order);
            op_price = 0;
            op_type = '';
          }
          if (op_type == 'SELL') {
            //close sell
            profit = op_price - payload.ask;
            txt_order = count + ';' + op_type + ';' + op_date + ';' + op_price + ';' + payload.created_at + ';' + payload.ask + ';' + (profit > 0 ? 'PROFIT' : profit < 0 ? 'LOST' : 'DRAW') + ';' + profit;
            write_order(txt_order);
            op_price = 0;
            op_type = '';
          }
          if (ask_history.length >= 2) {
            op_type = get_last_type();
            if (op_type == 'BUY') {
              //open buy
              op_price = payload.ask;
              op_date = payload.created_at;
              count++;
            }
            if (op_type == 'SELL') {
              //open sell
              op_price = payload.bid;
              op_date = payload.created_at;
              count++;
            }
          }
        }
      } else {
        pair_spread = false;
      }
    }

    function get_last_type() {
      var last_index = ask_history.length - 1;
      for (var i = last_index; i <= 1; i--) {
        if (ask_history[i] > ask_history[i - 1]) {
          return 'SELL';
        }
        if (ask_history[i] < ask_history[i - 1]) {
          return 'BUY';
        }
      }
      return '';
    }

    function write_order(txt) {

      fs.appendFile('orders.log',txt, function(err) {
          if(err) {
              return console.log(err);
          }
      });
    }

  }
}
