
// Objetos
	var utils = {
		rand: function (a,b) { return Math.floor((Math.random() * b) + a); },
		round: function (n) { return Math.round( n * 100 ) / 100 },
		isOfPercent: function (entero, porcentaje) { return (entero / 100) * porcentaje; },
		isPrecentOf: function (entero, extraido) { return (extraido / entero) * 100; },
		is100pOf: function (entero, porcentaje) { return (entero * 100) / porcentaje; },
		proporcional: function (lado1, lado2, nuevoLado1) {
			v1 = (lado2 / lado1) * nuevoLado1;
			v1 = this.round(v1);
			return v1;
		}
	}
	var win = {
		width: 0,
		height: 0,
		init: function () {
			this.resize();
			$(window).resize(this.resize);
		}
		resize: function () {
			this.width = $(window).width();
			this.height = $(window).height();

			$('#map-canvas').css({
				'height': utils.isOfPercent(this.height, 50)
			});
		}
	}
	var geolocate = {
		init: function () {
			navigator.geolocation.getCurrentPosition(this.success, this.error, {maximumAge: 500000, enableHighAccuracy: true, timeout: 6000});
		}
		success: function () {
			map.draw(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));

			$('#o_lat').text(pos.coords.latitude);
			$('#o_lng').text(pos.coords.longitude);
			$('#o_alt').text(pos.coords.altitude);
		},
		error: function () {
			map.draw(map.defaultLatLng);
		}
	}
	var map = {
		defaultLatLng: function () {
			var res = new google.maps.LatLng(34.0983425, -118.3267434);
			return res;
		},
		draw: function (latlng) {
			var myOptions = {
				zoom: 18,
				center: latlng,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			var map = new google.maps.Map(document.getElementById('map-canvas'), myOptions);
			var marker = new google.maps.Marker({
				position: latlng,
				map: map
			});
		}
	}
	var main = {
		init: function () {
			win.init();
			geolocate.init();
		}
	}

document.addEventListener('deviceready', main.init, false);