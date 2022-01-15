"use strict";
window.onload = function() {
    leafletmap();
};

function leafletmap() {
    let zoomLevel = 4;
    let centerpoint = [37.693058942425786, -97.32539007099342];
    let map = L.map("map_container", {
        preferCanvas: true,
        zoomControl: false
    }).setView(centerpoint, zoomLevel);
    let attributionHtml = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    // create tile layer with attribution
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: attributionHtml
    }).addTo(map);

    // Request JSON data via AJAX.
    // Uses the browser's modern Fetch API to do the AJAX call.
    // See also: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    let requestURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'
    fetch(requestURL)
        .then(function(response) {
            return response.json(); // this handles the JSON parse
        })
        .then(function(data) {
            //console.log(data);
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

    function getColor(mag) {
        let magnumber = parseFloat(mag);
        if(magnumber >= 0 && magnumber <= 1){
            return "#fff5f0";
        }else if(magnumber > 1 && magnumber <= 2){
            return "#fee0d2";
        }else if (magnumber <= 3 && magnumber > 2){
            return "#fcbba1";
        }else if(magnumber <= 4 && magnumber >3){
            return "#fc9272";
        }else if(magnumber <= 5 && magnumber >4){
            return "#fb6a4a";
        }else if(magnumber <= 6 && magnumber > 5){
            return "#ef3b2c";
        }else if(magnumber <= 7 && magnumber > 6){
            return "#cb181d";
        }else if(magnumber <= 8 && magnumber > 9){
            return "#a50f15";
        }else if(magnumber <= 9 && magnumber > 10){
            return "#67000d";
        }
        //https://stackoverflow.com/questions/44206050/leaflet-change-circle-marker-color-based-on-text-field


    //     switch (magnumber) {
    //       case magnumber >= 0 && magnumber <= 1:
    //         return  'orange';
    //         break;
    //       case magnumber > 1 || magnumber <= 2:
    //         return 'green';
    //         break;
    //       case magnumber <= 3 || magnumber > 2:
    //         return 'blue';
    //         break;
    //       case magnumber <= 4 && magnumber >3:
    //         return 'green';
    //         break;
    //       case magnumber <= 5 && magnumber >4:
    //           return 'yellow';
    //           break;
    //       case magnumber <= 6 && magnumber > 5:
    //         return 'blue';
    //         break;
    //       case magnumber <= 7 && magnumber > 6:
    //           return 'red';
    //           break;
    //       case magnumber <= 8 && magnumber > 9:
    //           return 'brown';
    //           break;
    //       case magnumber <= 9 && magnumber > 10:
    //           return 'black';
    //           break;
              
    //       default:
    //         //console.log(mag+" "+magnumber);
    //         return 'blue';
            
    //     }
      }


    let geolayer = L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {radius: 8, 
                fillOpacity: 1, 
                color: 'black', 
                fillColor: getColor(feature.properties.mag), 
                weight: 1});
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h1>" + feature.properties.place + "</h1><p>Magnitude: " + feature.properties.mag + "</p>" + "<p>Depth:" + feature.geometry.coordinates[2] + " km</p>");
        },
    }).addTo(map);

 

    //gets and sets magnitude div
    //currently works but need to 'clear' out old magnitude before appending 
    function magnitudecounter(text) {
        let magnitudediv = document.getElementById('magnitude');
        magnitudediv.innerHTML = "";
        let newtext = document.createTextNode(text);
        magnitudediv.appendChild(newtext);
    }

    function tablecreator(geolayer) {
        // Get the array of layers that make up the GeoJSON layer
        // We can call this method because a GeoJSON layer inherits everything from a LayerGroup
        // See also: https://leafletjs.com/reference.html#layergroup
        let layers = geolayer.getLayers();
        let tablediv = document.getElementById("table");
        tablediv.innerHTML = "";

        const table = document.createElement('table');
        let counter = 0;



        //now need to for loop through CURRENT markers
        for (let i = 0; i < layers.length; i++) {
            let marker = layers[i];
            let feature = layers[i].feature; // get the feature data from the layer
            let rowEl = null; //declares empty variable for row insertion

            // https://stackoverflow.com/questions/35655876/leaflet-detect-when-marker-is-out-of-view/35656174
            //table creation based on https://www.codeproject.com/Articles/1036671/Creating-HTML-Tables-with-JavaScript-DOM-Methods
            if (map.getBounds().contains(marker.getLatLng())) {
                if (counter == 0) {
                    //inserts title row for table, then increments counter variable so rest of data
                    rowEl = table.insertRow();
                    rowEl.insertCell().textContent = 'Location Name';
                    rowEl.insertCell().textContent = 'Magnitude';
                    rowEl.insertCell().textContent = 'Depth (Km)';
                    counter++;
                    //now need to insert current [i] or else it will be skipped
                    rowEl = table.insertRow(); // DOM method for creating table rows
                    rowEl.insertCell().textContent = feature.properties.place;
                    rowEl.insertCell().textContent = feature.properties.mag;
                    rowEl.insertCell().textContent = feature.geometry.coordinates[2];
                    rowEl.addEventListener('click', function(event) {
                        let centerpoint = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
                        map.setView(centerpoint, 9);
                        //would like to change style color to help users see which marker is being clicked
                        //code from https://gis.stackexchange.com/questions/350186/changing-circle-marker-color-in-leaflet
                        //this code works but need a delay then to set back to original color
                        //marker.setStyle({fillColor: 'green'});
                        //essentially need time delay here
                        //marker.setStyle({fillColor: '#ff7800'});

                    })
                } else {
                    //instead of using sum now create table
                    rowEl = table.insertRow(); // DOM method for creating table rows
                    rowEl.insertCell().textContent = feature.properties.place;
                    rowEl.insertCell().textContent = feature.properties.mag;
                    rowEl.insertCell().textContent = feature.geometry.coordinates[2];
                    rowEl.addEventListener('click', function(event) {
                        let centerpoint = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
                        map.setView(centerpoint, 9);
                    })
                }

            }
        }
        tablediv.appendChild(table);
    }
    tablecreator(geolayer);






    // Update some info when the map is moved or zoomed
    map.on("zoomend moveend", function(event) {
        var bounds = event.target.getBounds();
        //console.log("mapevent", event.type, "bounds", bounds);

        let avgMagnitude = calcmagnitudes(map, geolayer);
        //console.log("recalculated avg magnitude:", avgMagnitude);
        magnitudecounter(parseFloat(avgMagnitude).toFixed(2));
        tablecreator(geolayer);


    });

    //function to add home button to controls
    //https://gis.stackexchange.com/questions/127286/home-button-leaflet-map/127383
    zoomhome(map);


    // Calculate initial info with the default map view (before any movements or zooms)
    let initialAvgMagnitude = calcmagnitudes(map, geolayer);
    //console.log("calculated initial avg magnitude:", initialAvgMagnitude);
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
    for (let i = 0; i < layers.length; i++) {
        let marker = layers[i];
        let feature = layers[i].feature; // get the feature data from the layer

        // Only include the magnitude of this marker 
        // if the marker is in view of the map.
        // https://stackoverflow.com/questions/35655876/leaflet-detect-when-marker-is-out-of-view/35656174
        if (map.getBounds().contains(marker.getLatLng())) {
            sum += feature.properties.mag;
            count++;
        }
    }

    // Compute the average and return it 
    if (count == 0) {
        avg = 0;
    } else {
        avg = sum / count;
    }
    //console.log(`calcmagnitudes sum: ${sum} count: ${count} avg: ${avg}`);

    return avg;
}

