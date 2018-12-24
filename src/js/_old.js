	//posibles avisos de la API.
	//$feedback->advice = "Please define a valid email.";
	//$feedback->advice = "Please define username.";
	//$feedback->advice = "Invalid username: you can use alphanumeric, underscore(_) and hyphen(-), and period(.)";
	//$feedback->advice = "Please define password.";
	//$feedback->advice = "Invalid password: a minimum of 8 symbols are required.";
	//$feedback->advice = 'Username already in use.';
	//$feedback->advice = "Welcome.";

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


	/******************************************************/
	/* Open/close menu f-menu_switch **********************/

	// menu switch function
	function menu_switch() {

		//online users only
		if (Cookies('user_logued') == "True") {
			user_stats();
		}

		if ($('input').is(":focus")) {
			return
		}
		else {
			// if ( $('body').hasClass('playing')) {
			// 	TweenMax.to('.menu-overlay', 0.5, {
			// 		css: {opacity:"0.95", display:"block"},
			// 		ease: Elastic.easeInOut.config(1, 0.75),
			// 		force3D: true
			// 	});
			// } else {
			// 	TweenMax.to('.menu-overlay', 0.5, {
			// 		css: {opacity:"0", display:"none"},
			// 		ease: Elastic.easeInOut.config(1, 0.75),
			// 		force3D: true
			// 	});
			// }
			if ($('.menu').hasClass('menu-on')) {
				$('.header').focus();
				TweenMax.set('.brand', {
					opacity: 1,
					scale: 1,
					left: "0%"
				});
				TweenMax.to('.brand', 1, {
					opacity: 0,
					scale: 1,
					left: "-120%",
					ease: Elastic.easeIn.config(1, 0.75),
					force3D: true
				});

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
				console.log('caca');
				// TweenMax.to('.menu-overlay', 0.5, {
				// 	delay: 0.5,
				// 	css: {opacity:"0", display:"none"},
				// 	ease: Elastic.easeInOut.config(1, 0.75),
				// 	force3D: true
				// });
			}
			else {
				TweenMax.set('.brand', {
					opacity:1,
					scale: 1,
					left: "-120%"
				});
				TweenMax.to('.brand', 1, {
					delay: 0.1,
					left: "0%",
					opacity: 1,
					scale: 1,
					ease: Elastic.easeOut.config(1, 1),
					force3D: true
				});
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
	}


	/************************************************************/
	/* Slide tab ************************************************/

	funcion para ocultar o mostar el slide tab
	function show_sidebar() { $('#sidebar').toggleClass('slide-open'); };
	//calculamos windowsW
	var windowsW = $(window).width();
	//condicionales dependiendo de windowsW
	if (windowsW > 750) {
		$('#sidebar').addClass('slide-open');
		$('#slide-tab').addClass('slide-open');
	}
	else {
		$('#sidebar').removeClass('slide-open');
		$('#slide-tab').removeClass('slide-open');
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
	/* price up! ************************************************/

	// function push_price_up(order) {
	// 	$('#' + order + ' .price-pop').animate({top: '-20px', opacity: '1'}, "fast").delay( 800 );
	// 	$('#' + order + ' .price-pop').animate({top: '10px', opacity: '0'}, "slow");
	// }


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
			case 16: show_powerups();
			break;
			//salimos del handler
			default: return;
		}
		//prevenimos las convencionales
		e.preventDefault();
	});

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