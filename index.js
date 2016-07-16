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
        "text":"Hi ! Use Pokie-Talkie to talk with Pokemon Go trainers around you"
      }
    }
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(response.body) // Print the shortened url.
    }
    else {
      console.log(error);
      console.log(response);
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
          "title":"Turn on",
          "payload":"SWITCH_ON_PAYLOAD"
        },
        {
          "type":"postback",
          "title":"Turn off",
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

function switchOn(bot, message) {
  console.log(message.user + ": switch on PKTK");

  bot.startConversation(message, function(response, convo) {

    request({
      method: "POST",
        uri: process.env.api_url + 'switch' + "?verify_token=" + process.env.verify_token,
        json: { messenger_id: message.user, status: true }
      },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(response);
          convo.say("Your Pokie-Talkie is now on");
          convo.say("We detected " + response.body.zone.all + " trainer" + (response.body.zone.all > 1 ? "s" : "") + " in your location, and " + response.body.zone.online + (response.body.zone.online > 1 ? " are" : " is") + " online")
        }
        else {
          convo.say("Your Pokie-Talkie could not be turned on");
          console.log(error);
          console.log(response);
        }
        convo.next();
      }
    );

  });

}

function switchOff(bot, message) {
  console.log(message.user + ": switch off PKTK");

  bot.startConversation(message, function(response, convo) {

    request({
      method: "POST",
        uri: process.env.api_url + 'switch' + "?verify_token=" + process.env.verify_token,
        json: { messenger_id: message.user, status: false }
      },
      function (error, response, body) {
        if (!error && response.statusCode == 200)
          convo.say("Your Pokie-Talkie is now off");
        else {
          convo.say("Your Pokie-Talkie could not be turned off");
          console.log(error);
          console.log(response);
        }
        convo.next();
      }
    );

  });

}

function setLocation(bot, message) {
  console.log(message.user + ": setting location");

  bot.startConversation(message, function(response, convo) {
    convo.ask("Send me your location", function(response, convo) {
      if (response.attachments == undefined || response.attachments[0].type != "location") {
        convo.repeat();
        convo.next();
      }
      else {
        request({
          method: "POST",
            uri: process.env.api_url + 'location' + "?verify_token=" + process.env.verify_token,
            json: { messenger_id: message.user, lat: response.attachments[0].payload.coordinates.lat, lng: response.attachments[0].payload.coordinates.long }
          },
          function (error, response, body) {
            if (!error && response.statusCode == 200)
              convo.say("Your position has been updated");
            else {
              convo.say("Your location could not be updated");
              console.log(error);
              console.log(response);
            }
            convo.next();
          }
        );
      }
    });
  });

}

function getHelp(bot, message) {
  bot.startConversation(message,function(err,convo) {

      message_to_send = {
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"generic",
            "elements":[
              {
                "title": "What is Pokie-Talkie ?",
                "buttons":[
                  {
                    "type":"postback",
                    "payload":"HELP_WHAT",
                    "title":"Ask"
                  }
                ]
              },
              {
                "title": "How do I use it ?",
                "buttons":[
                  {
                    "type":"postback",
                    "payload":"HELP_HOW",
                    "title":"Ask"
                  }
                ]
              },
              {
                "title": "When should I update my location ?",
                "buttons":[
                  {
                    "type":"postback",
                    "payload":"HELP_LOCATION",
                    "title":"Ask"
                  }
                ]
              },
              {
                "title": "What is it for ?",
                "buttons":[
                  {
                    "type":"postback",
                    "payload":"HELP_WHY",
                    "title":"Ask"
                  }
                ]
              }
            ]
          }
        }
      };

      convo.ask(message_to_send, function(response, convo) {
        switch(response.text) {
          case "HELP_WHY":
            convo.say("Being with other trainers increases your chances to catch more pokemons, and it is easier to capture gyms in group. Plus it's an occasion to trade in-game tips");
            break;
          case "HELP_WHAT":
            convo.say("Pokie-Talkie is a walkie-talkie for Pokemon Go players. It can be used to send messages to trainers around you");
            break;
          case "HELP_LOCATION":
            convo.say("You should set your location (through the menu) when you move. Otherwise, you will be in contact with people of your previous location");
            break;
          case "HELP_HOW":
            convo.say("Much like a real walkie-talkie, you just switch it on/off through the menu, and then all your messages will be broadcasted to people within 500 meters (or 546 yards) of you");
            break;
          default:
            convo.repeat();
        }
        convo.next();
      });
  });
}

