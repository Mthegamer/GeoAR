
// Objects
	var degub = {
		enabled: false,
		logs: [],
		log: function (txt) {
			this.logs.push(txt);
			console.log(txt);
		},
		showOnDiv: function (selector) {
			for (x in this.logs) {
				$(selector).append('<p>' + this.logs[x] + '</p>');
			}
		}
	};
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
	};
	var win = {
		width: 0,
		height: 0,
		init: function () {
			this.resize();
			$(window).resize(this.resize);
		},
		resize: function () {
			this.width = $(window).width();
			this.height = $(window).height();

			$('#map-canvas').css({
				'height': win.height - ($('#info-loc').outerHeight() + $('[data-role="header"]').outerHeight())
			});
		}
	};

	// Geolocate object
	var geolocate = {
		// Latitude, longitude and altitude
		lat: 0, lng: 0, alt: 0,
		// Is geolocate
		success: function (pos) {
			// Setting geolocate data
			this.lat = pos.coords.latitude;
			this.lng = pos.coords.longitude;
			this.alt = pos.coords.altitude;

			// Drawing the map
			map.draw(new google.maps.LatLng(this.lat, this.lng));

			// Output geolocate data
			$('#o_lat').text(this.lat);
			$('#o_lng').text(this.lng);
			$('#o_alt').text(this.alt);
		},
		// is not locate :(
		error: function (error) {
			// Drawing the fail map
			map.draw(map.defaultLatLng);
	    	alert('Geolocate unavailable');
		},
		// Init the object
		init: function () {
			// Request geolocate
			navigator.geolocation.getCurrentPosition(this.success, this.error, {maximumAge: 500000, enableHighAccuracy: true, timeout: 6000});
		}
	};
	// Foursquare object
	var foursquare = {
		// Clien API info
		client_id: 'EXX1BOFMQDAWMTSTKSBA2SL20ONA1DIB0HFDNCIRCIXDHX5U',
		clien_secret: 'ELZCHJCR440OLXUVT23ZHRBSMY4QNZKGPUZZIIL4XTLK1AR3',
		// URL to request
		url: 'https://api.foursquare.com/v2/venues/search?v=20140526&ll={ll}&client_id={id}&client_secret={secret}',
		// List the venues
		list: function (ll, callback) {
			_url = this.url.replace('{id}', this.client_id).replace('{secret}', this.clien_secret).replace('{ll}', ll);
			resp = {};
			$.getJSON(_url, function (res) {
				// Return the callback
				callback(res);
			});
		}
	};
	// Map object
	var map = {
		// Default locate
		defaultLatLng: new google.maps.LatLng(34.0983425, -118.3267434),
		// Drwaing the map function
		draw: function (latlng) {
			var myOptions = {
				zoom: 17,
				center: latlng,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				streetViewControl: false,
				mapTypeControl: false,
				zoomControl: false
			};
			var _map = new google.maps.Map(document.getElementById('map-canvas'), myOptions);
			var marker = new google.maps.Marker({
				position: latlng,
				map: _map
			});

			// Drwaing the fourquare venues on the map
			foursquare.list(latlng.lat() + ',' + latlng.lng(), function (res) {
				var venues = res.response.venues;
				for (x in venues) {
					venue = venues[x];
					var venueMark = new google.maps.Marker({
						position: new google.maps.LatLng(venue.location.lat, venue.location.lng),
						map: _map,
						title: venue.name
					});
				}
			});
		}
	};
	// Wikitude object
	var wikitude = {
		// Init wikitude
		init: function () {
			// is supporting?
        	WikitudePlugin.isDeviceSupported(this.onDeviceSupported, this.onDeviceNotSupported);
		},
		// Supported RA
	    onDeviceSupported: function() {
	    	// Event to open camera
			$('.toCamera').click(function () {
				WikitudePlugin.loadARchitectWorld("www/camerar/index.html");
			});
	    },
	    // Not supported
	    onDeviceNotSupported: function() {
	    	navigator.notification.alert('Unable to launch the augmented reality world on this device!');
	    }
	};

	// Main object
	var main = {
		// And God said, Let there be light: and there was light.
		init: function () {
			document.addEventListener('deviceready', this.deviceready, false);
		},
		// Ready, set, go!
		deviceready: function () {
			win.init();
			geolocate.init();
			wikitude.init();

			//WikitudePlugin.loadARchitectWorld("www/camerar/index.html");

			// Deleting all links
			$('a').click(function (e) {
				e.preventDefault();
			});
		}
	};
	main.init();