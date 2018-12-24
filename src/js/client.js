//comenzamos
$(document).ready(function() {

	 //redefinimos array para añadir un random, lo vamos a usar...
	 Array.prototype.rand = function () {
	 	return this[Math.floor((Math.random()*this.length))];
	 }

	 //conservar como variable principal y hacer que se pueda remplazar desde el menu
	 var server = 'wss://clouds.bitofwar.com';

	//definimos lo que hay que definir
	var socket = io(server); //hello
	var game = Game.create(socket, document.getElementById('canvas'), document.getElementById('leaderboard'));
	var chat = Chat.create(socket, $('.chat-display'), document.getElementById('chat-input'));
	var userStatus = "offline";

	Input.applyEventHandlers(document.getElementById('canvas'));
	Input.addMouseTracker(document.getElementById('canvas'));


/************************************************************/
	/* Sounds ***************************************************/

	//sound menu ambient
	var sound_menu_ambient = document.createElement("audio");
	sound_menu_ambient.src = "./audio/menu/ambient.mp3";
	sound_menu_ambient.volume = 0.5;
	sound_menu_ambient.autoPlay = true;
	sound_menu_ambient.loop = true;
	sound_menu_ambient.preLoad = false;
	sound_menu_ambient.controls = false;
	sound_menu_ambient.currentTime = 1;

	//sound menu click
	var sound_menu_click = document.createElement("audio");
	sound_menu_click.src = "./audio/menu/click.wav";
	sound_menu_click.volume = 0.2;
	sound_menu_click.autoPlay = false;
	sound_menu_click.loop = false;
	sound_menu_click.preLoad = true;
	sound_menu_click.controls = false;

	//sound menu tabs
	var sound_menu_tabs = document.createElement("audio");
	sound_menu_tabs.src = "./audio/menu/tabs.wav";
	sound_menu_tabs.volume = 0.02;
	sound_menu_tabs.autoPlay = false;
	sound_menu_tabs.loop = false;
	sound_menu_tabs.preLoad = true;
	sound_menu_tabs.controls = false;

	//Posiciones en segundos
	var sound_bg_posiciones = [
	0, 147, 383, 626, 830, 1075, 1332, 1524, 1777, 1968, 2246, 2524, 2766,
	2990, 3216, 3286, 3461, 3702, 3857, 4090, 4326, 4580, 4845, 5143
	];

	//selección al azar
	var sound_bg_posicion = sound_bg_posiciones[Math.floor(Math.random() * sound_bg_posiciones.length)];

	//on playing music
	var sound_bg = document.createElement("audio");
	sound_bg.src = "./audio/full.mp3";
	sound_bg.volume = 0.2;
	sound_bg.autoPlay = false;
	sound_bg.preLoad = true;
	sound_bg.controls = true;
	sound_bg.currentTime = sound_bg_posicion;


	/************************************************************/
	/* sound preloader ******************************************/

	//espacios para sonidos
	var sounds_harm = [];
	var sounds_dies = [];
	var sounds_eliminacion = [];
	var sounds_spawn = [];
	var sounds_order_1 = [];
	var sounds_order_2 = [];
	var sounds_order_3 = [];
	var sounds_order_4 = [];
	var sounds_order_5 = [];
	var sounds_order_6 = [];


	//sounds.whenLoaded = alinear_sonido;

	function preload() {
		//preload sounds
		socket.emit('preload', function(feedback) {

			//los predefinidos
			sounds.load(['./audio/coins.mp3']);
			sounds.load(['./audio/cardio.mp3']);
			sounds.load(['./audio/buzz.mp3']);
			//sonidos de munición
			sounds.load(['./audio/ammo/common.mp3']);
			sounds.load(['./audio/ammo/quick.mp3']);
			sounds.load(['./audio/ammo/fork.mp3']);

			//sound preloader harm
			feedback.harm.forEach( function(file) {
				sounds.load([ './audio/harm/' + file ]);
				sounds_harm.push('./audio/harm/' + file);
			});
			//sound preloader dies
			feedback.dies.forEach( function(file) {
				sounds.load([ './audio/dies/' + file ]);
				sounds_dies.push('./audio/dies/' + file);
			});
			//sound preloader dies
			feedback.eliminacion.forEach( function(file) {
				sounds.load([ './audio/eliminacion/' + file ]);
				sounds_eliminacion.push('./audio/eliminacion/' + file);
			});
			//sound preloader spawn
			feedback.spawn.forEach( function(file) {
				sounds.load([ './audio/spawn/' + file ]);
				sounds_spawn.push('./audio/spawn/' + file);
			});
			//sound preloader powers 1
			feedback.order_1.forEach( function(file) {
				sounds.load([ './audio/powers/1/' + file ]);
				sounds_order_1.push('./audio/powers/1/' + file);
			});
			//sound preloader powers 2
			feedback.order_2.forEach( function(file) {
				sounds.load([ './audio/powers/2/' + file ]);
				sounds_order_2.push('./audio/powers/2/' + file);
			});
			//sound preloader powers 3
			feedback.order_3.forEach( function(file) {
				sounds.load([ './audio/powers/3/' + file ]);
				sounds_order_3.push('./audio/powers/3/' + file);
			});
			//sound preloader powers 4
			feedback.order_4.forEach( function(file) {
				sounds.load([ './audio/powers/4/' + file ]);
				sounds_order_4.push('./audio/powers/4/' + file);
			});
			//sound preloader powers 5
			feedback.order_5.forEach( function(file) {
				sounds.load([ './audio/powers/5/' + file ]);
				sounds_order_5.push('./audio/powers/5/' + file);
			});
			//sound preloader powers 6
			feedback.order_6.forEach( function(file) {
				sounds.load([ './audio/powers/6/' + file ]);
				sounds_order_6.push('./audio/powers/6/' + file);
			});
			//inicializados
			sounds.whenLoaded = alinear_sonido;
		});
	}

	//corremos preload
	preload();
	//quizás debería sacarse
	function alinear_sonido() {
	}

	//money sound
	function sound_coins() {
		sounds['./audio/coins.mp3'].play()
	}


	/******************************************************/
	/* Interface composer UI f-interfarce *****************/

	$(window).resize(function() {
		var chatSize = $('.menu-right').height() - ( $('.avatar-container').height() + $('.chat-input').height() + 92);
		$('.chat-display').height(chatSize);
	});

	// background body change
	setInterval(function() {
		var items = [1,2,3];
		var item = items[Math.floor(Math.random()*items.length)];
			$('body').attr({'style' : 'background-image: url("../img/menu/0' + item + '.png");'});
	}, 5000);

	var brand_top = $('.brand').offset().top;
	var brand_height = $('.brand').height();
	var menu_top = $('.menu').offset().top;
	var brand_position = (menu_top - (brand_height / 2) - 15);
	$('.brand').css({'top': brand_position});
	
	$(window).click(function(e) {	
		// close menu if click outside    
	    if (menu_status == 'on') { 
	    	if (e.target.id == 'body' || e.target.id == 'canvas' || e.target.id == 'canvas_02') {menu_switch('off')};
	    }
	});


	/******************************************************/
	/* Menu kard's triggers *******************************/

	// track which section tab clicked
	$('.menu-manager').click(function() {
		var elementClicked = this.getAttribute('href').split('#')[1];
		menu_manager(elementClicked);
	});


	/******************************************************/
	/* Open/close menu f-menu_switch **********************/
	var brand_top = $('.brand').offset().top;
	var menu_status = 'on';
	// menu switch function
	function menu_switch(state) {

		if ( menu_status == 'on' || (state == 'off')) {
			TweenMax.set('.brand', {opacity: 1, scale: 1, top: brand_top});
			TweenMax.to('.brand', 0.3, {opacity: 0, scale: 0.5, display: "none", top: "0%", ease: Expo.easeIn });

			TweenMax.set('.menu', {opacity: 1, scale: 1, top: "22%"});
			TweenMax.to('.menu', 0.1, {boxShadow: "0 0 0 #000", ease: Expo.easeIn});

			TweenMax.set('.menu-left', {opacity: 1, scale: 1, css:{position: 'relative', left: '0%'}});
			TweenMax.to('.menu-left', 0.38, {delay:0.2, opacity: 1, scale: 0.5, css:{position: 'relative', left: '20%'}, ease: Expo.easeOut});

			TweenMax.set('.menu-right', {opacity: 1, scale: 1, css:{position: 'relative', left: '0%'}});
			TweenMax.to('.menu-right', 0.3, {delay:0.2, opacity: 1, scale: 0.5, css:{position: 'relative', left: '-35%'}, ease: Expo.easeOut});

			TweenMax.to('.menu', 0.4, {delay:0.2, opacity: 0, className: '-=menu-on', scale: 0.5, top: "110%", ease: Expo.easeIn });

			menu_status = 'off';
		}
		else { //open menu
			user_stats();
			TweenMax.set('.brand', {delay: 0.9, opacity:1, scale: 0.5, top: "20%", display: "block",});
			TweenMax.to('.brand', 1, {delay: 0.9, top: brand_top, opacity: 1, scale: 1, ease: Elastic.easeOut.config(1, 1), force3D: true });

			TweenMax.set('.menu', {opacity:1, scale: 0.5, className: '+=menu-on', top: "110%"});
			TweenMax.to('.menu', 0.7, {top: "22%", opacity: 1, scale: 1, ease: Elastic.easeOut.config(1, 0.75), force3D: true });
			TweenMax.to('.menu', 0.3, {delay: 0.84, boxShadow: "0 3px 140px #000", ease: Expo.easeOut});

			TweenMax.set('.menu-left', {delay: 0.3, opacity: 1, scale: 0.5, css:{position: 'relative', left: '22%'}});
			TweenMax.to('.menu-left', 0.5, {delay: 0.38, opacity: 1, scale: 1, css:{position: 'relative', left: '0%'}, ease: Expo.easeOut});

			TweenMax.set('.menu-right', {delay: 0.26, opacity: 1, scale: 0.5, css:{position: 'relative', left: '-35%'}});
			TweenMax.to('.menu-right', 0.5, {delay: 0.26, opacity: 1, scale: 1, css:{position: 'relative', left: '0%'}, ease: Expo.easeOut});

			menu_status = 'on';
		}
	}


	/******************************************************/
	/* Url worker f-url_worker ****************************/

	// read the url and send to menu_manager
	function url_worker() {

		// create array with all sections
		var sections = [];

		$('.menu-left ul li a').each(function() {
			var thisSection = $( this ).attr('href').split('#')[1];
			sections.push(thisSection);
		});

		// check url to manage menu
		var url = location.hash.split('#')[1];

		//fill user stats if necessary
		user_stats();

		if (url && ($.inArray(url, sections) >= 0)) {
			menu_manager(url);
		}
		else if (typeof url === 'undefined') {
			menu_manager('leaderboard');
		}
		else {
			menu_manager('leaderboard');
		};
	}


	/******************************************************/
	/* Menu manager  f-menu_manager ***********************/

	// function that manage the center of the menu
	function menu_manager(kard) {

		// if menu is not open
		if (menu_status == 'off') { menu_switch('on');};

		location.hash = ('#' + kard);
		$('*').removeClass('menu-active');
		$('.menu-manager.' + kard).addClass('menu-active');
		$('.menu').addClass('menu-on');
		sound_menu_click.currentTime = 0;
		sound_menu_click.play();

		//for each kard
		if (kard == 'new-user') {
			$('#name-input').focus();
		}
		if (kard == 'leaderboard') {
			leaderboard_view(0, 50);
		}
		if (kard == 'cashier') {
			$('#withdrawals-available-balance').val(Cookies('user_balance'));
			$('.kard-cashier [data-tab-link]').removeClass('active');
			$('.kard-cashier [data-tab-link]:first-child').addClass('active');
			$('.kard-cashier [data-tab]').removeClass('active');
			$('#kard-cashier-deposits').addClass('active');
		}
		if (kard == 'settings') {
			user_mfa_show();
			$('.kard-settings [data-tab-link]').removeClass('active');
			$('.kard-settings [data-tab-link]:first-child').addClass('active');
			$('.kard-settings [data-tab]').removeClass('active');
			$('#kard-settings-ux').addClass('active');
		}
		if (kard == 'balance') {
			user_balance_view();
		}
		if (kard == 'profile') {
			user_overview();
			if (Cookies('user-email')) {var email = Cookies('user-email');$('#user_email_edit').attr({'placeholder': email});} else {$('#user_email_edit').attr({'placeholder': 'add email'});}
		}
		if (kard == 'online-players') {
			user_status();
			leaderboard_view(1, 25);
		}

		// manage show and hide kards
		if ( $('.kard-' + kard).css('display') == 'none' ) {
			// take out the actual section
			TweenMax.staggerTo('.kard-modal.show',1.2, {opacity: 1, top: '100%', ease: Elastic.easeOut.config(1, 1), onComplete: outShow(), });
			TweenMax.staggerTo('.kard-modal.show', 0.1, {display: 'none', className: '-=show', });

			function outShow() {
				// take in the selected section
				TweenMax.set('#kard-' + kard  + '.kard-modal', {opacity: 0, top: '-100%', });
				TweenMax.staggerTo('#kard-' + kard  + '.kard-modal',1.2, {opacity: 1, top: '0%', display: 'block', ease: Elastic.easeOut.config(1, 1), className: '+=show', });
			};
		}
	}


	/************************************************************/
	/* New user register ****************************************/

	function user_new() {
		//asociamos variables
		var email = $('#user-new-email').val();
		var username = $('#user-new-username').val();
		var password = $('#user-new-password').val();
		var nonce = (new Date()).getTime();

		//enviamos un comunicado al servidor con las variables asociadas
		socket.emit('user-new', { email: email, username: username, password: password }, function(feedback) {

			//not possible to create user
			if(feedback.advice != 'Welcome.') { $('#alert-message-register').text(feedback.advice); }

			//user create success
			if(feedback.advice == 'Welcome.') {

				//abrimos sock de acceso (enviamos un segundo pedido accediendo con el nuevo usuario y password).
				socket.emit('user-login', { name: username, pass: password, nonce: nonce }, function(feedback) {

					//rare case
					if(feedback.advice == 'Invalid username or password.') {
						clear_modal_login()
						$('#alert-message-register').text(feedback.advice);
					}
					//everything ok
					else {
						showAlert('Welcome ' + username, 'yellow');
						clear_modal_login();
						//armamos las cookies
						Cookies.set('user_id', feedback.user.id);
						Cookies.set('user_email', feedback.user.email);
						Cookies.set('user_username', feedback.user.username);
						Cookies.set('user_password', feedback.user.password);
						Cookies.set('user_balance', feedback.user.available_balance);
						Cookies.set('user_address', feedback.user.address);
						Cookies.set('user_logued', 'True');
						Cookies.set('developer_info', 'off');
						Cookies.set('music_playing', 'on');
						Cookies.set('music_menu', 'on');
						Cookies.set('playing_rain', 'on');
						menu_manager('cashier');
						user_status();
						user_stats();
					}
				}); //cerramos el sock de acceso (user/access)
			};
		}); //cerramos sock de creación de usuario
	}


	/************************************************************/
	/* User login ***********************************************/

	function user_login() {
		//fill with the input variables
		var name = $('#name-input').val();
		var pass = $('#pass-input').val();
		var mfa_code = $('#mfa-code-input').val();
		var nonce = (new Date()).getTime();

		socket.emit('user-login', { name: name, pass: pass, mfa_code: mfa_code, nonce: nonce }, function(feedback) {

			//if user or password invalid
			if(feedback.advice == 'Invalid username or password.') {
				clear_modal_login()
				$('#alert-message-resume').text('User or password invalid');
			}
			//if 2fa is invalid
			else if(feedback.advice == 'Invalid MFA.') {
				clear_modal_login()
				$('#alert-message-resume').text('Invalid MFA.');
			}
			//if user is valid
			else {
				clear_modal_login();
				//set up cookies
				Cookies.set('user_id', feedback.user.id);
				Cookies.set('user_email', feedback.user.email);
				Cookies.set('user_username', feedback.user.username);
				Cookies.set('user_password', feedback.user.password);
				Cookies.set('user_balance', feedback.user.available_balance);
				Cookies.set('user_address', feedback.user.address);
				Cookies.set('user_logued', 'True');
				Cookies.set('developer_info', 'off');
				Cookies.set('music_playing', 'on');
				Cookies.set('music_menu', 'on');
				Cookies.set('playing_rain', 'on');

				//send to online players menu
				menu_manager('online-players');
				//set user status
				user_status();
				user_stats();
			}
		})
		return false;
	};

	//detect "enter key" on password input field to login
	$.fn.pressEnter = function(fn) {
	    return this.each(function() {
	        $(this).bind('enterPress', fn);
	        $(this).keyup(function(e){
	            if(e.keyCode == 13)
	            {
	              $(this).trigger("enterPress");
	            }
	        })
		});
	};
	$('#pass-input').pressEnter(function(){user_login();})


	/************************************************************/
	/* Recuperacion de password *********************************/

	function recover_pass() {
		var email = $('#email-recover-input').val();
		socket.emit('recover-pass', { email: email }, function(feedback) {
		})
	}


	/************************************************************/
	/* Procesa la información necesaria para crear el MFA *******/

	function user_mfa_show() {
		//search from cookies
		var username = Cookies('user_username');
		var password = Cookies('user_password');

		socket.emit('user-mfa', { username: username, password: password }, function(feedback) {

			//build qr information
			var informacion = 'otpauth://totp/' + username + '?secret=' + feedback.mfa.recover + '&issuer=www.bitofwar.com';
			//qr creation
			$('#qrcode_mfa').text('');
			$('#qrcode_mfa').qrcode(informacion);
			//info recover_code
			$('#user-mfa-recover').text('');
			$('#user-mfa-recover').text(feedback.mfa.recover);
		})
	}


	/************************************************************/
	/* Procesa la información necesaria para crear el MFA *******/

	function user_mfa_enable() {
		//search from cookies
		var username = $('#2fa-username').val();
		var password = $('#2fa-password').val();
		var password = forge_sha256(password);
		var mfa_recover = $('#user-mfa-recover').text();
		var mfa_code = $('#user-mfa-code').val();
		socket.emit('user-mfa-enable', { username: username, password: password, mfa_recover: mfa_recover, mfa_code: mfa_code }, function(feedback) {
			//hacer cosas con la información? o no hacer nada... siempre dice done.
			// console.log(feedback);
			//generador de QR
			//$('#qrcode_mfa').qrcode(feedback.mfa.recover_code);
			//informamos el recover_code
			//$('#user-mfa-recover-code').val(feedback.mfa.recover_code);
		})
	}


	/************************************************************/
	/* Cerramos la sesión ***************************************/

	function session_close() {
		sounds['./audio/cardio.mp3'].pause();
		sounds['./audio/buzz.mp3'].pause();
		sound_bg.pause();
		//user disconnect
		var previa = socket.disconnect();
		previa.open();
		//eliminamos las cookies que creamos con el login
		Cookies.expire('user_id');
		Cookies.expire('user_email');
		Cookies.expire('user_username');
		Cookies.expire('user_password');
		Cookies.expire('user_balance');
		Cookies.expire('user_balance_usd');
		Cookies.expire('user_logued');
		Cookies.expire('user_address');
		Cookies.expire('developer_info');
		Cookies.expire('music_playing');
		Cookies.expire('music_menu');
		Cookies.expire('playing_rain');
		$(location).attr('href', '#new-user');
		user_status();
	}


	/************************************************************/
	/* Clear modal register *************************************/

	function clear_modal_login() {
		$('#kard-new-user input').val('');
	};


	/************************************************************/
	/* Usuario online & offline f-user_status *******************/

	function user_status() {
		if (Cookies('user_logued') == "True") {
			//change on the ui
			$(".user-online").css({ "display": "inherit" });
			$(".user-offline").css({ "display": "none" });
			$('body').addClass('user-logged');

			if ($('body').hasClass('playing')) {
				$('.btn-respawn').css({'display': 'none'});
			}
			else {
				$('.btn-respawn').css({'display': 'inline-block'});
			}

			//build qr
			$('#qrcode_personal_address').text('');
			$('#qrcode_personal_address').qrcode(Cookies('user_address'));
		}
		else {
			//change on the ui
			$(".user-online").css({ "display": "none" });
			$(".user-offline").css({ "display": "inherit" });
			$('.btn-respawn').css({'display': 'none'});
			//send user to new-user kard
			menu_manager('new-user');
			Cookies.set('user_logued', 'False');
		}
	}


	/************************************************************/
	/* User stats info f-user_stats *****************************/

	function user_stats() {

		//only if user is logged
		if (Cookies('user_logued') == "True") {

			//search on cookies
			var username = Cookies('user_username');
			var password = Cookies('user_password');

			//send to node
			socket.emit('user-balance-view', { username: username, password: password }, function(feedback) {
				if ($('.user-name').text() != feedback.user.username ) { $('.user-name').text(feedback.user.username); }
				if ($('.user-address').text() != feedback.user.address ) { $('.user-address').text(feedback.user.address); }
				if ($('.user-email').text() != feedback.user.email ) { $('.user-email').text(feedback.user.email); }
				if ($('.user-kills').text() != feedback.user.won ) { $('.user-kills').text(feedback.user.won); }
				if ($('.user-deaths').text() != feedback.user.eliminado ) { $('.user-deaths').text(feedback.user.lose); }
				if ($('.user-spawns').text() != feedback.user.spawns ) { $('.user-spawns').text(feedback.user.spawns); }
				if ($('.user-bits').text() != feedback.user.available_balance ) { $('.user-bits').text(feedback.user.available_balance); }
				if ($('.user-profit').text() != feedback.user.difference ) { $('.user-profit').text(feedback.user.difference); }
				if ($('.user-status').text() != feedback.user.condicion ) { $('.user-status').text(feedback.user.condicion); }
			});
		}
	}


	/************************************************************/
	/* cashier/search *******************************************/

	//Busca nuevas operaciones del usuario
	function cashier_search() {
		//buscamos las variables de cookies
		var username = Cookies('user_username');
		var password = Cookies('user_password');
		//envamos las variables para node
		socket.emit('cashier-search', { username: username, password: password }, function(feedback) {
			//si hay operaciones nuevas, informamos.
			if(feedback.advice != null) { showAlert(feedback.advice, 'yellow'); }
			//almacenamos el balance en balance_previo
			var balance_previo = $('.user_balance').html();
			//console.log(balance_previo, feedback.user.available_balance);
			//si el balance nuevo es mayor a balance_previo, hacemos ruido de monedas
			if(feedback.user.available_balance > balance_previo) { sound_coins(); }
			//refrescamos el balance del usuario
			$('.user_balance').text(feedback.user.available_balance);
			//modificamos la cookie
			if(feedback.user.available_balance != Cookies('user_balance')) { Cookies.set('user_balance', feedback.user.available_balance); }
		});
	};


	/************************************************************/
	/* cashier/view *********************************************/

	//habilitamos la funcion de copy para el address en el modal cashier
	$('#user_address_copy').click(function() {
		var dummy = document.createElement("input");
	    document.body.appendChild(dummy);
	    dummy.value = $('#user_address_cashier').text();
	    dummy.select();
	    document.execCommand("copy");
	    document.body.removeChild(dummy);
	    showAlert('address copied on your clipboard','yellow');
	})


	/************************************************************/
	/* cashier/withdrawals **************************************/

	//Update balance left when amount input change
	$('#withdrawals-amount').keyup(function cashier_withdrawals_amount_input() {
		var balance = Cookies('user_balance');
		var amount = $('#withdrawals-amount').val();
		$('#withdrawals-balance-left').val(balance - amount);
	});

	//Send bits to address
	function cashier_send() {
		//buscamos las variables de cookies
		var username = Cookies('user_username');
		var password = Cookies('user_password');
		var address = $('#withdrawals-amount').val();

		//envamos las variables para node
		socket.emit('cashier-send', { username: username, password: password, address: address }, function(feedback) {
			showAlert(feedback.advice, 'yellow');
			console.log(feedback.advice);
		});
	}


	/************************************************************/
	/* cashier/wire *********************************************/

	// Send funds between users, must be used like @username
	function cashier_wire() {

		var username = Cookies('user_username');
		var password = Cookies('user_password');
		var user_b = $('#send_funds_username').val();
		var value = $('#send_funds_amount').val();
		//se podría incluír un message
		var message = null;

		socket.emit('cashier-wire', { username: username, password: password, user_b: user_b, value: value, message: message}, function(feedback) {
			console.log(feedback);
		});
	}

	/************************************************************/
	/* leaderboard/view *****************************************/

	//get the first 50 users
	function leaderboard_view(online, size) {

		socket.emit('leaderboard-view', {online: online, size: size}, function(feedback) {

			if(feedback.leaderboard != null) {

				var row = '';
				for (var i = 0; i < feedback.leaderboard.length; ++i) {
					if (feedback.leaderboard[i]['username'] == 'healco') { continue; }
					else {
						row += '<tr>';
						row += '<td># ' + i + '</td>';
						if (feedback.leaderboard[i]['condicion'] == 'online') {
							row += '<td><a class="view_usermame"><i class="fas fa-circle x-color-green"></i> <span>' + feedback.leaderboard[i]['username'] + '</span></a></td>';
						}
						else {
							row += '<td><a class="view_usermame"><i class="fas fa-circle"></i> <span>' + feedback.leaderboard[i]['username'] + '</span></a></td>';
						};
						row += '<td>' + feedback.leaderboard[i]['won'] + '</td>';
						row += '<td>' + feedback.leaderboard[i]['lose'] + '</td>';
						// row += '<td>' + feedback.leaderboard[i]['spawn'] + '</td>';
						row += '<td>' + feedback.leaderboard[i]['spawns'] + '</td>';

						if (feedback.leaderboard[i]['difference'] < 0) {
							row += '<td><i class="fas fa-arrow-down x-color-one"></i> ' + (feedback.leaderboard[i]['difference'] * -1) + '</td>';
						}
						else {
							row += '<td><i class="fas fa-arrow-up x-color-green"></i> ' + feedback.leaderboard[i]['difference'] + '</td>';
						}
						row += '</tr>';
					}
				}
				//enviamos la información hacia ambos leaderboards
				$('.leaderboard-content').html(row);

				var row3 = '';
				for (var i = 0; i < feedback.leaderboard.length; ++i) {
					if (feedback.leaderboard[i]['username'] == 'healco') {
						continue;
					}
					else {
						row3 += '<tr>';
						row3 += '<td># ' + i + '</td>';
						if (feedback.leaderboard[i]['condicion'] == 'online') {
							row3 += '<td><a class="view_usermame"><i class="fas fa-circle x-color-green"></i> <span>' + feedback.leaderboard[i]['username'] + '</span></a></td>';
						}
						else if (feedback.leaderboard[i]['condicion'] == 'limbo') {
							row3 += '<td><a class="view_usermame"><i class="fas fa-circle"></i> <span>' + feedback.leaderboard[i]['username'] + '</span></a></td>';
						}
						else {
							row3 += '<td><a class="view_usermame"><i class="fas fa-circle"></i> <span>' + feedback.leaderboard[i]['username'] + '</span></a></td>';
						};
						row3 += '<td>' + feedback.leaderboard[i]['won'] + '</td>';
						row3 += '<td>' + feedback.leaderboard[i]['lose'] + '</td>';
						row3 += '<td>' + feedback.leaderboard[i]['spawns'] + '</td>';
						row3 += '<td>' + feedback.leaderboard[i]['difference'] + '</td>';
						row3 += '</tr>';
					}
				}
				$('#table-online-players').html(row3);
			}
		});
	}


	/******************************************************/
	/* Spawn function f-respawn ***************************/

	function respawn() {
		//search on cookies
		var username = Cookies('user_username');
		var password = Cookies('user_password');

		socket.emit('user-spawn', { name: username, pass: password}, function(feedback) {
			//check user invalid
			if(feedback.advice == 'Invalid username or password.') {
				showAlert(feedback.advice, 'red');
			}
			//if user already online
			if(feedback.advice == 'You are online already.') {
				showAlert(feedback.advice, 'yellow');
			}
			//if uswer low funds
			if(feedback.advice == 'Low funds.') {
					menu_manager('low-funds');
				}
			//everything ok
			if(feedback.advice == 'Welcome.') {

				$('#canvas-container').css({'display': 'block'});
				$('body').addClass('playing');
				$('.btn-respawn').css({'display': 'none'});
				$('.powerups-info .title span').text('3');

				menu_switch();
				player_hub();

				//start game
				$(location).attr('href','#play');
				game.animate();
				//sounds
				sound_menu_ambient.pause();
				manage_music_playing();
				$('#canvas').focus();

				//respawn sounds
				rand = sounds_spawn.rand(); sounds[rand].play();
			}
		});
	};


	/******************************************************/
	/* Ingame respawn f-ingame-respawn ********************/

	function ingame_respawn() {

		player_id = game['self']['id'];

		socket.emit('ingame-respawn', {player_id : player_id}, function(feedback) {

			if(feedback == 'respawn_ok') {
				KilledSequence(null, 'respawn');
				manage_music_playing();
				$('#canvas').css({ 'filter': 'inherit'});
				$('#canvas').focus();

				rand = sounds_spawn.rand(); sounds[rand].play();
				$('.powerups-info .title span').text('5');
			}
			//prevention fail respawn
			if(feedback == 'respawn_fail') { alert(feedback); }
		});
	}


	/******************************************************/
	/* Respawn with a drone f-drone ***********************/

	function drone_respawn() {
		showAlert('Low founds for a tank! Have a drone.', 'red');
		menu_switch()
		$('#canvas-container').css({'display': 'block'});
		$('#home').css({'display': 'none'});
		$('.player-hub').css({'display': 'none'});
		$('body').addClass('playing');

		$('#canvas').focus();
		// start game
		game.animate();
		sound_menu_ambient.pause();
		manage_music_playing();
	}
	$('.drone-respawn').click(drone_respawn);


	/************************************************************/
	/* Playing big notifications ********************************/

	function show_upper_message(info) {
		$('#action-container span').html(info);

		TweenMax.set("#action-container", {opacity: 0, className: '+=active', left: '0%', top: '2vw', scale: 3, textShadow:"0px 0px 0px rgba(0,0,0,0.3)", });
		TweenMax.staggerTo("#action-container", 1, {scale: 1, opacity: 1, textShadow:"0px 0px 0px rgba(0,0,0,0.3)", ease: Elastic.easeOut.config(1, 0.75), force3D: true });
		TweenMax.staggerTo("#action-container", 0.6, {textShadow:"5px 5px 10px rgba(0,0,0,0.3)", delay: 0.4 });
		TweenMax.staggerTo("#action-container", 1, {scale: 0, opacity: 0, textShadow:"0px 0px 0px rgba(0,0,0,0.3)", delay: 0.9, ease: Elastic.easeIn.config(1, 0.75), force3D: true });
		TweenMax.staggerTo("#action-container", 0.5, {className: '-=active', delay: 2.6 });
		// $('#action-container').removeClass(rage);
	}


	/************************************************************/
	/* advices **************************************************/

	var spawn_random_advice = [
	"Conflicts between 5 or more tanks can be risky, but nice profits can be done if you are well armed. it’s recommended to avoid them otherwise.",
	"There's several hotkeys in the game: you can use (1) for quite a good shield, (2) for rapid ammo and (3) when you really need to end it. Purchase powerups on demand!",
	"Remember that you can quickly purchase a shield using the key (1) to protect yourself during a battle. Specially useful if you wanna scape alive.",
	"Thanks to the speed and efficiency provided by bitcoin switness and Green Addresses, the whole action is recorded for ever on the blockchain, as it happens.",
	"Invite someone a drink! You can easily and quickly transfer funds to another player of your team from the cashier section. They might help you back later.",
	"Bit of war has multiple servers and rooms, you can see all of them from the rooms section. Find one near you for a better game experience!"
	];

	//selección al azar
	var spawn_random_advice = spawn_random_advice[Math.floor(Math.random() * spawn_random_advice.length)];

	//remplazamos
	$('#spawn_random_advice').text(spawn_random_advice);


	/************************************************************/
	/* feedback function ****************************************/

	function send_feedback() {

		var params =  {
			username: Cookies('user_username'),
			password: Cookies('user_password'),
			user_feedback: $('#user_feedback').val()
		};

		socket.emit('feedback', params, function(feedback) {
			//devolvemos la información
			showAlert(feedback.advice, 'yellow');
		});
	}


	/************************************************************/
	/* recepción de información desde el server *****************/

	socket.on('simon-says', function(pack) {
		//el usuario fue dañado
		if (pack.user_damaged == '1') {
			rand = sounds_harm.rand();
			sounds[rand].play();
			//deberíamos remplazarlo por redish

			TweenMax.set(".canvas-overlay", {
				opacity: 0,
				className:"+=damaged"
			});
			TweenMax.staggerTo(".canvas-overlay", 1, {
				opacity: 1,
				delay: 0.2,
				ease: Elastic.easeOut.config(1, 0.75),
				force3D: true
			});
			TweenMax.staggerTo(".canvas-overlay", 0.6, {
				opacity: 0,
				delay: 0.4,
				className:"-=damaged"
			});
			// console.log(pack);
		}
		if (pack.user_dies == '1') { rand = sounds_dies.rand(); sounds[rand].play(); }
		if (pack.user_cardio == '1') {
			// console.log('Cardio: 1');
			//cardio
			sounds['./audio/cardio.mp3'].pause();
			sounds['./audio/cardio.mp3'].playbackRate = 1;
			sounds['./audio/cardio.mp3'].loop = true;
			sounds['./audio/cardio.mp3'].play();
			//buzz
			sounds['./audio/buzz.mp3'].pause();
			sounds['./audio/buzz.mp3'].volume = 0.3;
			sounds['./audio/buzz.mp3'].loop = true;
			sounds['./audio/buzz.mp3'].play();
		}
		if (pack.user_cardio == '2') {
			// console.log('Cardio: 2');
			//cardio
			sounds['./audio/cardio.mp3'].pause();
			sounds['./audio/cardio.mp3'].playbackRate = 1.2;
			sounds['./audio/cardio.mp3'].loop = true;
			sounds['./audio/cardio.mp3'].play();
			//buzz
			sounds['./audio/buzz.mp3'].pause();
			sounds['./audio/buzz.mp3'].volume = 0.6;
			sounds['./audio/buzz.mp3'].loop = true;
			sounds['./audio/buzz.mp3'].play();
		}
		if (pack.user_cardio == '3') {
			// console.log('Cardio: 3');
			//cardio
			sounds['./audio/cardio.mp3'].pause();
			sounds['./audio/cardio.mp3'].playbackRate = 1.6;
			sounds['./audio/cardio.mp3'].loop = true;
			sounds['./audio/cardio.mp3'].play();
			//buzz
			sounds['./audio/buzz.mp3'].pause();
			sounds['./audio/buzz.mp3'].volume = 0.9;
			sounds['./audio/buzz.mp3'].loop = true;
			sounds['./audio/buzz.mp3'].play();
		}
		if (pack.user_cardio == '0') {
			// console.log('Cardio: 0');
			//fadeoff a los sonidos de cardio;
			sounds['./audio/cardio.mp3'].pause();
			sounds['./audio/buzz.mp3'].pause();
		}
		if (pack.user_dead == '1') {
			sounds['./audio/cardio.mp3'].pause();
			sounds['./audio/buzz.mp3'].pause();
			sound_bg.pause();
			rand = sounds_eliminacion.rand(); sounds[rand].play();
		}
	});


	/************************************************************/
	/* Developer table info f-developer_info ********************/

	function developer_info() {

		if ($('#developer-switch').hasClass('fa-check-square') || $('.btn-dev-on-off').hasClass('x-color-one')) {

			

			var developer_self = '';
			$.each( game['self'], function( key, value ) {
				developer_self += '<tr>';
				developer_self += '<td>' + key + '</td>';
				developer_self += '<td>' + value + '</td>';
				developer_self += '</tr>';
			});

			$('#developer_self').html(developer_self);

			// populamos
			var developer_powerups = '';
			$.each( game['self']['powerups'], function( key, value ) {
				var expiracion = value.expirationTime
				var ahora = Date.now();
				var diferencia = expiracion - ahora;
				developer_powerups += '<tr><td><strong>powerups</strong></td><td></td></tr>';
				developer_powerups += '<tr>';
				developer_powerups += '<td>value.name</td>';
				developer_powerups += '<td>' + value.name + '</td>';
				developer_powerups += '</tr>';
				developer_powerups += '<tr>';
				developer_powerups += '<td>value.data</td>';
				developer_powerups += '<td>' + value.data + '</td>';
				developer_powerups += '</tr>';
				developer_powerups += '<tr>';
				developer_powerups += '<td>value.expirationTime</td>';
				developer_powerups += '<td>' + expiracion  + '</td>';
				developer_powerups += '</tr>';
				developer_powerups += '<tr>';
				developer_powerups += '<td>Calculo de diferencia</td>';
				developer_powerups += '<td>' + diferencia + '</td>';
				developer_powerups += '</tr>';
			});

			$('#developer_powerups').html(developer_powerups);
		};
	};


	/************************************************************/
	/* playing footer info **************************************/

	// it's fullscreen enable?
	if( window.innerHeight == screen.height) {
	    $('.btn-fullscreen').html('<i class="far fa-compress"></i>');
	}
	else if ( window.innerHeight < screen.height ) {
		$('.btn-fullscreen').html('<i class="far fa-expand-wide"></i>');
	}
	// fullscreen btn
	$('.btn-fullscreen').click(function() {
		if ( window.innerHeight == screen.height ) {
			document.fullScreenElement && null == document.fullScreenElement || !document.mozFullScreen && !document.webkitIsFullScreen ? document.documentElement.requestFullScreen ? document.documentElement.requestFullScreen() : document.documentElement.mozRequestFullScreen ? document.documentElement.mozRequestFullScreen() : document.documentElement.webkitRequestFullScreen && document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT) : document.cancelFullScreen ? document.cancelFullScreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitCancelFullScreen && document.webkitCancelFullScreen();
			$(this).html('<i class="far fa-expand-wide"></i>');

		}
		else if ( window.innerHeight < screen.height ) {
			document.fullScreenElement && null !== document.fullScreenElement || !document.mozFullScreen && !document.webkitIsFullScreen ? document.documentElement.requestFullScreen ? document.documentElement.requestFullScreen() : document.documentElement.mozRequestFullScreen ? document.documentElement.mozRequestFullScreen() : document.documentElement.webkitRequestFullScreen && document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT) : document.cancelFullScreen ? document.cancelFullScreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitCancelFullScreen && document.webkitCancelFullScreen();
			$(this).html('<i class="far fa-compress"></i>');
		}
	});


	/************************************************************/
	/* Playing footer function **********************************/

		function playing_footer() {

			//esperamos la presencia de game
			if (game['self']) {
				//clonamos gameself para referenciarlo más rápido
				var playing_info = game['self'];

				//solo cambiar la información si no hay información, o si la información es nueva.
				if ($('.user-name').text == null || $('.user-name').text != playing_info.name) { $('.user-name').text(playing_info.name); }
				//var kills = $('.user-kills').text;
				//console.log(kills.text);
				//if ($('.user-name').text != playing_info.name ) { $('.user-name').text(playing_info.name); }
				//if (kills.text !== playing_info.kills ) { console.log('vamos'); kills.text(playing_info.kills); }
				//if ($('.user-deaths').text != playing_info.deaths ) { $('.user-deaths').text(playing_info.deaths); }
				//if ($('.user-spawns').text != playing_info.spawns ) { $('.user-spawns').text(playing_info.spawns); }
				//if ($('.user-bits').text != playing_info.balance ) { $('.user-bits').text(playing_info.balance); }
				// $('.user-name').text(playing_info.name);
				// $('.user-kills').text(playing_info.kills);
				// $('.user-deaths').text(playing_info.deaths);
				// $('.user-spawns').text(playing_info.spawns);
				// $('.user-bits').text(playing_info.balance);
			}
		}

		// powerups btn tooltip
		$('.powerups-info .title').on( "mousemove", function( event ) {
			$('.powerups-info .title label').fadeIn(80);
		});

		$('.powerups-info .title').on( "mouseleave", function( event ) {
			$('.powerups-info .title label').fadeOut(80);
		});

		function show_powerups() {
			$('.powerups-container').toggleClass('active');
		}
		$('.powerups-info .title').click(function() {
			show_powerups();
			$('#canvas').focus();
		});


	/************************************************************/
	/* settings funciones f-settings ****************************/

	function manage_developer_info() {
		//grab from cookies
		if (Cookies('developer_info') == 'on') {
			$('#developer-switch').removeClass('fal fa-square');
			$('#developer-switch').addClass('fal fa-check-square');
			$('#developer-mode').css({display: 'block'});
		}
		else if (Cookies('developer_info') == 'off'){
			$('#developer-switch').removeClass('fal fa-check-square');
			$('#developer-switch').addClass('fal fa-square');
			$('#developer-mode').css({display: 'none'});
		}
	};
	// switch action
	$('#developer-switch').click(function() {

		if (Cookies('developer_info') == 'off') {
			Cookies.set('developer_info', 'on');
			manage_developer_info();
		}
		else if (Cookies('developer_info') == 'on') {
			Cookies.set('developer_info', 'off');
			manage_developer_info();
		}
	});


	function manage_rain() {
		//grab from cookies
		if (Cookies('playing_rain') == 'on') {
			$('#rain-switch').removeClass('fal fa-square');
			$('#rain-switch').addClass('fal fa-check-square');
			$('#canvas_02').css({display: 'block'});
		}
		else if (Cookies('playing_rain') == 'off'){
			$('#rain-switch').removeClass('fal fa-check-square');
			$('#rain-switch').addClass('fal fa-square');
			$('#canvas_02').css({display: 'none'});
		}
	};
	// switch action
	$('#rain-switch').click(function() {
		if (Cookies('playing_rain') == 'off') {
			Cookies.set('playing_rain', 'on');
			manage_rain();
		}
		else if (Cookies('playing_rain') == 'on') {
			Cookies.set('playing_rain', 'off');
			manage_rain();
		}
	});


	function manage_music_playing() {
			//grab from cookies
		if (Cookies('music_playing') == 'on') {
			$('.music-settings-switch').removeClass('fal fa-square');
			$('.music-settings-switch').addClass('fal fa-check-square');
			if ($('body').hasClass('playing')) {
				sound_bg.play();
			}
			sound_bg.volume = 0.2;
			$('.btn-music').html('<i class="fas fa-volume-up"></i>');
		}
		else if (Cookies('music_playing') == 'off'){
			$('.music-settings-switch').removeClass('fal fa-check-square');
			$('.music-settings-switch').addClass('fal fa-square');
			sound_bg.pause();
			sound_bg.volume = 0;
			$('.btn-music').html('<i class="fas fa-volume-off"></i>');
		}
	};
	// switch action
	$('.music-settings-switch, .btn-music').click(function() {
		if (Cookies('music_playing') == 'off') {
			Cookies.set('music_playing', 'on');
			manage_music_playing();
		}
		else if (Cookies('music_playing') == 'on') {
			Cookies.set('music_playing', 'off');
			manage_music_playing();
		}
	});


	function manage_music_menu() {
			//grab from cookies
		if (Cookies('music_menu') == 'on') {
			$('.menu-music-settings-switch').removeClass('fal fa-square');
			$('.menu-music-settings-switch').addClass('fal fa-check-square');

			sound_menu_ambient.volume = 0.5;
			if ($('body').hasClass('playing')) {
				sound_menu_ambient.pause();
			}
			else {
				sound_menu_ambient.play();
			}
		}
		else if (Cookies('music_menu') == 'off'){
			$('.menu-music-settings-switch').removeClass('fal fa-check-square');
			$('.menu-music-settings-switch').addClass('fal fa-square');
			sound_menu_ambient.pause();
		}
	};

		// switch action
	$('.menu-music-settings-switch').click(function() {
		if (Cookies('music_menu') == 'off') {
			Cookies.set('music_menu', 'on');
			manage_music_menu();

		}
		else if (Cookies('music_menu') == 'on') {
			Cookies.set('music_menu', 'off');
			manage_music_menu();
		}
	});


	/************************************************************/
	/* Pedir conversaciones previas *****************************/

	function dialog_view() {
		//envamos las variables para node
		socket.emit('dialogo-view', function(feedback) {
			//si hay operaciones nuevas, informamos.
			var conversaciones = feedback.dialogo
			var username = Cookies('user_username');
			// console.log(conversaciones);

			var i = 0;
			while ( i < conversaciones.length) {
				var time = conversaciones[i].creacion.split(" ");
				var time2 = time[1].split(":");

				if (conversaciones[i].username == username) {
					variable  = "<li class='dialog'><i class='fas fa-comment x-color-one'></i>";
				}
				else {
					variable  = "<li class='dialog'><i class='fas fa-comment'></i>";
				}
				// variable  = "<li class='dialog x-fadeIn'><i class='fas fa-comment'></i>";
				variable += '<span class="chat-time">' + (time2[0] + ':' + time2[1] + '</span>');
				variable += ' <span class="chat-name">' + conversaciones[i].username + ': </span>';
				variable += conversaciones[i].message;
				variable += "</li>";
				$(variable).appendTo('.small-chat-container .chat-display');
				++i;
			}
			$('.small-chat-container .chat-display').scrollTop(99999);
			var chatSize = $('.menu-right').height() - ( $('.avatar-container').height() + $('.chat-input').height() + 92);
			$('.chat-display').height(chatSize);
		});
	};


	/************************************************************/
	/* Nos encargamos del Player Hub ****************************/

	var rage_informed = 0
	function player_hub() {

		// hide player hub when mouse hover
		var bottomX = 410;
		var bottomY = window.innerHeight - 220;

		$('#canvas').on( "mousemove", function( event ) {
			if (event.pageX < bottomX && event.pageY > bottomY) {
				$('.player-hub').css({'opacity': 0});
			}
			else {
				$('.player-hub').css({'opacity': 1});
			}
		});

		// if game 
		if (game['self']) {
			var hub_usuario = game['self'];
			$('#health-bar').empty();
			$('#shield-bar').empty();

			var emptyHealth = 20 - hub_usuario.health;
			//salud
			for (var i = 0; i < hub_usuario.health; ++i) {
				$('#health-bar').append('<li></li>');
			}

			// manejamos el ambiente segun la vida
			a = (7 / hub_usuario.health) * 100;
			b = a - 100;
			c = (7 - hub_usuario.health + 100);
			$('#canvas').css({ 'filter': 'grayscale(' + b + '%) contrast(' + c + '%)','-webkit-filter': 'grayscale(' + b + '%) contrast(' + c + '%)'});

			//av en llamas
			if (hub_usuario.health <= 5 ) {
				$('#av_fire').css({opacity: '1'})
				$('#av_plain').css({opacity: '0'})
			}
			else {
				$('#av_plain').css({opacity: '1'})
				$('#av_fire').css({opacity: '0'})
			}
			//hacer sonido de explosion
			if (hub_usuario.health <= 0 ) {
				//hacer sonido de explosion
			}
			//salud perdida
			for (var i = 0; i < emptyHealth; ++i) {
				$('#health-bar').append('<li class="empty"></li>');
			}
			//shield
			if (hub_usuario.shieldsize > 0) {
				for (var i = 0; i < hub_usuario.shieldsize; ++i) {
					$('#shield-bar').append('<li></li>');
				}
			}
		}

	}


	/************************************************************/
	/* Anuncios *************************************************/

	function showAlert(info, color) {
		$('#alert-container').text(info);
		if (color == 'red') {
			$('#alert-container').removeClass('alert-yellow');
			$('#alert-container').addClass('active alert-red');
		}
		if (color == 'yellow') {
			$('#alert-container').removeClass('alert-red');
			$('#alert-container').addClass('active alert-yellow');
		}

		setTimeout(function(){
			$('#alert-container').removeClass('active');
		},5000);
	}


	/************************************************************/
	/* Someone killed *******************************************/

	socket.on('dialogo-servidor-usuarios', bind(this, function(info) {
		var user_killer = info['user_killer'];
		var user_killed = info['user_killed'];
		var user_self = Cookies('user_username');
		//si es el asesino
		// if (user_killer == user_self) {
		// 	KilledSequence(('You have killed <span class="text-green">' + user_killed + '. Well done!</span>'), 'kill');
		// }
		//si fue el que perdió
		if (user_killed == user_self) {
			KilledSequence(('You were eliminated by <span class="text-red">' + user_killer + '. Such a shame.</span>'), 'die');
		}
	}));


	/************************************************************/
	/* KilledSequence *******************************************/

	function KilledSequence(info, action) {

		var aarray = ["#action-container", "img.dead", "button.dead", "#action-container .fas"]

		if (action == 'kill') {
			$('#action-container span').html(info);
			TweenMax.set("#action-container", {opacity: 0, className: '+=active', top: '2vw', scale: 1, textShadow: "0px 0px 0px rgba(0,0,0,0)"});
			TweenMax.set("#action-container", {className: '-=rage', });
			TweenMax.staggerTo("#action-container", 1, {scale: 1.7, opacity: 1, delay: 0.2, ease: Elastic.easeOut.config(1, 0.75), force3D: true });
			TweenMax.staggerTo("#action-container", 0.6, {textShadow: "5px 5px 10px rgba(0,0,0,0.5)", ease: Elastic.easeOut.config(1, 0.75), delay: 0.4 });
			TweenMax.staggerTo("#action-container", 1, {scale: 0, opacity: 0, textShadow: "0px 0px 0px rgba(0,0,0,0)", delay: 0.7, ease: Elastic.easeIn.config(1, 0.75), force3D: true });
		}
		if (action == 'die') {
			$('#action-container span').html(info);
			TweenMax.set("#action-container", {opacity: 0, className: '+=active', top: '2vw', scale: 1, textShadow: "0px 0px 0px rgba(0,0,0,0)"});
			TweenMax.set("#action-container", {className: '-=rage', });
			TweenMax.set(".canvas-overlay", {opacity: 0, });
			TweenMax.set(aarray, {opacity: 0, top: '22vw', scale: 3, textShadow:"0px 0px 0px rgba(0,0,0,0.5)", });

			TweenMax.staggerTo(aarray, 1, {scale: 1, opacity: 1, top: '22vw', textShadow:"0px 0px 0px rgba(0,0,0,0.5)", delay: 0.2, ease: Elastic.easeOut.config(1, 0.75), force3D: true });
			TweenMax.staggerTo(".canvas-overlay", 0.2, {opacity: 1, delay: 0.1 });

			TweenMax.staggerTo(aarray, 2, {textShadow:"5px 5px 10px rgba(0,0,0,0.5)", delay: 0.4, onComplete: layer200('off') });
		}
		if (action == 'respawn') {
			TweenMax.set(".canvas-overlay", {opacity: 1 });
			TweenMax.set(aarray, {opacity: 1, });
			TweenMax.staggerTo(aarray, 1, {scale: 0, opacity: 0, delay: 0, ease: Elastic.easeIn.config(1, 0.75), force3D: true, onComplete: layer200('on') });
			TweenMax.staggerTo(".canvas-overlay", 1, {opacity: 0, ease: Elastic.easeIn.config(1, 0.75), delay: 0 });

			$('#canvas').focus();
		}
	}

	/************************************************************/
	/* Esconder UI **********************************************/

	function layer200(state) {
		if (state == 'off') {
			$('*').filter(function() { return $(this).css('z-index') == 200; }).each(function() {
				$(this).css({'opacity': '0'});
				$(this).css({'pointer-events': 'none'});
			});
		} else if (state == 'on') {
			$('*').filter(function() { return $(this).css('z-index') == 200; }).each(function() {
				$(this).css({'opacity': '1'});
				$(this).css({'pointer-events': 'inherit'});
			});
		}
	}


	/************************************************************/
	/* User elimination f-user_del ******************************/

	function user_del(param) {
		//buscamos las variables de cookies
		var username = $('#del_user_username').val();
		var password = $('#del_user_password').val();

		socket.emit('user-del', { username: username, password: password }, function(feedback) {
			//comunicamos al usuario
			showAlert(feedback.advice, 'yellow');
			//revisamos si lo elimino
			if (feedback.advice == 'Ciao') {
				session_close();
			}
		})
	}


	/************************************************************/
	/* Visualización de propio usuario **************************/

	function user_overview() {
		//loading
		// $('#user-overview').append($('<span>').addClass('fa fa-2x fa-spinner fa-pulse'));

		//buscamos las variables de cookies
		var username = Cookies('user_username');
		var password = Cookies('user_password');
		$('.username').text(username);

		socket.emit('user-overview', { username: username, password: password }, function(feedback) {

			// populamos email y password
			$('#user_overview_email').val(feedback.user.email);
			$('#user_overview_password').val(feedback.user.password);

			// //habilitamos para editar email
			// $('#user_overview_email_edit').click(function() {
			// 	$('#user_overview_email').removeAttr('disabled');
			// 	$('#user_overview_email').focus();
			// 	$('#user_overview_email').val('');
			// });

			// //habilitamos para editar passowrd
			// $('#user_overview_password_edit').click(function() {
			// 	$('#user_overview_password').removeAttr('disabled');
			// 	$('#user_overview_password').focus();
			// 	$('#user_overview_password').val('');
			// });

			// populamos el nombre en el parrafo
			$('#username_text').text(feedback.user.username + '!');

			if (feedback.user.condicion == 'online') {
				$('.avatar-container .stats .fa-circle').addClass('x-color-green');
				// $('.user-status').addClass('x-color-green');
			}
			else {
				$('.avatar-container .stats .fa-circle').removeClass('x-color-green');
				// $('.user-status').removeClass('x-color-green');
			}
			$('.user-status').text(feedback.user.condicion);
			// console.log(feedback.user);

			var row = '';
			row += '<tr>';
			row += '<td><b>Enemies killed</b></td>';
			row += '<td>' + feedback.user.won + '</td>';
			row += '</tr><tr>';
			row += '<td><b>Deaths</b></td>';
			row += '<td>' + feedback.user.lose + '</td>';
			row += '</tr><tr>';
			row += '<td><b>Profits</b></td>';
			row += '<td>' + feedback.user.difference + '</td>';
			row += '</tr><tr>';
			row += '<td><b>Available Balance</b></td>';
			row += '<td>' + feedback.user.available_balance + '</td>';
			row += '</tr><tr>';
			row += '<td><b>Pending received balance</b></td>';
			row += '<td>' + feedback.user.pending_received_balance + '</td>';
			row += '</tr><tr>';
			row += '<td><b>Spawns</b></td>';
			row += '<td>' + feedback.user.spawns + '</td>';
			row += '</tr><tr>';
			row += '<td><b>Condition</b></td>';
			row += '<td>' + feedback.user.condicion + '</td>';
			row += '</tr><tr>';
			row += '<td><b>Personal address:</b></td>';
			row += '<td>' + feedback.user.address + '</td>';
			row += '</tr><tr>';
			row += '<td><b>User since:</b></td>';
			row += '<td>' + feedback.user.creacion + '</td>';
			row += '</tr>';

			//enviamos la información hacia la tabla user overview
			$('#user_statistics').html(row);
			// $('#user-overview .fa-spinner').remove();
		})
	}


	/************************************************************/
	/* Visualización del balance del propio usuario *************/

	//en que posiciones corremos la funcion user_balance_view?
	function user_balance_view() {

		//buscamos las variables de cookies
		var username = Cookies('user_username');
		var password = Cookies('user_password');

		//emisión de información
		socket.emit('user-balance-view', { username: username, password: password }, function(feedback) {

			// console.log(feedback);
			if ($('.user-name').text != feedback.user.username ) { $('.user-name').text(feedback.user.username); }
			if ($('.user-kills').text != feedback.user.won ) { $('.user-kills').text(feedback.user.won); }
			if ($('.user-deaths').text != feedback.user.eliminado ) { $('.user-deaths').text(feedback.user.lose); }
			if ($('.user-spawns').text != feedback.user.spawns ) { $('.user-spawns').text(feedback.user.spawns); }
			if ($('.user-bits').text != feedback.user.available_balance ) { $('.user-bits').text(feedback.user.available_balance); }
			if ($('.user-profit').text != feedback.user.difference ) { $('.user-profit').text(feedback.user.difference); }
			console.log(feedback);
		//populamos la tabla
		if (feedback.xfers) {
			var row = '';
			for (var i = 0; i < feedback.xfers.length; ++i) {
					//asosiamos variable
					var row_reason = feedback.xfers[i]['reason'];
					var row_difference = feedback.xfers[i]['difference']
					//comparamos variable
					if(row_reason == 'user_spawn') { row_reason = 'spawn fee'; }
					if(row_reason == 'kill') {
						if(row_difference < 0) { row_reason = 'defeated'; }
						else { row_reason = 'victorious'; }
					}
					//armamos el cuadro
					row += '<tr>';
					if (feedback.xfers[i]['condicion'] == 'confirmado') {
						row += '<td><i class="fas fa-check"></i></td>';
					}
					else if (feedback.xfers[i]['condicion'] == 'esperando') {
						row += '<td><i class="fas fa-check x-color-yellow"></i></td>';
					}
					else {
						row += '<td></td>';
					}
					row += '<td>' + row_reason + '</td>';

					if (feedback.xfers[i]['difference'] < 0) {
						row += '<td><i class="fas fa-arrow-down x-color-one"></i>' + (feedback.xfers[i]['difference'] * -1) + '</td>';
					}
					else {
						row += '<td><i class="fas fa-arrow-up x-color-green"></i>' + feedback.xfers[i]['difference'] + '</td>';
					}

					row += '<td>' + feedback.xfers[i]['difference_sum'] + '</td>';


					//remplazamos en busqueda del simbolo '-'
					// var difference_sum = feedback.xfers[i]['difference_sum'];
					// var raw_difference_sum = difference_sum.replace("-", "");

					row += '<td>falta api</td>';

					// if (feedback.xfers[i]['difference_sum'] < 0) {
					// 	row += '<td><i class="far fa-minus x-color-one"></i> ' + raw_difference_sum + '</td>';
					// }
					// else {
					// 	row += '<td><i class="far fa-plus x-color-green"></i> ' + raw_difference_sum + '</td>';
					// }

					// row += '<td>' + feedback.xfers[i]['creacion'] + '</td>';
					row += '</tr>';
				}
				// console.log(row);
				var aaa = [];
				var bbb = [];
				var ccc = [];
				lineacolor = '#89D926';

				for (var i = 0; i < feedback.xfers.length; ++i) {
					//realiazamos la inversion
					inversion = feedback.xfers[i]["difference_sum"] * 1;
					//calculamos el color de la posición
					if (feedback.xfers[i]['difference'] < 0) { color = '#FF3939'; bandera = 'loss' } else { color = '#89D926'; bandera = 'gain'; }
					//calculamos el proximo
					proximo = i + 1;
					//calculamos el color de la linea hacia la próxima posición.
					if (feedback.xfers[proximo] != null) {
						if (feedback.xfers[proximo]['difference'] < 0) { lineacolor = '#FF3939' } else { lineacolor = '#89D926' }
					}
					aaa.push( { y: inversion, flag: bandera, color: color, segmentColor: lineacolor });
					var date = feedback.xfers[i]['creacion'].split(" ");
					bbb.push(date[0]);
					ccc.push(feedback.xfers[i]['reason']);
					//y = feedback.xfers[i]['difference_sum']
					//@beluchi
					//ob.y : feedback.xfers[i]['difference_sum'];
					//ob.flag : 'win',
					//ob.color : '#89D926',
					//ob.segmentColor: '#89D926'

				}

				//armamos las Lineas
				$('.drawlines').each(function(){
					var chart = new Highcharts.Chart({
						chart: {
							renderTo: this,
							borderWidth: null,
							borderColor: null,
							backgroundColor: null,
							dashStyle: null
						},
					title: {
						text: '',
						x: -20
					},
					xAxis: {
						categories: 0,
						gridLineColor: 'transparent',
					},
					yAxis: {
						title: '',
						gridLineColor: 'transparent',
						plotLines: [{value: 0, width: 1 }]
					},
					tooltip: {
						headerFormat: ccc
					},
					series: [{
						type: 'coloredline',
						showInLegend: false, 
						name: ' ',
						data: aaa
					}]
				});
				});
				//ocultamos el highchart credits
				$('.highcharts-credits').css({'display': 'none'});
				//enviamos la información hacia la tabla user balance

				$('.user_balance_table').html(row);
				// $('.user_balance_table .fa-spinner').remove();
			};
		});

	}


	/************************************************************/
	/* Devuelve la información de un usuario cualquiera ********/

	function user_view(userClicked) {
		//buscamos las variables de cookies
		var username = userClicked;
		socket.emit('user-view', { username: username}, function(feedback) {
			// populamos
			var row = '';
			row += '<tr>';
			row += '<td><b>Username</b></td>';
			row += '<td>' + feedback.user.username + '</td>';
			row += '</tr><tr>';
			row += '<td><b>Enemies killed</b></td>';
			row += '<td>' + feedback.user.won + '</td>';
			row += '</tr><tr>';
			row += '<td><b>Deaths</b></td>';
			row += '<td>' + feedback.user.lose + '</td>';
			row += '</tr><tr>';
			row += '<td><b>Profits</b></td>';
			row += '<td>' + feedback.user.difference + '</td>';
			row += '</tr>';;
			row += '<tr>';
			row += '<td><b>Condition</b></td>';
			row += '<td>' + feedback.user.condicion + '</td>';
			row += '</tr><tr>';
			row += '<td><b>Personal address:</b></td>';
			row += '<td>' + feedback.user.address + '</td>';
			row += '</tr><tr>';
			row += '<td><b>User since:</b></td>';
			row += '<td>' + feedback.user.creacion + '</td>';
			row += '</tr>';

			//enviamos la información hacia la tabla user overview
			$('#user_x_overview').html(row);

			//abrimos el modal
			$("#modal-x-user").modal("show");
		});
	}


	/************************************************************/
	/* Go home f-go_home ****************************************/

	function go_home() {
		//sounds off
		sounds['./audio/cardio.mp3'].pause();
		sounds['./audio/buzz.mp3'].pause();
		sound_bg.pause();

		//desenchufamos al usuario,
		var previa = socket.disconnect();
		previa.open();
		$('#canvas-container').css({'display': 'none'});
		$('body').removeClass('playing');
		$('.brand').css({'display': 'block'});
		KilledSequence(null, 'respawn');
		$('#canvas').css({ 'filter': 'grayscale(0%) contrast(100%)','-webkit-filter': 'grayscale(0%) contrast(100%)'});
		$('.btn-respawn').css({'display': 'inline-block'});
		menu_manager('online-players');
		manage_music_menu();
		user_status();
	}


	/************************************************************/
	/* custom tabs ***********************************************/

	$('[data-tab-link]').click(function() {
		var tab = $(this).attr('data-tab-link');
		var parents = $(this).closest('.kard').find('[data-tab]');
		var contentId = parents[tab].id;

		$('[data-tab-link]').removeClass('active');
		sound_menu_tabs.currentTime = 0;
		sound_menu_tabs.play();
		$(this).addClass('active');

		parents.removeClass('active');
		$('#'+ contentId).addClass('active');
	});


	/************************************************************/
	/* powerup counter and info! ********************************/

	function powerup_counter(order) {
		if (game['self']['orders_remaining'] > 0 ) {
			$('#' + order).animate({top: '-20px', transform: 'scale(1.1)', opacity: '0.8'}, 'fast');
			$('#' + order).animate({top: '0px', transform: 'scale(1)', opacity: '1'}, 'slow');
			// $('.powerups-info .title span').animate({top: '20px', 'font-size': '32px', opacity: '0.8', 'color': 'red'}, 'fast');
			$('.powerups-info .title span').text(game['self']['orders_remaining'] - 1 + ' ');
			// $('.powerups-info .title span').animate({top: '0px', 'font-size': '22px', opacity: '1', 'color': 'white'}, 'slow');
		}
		if (game['self']['orders_remaining'] < 3 ) {
			$('.powerups-info .title span').css({'color': 'red', 'font-size': '22px'});
		}
	}

	/************************************************************/
	/* Use powerups! f-order_power ******************************/

	function order_power(keydown) {
		keydown = keydown;

		socket.emit('comprar-power', {keydown}, function(feedback) {
			//not more powerups
			if(feedback.advice == 'no_orders_remaining') {
				showAlert('All upgrades used', 'red');
				$('.powerups-container').removeClass('active');
			}
			//if everything ok
			else {
				//random sounds
				if(keydown == '49') {
					rand = sounds_order_1.rand(); sounds[rand].play();
					show_upper_message('A good shield when is needed.');
					powerup_counter('order_power_1');
					$('.powerups-container').removeClass('active');
				}
				if(keydown == '50') {
					rand = sounds_order_4.rand(); sounds[rand].play();
					show_upper_message('You are 1.666 times lighter with Moonwalk!');
					powerup_counter	('order_power_4');
					$('.powerups-container').removeClass('active');
				}
				if(keydown == '51') {
					rand = sounds_order_5.rand(); sounds[rand].play();
					show_upper_message('The Slow company loves you.');
					powerup_counter	('order_power_5');
					$('.powerups-container').removeClass('active');
				}
			}
		});
	}


	/************************************************************/
	/* Compra de powerups con el mouse **************************/

	$('#order_power_1').click(function() {
		order_power('49');
		$('#canvas').focus();
	});
	$('#order_power_2').click(function() {
		order_power('50');
		$('#canvas').focus();
	});
	$('#order_power_3').click(function() {
		order_power('51');
		$('#canvas').focus();
	});


	/************************************************************/
	/* Quickboards **********************************************/

	//onkeydown
	$('#canvas').keydown(function(e) {

		switch(e.which) {
			//'1' buy shield
			case 49:
			order_power(e.which);
			break;
			//'2' buy speed
			case 50:
			order_power(e.which);
			break;
			//'3' buy slowco
			case 51:
			order_power(e.which);
			break;
			// show poweups
			case 16: show_powerups();
			break;
			//exit handler
			default: return;
		}
		e.preventDefault();
	});

	// menu key
	$('body').keydown(function(e) {
		switch(e.which) {
			// show menu
			case 17: menu_switch();
			break;
			//exit handler
			default: return;
		}
		e.preventDefault();
	});


	/************************************************************/
	/* canvas foreground: Rain **********************************/

	/*create rain*/
	var canvas = document.getElementById('canvas_02');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	var ctx = canvas.getContext('2d');
	var w = canvas.width;
	var h = canvas.height;
	ctx.strokeStyle = 'rgba(174,194,224,0.5)';
	ctx.lineWidth = 1;
	ctx.lineCap = 'round';

	//máximo de lluvia
	var init = [];
	var maxParts = 50;
	for (var a = 0; a < maxParts; a++) {
		init.push({
			x: Math.random() * w,
			y: Math.random() * h,
			l: Math.random() * 1,
			xs: -4 + Math.random() * 4 + 2,
			ys: Math.random() * 10 + 10
		})
	}

	var particles = [];
	for (var b = 0; b < maxParts; b++) { particles[b] = init[b]; }

	//creamos la lluvia
	function draw() {
		ctx.clearRect(0, 0, w, h);
		for (var c = 0; c < particles.length; c++) {
			var p = particles[c];
			ctx.beginPath();
			ctx.moveTo(p.x, p.y);
			ctx.lineTo(p.x + p.l * p.xs, p.y + p.l * p.ys);
			ctx.stroke();
		}
		move();
	}

	//movemos la lluvia
	function move() {
		for (var b = 0; b < particles.length; b++) {
			var p = particles[b];
			p.x += p.xs;
			p.y += p.ys;
			if (p.x > w || p.y > h) { p.x = Math.random() * w; p.y = -20; }
		}
	}
	setInterval(draw, 10);


	/************************************************************/
	/* Clocks loops *********************************************/

	//a slow loop
	setInterval(function() { if(Cookies('user_logued') == "True") { cashier_search(); } }, 1000);
	//a quick loop
	setInterval(function() { if(game['self']) { player_hub(); developer_info(); playing_footer(); } }, 100);


	/************************************************************/
	/* clicks ***************************************************/

	//click para cosas que aun el dom no posee
	$(document).on('change', '.user_balance', function() { alert( "Handler for .change() called." ); });
	$(document).on('click', '.view_usermame', function() { user_view($(this).html()); });

	// click actions
	$('.btn-disconnect').click(session_close);
	$('.btn-go-menu').click(go_home);
	$('#recover-password').click(recover_pass);

	$('#name-submit').click(user_login);
	$('#name-create').click(user_new);

	$('#withdrawals_send').click(cashier_send);
	$('#send_funds_send').click(cashier_wire);

	$('#user-mfa-enable').click(user_mfa_enable);

	$('#del-user').click(user_del);
	$('.btn-respawn').click(respawn);
	$('#ingame_respawn').click(ingame_respawn);
	$('#send-feedback').click(send_feedback);

	//puede quedar al final
	url_worker();
	user_status();
	dialog_view();
	manage_developer_info();
	manage_rain();
	manage_music_playing();
	manage_music_menu();

});
