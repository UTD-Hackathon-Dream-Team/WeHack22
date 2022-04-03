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
}

async function showRoute() {
  var start = document.getElementById("start").value;
  var dest = document.getElementById("dest").value;
  var points = [];

  //Get coordinates of route endpoints
  geocoder.geocode({ address: start }, function (results, status) {
    if (status == "OK") {
      latitude = results[0].geometry.location.lat();
      longitude = results[0].geometry.location.lng();
      var place = results[0].address_components[0].long_name;
      points.push({ lat: latitude, lng: longitude });
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
  geocoder.geocode({ address: dest }, function (results, status) {
    if (status == "OK") {
      latitude = results[0].geometry.location.lat();
      longitude = results[0].geometry.location.lng();
      var place = results[0].address_components[0].long_name;
      points.push({ lat: latitude, lng: longitude });
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });

  console.log(points);

  //Get directions
  var directionsService = new google.maps.DirectionsService();
  var directionsDisplay = new google.maps.DirectionsRenderer();
  directionsDisplay.setMap(map);
  var request = {
    origin: start,
    destination: dest,
    travelMode: "DRIVING",
  };
  directionsService.route(request, function (result, status) {
    if (status == "OK") {
      console.log(result);
      directionsDisplay.setDirections(result);
      console.log(result.routes[0].legs[0].distance.text);
      console.log(result.routes[0].legs[0].duration.text);
      document.getElementById("distance").innerHTML =
        "Total Distance: " + result.routes[0].legs[0].distance.text;
      document.getElementById("duration").innerHTML =
        "Total Duration: " + result.routes[0].legs[0].duration.text;

      //Finding "stops"
      var steps = result.routes[0].legs[0].steps;
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
      console.log(stops);

      //Marking "stops"
      for (var i = 0; i < stops.length; i++) {
        // new google.maps.Marker({
        //   map,
        //   title: "Stop " + i.toString(),
        //   position: {
        //     lat: stops[i].lat(),
        //     lng: stops[i].lng(),
        //   },
        // });

        //Getting nearby gas station
        var stopRequest = {
          location: new google.maps.LatLng(stops[i].lat(), stops[i].lng()),
          radius: "16000",
          type: ["gas_station"],
          rankby: "distance",
        };
        service = new google.maps.places.PlacesService(map);
        service.nearbySearch(stopRequest, function (results, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            var place = results[0];
            points.push({
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            });
            console.log(
              place.geometry.location.lat(),
              place.geometry.location.lng()
            );
            new google.maps.Marker({
              map,
              title: place.name,
              position: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              },
            });
          }
        });
      }

      console.log(points);
      //Drawing route
      points = [
        { lat: "32.7766642", lng: "-96.79698789999999" },
        { lat: "29.7604267", lng: "-95.3698028" },
        { lat: "31.88048749999999", lng: "-96.3472792" },
        { lat: "30.1420754", lng: "-95.469291" },
      ];
      var endPoint = points[1];
      points.splice(1, 1);
      points.push(endPoint);
      console.log(points);
      var urlParams = "";
      for (var i = 0; i < points.length; i++) {
        urlParams += points[i].lat + "," + points[i].lng + "/";
      }
      var url = "https://www.google.com/maps/dir/" + urlParams;
      window.open(url);
    }
  });
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
