var params, chatUser, chatService;

$(document).ready(function() {
	//Web SDK initialization
	QB.init(QBAPP.appID, QBAPP.authKey, QBAPP.authSecret);

	// QuickBlox session creation
	QB.createSession(function(err, result) {
		if (err) {
			console.log(err.detail);
		} else {
			$('#loginForm').modal({
				backdrop: 'static',
				keyboard: false
			});
			
			//Some code not written
			
			// events
			login();
	//		$('#logout').click(logout);
	//		$('.sendMessage').click(sendMessage);
		}
	});

	//Some code not written

})

function login() {
	params = {
		login: 'chetanbhatt',
		password: '12345678'
	}

	// chat user authentication
	QB.login(params, function(err, result) {
		if (err) {
			onConnectFailed();
			console.log(err);
		} else {
			chatUser = {
				id: result.id,
				login: params.login,
				pass: params.password
			};

			connectChat();
		}
	});

}

function connectChat() {
	params = {
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

	chatService = new QBChat(params);
	chatService.connect(chatUser);
	
	setTimeout(function() {sendMessage()}, 2 * 5000);

}


function sendMessage() {
	var message = {
	        body: 'Hello world 2',
	        type: 'groupchat',
	};

	// send user message
	chatService.sendMessage('550a60c9535c124a1701b1c8', message);
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
