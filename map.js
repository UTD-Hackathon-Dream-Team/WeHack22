var map;
var service;
var geocoder;
var latitude = 32.985771;
var longitude = -96.750003;
var startDate = "2021-10-01";
var endDate = "2021-10-15";
var minMagnitude = 5;

async function initialize() {
  geocoder = new google.maps.Geocoder();
  showMap(37, -96, 4);
  showEarthquakes();
}

async function showEarthquakes(place) {
  const earthquakeResponse = await fetch(
    `https://earthquake.usgs.gov/fdsnws/event/1/query?starttime=${startDate}&endtime=${endDate}&minmagnitude=${minMagnitude}&format=geojson`
  );
  var earthquakesData = await earthquakeResponse.json();
  var earthquakes = earthquakesData.features;
  if (place) {
    var newEarthquakes = earthquakes.filter((earthquake) =>
      earthquake.properties.place
        ? earthquake.properties.place.includes(place)
        : false
    );
    earthquakes = newEarthquakes;
  }

  for (var i = 0; i < earthquakes.length; i++) {
    new google.maps.Marker({
      map,
      title: earthquakes[i].properties.place,
      position: {
        lat: earthquakes[i].geometry.coordinates[1],
        lng: earthquakes[i].geometry.coordinates[0],
      },
      icon: getCircle(earthquakes[i].properties.mag),
    });
  }
}

async function showRoute() {
  var directionsService = new google.maps.DirectionsService();
  var directionsDisplay = new google.maps.DirectionsRenderer();
  directionsDisplay.setMap(map);
  var start = document.getElementById("start").value;
  var dest = document.getElementById("dest").value;
  var request = {
    origin: start,
    destination: dest,
    travelMode: "DRIVING",
  };
  directionsService.route(request, function (result, status) {
    if (status == "OK") {
      directionsDisplay.setDirections(result);
      console.log(result.routes[0].legs[0].distance.text);
      console.log(result.routes[0].legs[0].duration.text);
      document.getElementById("distance").innerHTML =
        "Total Distance: " + result.routes[0].legs[0].distance.text;
      document.getElementById("duration").innerHTML =
        "Total Duration: " + result.routes[0].legs[0].duration.text;
    }
  });
}

function getCircle(magnitude) {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: "red",
    fillOpacity: 0.2,
    scale: Math.pow(2, magnitude) / 2,
    strokeColor: "white",
    strokeWeight: 0.5,
  };
}

function codeAddress() {
  var start = document.getElementById("start").value;
  var dest = document.getElementById("dest").value;

  geocoder.geocode({ address: start }, function (results, status) {
    if (status == "OK") {
      console.log(results[0]);
      latitude = results[0].geometry.location.lat();
      longitude = results[0].geometry.location.lng();
      var place = results[0].address_components[0].long_name;
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
  geocoder.geocode({ address: dest }, function (results, status) {
    if (status == "OK") {
      console.log(results[0]);
      latitude = results[0].geometry.location.lat();
      longitude = results[0].geometry.location.lng();
      var place = results[0].address_components[0].long_name;
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
  showRoute();
}

function showMap(latitude, longitude, zoom) {
  var place = new google.maps.LatLng(latitude, longitude);
  map = new google.maps.Map(document.getElementById("map"), {
    center: place,
    zoom: zoom,
  });
}
