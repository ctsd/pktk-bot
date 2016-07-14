if (!process.env.page_token) {
    console.log('Error: Specify page_token in environment');
    process.exit(1);
}

if (!process.env.verify_token) {
    console.log('Error: Specify verify_token in environment');
    process.exit(1);
}

var Botkit = require('botkit');
var os = require('os');
var request = require('request');
var smsg = require('smsg');


var controller = Botkit.facebookbot({
  debug: false,
  access_token: process.env.page_token,
  verify_token: process.env.verify_token,
});

var bot = controller.spawn({});

controller.setupWebserver(process.env.port || 3000, function(err, webserver) {
    controller.createWebhookEndpoints(webserver, bot, function() {
        console.log('ONLINE!');
    });
});

function prepare() {
  // Greeting text
  var options = {
    uri: 'https://graph.facebook.com/v2.6/me/thread_settings?access_token=' + process.env.page_token,
    method: 'POST',
    json: {
      "setting_type":"greeting",
      "greeting":{
        "text":"Hi ! Use Pokie Talkie to talk with Pokemon Go trainers around you"
      }
    }
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(response.body) // Print the shortened url.
    }
  });

  // Get started button
  var options = {
    uri: 'https://graph.facebook.com/v2.6/me/thread_settings?access_token=' + process.env.page_token,
    method: 'POST',
    json: {
      "setting_type":"call_to_actions",
      "thread_state":"new_thread",
      "call_to_actions":[
        {
          "payload":"GET_STARTED_PAYLOAD"
        }
      ]
    }
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(response.body) // Print the shortened url.
    }
  });

  // Persistent menu
  var options = {
    uri: 'https://graph.facebook.com/v2.6/me/thread_settings?access_token=' + process.env.page_token,
    method: 'POST',
    json: {
      "setting_type" : "call_to_actions",
      "thread_state" : "existing_thread",
      "call_to_actions":[
        {
          "type":"postback",
          "title":"Switch on",
          "payload":"SWITCH_ON_PAYLOAD"
        },
        {
          "type":"postback",
          "title":"Switch off",
          "payload":"SWITCH_OFF_PAYLOAD"
        },
        {
          "type":"postback",
          "title":"Set location",
          "payload":"SET_LOCATION_PAYLOAD"
        },
        {
          "type":"postback",
          "title":"Help",
          "payload":"HELP_PAYLOAD"
        }
      ]
    }
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(response.body) // Print the shortened url.
    }
  });
}

prepare();
