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