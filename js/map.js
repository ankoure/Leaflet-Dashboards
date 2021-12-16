"use strict";
window.onload = function () {
  leafletmap();
};

function leafletmap() {
  let zoomLevel = 4;
  let centerpoint = [37.693058942425786, -97.32539007099342];
  let map = L.map("map_container",{
    preferCanvas: true
  }).setView(centerpoint, zoomLevel);
  let attributionHtml = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  // create tile layer with attribution
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: attributionHtml }).addTo(map);

  // Request JSON data via AJAX.
  // Uses the browser's modern Fetch API to do the AJAX call.
  // See also: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  //let requestURL = "./js/reduced_earthquakes2.geojson";
  //all month
  //let requestURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';
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

   //gets and sets magnitude div
   //currently works but need to 'clear' out old magnitude before appending 
   function magnitudecounter(text){
      let magnitudediv = document.getElementById('magnitude');
      magnitudediv.innerHTML = "";
      let newtext = document.createTextNode(text);
      magnitudediv.appendChild(newtext);
    }

    function tablecreator(geolayer){
      // Get the array of layers that make up the GeoJSON layer
      // We can call this method because a GeoJSON layer inherits everything from a LayerGroup
      // See also: https://leafletjs.com/reference.html#layergroup
      let layers = geolayer.getLayers();
      let tablediv = document.getElementById("table");
      tablediv.innerHTML = "";

      const table = document.createElement('table');
      let counter = 0;
    

 
      //now need to for loop through CURRENT markers
      for(let i = 0; i < layers.length; i++) {
        let marker = layers[i];
        let feature = layers[i].feature; // get the feature data from the layer
        let rowEl = null;
        
  
        
        // Only include the magnitude of this marker 
        // if the marker is in view of the map.
        // https://stackoverflow.com/questions/35655876/leaflet-detect-when-marker-is-out-of-view/35656174
        //table creation based on https://www.codeproject.com/Articles/1036671/Creating-HTML-Tables-with-JavaScript-DOM-Methods
        if(map.getBounds().contains(marker.getLatLng())) {
          if(counter == 0 ){
          rowEl = table.insertRow();
          rowEl.insertCell().textContent = 'Location Name' ;      
          rowEl.insertCell().textContent = 'Magnitude' ;
          rowEl.insertCell().textContent = 'Depth (Km)';
          counter++;
          console.log('0 index')
          }else{
          //instead of using sum now create table
          rowEl = table.insertRow();  // DOM method for creating table rows
          // rowEl.insertCell().textContent = "table cell "+ i +"-1" ;      
          // rowEl.insertCell().textContent = "table cell "+ i +"-2" ; 
          rowEl.insertCell().textContent = feature.properties.place ;      
          rowEl.insertCell().textContent = feature.properties.mag ;
          rowEl.insertCell().textContent = feature.geometry.coordinates[2];
          }
         
        }
      }
      tablediv.appendChild(table);






      }
      tablecreator(geolayer);


    
    

  // Update some info when the map is moved or zoomed
  map.on("zoomend moveend", function (event) {
    var bounds = event.target.getBounds();
    console.log("mapevent", event.type, "bounds", bounds);
    
    let avgMagnitude = calcmagnitudes(map, geolayer);
    console.log("recalculated avg magnitude:", avgMagnitude);
    magnitudecounter(parseFloat(avgMagnitude).toFixed(2));
    tablecreator(geolayer);
    
   
  });

  // Calculate initial info with the default map view (before any movements or zooms)
  let initialAvgMagnitude = calcmagnitudes(map, geolayer);
  console.log("calculated initial avg magnitude:", initialAvgMagnitude);
  magnitudecounter(parseFloat(initialAvgMagnitude).toFixed(2));


}


function calcmagnitudes(map, geolayer) {
  // Get the array of layers that make up the GeoJSON layer
  // We can call this method because a GeoJSON layer inherits everything from a LayerGroup
  // See also: https://leafletjs.com/reference.html#layergroup
  let layers = geolayer.getLayers(); 
 

  // For computing the average magnitude
  let sum = 0;
  let count = 0;
  let avg = 0;

  // Iterate over each layer (marker) on the map
  for(let i = 0; i < layers.length; i++) {
    let marker = layers[i];
    let feature = layers[i].feature; // get the feature data from the layer
    
    // Only include the magnitude of this marker 
    // if the marker is in view of the map.
    // https://stackoverflow.com/questions/35655876/leaflet-detect-when-marker-is-out-of-view/35656174
    if(map.getBounds().contains(marker.getLatLng())) {
      sum += feature.properties.mag;
      count++;
    }
  }

  // Compute the average and return it 
  if(count == 0) {
    avg = 0;
  } else {
    avg = sum / count;
  }
  console.log(`calcmagnitudes sum: ${sum} count: ${count} avg: ${avg}`);

  return avg;
}
