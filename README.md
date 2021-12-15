# Leaflet-Dashboards

**This Project was created to fulfill the requirements of Larry Bouthillier's CSCI E-3 course at the Harvard Extension school. The goal of this project is to practice web development and WebGIS skills**


Dependencies:
1. Leaflet.js
2. That's it! Vanilla JS methods were used for the required event listening and DOM Manipulation.


Basic Methodology for creating an event-based widget. This guide assumes that the user loads the points using the L.geoJSON method from a piece of geoJSON.



Basic steps for creating a new function that will update on map change.
1. Load geoJSON file
2. Define new function 
3. Use .getlayers() method on geoJSON object to get it's layer group
4. Iterate through layer group so that each marker is tested 
5. Test if marker is within map boundaries
5a. Do something!
6.Ensure that your function is being called from the map.on("zoomend moveend") function


Example below of this working:

This is trimmed down code that all it will do is console.log('marker in bounds') when marker is in bounds


`"use strict";
window.onload = function () {
  leafletmap();
};

function leafletmap() {
  let zoomLevel = 4;
  let centerpoint = [37.693058942425786, -97.32539007099342];
  let map = L.map("map_container",{
      //setting preferCanvas: true avoids performance issues 
    preferCanvas: true
  }).setView(centerpoint, zoomLevel);
  let attributionHtml = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  // create tile layer with attribution
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: attributionHtml }).addTo(map);

  // Request JSON data via AJAX.
  // Uses the browser's modern Fetch API to do the AJAX call.
  // See also: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  let requestURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'


  fetch(requestURL)
    .then(function(response) {
      return response.json(); // this handles the JSON parse
    })
    .then(function(data) {
      console.log(data);
      mapdata(map, data);
    })
    .catch(function(error) {
      console.error('Error: ', error);
    });

};

function mapdata(map, data) {
  // Creates a GeoJSON layer on the map
  // See also: https://leafletjs.com/reference.html#geojson
  //geoJSON to CircleMarker As inspired by: https://stackoverflow.com/questions/25364072/how-to-use-circle-markers-with-leaflet-tilelayer-geojson
  //inspiration for cirlce marker https://stackoverflow.com/questions/43015854/large-dataset-of-markers-or-dots-in-leaflet
  var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};
  let geolayer = L.geoJSON(data, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, geojsonMarkerOptions);
  },
    onEachFeature: function (feature, layer) {
      layer.bindPopup("<h1>" + feature.properties.place + "</h1><p>Magnitude: " + feature.properties.mag + "</p>"+"<p>Depth:"+feature.geometry.coordinates[2]+" km</p>");
    },
  }).addTo(map);


    function test(geolayer){
      // Get the array of layers that make up the GeoJSON layer
      // We can call this method because a GeoJSON layer inherits everything from a LayerGroup
      // See also: https://leafletjs.com/reference.html#layergroup
      let layers = geolayer.getLayers();
     
      //now need to for loop through CURRENT markers
      for(let i = 0; i < layers.length; i++) {
        let marker = layers[i];
        let feature = layers[i].feature; // get the feature data from the layer
    
        // Only include the magnitude of this marker 
        // if the marker is in view of the map.
        // https://stackoverflow.com/questions/35655876/leaflet-detect-when-marker-is-out-of-view/35656174
        //table creation based on https://www.codeproject.com/Articles/1036671/Creating-HTML-Tables-with-JavaScript-DOM-Methods
        if(map.getBounds().contains(marker.getLatLng())) {
            console.log('marker in bounds')
        }
      }
      //depending on the function you may need to call it outside of event so that it will work onload as event would not have fired yet
      test(geolayer);

      }
  // Update some info when the map is moved or zoomed
  map.on("zoomend moveend", function (event) {
    var bounds = event.target.getBounds();
    console.log("mapevent", event.type, "bounds", bounds);

    test(geolayer);
    
   
  });



}



`
