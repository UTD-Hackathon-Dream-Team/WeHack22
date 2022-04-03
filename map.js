var map;
var service;
var geocoder;
var latitude = 32.985771;
var longitude = -96.750003;
var directionsService;
var directionsDisplay;

function addtoPoints(toAdd) {
  points.push(toAdd);
}

async function initialize() {
  geocoder = new google.maps.Geocoder();
  showMap(37, -96, 4);
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();
}

const getAddress = (address) => {
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === "OK") {
        resolve(results[0]);
      } else {
        reject(status);
      }
    });
  });
};

const getRoute = (request) => {
  return new Promise((resolve, reject) => {
    directionsService.route(request, (results, status) => {
      if (status === "OK") {
        resolve(results);
      } else {
        reject(status);
      }
    });
  });
};

const getStops = (service, stopRequest) => {
  return new Promise((resolve, reject) => {
    service.nearbySearch(stopRequest, (results, status) => {
      if (status === "OK") {
        resolve(results[0]);
      } else {
        reject(status);
      }
    });
  });
};

async function showRoute() {
  var start = document.getElementById("start").value;
  var dest = document.getElementById("dest").value;
  var points = [];

  //Get coordinates of route endpoints
  let startPoint = await getAddress(start);
  points.push({
    lat: startPoint.geometry.location.lat(),
    lng: startPoint.geometry.location.lng(),
  });

  //Get directions
  directionsDisplay.setMap(map);
  //map.clearOverlays();
  var request = {
    origin: start,
    destination: dest,
    travelMode: "DRIVING",
  };
  let directionResult = await getRoute(request);
  directionsDisplay.setDirections(directionResult);
  document.getElementById("distance").innerHTML =
    "Total Distance: " + directionResult.routes[0].legs[0].distance.text;
  document.getElementById("duration").innerHTML =
    "Total Duration: " + directionResult.routes[0].legs[0].duration.text;

  //Finding "stops"
  var steps = directionResult.routes[0].legs[0].steps;
  var sumDuration = 0;
  var stops = [];
  if (steps.length > 1) {
    for (var i = 0; i < steps.length - 1; i++) {
      sumDuration += steps[i].duration.value;
      if (sumDuration + steps[i + 1].duration.value > 7200) {
        stops.push(steps[i].end_location);
        sumDuration = 0;
      } else if (sumDuration >= 5400) {
        stops.push(steps[i].end_location);
        sumDuration = 0;
      }
    }
  }

  for (const stop of stops) {
    // new google.maps.Marker({
    //   map,
    //   title: "Stop " + i.toString(),
    //   position: {
    //     lat: stop.lat(),
    //     lng: stop.lng(),
    //   },
    // });

    //Getting nearby gas station
    var stopRequest = {
      location: new google.maps.LatLng(stop.lat(), stop.lng()),
      radius: "16000",
      type: ["gas_station"],
      rankby: "distance",
    };
    service = new google.maps.places.PlacesService(map);
    let stopsPoints = await getStops(service, stopRequest);
    new google.maps.Marker({
      map,
      title: stopsPoints.name,
      position: {
        lat: stopsPoints.geometry.location.lat(),
        lng: stopsPoints.geometry.location.lng(),
      },
    });
    points.push({
      lat: stopsPoints.geometry.location.lat(),
      lng: stopsPoints.geometry.location.lng(),
    });
  }

  let endPoint = await getAddress(dest);
  points.push({
    lat: endPoint.geometry.location.lat(),
    lng: endPoint.geometry.location.lng(),
  });

  var urlParams = "";
  for (var i = 0; i < points.length; i++) {
    console.log(points);
    urlParams += points[i].lat + "," + points[i].lng + "/";
  }
  var url = "https://www.google.com/maps/dir/" + urlParams;
  window.open(url);
}

function codeAddress() {
  var start = document.getElementById("start").value;
  var dest = document.getElementById("dest").value;

  geocoder.geocode({ address: start }, function (results, status) {
    if (status == "OK") {
      latitude = results[0].geometry.location.lat();
      longitude = results[0].geometry.location.lng();
      var place = results[0].address_components[0].long_name;
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
  geocoder.geocode({ address: dest }, function (results, status) {
    if (status == "OK") {
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
