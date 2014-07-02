// implementation of AR-Experience (aka "World")


// Mini Ajax

var ajax = {
    	xhr: new XMLHttpRequest (),
	request: function (method, url, vars) {
		vars = JSON.stringify(vars);
		vars = vars.replace(/\{/g, '').replace(/\}/g, '').replace(/\"/g, '').replace(/:/g, '=').replace(/,/g, '&');
		
		this.xhr.open(method, url, true);
		this.xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		this.xhr.send(vars);
	},
	response: function (res) {
		this.xhr.onreadystatechange = function () {
			return res(ajax.xhr.responseText);
		};
	},
	get: function(url, vars, res) {
		this.request('GET', url, vars);
		this.response(res);
	},
	post: function(url, vars, res) {
		this.request('POST', url, vars);
		this.response(res);
	}
	getJSON: function(url, res) {
		this.request('GET', url, null);
		this.response( JSON.parse(res) );
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
		ajax.getJSON(_url, function (res) {
			// Return the callback
			callback(res);
		});
	}
};

var World = {
	// true once data was fetched
	initiallyLoadedData: false,

	// different POI-Marker assets
	markerDrawable_idle: null,
	markerDrawable_selected: null,

	// list of AR.GeoObjects that are currently shown in the scene / World
	markerList: [],

	// The last selected marker
	currentMarker: null,

	// called to inject new POI data
	loadPoisFromJsonData: function loadPoisFromJsonDataFn(poiData) {

		// empty list of visible markers
		World.markerList = [];

		// start loading marker assets
		World.markerDrawable_idle = new AR.ImageResource("assets/marker_idle.png");
		World.markerDrawable_selected = new AR.ImageResource("assets/marker_selected.png");

		// loop through POI-information and create an AR.GeoObject (=Marker) per POI
		for (var currentPlaceNr = 0; currentPlaceNr < poiData.length; currentPlaceNr++) {
			var singlePoi = {
				"id": poiData[currentPlaceNr].id,
				"latitude": parseFloat(poiData[currentPlaceNr].latitude),
				"longitude": parseFloat(poiData[currentPlaceNr].longitude),
				"altitude": parseFloat(poiData[currentPlaceNr].altitude),
				"title": poiData[currentPlaceNr].name,
				"description": poiData[currentPlaceNr].description
			};

			World.markerList.push(new Marker(singlePoi));
		}

		World.updateStatusMessage(currentPlaceNr + ' places loaded');
	},

	// updates status message shon in small "i"-button aligned bottom center
	updateStatusMessage: function updateStatusMessageFn(message, isWarning) {

		var themeToUse = isWarning ? "e" : "c";
		var iconToUse = isWarning ? "alert" : "info";

		$("#status-message").html(message);
		$("#popupInfoButton").buttonMarkup({
			theme: themeToUse
		});
		$("#popupInfoButton").buttonMarkup({
			icon: iconToUse
		});
	},

	// location updates, fired every time you call architectView.setLocation() in native environment
	locationChanged: function locationChangedFn(lat, lon, alt, acc) {

		// request data if not already present
		if (!World.initiallyLoadedData) {
			World.requestDataFromLocal(lat, lon);
			World.initiallyLoadedData = true;
		}
	},

	// fired when user pressed maker in cam
	onMarkerSelected: function onMarkerSelectedFn(marker) {

		// deselect previous marker
		if (World.currentMarker) {
			if (World.currentMarker.poiData.id == marker.poiData.id) {
				return;
			}
			World.currentMarker.setDeselected(World.currentMarker);
		}

		// highlight current one
		marker.setSelected(marker);
		World.currentMarker = marker;
	},

	// screen was clicked but no geo-object was hit
	onScreenClick: function onScreenClickFn() {
		if (World.currentMarker) {
			World.currentMarker.setDeselected(World.currentMarker);
		}
	},

	// request POI data
	requestDataFromLocal: function requestDataFromLocalFn(centerPointLatitude, centerPointLongitude) {
		var poiData = [];

		// Drwaing the fourquare venues on the map
		foursquare.list(centerPointLatitude + ',' + centerPointLongitude, function (res) {
			var venues = res.response.venues;
			for (x in venues) {
				var venue = venues[x];
				var venn = {
					'id': venue.id,
					'name': venue.name,
					'latitude': venue.location.lat,
					'longitude': venue.location.lng,
					'altitude': '246.0',
					'description': ''
				}
				poiData.push(venn);
			}
		});

		World.loadPoisFromJsonData(poiData);
	}

};

/* forward locationChanges to custom function */
AR.context.onLocationChanged = World.locationChanged;

/* forward clicks in empty area to World */
AR.context.onScreenClick = World.onScreenClick;