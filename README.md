# Pokie-talkie bot
![alt text](https://ctsd.github.io/pktk-bot/img/calculus.png "Pokie-talkie")

As a yound and wild Pokemon Go trainer, meeting and communicating with other trainers around was a big deal.

That's why I created an Facebook Messenger bot, acting as a talkie-walkie relaying messages to people also connected to that bot in a radius of 500meters.

### Technology

This is the repo of the bot app, based on Node.js and the awesome [Botkit](https://github.com/howdyai/botkit) library.

Once connected to a Facebook page, it receives messages from users talking to it through Facebook Messenger, and answers them.

It also exchanges data with the webservice ([repo here](https://github.com/ctsd/pktk-api)), to eventually store data or broadcast a public message.
