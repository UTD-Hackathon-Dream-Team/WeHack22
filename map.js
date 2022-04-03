var map;
var service;
var geocoder;
var latitude = 32.985771;
var longitude = -96.750003;
var directionsService;
var directionsDisplay;
var gmarkers = [];

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
        console.log(results);
        resolve(results[0]);
      } else if (status === "OVER_QUERY_LIMIT") {
        reject(status);
        alert("Over query limit");
      } else {
        reject(status);
      }
    });
  });
};

async function showRoute() {
  for (i = 0; i < gmarkers.length; i++) {
    gmarkers[i].setMap(null);
  }
  var list = document.getElementById("your_stops");
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }

  var stopType = document.querySelector('input[name="stop_type"]:checked').id;

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
    "<strong> Total Distance:</strong> " +
    directionResult.routes[0].legs[0].distance.text;
  document.getElementById("duration").innerHTML =
    "<strong>Total Duration:</strong> " +
    directionResult.routes[0].legs[0].duration.text;

  //Finding "stops"
  var steps = directionResult.routes[0].legs[0].steps;
  var sumDuration = 0;
  var stops = [];
  if (steps.length > 1) {
    for (var i = 0; i < steps.length - 1; i++) {
      if (steps[i].duration.value >= 7200) {
        sumDuration += steps[i].duration.value / 2;
        var end_location = {
          lat:
            (steps[i].start_location.lat() + steps[i].end_location.lat()) / 2,
          lng:
            (steps[i].start_location.lng() + steps[i].end_location.lng()) / 2,
        };
        stops.push(new google.maps.LatLng(end_location.lat, end_location.lng));
        sumDuration = 0;
      } else {
        sumDuration += steps[i].duration.value;
        if (sumDuration + steps[i + 1].duration.value >= 7200) {
          stops.push(steps[i].end_location);
          sumDuration = 0;
        } else if (sumDuration >= 5400) {
          stops.push(steps[i].end_location);
          sumDuration = 0;
        }
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
      type: stopType,
      rankby: "prominence",
    };
    service = new google.maps.places.PlacesService(map);
    let stopsPoints = await getStops(service, stopRequest);
    var marker = new google.maps.Marker({
      map,
      title: stopsPoints.name,
      position: {
        lat: stopsPoints.geometry.location.lat(),
        lng: stopsPoints.geometry.location.lng(),
      },
    });
    var list = document.getElementById("your_stops");
    var entry = document.createElement("li");
    entry.classList.add("list-group-item");
    entry.appendChild(document.createTextNode(stopsPoints.name));
    list.appendChild(entry);
    gmarkers.push(marker);
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
    urlParams += points[i].lat + "," + points[i].lng + "/";
  }
  var url = "https://www.google.com/maps/dir/" + urlParams;
  window.open(url);
}

function showMap(latitude, longitude, zoom) {
  var place = new google.maps.LatLng(latitude, longitude);
  map = new google.maps.Map(document.getElementById("map"), {
    center: place,
    zoom: zoom,
  });
}
