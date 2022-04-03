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
  showMap(0, 0, 1.75);
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
  var address = document.getElementById("address").value;
  if (!address) {
    showMap(0, 0, 1.75);
    showEarthquakes();
    return;
  }
  geocoder.geocode({ address: address }, function (results, status) {
    if (status == "OK") {
      // console.log(results[0]);
      latitude = results[0].geometry.location.lat();
      longitude = results[0].geometry.location.lng();
      showMap(latitude, longitude, 5);
      var place = results[0].address_components[0].long_name;
      showEarthquakes(place);
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
}

function showMap(latitude, longitude, zoom) {
  var place = new google.maps.LatLng(latitude, longitude);
  map = new google.maps.Map(document.getElementById("map"), {
    center: place,
    zoom: zoom,
  });
}