function zoomhome(map){
    var lat = 37.706735542454176;
    var lng = -97.35340198995009;
    var zoom = 3;

    // custom zoom bar control that includes a Zoom Home function
    L.Control.zoomHome = L.Control.extend({
        options: {
            position: 'topright',
            zoomInText: '+',
            zoomInTitle: 'Zoom in',
            zoomOutText: '-',
            zoomOutTitle: 'Zoom out',
            zoomHomeText: '<i class="fa fa-home" style="line-height:1.65;"></i>',
            zoomHomeTitle: 'Zoom home'
        },

        onAdd: function (map) {
            var controlName = 'gin-control-zoom',
                container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
                options = this.options;

            this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle,
            controlName + '-in', container, this._zoomIn);
            this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle,
            controlName + '-home', container, this._zoomHome);
            this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
            controlName + '-out', container, this._zoomOut);

            this._updateDisabled();
            map.on('zoomend zoomlevelschange', this._updateDisabled, this);

            return container;
        },

        onRemove: function (map) {
            map.off('zoomend zoomlevelschange', this._updateDisabled, this);
        },

        _zoomIn: function (e) {
            this._map.zoomIn(e.shiftKey ? 3 : 1);
        },

        _zoomOut: function (e) {
            this._map.zoomOut(e.shiftKey ? 3 : 1);
        },

        _zoomHome: function (e) {
            map.setView([lat, lng], zoom);
        },

        _createButton: function (html, title, className, container, fn) {
            var link = L.DomUtil.create('a', className, container);
            link.innerHTML = html;
            link.href = '#';
            link.title = title;

            L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
                .on(link, 'click', L.DomEvent.stop)
                .on(link, 'click', fn, this)
                .on(link, 'click', this._refocusOnMap, this);

            return link;
        },

        _updateDisabled: function () {
            var map = this._map,
                className = 'leaflet-disabled';

            L.DomUtil.removeClass(this._zoomInButton, className);
            L.DomUtil.removeClass(this._zoomOutButton, className);

            if (map._zoom === map.getMinZoom()) {
                L.DomUtil.addClass(this._zoomOutButton, className);
            }
            if (map._zoom === map.getMaxZoom()) {
                L.DomUtil.addClass(this._zoomInButton, className);
            }
        }
    });
    // add the new control to the map
    var zoomHome = new L.Control.zoomHome();
    zoomHome.addTo(map);



}
