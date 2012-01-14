var map, gmarkers, eatLayer, visitLayer, experienceLayer, FTresponse, geocoder;
var infoWindow;
var query = "";
var info = null;
var Marker_TableID = 2441665;

function initialize() {
    var latlng = new google.maps.LatLng(31.241572, 29.982376);
    var myOptions = {
        singleInfoWindow: false,
        zoom: 11,
        streetViewControl: false,
        zoomControl: true,
        zoomControlOptions:{
            style: google.maps.ZoomControlStyle.SMALL,
            position: google.maps.ControlPosition.LEFT_CENTER
        },
        scaleControl: false,
        panControl: false,
        mapTypeControl: false,
        center: latlng,
        styles: alexMapStyle,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"),
        myOptions);

    eatLayer = new google.maps.FusionTablesLayer(Marker_TableID, {
      suppressInfoWindows: true });

    //console.log(eatLayer);
    eatLayer.setQuery("SELECT Lat FROM " + Marker_TableID + " WHERE Type LIKE 'Eat'");
    eatLayer.setMap(map);
    addClickHandler(eatLayer);

    experienceLayer = new google.maps.FusionTablesLayer(Marker_TableID, {
      suppressInfoWindows: true });
    experienceLayer.setQuery("SELECT Lat FROM " + Marker_TableID + " WHERE Type LIKE 'Experience'");
    experienceLayer.setMap(map);
    addClickHandler(experienceLayer);

    visitLayer = new google.maps.FusionTablesLayer(Marker_TableID, {
      suppressInfoWindows: true });
    visitLayer.setQuery("SELECT Lat FROM " + Marker_TableID + " WHERE Type LIKE 'Visit'");
    visitLayer.setMap(map);
    addClickHandler(visitLayer);


    infoWindow = new google.maps.InfoWindow();
    geocoder = new google.maps.Geocoder();

  //$('body').data('map', map);
}


function toggleLayer(checkbox, layer) {

    var $sidebar = $("#sidebar"),
        $info_window = $(".googft-info-window");

    //console.log( $info_window );
    var className = $(checkbox).next().text();

    if (checkbox.checked) {
        //console.log( $sidebar.find('.'+className) );
        $sidebar.find('.'+className).removeClass('hide');
        $info_window.removeClass('hide');
        layer.setMap(map);
    } else {
        $sidebar.find('.'+className).addClass('hide');
        $info_window.addClass('hide');
        layer.setMap(null);
    }

}





var alexMapStyle = [
  {
    featureType: "landscape.natural",
    stylers: [
      { hue: "#ffcc00" },
      { saturation: 68 },
      { gamma: 0.48 },
      { lightness: 32 }
    ]
  },{
  },{
    featureType: "road.local",
    elementType: "geometry",
    stylers: [
      { hue: "#ffdd00" },
      { gamma: 0.65 },
      { saturation: 39 },
      { lightness: -15 }
    ]
  },{
  },{
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [
      { hue: "#ffdd00" },
      { gamma: 0.41 },
      { saturation: -35 },
      { lightness: 34 }
    ]
  },{
    featureType: "road.highway",
    stylers: [
      { hue: "#ffdd00" },
      { gamma: 0.66 },
      { lightness: 1 },
      { saturation: -39 }
    ]
  },{
    featureType: "landscape.man_made",
    elementType: "geometry",
    stylers: [
      { hue: "#ffc300" },
      { saturation: 55 },
      { lightness: -43 }
    ]
  },{
    featureType: "poi",
    elementType: "geometry",
    stylers: [
      { hue: "#ffc300" },
      { lightness: -55 },
      { saturation: 75 }
    ]
  },{
    featureType: "transit",
    elementType: "labels",
    stylers: [
      { hue: "#ff4d00" }
    ]
  },{
    featureType: "water",
    stylers: [
      { hue: "#0000ff" },
      { saturation: -95 },
      { lightness: -8 }
    ]
  }
];

google.load('visualization', '1', {'packages':['corechart', 'table', 'geomap']});

function createSidebar() {
    // https://www.google.com/fusiontables/api/query?sql=SELECT%20ROWID,%20%2A%20FROM%20564705
    //set the query using the parameter
    // var queryText = encodeURIComponent("http://www.google.com/fusiontables/gvizdata?tq=SELECT * FROM FT_TableID");
    // var query = new google.visualization.Query(queryText);
    var queryText = new Array();
        queryText[0] = encodeURIComponent("SELECT 'Title', 'Name', 'Lat', 'Description', 'Type' FROM " + Marker_TableID );
     
    var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + queryText[0]);
    //set the callback function
    query.send(getData);
}

google.setOnLoadCallback(createSidebar);