function initiateUser(convo) {

    convo.ask('Let\'s set you up ! What is your in-game player name ?', function(response, convo) {

      var name = response.text;
      convo.say("Great " + name + " ! Let's continue.");

      var message = {
        "text": "What is your team ?",
        "quick_replies": [
          {
            "content_type":"text",
            "title":"Valor",
            "payload":"TEAM_VALOR_PAYLOAD"
          },
          {
            "content_type":"text",
            "title":"Mystic",
            "payload":"TEAM_MYSTIC_PAYLOAD"
          },
          {
            "content_type":"text",
            "title":"Instinct",
            "payload":"TEAM_INSTINCT_PAYLOAD"
          },
          {
            "content_type":"text",
            "title":"Red",
            "payload":"TEAM_VALOR_PAYLOAD"
          },
          {
            "content_type":"text",
            "title":"Blue",
            "payload":"TEAM_MYSTIC_PAYLOAD"
          },
          {
            "content_type":"text",
            "title":"Yellow",
            "payload":"TEAM_INSTINCT_PAYLOAD"
          }
        ]
      };

      convo.ask(message, function(response, convo) {

        var team = (response.quick_reply == undefined ? response.text : response.quick_reply.payload)
        var team_ok = true;
        switch(team) {
          case "TEAM_VALOR_PAYLOAD":
            team = 1
            break;
          case "TEAM_MYSTIC_PAYLOAD":
            team = 2
            break;
          case "TEAM_INSTINCT_PAYLOAD":
            team = 3
            break;
          default:
            team_ok = false;
        }

        if (team_ok == false) {
          convo.say("I did not understand your team name, please select one of the replies");
          convo.repeat();
        }
        else {
          convo.say("Cool ! One last thing, I need your location.");
          convo.ask("At the bottom of Facebook Messenger Mobile application, there is a three dots button, tap it, then tap location pin. A location close to you is all I need.", function(response, convo) {

              if (response.attachments == undefined || response.attachments[0].type != "location") {
                convo.repeat();
                convo.next();
              }
              else {
                data = { messenger_id: response.user, lat: response.attachments[0].payload.coordinates.lat, lng: response.attachments[0].payload.coordinates.long, name: name, team: team };
                console.log(data);
                request({
                  method: "POST",
                    uri: process.env.api_url + 'user' + "?verify_token=" + process.env.verify_token,
                    json: data
                  },
                  function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                      convo.say("Yeah, you're ready to get started !");
                      convo.say("Just turn me on when you want to get in touch with local trainers. If you want to stop receiving messages, simply turn me off (available in the menu).");
                      var message = {
                        "text": "Be aware than when switched on, all messages you send to me will be made public.",
                        "quick_replies": [
                          {
                            "content_type":"text",
                            "title": "Turn on",
                            "payload":"SWITCH_ON_PAYLOAD"
                          }
                        ]
                      };
                      convo.say(message)
                    }
                    else {
                      convo.say("Sorry ! There was a problem creating your profile. Maybe come back later.");
                      console.log(error);
                      console.log(response);
                    }
                    convo.next();
                  }
                );
              }
          });
        }

        convo.next();
      });

      convo.next();
    });
}

controller.hears(['switch on', 'turn on', 'switch_on', 'turn_on', 'SWITCH_ON_PAYLOAD'], 'message_received', function(bot, message) {
  switchOn(bot, message);
});
controller.hears(['switch off', 'turn off', 'switch_off', 'turn_off', 'SWITCH_OFF_PAYLOAD'], 'message_received', function(bot, message) {
  switchOff(bot, message);
});
controller.hears(['help'], 'message_received', function(bot, message) {
  getHelp(bot, message);
});
controller.hears(['location'], 'message_received', function(bot, message) {
  setLocation(bot, message);
});

controller.on('message_received', function(bot, message) {
  // Check if message is text only
  // Check if user is known
  // Check if user's talkie is on

  console.log("Received message: " + message.text + " from " + message.user);

  if (message.text != undefined) {

    bot.startConversation(message, function(err,convo) {

      request({
        method: "POST",
          uri: process.env.api_url + 'message' + "?verify_token=" + process.env.verify_token,
          json: { messenger_id: message.user, text: message.text }
        },
        function (error, response, body) {
          if (!error && response.statusCode == 200)
            console.log("Message succesfully broadcasted");
          else if (response.statusCode == 404) {
            initiateUser(convo);
            return
          }
          else if (response.statusCode == 402)
            convo.say("Sorry, I don't understand your request. Try typing \"help\".");
          convo.next();
        }
      );

    });
  }
});

controller.on('facebook_postback', function(bot, message) {
  console.log("Received postback: " + message.payload);

  if (message.payload == "GET_STARTED_PAYLOAD")
    bot.startConversation(message, function(err,convo) {
      initiateUser(convo);
    });

});
