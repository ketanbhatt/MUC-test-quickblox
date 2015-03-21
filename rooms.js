var params, chatUser;

$(document).ready(function() {

	var login = window.prompt("Enter login");
	params = {
		login: login,
		password: '12345678'
	}

	//Web SDK initialization
	QB.init(QBAPP.appID, QBAPP.authKey, QBAPP.authSecret);

	// create an API session and authenticate user
	QB.createSession(params, function(err, result) {
	  if (err) { 
	    console.log('Something went wrong: ' + err);
	  } else {
	    console.log("Session created");
	    chatUser = {
		login: params.login,
		password: result.token,
		id: result.user_id,
		appId: result.application_id
	}
	    
	     setTimeout(function () {
	     	connectChat()
	     }, 2*1000);


	  }
	  
	});

});

function connectChat() {
	console.log("Inside connectChat");
	QB.chat.connect({jid: QB.chat.helpers.getUserJid(chatUser.id, chatUser.appId), password: chatUser.password} , function(err, res) {
		if (err) {
			console.log("Error at connectChat");
		} else {
			QB.chat.onMessageListener = function(senderId, message) {
				  if (senderId == chatUser.id) {
				  	document.writeln("Me: " + message.body + "<br />");
				  } else {
				  	document.writeln(senderId + ": " + message.body + "<br />");
				  }
				};			
			console.log("Chat Connected");
			setTimeout(function() {connectMUC()}, 2*1000);
		}

	 	
	});
}

function connectMUC() {
	console.log("Inside connectMUC");
	QB.chat.muc.join(' 20878_550a60c9535c124a1701b1c8@muc.chat.quickblox.com', function () {
		console.log('User joined');
	});	

}

function sendMessage(msg) {
	var message = {
	        body: msg,
	        type: 'groupchat',
	        extension: {
		  save_to_history: 1,
		  date_sent: Math.floor(Date.now() / 1000)
		}
	};

	QB.chat.send(' 20878_550a60c9535c124a1701b1c8@muc.chat.quickblox.com', message);
	console.log("Message sent");

}

/* Callbacks
----------------------------------------------------------*/

function onConnectFailed() {
	console.log("Error at onConnectFailed");
}

function onConnectSuccess() {	
	// join to Public Room by default
	chatService.join('550a60c9535c124a1701b1c8', chatUser.login);
	
	// create a timer that will send presence each 60 seconds
	chatService.startAutoSendPresence(60);
	
	setTimeout(function() { $('.loading').remove() }, 2 * 1000);
}

function onConnectClosed() {	
	console.log("bye bye")
}

function onChatMessage(nick, message) {
	console.log(message);
}

function onMUCPresence(nick, presence) {
	
	if (presence.type === 'unavailable')
		console.log("unavailable");
	else
		console.log("joined");

}

function onMUCRoster(users, room) {
	var occupants = Object.keys(users);
	var selector = $('.chat .chat-user-list');
	
	// filling of user list
	selector.html('');
	$(occupants).each(function(i) {
		selector.append('<a href="#" class="list-group-item btn"><span class="glyphicon glyphicon-user"></span> ' + this + '</a>');
		
		// disable current user's element
		if (occupants[i] === chatUser.login)
			selector.find('.list-group-item:last').addClass('disabled');
	});
}
