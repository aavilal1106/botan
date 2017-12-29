var axios = require('axios');
var fs = require('fs');

module.exports = {
  run : function() {

    var book = 'xrp_mxn';
    var max_spread = 0.02;

    var ask_first = 0;
    var ask_last = 0;
    var pair_spread = false;
    var count = 0;
    var op_type = '';
    var op_price = 0;
    var op_date = '';
    var txt_order = '';

    var op_profit = 0;
    var op_result = '';
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
          pair_spread = true;
          if (ask_first == 0) {
            ask_first = payload.ask;
            return;
          }

          if (ask_first != 0 && ask_last == 0)
            ask_last = payload.ask;

          if (ask_first > ask_last && op_type == '')
            op_type = 'BUY';
          if (ask_first < ask_last && op_type == '')
            op_type = 'SELL';

          if (op_type == '') {
            ask_first = ask_last;
            ask_last = 0;
            return;
          }
          //close buy
          if (op_type == 'BUY' && op_price != 0) {
            op_profit = op_price - payload.bid;
            op_result = op_profit > 0 ? 'PROFIT' : op_profit < 0 ? 'LOST' : 'DRAW';
            txt_order = count + ';' + op_type + ';' + op_date + ';' + op_price + ';' + payload.created_at + ';' + payload.bid + ';' + op_result + ';' + op_profit;
            write_order(txt_order);
            op_price = 0;
            if (op_result == 'PROFIT') {
                op_type = op_type == 'BUY' ? 'SELL' : 'BUY';
            }
          }
          //close sell
          if (op_type == 'SELL' && op_price != 0) {
            op_profit = op_price - payload.ask;
            op_result = op_profit > 0 ? 'PROFIT' : op_profit < 0 ? 'LOST' : 'DRAW';
            txt_order = count + ';' + op_type + ';' + op_date + ';' + op_price + ';' + payload.created_at + ';' + payload.bid + ';' + op_result + ';' + op_profit;
            write_order(txt_order);
            op_price = 0;
            if (op_result == 'PROFIT') {
                op_type = op_type == 'BUY' ? 'SELL' : 'BUY';
            }
          }
          //open buy
          if (op_type == 'BUY') {
            op_price = payload.ask;
            op_date = payload.created_at;
            count++;
          }
          //open sell
          if (op_type == 'SELL') {
            op_price = payload.bid;
            op_date = payload.created_at;
            count++;
          }

        }
      } else {
        pair_spread = false;
      }
    }

    function write_order(txt) {
      console.log(txt);
      fs.appendFile('orders.log',('\n'+ txt), function(err) {
          if(err) {
              return console.log(err);
          }
      });
    }

  }
}
