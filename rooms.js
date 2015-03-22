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
	     $('.messages button').click(sendMessage);
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
				if (message.dialog_id == QB.chat.helpers.getDialogIdFromNode(current_room)) {
					$('.messages p').append('(From Room ' + message.dialog_id + ') ')
					  if (senderId == chatUser.id) {
					  	$('.messages p').append('Me: ');
					  } else {
					  	$('.messages p').append(senderId + ': ');
					  }
					  $('.messages p').append(message.body + '<br />');
				}};			
			console.log("Chat Connected");
			$('#selectCourse').show();
		}

	 	
	});
}

function goBack() {
	QB.chat.muc.leave(QBROOMS[current_course].general, function () {
		console.log('User left Previously joined Room');
	});
	for (var i = 0; i < QBROOMS[current_course].concepts.length; i++) {
		QB.chat.muc.leave(QBROOMS[current_course].concepts[i], function () {
			console.log("User left Previously joined Room");

		});
	};
	$('#selectCourse').show();
	$('#selectConcept').hide();
	$('.messages').hide();
	$('#back').hide();
}

function connectMUC() {
	
	var current_selection = $(this).attr('class');
	if (current_selection == 'course'){
		$('#selectCourse').hide();
		$('#selectConcept').show();
		$('#back').show();
		current_course = $(this).val();
		QB.chat.muc.join(QBROOMS[current_course].general, function () {
			console.log('User joined Course Room');
		});
		for (var i = 0; i < QBROOMS[current_course].concepts.length; i++) {
			QB.chat.muc.join(QBROOMS[current_course].concepts[i], function () {
				console.log("User joined Concept Room ");

			});
		};
		current_room = QBROOMS[current_course].general;
	} else {
		current_room = QBROOMS[current_course].concepts[$(this).val()];
	}
	$('.messages').show();
	$('.messages p').html('');
}

function sendMessage(event) {
	event.preventDefault();
	var message = {
	        body: $('#textMessage').val(),
	        type: 'groupchat',
	        extension: {
		  save_to_history: 1,
		  date_sent: Math.floor(Date.now() / 1000)
		}
	};
	$('#textMessage').val('');
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
