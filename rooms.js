var params, chatUser;

$(document).ready(function() {

	params = {
		login: 'chetanbhatt',
		password: '12345678'
	}

	//Web SDK initialization
	QB.init(QBAPP.appID, QBAPP.authKey, QBAPP.authSecret);

	// create an API session and authenticate user
	QB.createSession(params, function(err, result) {
	  if (err) { 
	    console.log('Something went wrong: ' + err);
	  } else {
	    console.log('Session created with id ' + result.id);
	    chatUser = {
			login: params.login,
			password: params.password,
			jid: result.user_id
		}

	    setTimeout(function () {
	    	connectChat();
	    }, 2*3000);

	  }
	  
	});

});

function connectChat() {
	QB.chat.connect(chatUser , function(err, roster) {
		if (err) {
			console.log("Error at connectChat");
		} else {
			console.log("Inside");
			setTimeout(function() {connectMUC()}, 2*2000);
			console.log(roster);
		}

	 	
	});
}

function connectMUC() {
/*	params = {
		// set chat callbacks
		onConnectFailed: onConnectFailed,
		onConnectSuccess: onConnectSuccess,
		onConnectClosed: onConnectClosed,
		onChatMessage: onChatMessage,
		
		// set MUC callbacks
		onMUCPresence: onMUCPresence,
		onMUCRoster: onMUCRoster,
		
		debug: true
	};
*/
	QB.chat.muc.join('550a60c9535c124a1701b1c8', function () {
		console.log('User joined');
	});	

}

/*
function sendMessage() {
	var message = {
	        body: 'Hello world 2',
	        type: 'groupchat',
	};

	// send user message
	chatService.sendMessage('550a60c9535c124a1701b1c8', message);
	console.log("Message sent");

}

*/

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