function getData(response) {
    if (!response) {
        alert('no response');
        return;
    }

    if (response.isError()) {
        alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return;
    }

    FTresponse = response;
  //for more information on the response object, see the documentation
  //http://code.google.com/apis/visualization/documentation/reference.html#QueryResponse
  numRows = response.getDataTable().getNumberOfRows();
  numCols = response.getDataTable().getNumberOfColumns();
  var classAttr = "class";

  //concatenate the results into a string, you can build a table here
  fusiontabledata = "<table class='" + classAttr + "'><tr>";
//  for(i = 0; i < numCols; i++) {
    fusiontabledata += "<th>" + response.getDataTable().getColumnLabel(0) + "</th>";
//   }
  fusiontabledata += "</tr><tr>";

  //FT_infowindow
  for(i = 0; i < numRows; i++) {
//    for(j = 0; j < numCols; j++) {
      fusiontabledata += "<td class="+response.getDataTable().getValue(i, 3)+"><a href='javascript:myFTclick("+i+")'>"+response.getDataTable().getValue(i, 0) + "</a></td>";
//    }
    fusiontabledata += "</tr><tr>";
  }
  fusiontabledata += "</table>"  

  //display the results on the page
  document.getElementById('content').innerHTML = fusiontabledata;
}


function openInfoWindowGeocoded(address, title, name, description, type) {
    if(geocoder) {
        geocoder.geocode({ 'address': address}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {
                    map.setCenter(results[0].geometry.location);
                    openFtInfoWindow(results[0].geometry.location, title, name, description, lat, type);
                } else {
                    alert("No results found");
                }
            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });
    }
}

/*
function openFtInfoWindow(position, title, name, description, type) {
     // Set up and create the infowindow
     if (!infoWindow) infoWindow = new google.maps.InfoWindow();
     var content = '<div class="FT_infowindow">' + title;
     if (description)  content += '<br>'+name +'<br>'+description +'<br>'+type;

     infoWindow.setOptions({
       content: content,
       pixelOffset: null,
       position: position
     });

     // Infowindow-opening event handler
     infoWindow.open(map);

     //map.trigger(position, name, description);
}
*/

function openFtInfoWindow(position, title, name, description, type) {
     // Set up and create the infowindow
     if (!infoWindow) infoWindow = new google.maps.InfoWindow();
     var content = '<div class="FT_infowindow">' +
     '<strong>Title: </strong>'+title+
     '<br><strong>From: </strong>'+name+
     '<br><strong>Description: </strong>'+description+
     '<br><strong>Type: </strong>'+type+
     '</div>';

     infoWindow.setOptions({
       content: content,
       pixelOffset: null,
       position: position,
       maxWidth: 150
     });

     // Infowindow-opening event handler
     infoWindow.open(map);

     //map.trigger(position, name, description);
}

function myFTclick(row) {
   var title = FTresponse.getDataTable().getValue(row,0);
   var name = FTresponse.getDataTable().getValue(row,1);
   var description = FTresponse.getDataTable().getValue(row,3);
   var latlng =  FTresponse.getDataTable().getValue(row,2);
   var type = FTresponse.getDataTable().getValue(row,4);
  //console.log( google.maps.Markers );
  //console.log( map.b.children );
  //console.log(map.markers)

   if (latlng.indexOf("<") === -1) {
     var coords = latlng.split(',');
     var lat = parseFloat(coords[0]);
     var lng = parseFloat(coords[1]);

     if (isNaN(lat) || isNaN(lng)) {
       // assume address, send to geocoder
       openInfoWindowGeocoded(latlng, title, name, description, type);
     }

     var position = new google.maps.LatLng(lat,lng);
     openFtInfoWindow(position, title, name, description, type);
   }
}


function addClickHandler(FTLayer) {
    google.maps.event.addListener(FTLayer, "click", function(event) {
        console.log(FTLayer);
        if (infoWindow) infoWindow.close();
        infoWindow.setOptions({pixelOffset:null,
            content:event.infoWindowHtml,
            position:event.latLng
        });
        infoWindow.open(map);
    });
}


;(function($){
  
  var mapThing = {

    toggleLayer: function() {
      $('checkbox').bind('change', function(e) {
        var $elem = $(this);
        //console.log( $elem.attr('checked') );
        /*
        var latlng = new google.maps.LatLng(31.22, 29.85);
        var myOptions = {
            zoom: 11,
            streetViewControl: false,
            zoomControl: true,
            zoomControlOptions:{
                style: google.maps.ZoomControlStyle.DEFAULT,
                position: google.maps.ControlPosition.LEFT_CENTER
            },
            scaleControl: false,
            panControl: false,
            center: latlng,
            styles: alexMapStyle,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map($("#map_canvas"),
            myOptions);
        */
        //var visitLayer = new google.maps.FusionTablesLayer(Marker_TableID, {
        //  suppressInfoWindows: true
        //});
        //visitLayer.setQuery("SELECT Lat FROM " + Marker_TableID + " WHERE Type LIKE 'Visit'");
        //visitLayer.setMap(map);
        //console.log(visitLayer);
        //console.log($('body').data('map'));
        toggleLayer($elem, visitLayer);
      });
    },

    init: function() {
      
      this.toggleLayer();

      //initialize();
    }

  };

  mapThing.init();

})(jQuery);


