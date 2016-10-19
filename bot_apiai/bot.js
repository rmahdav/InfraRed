var Botkit = require('botkit');
var apiai = require('apiai');
var app = apiai(process.env.APIAITOKEN);
var actions = require('./actions.js');

var controller = Botkit.slackbot({
  debug: false
});

// connect the bot to a stream of messages
controller.spawn({
  token: process.env.ALTCODETOKEN,
}).startRTM()

controller.hears('(.*)',['mention', 'direct_mention', 'direct_message'], function(bot,message) {
	var request = app.textRequest(message.text);

	request.on('response', function(response) {
    	console.log(response);
    	if(response.result.actionIncomplete) {
    		bot.reply(message, response.result.fulfillment.speech);
    	} else {
    		switch (response.result.action)
			{
			   case 'save.keys': actions.saveKeys(bot, message, response);
			   break;
			   
			   case 'create.vm': actions.createVM(bot, message, response);
			   break;
			   
			   case 'create.cluster': actions.createCluster(bot, message, response);
			   break;

			   case 'smalltalk.greetings': bot.reply(message, response.result.fulfillment.speech);
			   break;
			   
			   default: bot.reply(message, response.result.fulfillment.speech);
			}
    	}
	});
 
	request.on('error', function(error) {
	    console.log(error);
	});

	request.end();
});