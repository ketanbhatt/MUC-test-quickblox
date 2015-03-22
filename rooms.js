var params, chatUser, current_course, current_room;

$(document).ready(function() {
	var login = window.prompt("Enter login");
	params = {
		login: login,
		password: QBAPP.userPassword
	}

	//Web SDK initialization
	QB.init(QBAPP.appID, QBAPP.authKey, QBAPP.authSecret, QBAPP.debug);

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
	};
	    
	     connectChat();

	     //events
	     $('.choose button').click(connectMUC);
	     $('#back').click(goBack);
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
				  	$('.messages p').append('Me: ' + message.body + '<br />');
				  } else {
				  	$('.messages p').append(senderId + ': ' + message.body + '<br />');
				  }
				};			
			console.log("Chat Connected");
			$('#selectCourse').show();
		}

	 	
	});
}

function goBack() {
	$('#selectCourse').show();
	$('#selectConcept').hide();
	$('#back').hide();
}

function connectMUC() {
	
	var current_selection = $(this).attr('class');
	if (current_selection == 'course'){
		$('#selectCourse').hide();
		$('#selectConcept').show();
		current_course = $(this).val()
		current_room = COURSE_ROOMS[current_course];
	} else {
		current_room = CONCEPT_ROOMS[current_course + '.' + $(this).val()];
	}
	$('.messages').show();
	$('.messages p').html('');
	QB.chat.muc.join(current_room, function () {
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

	QB.chat.send(current_room, message);
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
