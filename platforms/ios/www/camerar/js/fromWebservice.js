var World = {
	markerDrawable_idle: null,
	markerDrawable_selected: null,
	markerDrawable_directionIndicator: null,
	markerList: [],
	currentMarker: null,

	updateStatusMessage: function (message, isWarning) {
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
	onMarkerSelected: function (marker) {
		if (World.currentMarker) {
			if (World.currentMarker.poiData.id == marker.poiData.id) {
				return;
			}
			World.currentMarker.setDeselected(World.currentMarker);
		}

		marker.setSelected(marker);
		World.currentMarker = marker;
	},
	onScreenClick: function () {
		if (World.currentMarker) {
			World.currentMarker.setDeselected(World.currentMarker);
		}
		World.currentMarker = null;
	}
};
var foursquare = {
	client_id: 'EXX1BOFMQDAWMTSTKSBA2SL20ONA1DIB0HFDNCIRCIXDHX5U',
	clien_secret: 'ELZCHJCR440OLXUVT23ZHRBSMY4QNZKGPUZZIIL4XTLK1AR3',
	url: 'https://api.foursquare.com/v2/venues/search?v=20140526&ll={ll}&client_id={id}&client_secret={secret}',
	list: function (ll, callback) {
		_url = this.url.replace('{id}', this.client_id).replace('{secret}', this.clien_secret).replace('{ll}', ll);
		resp = {};
		$.getJSON(_url, function (res) {
			callback(res);
		});
	}
};
var geolocate = {
	lat: 0, lng: 0, alt: 0,
	success: function (pos) {
		this.lat = pos.coords.latitude;
		this.lng = pos.coords.longitude;
		this.alt = pos.coords.altitude;

		World.markerList = [];

		foursquare.list(pos.coords.latitude + ',' + pos.coords.longitude, function (res) {

			World.markerDrawable_idle = new AR.ImageResource("assets/marker_idle.png");
			World.markerDrawable_selected = new AR.ImageResource("assets/marker_selected.png");
			World.markerDrawable_directionIndicator = new AR.ImageResource("assets/indi.png");

			var venues = res.response.venues;
			for (x = 0; x < venues.length; x++) {
				var venue = venues[x];
				var singlePoi = {
					"id": venue.id,
					"latitude": parseFloat(venue.location.lat),
					"longitude": parseFloat(venue.location.lng),
					"altitude": parseFloat(pos.coords.altitude + 2),
					"title": venue.name,
					"description": venue.location.address
				};
				World.markerList.push(new Marker(singlePoi));
				World.updateStatusMessage(x + ' places loaded');
			}
		});
	},
	error: function (error) {
	},
	init: function () {
		navigator.geolocation.getCurrentPosition(this.success, this.error, {maximumAge: 500000, enableHighAccuracy: true, timeout: 6000});
	}
};

geolocate.init();
AR.context.onLocationChanged = World.locationChanged;
AR.context.onScreenClick = World.onScreenClick;
