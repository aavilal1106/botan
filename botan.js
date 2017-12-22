var axios = require('axios');
var fs = require('fs');

/*data*/
var botan_params = {
  currency: 'xrp_mxn'
};

module.exports = {
  run : function() {
    var open_candle_ask = 0;
    var open_candle_bid = 0;
    var open_candle_min = '';
    var close_candle_ask = 0;
    var close_candle_bid = 0;
    var close_candle_min = '';

    var type_op = '';
    var open_op = 0;
    var date_op = '';

    var max_lost = 0;
    var lost_count = 0;
    var stop_loss = 1;
    var take_profit = 1;
    var max_spread = 0.2;
    var text_op = '';
    var count = 0;
    tick();
    function tick() {
      axios.get('https://api.bitso.com/v3/ticker/?book=' + botan_params.currency)
    	.then(function (response) {
        var payload = response.data.payload;
    		//console.log('TIME: ', payload.created_at, ' ASK: ', payload.ask, ' BID: ', payload.bid);
        bot(response.data.payload);
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
        var spread = Math.abs(payload.ask - payload.bid);
        if (payload.created_at.indexOf('00+00:00') != -1 && open_candle_ask == 0) {
          open_candle_ask = payload.ask;
          open_candle_bid = payload.bid;
          open_candle_min = payload.created_at.substring(0,16);
          close_candle_ask = 0;
          close_candle_bid = 0;
          close_candle_min = '';
        }
        //consider spread
        if (open_candle_ask != 0 && open_candle_min != payload.created_at.substring(0,16) && spread <= max_spread) {
          close_candle_ask = payload.ask;
          close_candle_bid = payload.bid;
          close_candle_min = payload.created_at.substring(0,16);
        }
        if (close_candle_min != '' && type_op == '') {
          if (close_candle_ask > open_candle_ask) {
            type_op = 'BUY';
            open_op = payload.ask;
            date_op = payload.created_at.substring(0,16);
            count = count + 1;
            console.log(count, ' BUY ', date_op, ' ', open_op);
          }
          if (close_candle_ask < open_candle_ask) {
            type_op = 'SELL';
            open_op = payload.bid;
            date_op = payload.created_at.substring(0,16);
            count = count + 1;
            console.log(count, ' SELL ', date_op, ' ', open_op);
          }
          open_candle_min = 0;
          close_candle_min = 0;
        }

        if (type_op == 'BUY') {
          if (payload.bid - open_op >= take_profit) {
            //win
            text_op = '\n' + count + ';'+ type_op + ';' + date_op + ';' + open_op + ';' + payload.created_at.substring(0,16) + ';' + payload.bid + ';PROFIT';
            write(text_op);
            lost_count = 0;
            restart();
          }
          if (open_op - payload.bid >= stop_loss) {
            //loose
            text_op = '\n' + count + ';'+ type_op + ';' + date_op + ';' + open_op + ';' + payload.created_at.substring(0,16) + ';' + payload.bid + ';LOST';
            write(text_op);
            lost_count = lost_count + 1;
            if (lost_count > max_lost) {
              max_lost = lost_count;
            }
            restart();
          }
        }

        if (type_op == 'SELL') {
          if (open_op - payload.ask >= take_profit) {
            //win
            text_op = '\n' + count + ';'+ type_op + ';' + date_op + ';' + open_op + ';' + payload.created_at.substring(0,16) + ';' + payload.ask + ';PROFIT';
            write(text_op);
            lost_count = 0;
            restart();
          }
          if (payload.ask - open_op >= stop_loss) {
            //loose
            text_op = '\n' + count + ';'+ type_op + ';' + date_op + ';' + open_op + ';' + payload.created_at.substring(0,16) + ';' + payload.ask + ';LOST';
            write(text_op);
            lost_count = lost_count + 1;
            if (lost_count > max_lost) {
              max_lost = lost_count;
            }
            restart();
          }
        }
    }
    function write(text) {
      fs.appendFile('ops.log', '\n'+ text, function (err) {
        if (err) throw err;
        console.log(text);
      });
    }
    function restart() {
      open_candle_ask = 0;
      open_candle_bid = 0;
      open_candle_min = '';
      close_candle_ask = 0;
      close_candle_bid = 0;
      close_candle_min = '';

      type_op = '';
      open_op = 0;
      date_op = '';
    }
  }
}
