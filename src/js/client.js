//comenzamos
$(document).ready(function() {

	 //redefinimos array para añadir un random, lo vamos a usar...
	 Array.prototype.rand = function () {
	 	return this[Math.floor((Math.random()*this.length))];
	 }

	 //conservar como variable principal y hacer que se pueda remplazar desde el menu
	 //es posible que requiera una función como 'serverswapper'
	 var server = 'wss://clouds.bitofwar.com';

	//definimos lo que hay que definir
	var socket = io(server);
	var game = Game.create(socket, document.getElementById('canvas'), document.getElementById('leaderboard'));
	var chat = Chat.create(socket, $('.chat-display'), document.getElementById('chat-input'));
	var userStatus = "offline";

	// console.log(socket);
	Input.applyEventHandlers(document.getElementById('canvas'));
	Input.addMouseTracker(document.getElementById('canvas'));

	/************************************************************/
	/* canvas foreground: lluvia ********************************/

	/*mandamos la lluvia acá nomás*/
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
	/* serverswapper *******************************************/


	/************************************************************/
	/* New user register ****************************************/

	function user_new() {
		//buscamos las variables que queremos del dom
		var email = $('#user-new-email').val();
		var username = $('#user-new-username').val();
		var password = $('#user-new-password').val();
		var nonce = (new Date()).getTime();
		//envamos las variables para node
		socket.emit('user-new', { email: email, username: username, password: password }, function(feedback) {
			//hacer cosas con la información? o no hacer nada...
			//si el usuario no es válido
			if(feedback.advice != 'Welcome.') {
				clear_modal_login()
				$('#alert-message-register').text(feedback.advice);
			}
			if(feedback.advice == 'Welcome.') {
				//enviamos la información al server
				socket.emit('user-login', { name: username, pass: password, nonce: nonce }, function(feedback) {
					//revision, acá ya poseemos la info del usuario en el browser
					//si el usuario no es válido
					if(feedback.advice == 'Invalid username or password.') {
						clear_modal_login()
						$('#alert-message-resume').text('User or password invalid');
					}
					//si el usuario es válido
					else {
						showAlert('Welcome ' + username, 'yellow');
						clear_modal_login();
						//armamos las cookies
						Cookies.set('user_id', feedback.user.id);
						Cookies.set('user_email', feedback.user.email);
						Cookies.set('user_username', feedback.user.username);
						Cookies.set('user_password', feedback.user.password);
						Cookies.set('user_balance', feedback.user.available_balance);
						//Cookies.set('user_balance_usd', feedback.user.balance_usd);
						Cookies.set('user_address', feedback.user.address);
						Cookies.set('user_online', 'True');
						//escondemos el modal
						// modals_manager('online-players');
						//marcamos al usuario online
						is_user_online();
					}
				})
			};
		})
	}

	/************************************************************/
	/* creacion de password *************************************/

	//función muy simple para crear un password digno
	function cookpassword() {
		var chars = "abcdefhklmnopqrsuvwxyz!ABCDEFGHJKMNOP23457890";
		var pass = "";
		for (var x = 0; x < 12; x++) { var i = Math.floor(Math.random() * chars.length); pass += chars.charAt(i); }
		$('#user-new-password').val(pass);
		return pass;
	}
	// corremos la funcional del password cuando se abre el modal
	$("#modal-new-user").on('shown.bs.modal', function ()  { cookpassword(); });


	/************************************************************/
	/* Acceso de usuario ****************************************/

	function user_login() {
		//revisamos
		//leemos la información del form.
		var name = $('#name-input').val();
		var pass = $('#pass-input').val();
		var mfa_code = $('#mfa-code-input').val();
		var nonce = (new Date()).getTime();
		$('#name-prompt-container').append($('<span>').addClass('fa fa-2x fa-spinner fa-pulse'));
		//enviamos la información al server
		socket.emit('user-login', { name: name, pass: pass, mfa_code: mfa_code, nonce: nonce }, function(feedback) {
			//revision, acá ya poseemos la info del usuario en el browser
			//si el usuario no es válido
			if(feedback.advice == 'Invalid username or password.') {
				clear_modal_login()
				$('#alert-message-resume').text('User or password invalid');
				//console.log(feedback.advice);
			}
			//en caso de que haya MFA y sea inválido
			else if(feedback.advice == 'Invalid MFA.') {
				clear_modal_login()
				$('#alert-message-resume').text('Invalid MFA.');
				// console.log(feedback.advice);
			}
			//si el usuario es válido
			else {
				clear_modal_login();
				//armamos las cookies
				Cookies.set('user_id', feedback.user.id);
				Cookies.set('user_email', feedback.user.email);
				Cookies.set('user_username', feedback.user.username);
				Cookies.set('user_password', feedback.user.password);
				Cookies.set('user_balance', feedback.user.available_balance);
				//Cookies.set('user_balance_usd', feedback.user.balance_usd);
				Cookies.set('user_address', feedback.user.address);
				Cookies.set('user_online', 'True');
				//marcamos al usuario online
				// modals_manager('online-players');
				$(location).attr('href', '#online-players');
				is_user_online();

			}
		})
		return false;
	};


	/************************************************************/
	/* Reordenar el modal ***************************************/

	function clear_modal_login() {
		$('#alert-message').empty();
		$('#resume-container :input').val('');
		$('#register-container :input').val('');
		$('#name-prompt-container .fa-spinner').remove();
	};
	// $('#close-login').click(clear_modal_login);
	//$('#name-form').submit(user_login);

	/******************************************************/
	/* Fill home screen************************************/
	// function home_layout() {

	// 	show_home();

	// }

	// function show_home() {

	// 	if ( (Cookies('user_online') == "True") && ($('#home').css('display') == 'block')) {
	// 		user_balance_view();
	// 		leaderboard_view();
	// 		$('*').modal('hide');
	// 		$('#modal-home-logged').modal('show');
	// 	}
	// 	else {
	// 		console.log('cccc');
	// 	}
	// }

	/******************************************************/
	/* Interface composer UI ******************************/
	// var chatHeight = $('.kard.chat').innerHeight();
	// $('.chat-display').height(chatHeight - 150);

	$(window).resize(function() {
		var chatSize = $('.menu-right').height() - ( $('.avatar-container').height() + $('.chat-input').height() + 92);
		$('.chat-display').height(chatSize);
	});

	/******************************************************/
	/* Kards manager **************************************/

	// track which section tab clicked
	$('.modal-manager').click(function() {
		var elementClicked = this.getAttribute('href').split('#')[1];
		modals_manager(elementClicked);
	});
	// funcion para levantar el menu
	function modals_switch() {
		if ( $('body').hasClass('playing')) {
			TweenMax.to('.menu-overlay', 0.5, {
				css: {opacity:"1", display:"block"},
				ease: Elastic.easeInOut.config(1, 0.75),
				force3D: true
			});


		} else {
			TweenMax.to('.menu-overlay', 0.5, {
				css: {opacity:"0", display:"none"},
				ease: Elastic.easeInOut.config(1, 0.75),
				force3D: true
			});
		}
		if ($('.menu').hasClass('menu-on')) {

			TweenMax.set('.menu', {
				opacity: 1,
				scale: 1,
				left: "0%"
			});
			TweenMax.to('.menu', 1, {
				opacity: 0,
				scale: 1,
				left: "-120%",
				ease: Elastic.easeIn.config(1, 0.75),
				force3D: true
			});
			TweenMax.to('.menu', 0.1, {
				delay: 0.5,
				className: '-=menu-on'
			});

			TweenMax.to('.menu-overlay', 0.5, {
				delay: 0.5,
				css: {opacity:"0", display:"none"},
				ease: Elastic.easeInOut.config(1, 0.75),
				force3D: true
			});
		}
		else {
			TweenMax.set('.menu', {
				opacity:1,
				scale: 1,
				className: '+=menu-on',
				left: "120%"
			});
			TweenMax.to('.menu', 1, {
				delay: 0.1,
				left: "0%",
				opacity: 1,
				scale: 1,
				ease: Elastic.easeOut.config(1, 0.75),
				force3D: true
			});
		}
	}

	// funcion para leer la url y levantar el menu que corresponde
	function url_worker() {

		// create array with all sections
		var sections = [];

		$('.menu-left ul li a').each(function() {
			var thisSection = $( this ).attr('href').split('#')[1];
			sections.push(thisSection);
		});

		// check url to manage menu
		var url = $(location).attr('href').split('#')[1];
		console.log(url);
		if (url && ($.inArray(url, sections) >= 0)) {
			$('*').removeClass('menu-active');
			modals_manager(url);
		}
		else if (typeof url === 'undefined') {
			$('*').removeClass('menu-active');
			modals_manager('online-players');
		}
		else {
			$('*').removeClass('menu-active');
			modals_manager('credits');
		};
	}

	// funcion que maneja la columna central del menu, recibe una variable 'modal' desde varios lados.
	function modals_manager(modal) {

		$('*').removeClass('menu-active');
		$('.modal-manager.' + modal).addClass('menu-active');
		$('.menu').addClass('menu-on');

		// detect if user is logged to preload the info
		if (Cookies('user_online') == "True") {
			user_balance_view();
			user_overview();
			if (modal == 'settings') {
				user_mfa_show();
			}
		}

		//pide usuarios offline, size: 50
		leaderboard_view(0, 50);

		// manage show and hide modals
		if ( $('.kard-' + modal).css('display') == 'none' ) {
			// take out the actual section
			TweenMax.staggerTo('.kard-modal.show',1.2, {
				opacity: 1,
				top: '100%',
				ease: Elastic.easeOut.config(1, 1),
				onComplete: outShow(),
			});
			TweenMax.staggerTo('.kard-modal.show', 0.1, {
				display: 'none',
				className: '-=show',
			});

			function outShow() {
				// $('.kard-modal.show').css({'display': 'none'});
				// $('*').removeClass('show');

				// take in the selected section
				TweenMax.set('#kard-' + modal  + '.kard-modal', {
					opacity: 0,
					top: '-100%',

				});
				TweenMax.staggerTo('#kard-' + modal  + '.kard-modal',1.2, {
					opacity: 1,
					top: '0%',
					display: 'block',
					ease: Elastic.easeOut.config(1, 1),
					className: '+=show',
				});
			};
		}

	}

	/******************************************************/
	/* Ingame respawn *************************************/

	function ingame_respawn() {

		player_id = game['self']['id'];
		// console.log(player_id);

		socket.emit('ingame-respawn', {player_id : player_id}, function(feedback) {
		//hacer cosas con la información? o no hacer nada... siempre dice done.
		// console.log(feedback);
		//leemos feedback para salir del asyn
		if(feedback == 'respawn_ok') {
			KilledSequence(null, 'respawn');
			$('.menu').removeClass('menu-on');
			sound_bg.play();
			$('#canvas').css({ 'filter': 'inherit'});
			$('#canvas').focus();
			//sonido respawn al azar
			rand = sounds_spawn.rand(); sounds[rand].play();
			//completamos el grafico de forma cabeza
			user_balance_view();
			$('.powerups-info .title span').text('5');
		}
		//prevención de doble respawn desde server.
		if(feedback == 'respawn_fail') { alert(feedback); }
	});

	}

	/******************************************************/
	/* Función de respawn *********************************/

	function respawn() {
		//buscamos las variables de cookies
		var username = Cookies('user_username');
		var password = Cookies('user_password');
		//revisamos
		//hacemos el respawn
		socket.emit('user-spawn', { name: username, pass: password}, function(feedback) {
			//revision, acá ya poseemos la info del usuario en el browser
			//revisamos si el usuario es inválido:
			if(feedback.advice == 'Invalid username or password.') {
				showAlert(feedback.advice, 'red');
				// console.log(feedback.advice);
				// alert(feedback.advice);
			}
			//revisamos si el usuario ya anda online:
			if(feedback.advice == 'You are online already.') {
				showAlert(feedback.advice, 'yellow');
				// console.log(feedback.advice);
				// alert(feedback.advice);
			}
			//revisamos si el usuario dispone de dinero
			if(feedback.advice == 'Low funds.') {
					//Have a drone.
					modals_manager('low-funds');
					console.log('test');
				}
			//si no hizo cosas raras
			if(feedback.advice == 'Welcome.') {
				//cerramos el modal y realizamos operaciones gráficas.
				// is_user_online();
				$('#canvas-container').css({'display': 'block'});
				$('.menu').removeClass('menu-on');
				$('.menu-overlay').attr('style','');
				// cargamos el hub
				player_hub();
				$(location).attr('href','#play');
				$('body').addClass('playing');
				//completamos el grafico de forma cabeza
				user_balance_view();
				$('.powerups-info .title span').text('5');
				//comienza el game
				game.animate();
				//lanzamos música de fondo
				sound_bg.play();
				$('#canvas').focus();
				//sonido respawn al azar
				rand = sounds_spawn.rand(); sounds[rand].play();
			}
		});
	};

	/******************************************************/
	/* Respawn with a drone *******************************/

	function drone_respawn() {
		showAlert('Low founds for a tank! Have a drone.', 'red');
		// cerramos el modal y realizamos operaciones gráficas.
		$('.menu').removeClass('menu-on');
		$('#canvas-container').css({'display': 'block'});
		$('#home').css({'display': 'none'});
		$('.player-hub').css({'display': 'none'});
		// focus sobre el canvas
		$('#canvas').focus();
		// comienza el game
		game.animate();
		// marcamos al usuario online
		// is_user_online();
		// lanzamos música de fondo
		sound_bg.play();
	}
	$('.drone-respawn').click(drone_respawn);


	/************************************************************/
	/* Usuario online & offline *********************************/

	function is_user_online() {
		if (Cookies('user_online') == "True") {
			//mandamos la información a la UI.
			$('.user_username').text(Cookies('user_username'));
			$('.user_balance').text(Cookies('user_balance'));
			//$('.user_balance_usd').text(Cookies('user_balance_usd'));
			$('.user_address').val(Cookies('user_address'));
			//cambiamos el view
			$(".user-online").css({ "display": "inherit" });
			$(".user-offline").css({ "display": "none" });
			$('body').addClass('user-logged');
			//armamos el QR con su dirección
			$('#qrcode_personal_address').text('');
			$('#qrcode_personal_address').qrcode(Cookies('user_address'));
			$('*').removeClass('menu-active');
			url_worker();

		}
		else {
			$(".user-online").css({ "display": "none" });
			$(".user-offline").css({ "display": "inherit" });
			$('*').removeClass('menu-active');
			// modals_manager('new-user');
			// $(location).attr('href', '#new-user');
			url_worker();
		};
	};


	/************************************************************/
	/* Playing rage notification ********************************/

	function rage_state() {
		$('#action-container span').text('massive rage unleashed');
		TweenMax.set("#action-container", {
			opacity: 0,
			className: '+=rage active',
		});

		TweenMax.staggerTo("#action-container", 1, {
			opacity: 1,
			delay: 0.2,
			ease: Elastic.easeOut.config(1, 0.75),
			force3D: true
		});

		TweenMax.staggerTo("#action-container", 1, {
			opacity: 0,
			delay: 2.9,
			ease: Elastic.easeOut.config(1, 0.75),
			force3D: true
		});
		TweenMax.staggerTo("#action-container", 1, {
			className: '-=rage active',
			delay: 3.9
		});
		$('.rage-line').addClass('on-rage');
	}

	/************************************************************/
	/* Playing big notifications ********************************/

	function show_upper_message(info) {
		$('#action-container span').html(info);

		TweenMax.set("#action-container", {
			opacity: 0,
			className: '+=active',
			left: '0%',
			top: '2vw',
			scale: 3,
			textShadow:"0px 0px 0px rgba(0,0,0,0.3)",
		});

		TweenMax.staggerTo("#action-container", 1, {
			scale: 1,
			opacity: 1,
			textShadow:"0px 0px 0px rgba(0,0,0,0.3)",
			ease: Elastic.easeOut.config(1, 0.75),
			force3D: true
		});

		TweenMax.staggerTo("#action-container", 0.6, {
			textShadow:"5px 5px 10px rgba(0,0,0,0.3)",
			delay: 0.4
		});

		TweenMax.staggerTo("#action-container", 1, {
			scale: 0,
			opacity: 0,
			textShadow:"0px 0px 0px rgba(0,0,0,0.3)",
			delay: 0.9,
			ease: Elastic.easeIn.config(1, 0.75),
			force3D: true
		});
		TweenMax.staggerTo("#action-container", 0.5, {
			className: '-=active',
			delay: 2.6
		});
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
	/* sonido ***************************************************/

	//Posiciones en segundos
	var sound_bg_posiciones = [
	0, 147, 383, 626, 830, 1075, 1332, 1524, 1777, 1968, 2246, 2524, 2766,
	2990, 3216, 3286, 3461, 3702, 3857, 4090, 4326, 4580, 4845, 5143
	];

	//selección al azar
	var sound_bg_posicion = sound_bg_posiciones[Math.floor(Math.random() * sound_bg_posiciones.length)];

	//sonido de fondo, debería de correr solo cuando is playin'
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
		// console.log('corriendo preloader...');
		//envamos las variables para node
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
		console.log('Sonidos armados');
	}

	/************************************************************/
	/* feedback *************************************************/

	//Envía el feedback del usuario hacia el servidor

	function send_feedback() {

		//nueva forma de enviar variables
		var params =  {
			username:               Cookies('user_username'),
			password:               Cookies('user_password'),
			user_feedback:          $('#user_feedback').val()
		};

		//envamos las variables para node
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
	/* leaderboard/view *****************************************/

	//Devuelve los 50 principales
	function leaderboard_view(online, size) {

		//if player self developer mode on comenzar clock
		//console logs para developer only

		//enviamos las variables para node
		//var online = online;
		//var size = size;
		//console.log(online, size);
		socket.emit('leaderboard-view', {online: online, size: size}, function(feedback) {
			//hacer cosas con la información? o no hacer nada...
			//feedback vuelve con información del node, muchas veces no debería de verse.
			if(feedback.leaderboard != null) {
				var row = '';
				for (var i = 0; i < feedback.leaderboard.length; ++i) {
					if (feedback.leaderboard[i]['username'] == 'healco') {
						// avoid healco
					}
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
						row += '<td>' + feedback.leaderboard[i]['difference'] + '</td>';
						row += '</tr>';
					}
				}
				//enviamos la información hacia ambos leaderboards
				$('.leaderboard-content').html(row);
				// $('#leaderboard').html(row);
				// var row2 = '';
				// for (var i = 0; i < feedback.leaderboard.length; ++i) {
				// 	row2 += '<tr>';
				// 	row2 += '<td># ' + i + '</td>';
				// 	row2 += '<td><a class="view_usermame">' + feedback.leaderboard[i]['username'] + '</a></td>';
				// 	row2 += '<td>' + feedback.leaderboard[i]['won'] + '</td>';
				// 	row2 += '<td>' + feedback.leaderboard[i]['lose'] + '</td>';
				// 	row2 += '<td>' + feedback.leaderboard[i]['difference'] + '</td>';
				// 	row2 += '</tr>';
				// }
				// $('#playing-leaderboard').html(row2);
				//revision

				var row3 = '';
				for (var i = 0; i < 11; ++i) {
					if (feedback.leaderboard[i]['username'] == 'healco') {
						// avoid healco
					}
					else {
						row3 += '<tr>';
						row3 += '<td># ' + i + '</td>';
						if (feedback.leaderboard[i]['condicion'] == 'online') {
							row3 += '<td><a class="view_usermame"><i class="fas fa-circle x-color-green"></i> <span>' + feedback.leaderboard[i]['username'] + '</span></a></td>';
						}
						else {
							row3 += '<td><a class="view_usermame"><i class="fas fa-circle"></i> <span>' + feedback.leaderboard[i]['username'] + '</span></a></td>';
						};
						row3 += '<td>' + feedback.leaderboard[i]['won'] + '</td>';
						row3 += '<td>' + feedback.leaderboard[i]['lose'] + '</td>';
						row3 += '<td>' + feedback.leaderboard[i]['difference'] + '</td>';
						row3 += '</tr>';
					}
				}
				$('#table-online-players').html(row3);
			}
		});

		//if player self developer mode on finalizar clock
	}

	/************************************************************/
	/* cashier/view *********************************************/

	//Devuelve la información para hacer display
	function cashier_view() {
		//buscamos las variables de cookies
		var username = Cookies('user_username');
		var password = Cookies('user_password');
		//envamos las variables para node
		socket.emit('cashier-view', { username: username, password: password }, function(feedback) {
		//hacer cosas con la información? o no hacer nada...
		//feedback vuelve con información del node, muchas veces no debería de verse.
		//console.log(feedback);
	});
	}

	//habilitamos la funcion de copy para el address en el modal cashier
	$('#cashier_copy_address').click(function() {
		$('.user_address').select();
		document.execCommand('copy');
	})

	/************************************************************/
	/* cashier/send *********************************************/

	//Envía el dinero al usuario a su dirección personal
	function cashier_send() {
		//buscamos las variables de cookies
		var username = Cookies('user_username');
		var password = Cookies('user_password');
		var address = $('#address_hacia').val();
		//envamos las variables para node
		socket.emit('cashier-send', { username: username, password: password, address: address }, function(feedback) {
		//hacer cosas con la información? o no hacer nada...
		//feedback vuelve con información del node, muchas veces no debería de verse.
		showAlert(feedback.advice, 'yellow');
	});
	}

	/************************************************************/
	/* cashier/wire *********************************************/

	//Envía dinero de un usuario a un segundo, funciona con nombres de usuario
	//Por lo que solo puede ser usado para operaciones locales.
	function cashier_wire() {
		//buscamos las variables de cookies
		var username = Cookies('user_username');
		var password = Cookies('user_password');
		var user_b = $('#wire_user_b').val();
		var value = $('#wire_value').val();
		var message = $('#wire_message').val();

		//envamos las variables para node
		socket.emit('cashier-wire', { username: username, password: password, user_b: user_b, value: value, message: message}, function(feedback) {
		//hacer cosas con la información? o no hacer nada...
		//feedback vuelve con información del node, muchas veces no debería de verse.
		showAlert(feedback.advice, 'yellow');
	});
	}

	/************************************************************/
	/* funciones developer **************************************/

	function developer_info() {

	//asumo que si lo ponemos en un if vamos a alivianar la carga del cpu y ram.
	//no considero necesario correr los foreach ni armar el cuadro si el usuario no lo ve.
		if ($('#developer-switch').hasClass('fa-check-square') || $('.btn-dev-on-off').hasClass('x-color-one')) {

			// populamos
			var developer_self = '';
			$.each( game['self'], function( key, value ) {
				developer_self += '<tr>';
				developer_self += '<td>' + key + '</td>';
				developer_self += '<td>' + value + '</td>';
				developer_self += '</tr>';
			});
			//enviamos la información hacia la tabla user overview
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

			//enviamos la información hacia la tabla user overview
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

	// it's sound enable?
	if ( sound_bg.volume > 0 ) {
		$('.btn-music').html('<i class="fas fa-volume-up"></i>');
	}
	else if ( sound_bg.volume == 0 ) {
		$('.btn-music').html('<i class="fas fa-volume-off"></i>');
	}
	// sound enable btn
	$('.btn-music').click(function() {
		if ( sound_bg.volume > 0 ) {
			sound_bg.pause();
			sound_bg.volume = 0;
			$(this).html('<i class="fas fa-volume-off"></i>');
		}
		else if ( sound_bg.volume == 0 ) {
			sound_bg.play();
			sound_bg.volume = 0.2;
			$(this).html('<i class="fas fa-volume-up"></i>');
		}
	});

	/************************************************************/
	/* Playing footer function **********************************/

		function playing_footer() {

			//esperamos la presencia de game
			if (game['self']) {
				//clonamos gameself para referenciarlo más rápido
				var playing_info = game['self'];
				// injection footer info
				$('.user-name').text(playing_info.name);
				$('.user-kills').text(playing_info.kills);
				$('.user-deaths').text(playing_info.deaths);
				$('.user-spawns').text(playing_info.spawns);
				$('.user-bits').text(playing_info.balance + ' BITS');
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
	/* settings funciones ***************************************/

	$('#developer-switch').click(function() {
		// developer mode
		if ($('#developer-switch').hasClass('fal fa-square')) {
			$('#developer-switch').removeClass('fal fa-square');
			$('#developer-switch').addClass('fal fa-check-square');
			$('#developer-mode').css({display: 'block'});
		}
		else {
			$('#developer-switch').removeClass('fal fa-check-square');
			$('#developer-switch').addClass('fal fa-square');
			$('#developer-mode').css({display: 'none'});
		};
	});
	$('.btn-dev-on-off').click(function() {
		$('#developer-mode').toggleClass('active');
		$('.btn-dev-on-off').toggleClass('x-color-one');
		$('#canvas').focus();
	});

	$('#rain-switch').click(function() {
		// show rain
		if ($('#rain-switch').hasClass('fal fa-square')) {
			$('#rain-switch').removeClass('fal fa-square');
			$('#rain-switch').addClass('fal fa-check-square');
			$('#canvas_02').css({display: 'block'});
		}
		else {
			$('#rain-switch').removeClass('fal fa-check-square');
			$('#rain-switch').addClass('fal fa-square');
			$('#canvas_02').css({display: 'none'});
		};
	});

	$('.music-settings-switch').click(function() {
		// play - pause music
		if ( sound_bg.volume > 0 ) {
			sound_bg.pause();
			sound_bg.volume = 0;
			$(this).html('<i class="fal fa-square"></i>');
			$('.btn-music').html('<i class="fas fa-volume-off"></i>');
		}
		else if ( sound_bg.volume == 0 ) {
			sound_bg.play();
			sound_bg.volume = 0.2;
			$(this).html('<i class="fal fa-check-square"></i>');
			$('.btn-music').html('<i class="fas fa-volume-up"></i>');
		}
	});

	/************************************************************/
	/* Pedir conversaciones previas *****************************/

	//recomendaciones de la función:
	//sería recomendable correrlo solo una vez, en la carga inicial.
	//realizar las modificaciones en la función que sean necesarias,
	//a fin de almacenar la información

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
			$('.small-chat-container .chat-display').scrollTop(9000);
			var chatSize = $('.menu-right').height() - ( $('.avatar-container').height() + $('.chat-input').height() + 92);
			$('.chat-display').height(chatSize);

			//if(feedback.advice != null) { showAlert(feedback.advice, 'yellow'); }
			//almacenamos el balance en balance_previo
			//var balance_previo = $('.user_balance').html();
			//console.log(balance_previo, feedback.user.available_balance);
			//si el balance nuevo es mayor a balance_previo, hacemos ruido de monedas
			//if(feedback.user.available_balance > balance_previo) { sound_coins(); }
			//refrescamos el balance del usuario
			//$('.user_balance').text(feedback.user.available_balance);
			//modificamos la cookie
			//if(feedback.user.available_balance != Cookies('user_balance')) { Cookies.set('user_balance', feedback.user.available_balance); }
		});
	};


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

		//esperamos la presencia de game
		if (game['self']) {
			//clonamos gameself para referenciarlo más rápido
			var hub_usuario = game['self'];
			$('#health-bar').empty();
			$('#shield-bar').empty();
			//cargamos la barra de experiencia
			// console.log((hub_usuario.rage - 1 ) * 100 + '%');

			//calculamos la salud perdida
			// console.log(hub_usuario.rage);

			// user rage --------------------> OFF
			// $('#progress-bar-rage').css({width: (hub_usuario.rage - 1 ) * 100 + '%'});
			// if (hub_usuario.rage >= 2 && rage_informed == 0) {
			// 	rage_state();
			// 	rage_informed = 1;
			// };
			// if (hub_usuario.rage < 2) {
			// 	rage_informed = 0;
			// 	$('.rage-line').removeClass('on-rage');
			// };

			var emptyHealth = 20 - hub_usuario.health;
			//salud
			for (var i = 0; i < hub_usuario.health; ++i) {
				$('#health-bar').append('<li></li>');
			}
			// rage
			// $('#progress-bar-bitcoin').attr('width': hub_usuario.rage);

			// TweenMax.set("#progress-bar-bitcoin", {
			// 	width: hub_usuario.rage,
			// });
			// TweenMax.staggerTo("#action-container", 1, {
			// 	width: hub_usuario.rage,
			// 	ease: Elastic.easeOut.config(1, 0.75),
			// 	force3D: true
			// });

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
			TweenMax.set("#action-container", {
				opacity: 0,
				className: '+=active',
				top: '2vw',
				scale: 1,
				textShadow: "0px 0px 0px rgba(0,0,0,0)"
			});
			TweenMax.set("#action-container", {
				className: '-=rage',
			});
			TweenMax.staggerTo("#action-container", 1, {
				scale: 1.7,
				opacity: 1,
				delay: 0.2,
				ease: Elastic.easeOut.config(1, 0.75),
				force3D: true
			});
			TweenMax.staggerTo("#action-container", 0.6, {
				textShadow: "5px 5px 10px rgba(0,0,0,0.5)",
				ease: Elastic.easeOut.config(1, 0.75),
				delay: 0.4
			});
			TweenMax.staggerTo("#action-container", 1, {
				scale: 0,
				opacity: 0,
				textShadow: "0px 0px 0px rgba(0,0,0,0)",
				delay: 0.7,
				ease: Elastic.easeIn.config(1, 0.75),
				force3D: true
			});
		}
		if (action == 'die') {
			$('#action-container span').html(info);
			TweenMax.set("#action-container", {
				opacity: 0,
				className: '+=active',
				top: '2vw',
				scale: 1,
				textShadow: "0px 0px 0px rgba(0,0,0,0)"
			});
			TweenMax.set("#action-container", {
				className: '-=rage',
			});
			TweenMax.set(".canvas-overlay", {
				opacity: 0,
			});
			TweenMax.set(aarray, {
				opacity: 0,
				top: '22vw',
				scale: 3,
				textShadow:"0px 0px 0px rgba(0,0,0,0.5)",
			});

			TweenMax.staggerTo(aarray, 1, {
				scale: 1,
				opacity: 1,
				top: '22vw',
				textShadow:"0px 0px 0px rgba(0,0,0,0.5)",
				delay: 0.2,
				ease: Elastic.easeOut.config(1, 0.75),
				force3D: true
			});
			TweenMax.staggerTo(".canvas-overlay", 0.2, {
				opacity: 1,
				delay: 0.1
			});

			TweenMax.staggerTo(aarray, 2, {
				textShadow:"5px 5px 10px rgba(0,0,0,0.5)",
				delay: 0.4,
				onComplete: layer200('off')
			});
		}
		if (action == 'respawn') {
			TweenMax.set(".canvas-overlay", {
				opacity: 1
			});
			TweenMax.set(aarray, {
				opacity: 1,
			});
			TweenMax.staggerTo(aarray, 1, {
				scale: 0,
				opacity: 0,
				delay: 0,
				ease: Elastic.easeIn.config(1, 0.75),
				force3D: true,
				onComplete: layer200('on')
			});
			TweenMax.staggerTo(".canvas-overlay", 1, {
				opacity: 0,
				ease: Elastic.easeIn.config(1, 0.75),
				delay: 0
			});

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
	/* Recuperacion de password *********************************/

	function recover_pass() {
		//dispara el pedido de recuperación hacia el server.
		var email = $('#email-recover-input').val();
		socket.emit('recover-pass', { email: email }, function(feedback) {
		//hacer cosas con la información? o no hacer nada... siempre dice done.
		//console.log(feedback);
	})
	}

	/************************************************************/
	/* Eliminación de usuario ***********************************/

	//función para eliminar un usuario especificado por el usuario.

	function user_del(param) {
		//buscamos las variables de cookies
		var username = $('#del_user_username').val();
		var password = $('#del_user_password').val();
		//enviamos el pedido
		socket.emit('user-del', { username: username, password: password }, function(feedback) {
			//hacer cosas con la información? o no hacer nada... siempre dice done.
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
		$('#user-overview').append($('<span>').addClass('fa fa-2x fa-spinner fa-pulse'));

		//buscamos las variables de cookies
		var username = Cookies('user_username');
		var password = Cookies('user_password');
		$('.username').text(username);

		socket.emit('user-overview', { username: username, password: password }, function(feedback) {
		//hacer cosas con la información? o no hacer nada... siempre dice done.
			// console.log(feedback);

			// populamos email y password
			$('#user_overview_email').val(feedback.user.email);
			$('#user_overview_password').val(feedback.user.password);

			//habilitamos para editar email
			$('#user_overview_email_edit').click(function() {
				$('#user_overview_email').removeAttr('disabled');
				$('#user_overview_email').focus();
				$('#user_overview_email').val('');
			});

			//habilitamos para editar passowrd
			$('#user_overview_password_edit').click(function() {
				$('#user_overview_password').removeAttr('disabled');
				$('#user_overview_password').focus();
				$('#user_overview_password').val('');
			});

			// acomodamos el modal cuando se cierra
			$('#modal-user').on('hidden.bs.modal', function () {
				$('#user_overview_email').val(feedback.user.email);
				$('#user_overview_password').val(feedback.user.password);
				$('#user_overview_email').attr('disabled', 'disabled');
				$('#user_overview_password').attr('disabled', 'disabled');
			});

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
			row += '</tr>';
			row += '<tr>';
			row += '<td><b>Deaths</b></td>';
			row += '<td>' + feedback.user.lose + '</td>';
			row += '</tr>';
			row += '<tr>';
			row += '<td><b>Profits</b></td>';
			row += '<td>' + feedback.user.difference + '</td>';
			row += '</tr>';
			row += '<tr>';
			row += '<td><b>Available Balance</b></td>';
			row += '<td>' + feedback.user.available_balance + '</td>';
			row += '</tr>';
			row += '<tr>';
			row += '<td><b>Pending received balance</b></td>';
			row += '<td>' + feedback.user.pending_received_balance + '</td>';
			row += '</tr>';
			row += '<tr>';
			row += '<td><b>Spawns</b></td>';
			row += '<td>' + feedback.user.spawns + '</td>';
			row += '</tr>';
			row += '<tr>';
			row += '<td><b>Condition</b></td>';
			row += '<td>' + feedback.user.condicion + '</td>';
			row += '</tr>';
			row += '<tr>';
			row += '<td><b>Personal address:</b></td>';
			row += '<td>' + feedback.user.address + '</td>';
			row += '</tr>';
			row += '<tr>';
			row += '<td><b>User since:</b></td>';
			row += '<td>' + feedback.user.creacion + '</td>';
			row += '</tr>';

			//enviamos la información hacia la tabla user overview
			$('#user_statistics').html(row);
			$('#user-overview .fa-spinner').remove();
		})
	}


	/************************************************************/
	/* Visualización del balance del propio usuario *************/

	function user_balance_view() {
		//loading
		$('.user_balance_table').append($('<span>').addClass('fa fa-2x fa-spinner fa-pulse'));

		//buscamos las variables de cookies
		var username = Cookies('user_username');
		var password = Cookies('user_password');
		socket.emit('user-balance-view', { username: username, password: password }, function(feedback) {
		//hacer cosas con la información? o no hacer nada... siempre dice done.
		// console.log(feedback);

		//cargamos el player battle info (kill, death, profit, spawns)
			$('.user-name').text(feedback.user.username);
			$('.user-kills').text(feedback.user.won);
			$('.user-deaths').text(feedback.user.eliminado);
			$('.user-spawns').text(feedback.user.spawns);
			$('.user-bits').text(feedback.user.available_balance);

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

					row += '<td><a href="https://btc.com/' + feedback.xfers[i]['xid'] + '" target="_blank">' + feedback.xfers[i]['xid'] + '</a></td>';


					//remplazamos en busqueda del simbolo '-'
					var difference_sum = feedback.xfers[i]['difference_sum'];
					var raw_difference_sum = difference_sum.replace("-", "");


					if (feedback.xfers[i]['difference_sum'] < 0) {
						row += '<td><i class="far fa-minus x-color-one"></i> ' + raw_difference_sum + '</td>';
					}
					else {
						row += '<td><i class="far fa-plus x-color-green"></i> ' + raw_difference_sum + '</td>';
					}

					// row += '<td>' + feedback.xfers[i]['creacion'] + '</td>';
					row += '</tr>';
				}
				// console.log(row);
				var aaa = [];
				var bbb = [];
				var ccc = [];

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

				// console.log(aaa);

				//console.log(construccion);

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
						categories: 2,
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
					legend: {
						layout: 'vertical',
						align: 'right',
						verticalAlign: 'middle',
						borderWidth: 0
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
				$('.user_balance_table .fa-spinner').remove();
			};
		});

	}

	/************************************************************/
	/* Procesa la información necesaria para crear el MFA *******/

	function user_mfa_show() {
		//buscamos las variables de cookies
		var username = Cookies('user_username');
		var password = Cookies('user_password');
		socket.emit('user-mfa', { username: username, password: password }, function(feedback) {
			//hacer cosas con la información? o no hacer nada... siempre dice done.
			// console.log(feedback);
			//armamos la información para el QR
			var informacion = 'otpauth://totp/' + username + '?secret=' + feedback.mfa.recover + '&issuer=www.bitofwar.com';
			//creamos el QR
			$('#qrcode_mfa').text('');
			$('#qrcode_mfa').qrcode(informacion);
			//informamos el recover_code
			$('#user-mfa-recover').text('');
			$('#user-mfa-recover').text(feedback.mfa.recover);
		})
	}

	/************************************************************/
	/* Procesa la información necesaria para crear el MFA *******/

	function user_mfa_enable() {
		//clear a los previos si los hay, no me funciona... revisar.
		//$('#qrcode_mfa').val();
		//$('#user-mfa-recover-code').val();
		//buscamos las variables de cookies
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
	/* Devuelve la información de un usuario cualquiera ********/

	function user_view(userClicked) {

		//que onda
		//console.log(game['self']);
		//console.log(game['self']['powerups']);

		//buscamos las variables de cookies
		var username = userClicked;
		socket.emit('user-view', { username: username}, function(feedback) {
		//hacer cosas con la información? o no hacer nada... siempre dice done.
		// populamos
		var row = '';
		row += '<tr>';
		row += '<td><b>Username</b></td>';
		row += '<td>' + feedback.user.username + '</td>';
		row += '</tr>';
		row += '<tr>';
		row += '<td><b>Enemies killed</b></td>';
		row += '<td>' + feedback.user.won + '</td>';
		row += '</tr>';
		row += '<tr>';
		row += '<td><b>Deaths</b></td>';
		row += '<td>' + feedback.user.lose + '</td>';
		row += '</tr>';
		row += '<tr>';
		row += '<td><b>Profits</b></td>';
		row += '<td>' + feedback.user.difference + '</td>';
		row += '</tr>';;
		row += '<tr>';
		row += '<td><b>Condition</b></td>';
		row += '<td>' + feedback.user.condicion + '</td>';
		row += '</tr>';
		row += '<tr>';
		row += '<td><b>Personal address:</b></td>';
		row += '<td>' + feedback.user.address + '</td>';
		row += '</tr>';
		row += '<tr>';
		row += '<td><b>User since:</b></td>';
		row += '<td>' + feedback.user.creacion + '</td>';
		row += '</tr>';

		//enviamos la información hacia la tabla user overview
		$('#user_x_overview').html(row);

		//abrimos el modal
		$("#modal-x-user").modal("show");
	})
	}

	/************************************************************/
	/* User log (top of the sidebar) ****************************/

	// function user_log() {
	// 	//buscamos las variables de cookies
	// 	var username = Cookies('user_username');
	// 	var password = Cookies('user_password');

	// 	socket.emit('user-overview', { username: username, password: password }, function(feedback) {

	// 		// populamos
	// 		$('#username_log').text('@' + username);

	// 		var row = '';
	// 		row += '<tr>';
	// 		row += '<td>you have killed: ' + feedback.user.won + '</td>';
	// 		row += '</tr>';
	// 		row += '<tr>';
	// 		row += '<td>you have been killed: ' + feedback.user.lose + '</td>';
	// 		row += '</tr>';
	// 		row += '<tr>';
	// 		row += '<td>balance is: ' + feedback.user.available_balance + '</td>';
	// 		row += '</tr>';
	// 		//row += '<tr>';
	// 		//row += '<td>balance in dollars: ' + feedback.user.balance_usd + '</td>';
	// 		//row += '</tr>';

	// 		//enviamos la información hacia la tabla user overview
	// 		$('#user-log').html(row);
	// 		$('#user-log-playing').html(row);
	// 		// $('*').modal('hide');
	// 	})
	// }


	/************************************************************/
	/* Slide tab ************************************************/

	// funcion para ocultar o mostar el slide tab
	// function show_sidebar() { $('#sidebar').toggleClass('slide-open'); };
	// //calculamos windowsW
	// var windowsW = $(window).width();
	// //condicionales dependiendo de windowsW
	// if (windowsW > 750) {
	// 	$('#sidebar').addClass('slide-open');
	// 	$('#slide-tab').addClass('slide-open');
	// }
	// else {
	// 	$('#sidebar').removeClass('slide-open');
	// 	$('#slide-tab').removeClass('slide-open');
	// }

	/************************************************************/
	/* Cerramos la sesión ***************************************/

	function session_close() {
		//asumo que la función de fadein será así...
		// $('.respawn-container').fadeIn(500);
		//sacamos los sonidos
		sounds['./audio/cardio.mp3'].pause();
		sounds['./audio/buzz.mp3'].pause();
		//la musica
		sound_bg.pause();
		//desenchufamos al usuario,
		var previa = socket.disconnect();
		//console.log(previa);
		previa.open();
		//eliminamos las cookies que creamos con el login
		Cookies.expire('user_id');
		Cookies.expire('user_email');
		Cookies.expire('user_username');
		Cookies.expire('user_password');
		Cookies.expire('user_balance');
		Cookies.expire('user_balance_usd');
		Cookies.expire('user_online');
		Cookies.expire('user_address');
		$(location).attr('href', '#new-user');
		is_user_online();
	}

	/************************************************************/
	/* Volver a casa ********************************************/

	function go_home() {
		//sacamos los sonidos
		sounds['./audio/cardio.mp3'].pause();
		sounds['./audio/buzz.mp3'].pause();
		//la musica
		sound_bg.pause();
		//desenchufamos al usuario,
		var previa = socket.disconnect();
		previa.open();
		$('#canvas-container').css({'display': 'none'});
		// $('.menu').addClass('menu-on');
		KilledSequence(null, 'respawn');
		$('#canvas').css({ 'filter': 'grayscale(0%) contrast(100%)','-webkit-filter': 'grayscale(0%) contrast(100%)'});
		$(location).attr('href', '#online-players');
		// modals_manager('online-players');
		is_user_online();
	}

	/************************************************************/
	/* Modals open & close **************************************/



	// $('.show-modal-balance').click(function() {

	// 	if ( $('.modal-balance').not('.show') ) {
	// 		user_balance_view();
	// 		$('*').modal('hide');
	// 		$('#modal-balance').modal('show');
	// 	}
	// 	else {
	// 		$('#modal-balance').modal('hide');
	// 		show_home();
	// 	}
	// });
	// $('#modal-balance').on('shown.bs.modal', function (e) {
	// 	$('body').addClass('modal-open');
	// });
	// $('#modal-balance').on('hidden.bs.modal', function (e) {
	// 	show_home();
	// });

	// $('.show-modal-settings').click(function() {
	// 	$('*').modal('hide');
	// 	$('#modal-settings').modal('toggle').delay(500);
	// });
	// $('#modal-settings').on('show.bs.modal', function (e) {
	// 	user_mfa_show();
	// 	$('#modal-settings .modal-info').height(530);
	// 	$('body').addClass('modal-open');
	// });
	// $('#modal-settings').on('hidden.bs.modal', function (e) {
	// 	show_home();
	// });

	// $('.show-modal-disconnect').click(function() {
	// 	$('*').modal('hide');
	// 	$('#modal-disconnect').modal('toggle');
	// });
	// $('#modal-disconnect').on('shown.bs.modal', function (e) {
	// 	$('body').addClass('modal-open');
	// });
	// $('#modal-disconnect').on('hidden.bs.modal', function (e) {
	// 	show_home();
	// });

	// $('.show-modal-rooms').click(function() {
	// 	$('*').modal('hide');
	// 	$('#modal-rooms').modal('toggle');
	// 	$('body').addClass('modal-open');
	// });
	// $('#modal-rooms').on('hidden.bs.modal', function (e) {
	// 	show_home();
	// });

	// $('.show-modal-login').click(function() {
	// 	$('*').modal('hide');
	// 	$('#modal-new-user').modal('toggle');
	// 	$('body').addClass('modal-open');
	// });

	// $('.show-modal-online-players').click(function() {
	// 	$('*').modal('hide');
	// 	$('#modal-online-players').modal('toggle');
	// 	$('body').addClass('modal-open');
	// });
	// $('#modal-online-players').on('hidden.bs.modal', function (e) {
	// 	show_home();
	// });

	// $('.show-modal-leaderboard').click(function() {
	// 	leaderboard_view();
	// 	$('*').modal('hide');
	// 	$('#modal-leaderboard').modal('toggle');
	// 	$('body').addClass('modal-open');
	// });
	// $('#modal-leaderboard').on('hidden.bs.modal', function (e) {
	// 	show_home();
	// });

	// $('.show-modal-cashier').click(function() {
	// 	$('*').modal('hide');
	// 	// show_home('#modal-cashier');
	// 	$('#modal-cashier').modal('toggle');
	// 	$('body').addClass('modal-open');
	// });
	// $('#modal-cashier').on('hidden.bs.modal', function (e) {
	// 	show_home();
	// });

	// $('.open-cashier-btn').click(function() {
	// 	$('*').modal('hide');
	// 	$('#modal-cashier').modal('show');
	// });
	// $('.show-modal-credits').click(function() {
	// 	$('*').modal('hide');
	// 	// show_home('#modal-credits');
	// 	$('#modal-credits').modal('show');
	// });
	// $('#modal-credits').on('hidden.bs.modal', function (e) {
	// 	show_home();
	// });



	/************************************************************/
	/* custom tabs ***********************************************/

	$('[data-tab-link]').click(function() {
		var tab = $(this).attr('data-tab-link');
		var parents = $(this).closest('.kard').find('[data-tab]');
		var contentId = parents[tab].id;

		$('[data-tab-link]').removeClass('active');
		$(this).addClass('active');

		parents.removeClass('active');
		$('#'+ contentId).addClass('active');
	});

	/************************************************************/
	/* price up! ************************************************/

	// function push_price_up(order) {
	// 	$('#' + order + ' .price-pop').animate({top: '-20px', opacity: '1'}, "fast").delay( 800 );
	// 	$('#' + order + ' .price-pop').animate({top: '10px', opacity: '0'}, "slow");
	// }

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
	/* Comprar powerups! ****************************************/

	function order_power(keydown) {
		keydown = keydown;
		//no es necesario enviar siempre el usuario y password
		//node puede sacar esa información usando el sock.id
		//envamos las variables para node
		socket.emit('comprar-power', {keydown}, function(feedback) {
			//refrescamos el balance del usuario
			if(feedback.advice == 'no_orders_remaining') {
				showAlert('All upgrades used', 'red');
				$('.powerups-container').removeClass('active');
			}
			//si la compra salió bien.
			else {
				//refrescamos el balance del usuario
				//$('.user_balance').text(feedback.user.available_balance);
				//randomización de sonidos desde array
				if(keydown == '49') {
					rand = sounds_order_1.rand(); sounds[rand].play();
					show_upper_message('A good shield when is needed.');
					powerup_counter('order_power_1');
					$('.powerups-container').removeClass('active');
				}
				if(keydown == '50') {
					rand = sounds_order_2.rand(); sounds[rand].play();
					show_upper_message('There’s nothing faster than Assassin MK1!');
					powerup_counter	('order_power_2');
					$('.powerups-container').removeClass('active');
				}
				if(keydown == '51') {
					rand = sounds_order_3.rand(); sounds[rand].play();
					show_upper_message('Vladof relics 1.0  more bullets, more kills!');
					powerup_counter	('order_power_3');
					$('.powerups-container').removeClass('active');
				}
				if(keydown == '52') {
					rand = sounds_order_4.rand(); sounds[rand].play();
					show_upper_message('You are 1.666 times lighter with Moonwalk!');
					powerup_counter	('order_power_4');
					$('.powerups-container').removeClass('active');
				}
				if(keydown == '53') {
					rand = sounds_order_5.rand(); sounds[rand].play();
					show_upper_message('The Slow company loves you.');
					powerup_counter	('order_power_5');
					$('.powerups-container').removeClass('active');
				}
				if(keydown == '54') {
					rand = sounds_order_6.rand(); sounds[rand].play(); console.log(rand);
					show_upper_message("Providing healing. We're killing you slowly");
					powerup_counter	('order_power_6');
					$('.powerups-container').removeClass('active');
				}
			}
		});
	}

	/************************************************************/
	/* Lineas ***************************************************/

//No anda porque cayó Ghub



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
	$('#order_power_4').click(function() {
		order_power('52');
		$('#canvas').focus();
	});
	$('#order_power_5').click(function() {
		order_power('53');
		$('#canvas').focus();
	});
	$('#order_power_6').click(function() {
		order_power('54');
		$('#canvas').focus();
	});


/************************************************************/
/* Quickboards **********************************************/

	//onkeydown
	$('#canvas').keydown(function(e) {

		//información on keydown.
		// if (Cookies('user_username') == "developer") { developer_info(); }

		switch(e.which) {
			//'1' para comprar 'shield'
			case 49:
			order_power(e.which);
			break;
			//'2' para comprar 'quickfire'
			case 50:
			order_power(e.which);
			break;
			//'3' para comprar 'peacemaker'
			case 51:
			order_power(e.which);
			break;
			//'4' para comprar 'moonwalker'
			case 52:
			order_power(e.which);
			break;
			//'5' slowco
			case 53:
			order_power(e.which);
			break;
			//'6' healco
			case 54:
			order_power(e.which);
			break;
			//añadir sunflower, añadir laser
			//'Tab' para abrir sidebar
			//case 9: show_sidebar();
			//break;
			// show powerups
			case 16: show_powerups(); leaderboard_view(1, 25);
			break;
			// show menu
			case 9: modals_switch();
			break;
			//salimos del handler
			default: return;
		}
		//prevenimos las convencionales
		e.preventDefault();
	});

//se añade a fin de cerrar el menú
	$('body').keydown(function(e) {
		switch(e.which) {
			// show menu
			case 9: modals_switch();
			break;
			//salimos del handler
			default: return;
		}
		//prevenimos las convencionales
		e.preventDefault();
	});

	//Tabulador hodl
	//$('#canvas').keydown(function(e) { if (e.which == 9) { e.preventDefault(); $('#sidebar').show(); } });
	//Tabulador released
	//$('#canvas').keyup(function(e){ if (e.which == 9) { e.preventDefault(); $('#sidebar').hide(); } });

	/************************************************************/
	/* super quick peaced funciones *****************************/

	//corremos cashier_search cada 100ms
	setInterval(function() {
		//información
		// console.log(socket.connected);
		//para cualquier usuario
		//leaderboard_view();
		//developer info


		//user is online
		if (Cookies('user_online') == "True") { cashier_search(); }
		if (game['self']) { player_hub(); developer_info(); }
	}, 100);

	setInterval(function() {
		if (game['self']) { playing_footer(); }
	}, 5000);

	/************************************************************/
	/* clicks ***************************************************/

	//click para cosas que aun el dom no posee
	$(document).on('change', '.user_balance', function() { alert( "Handler for .change() called." ); });
	$(document).on('click', '.view_usermame', function() { user_view($(this).html()); });

	// click actions
	// refresh password on modal new user
	$('#refresh-password').click(cookpassword);

	$('.btn-disconnect').click(session_close);
	$('.btn-go-menu').click(go_home);
	$('#recover-password').click(recover_pass);

	$('#name-submit').click(user_login);
	$('#name-create').click(user_new);

	$('#cashier_send').click(cashier_send);
	$('#cashier_wire').click(cashier_wire);
	$('#rescan_blockchain').click(cashier_search);
	$('#show_leaderboard').click(leaderboard_view);
	$('#show_user_overview').click(user_overview);
	$('.show_user_overview_solapa').click(user_overview);
	$('.show_user_mfa_solapa').click(user_mfa_show);
	$('#user-mfa-enable').click(user_mfa_enable);
	$('.show_user_balance').click(user_balance_view);
	//$('#show_user_overview').click(user_del);
	$('#del-user').click(user_del);
	$('.btn-respawn').click(respawn);
	$('#ingame_respawn').click(ingame_respawn);
	$('#send-feedback').click(send_feedback);

	//puede quedar al final
	is_user_online();
	dialog_view();

	// modals_manager('online-players');

	//mandamos helpers
//   tippy('.helpers', {
//   delay: 100,
//   arrow: true,
//   arrowType: 'round',
//   size: 'large',
//   duration: 500,
//   animation: 'scale'
// })

/************************************************************/
/* sonidos **************************************************/

	//dinero
	function sound_coins() {
		sounds['./audio/coins.mp3'].play()
	}
//finalizamos
});
