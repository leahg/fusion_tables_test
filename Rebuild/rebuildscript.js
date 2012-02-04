

  //old var
  var gmarkers, eatLayer, visitLayer, experienceLayer, FTresponse, geocoder;
  var infoWindow;
  var query = "";
  var Marker_TableID = '2441665';
  var info = null;

  // == mapstyle =================================== //

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


//new query
function createSidebar() {
var queryText = encodeURIComponent("SELECT 'Title', 'Name', 'Lat', 'Description', 'Type' FROM " + Marker_TableID );
  var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + queryText);

  var type_queryText = encodeURIComponent("SELECT 'Type' FROM " + Marker_TableID);
  var type_query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + type_queryText);
     query.send(getData);
}

google.setOnLoadCallback(createSidebar);



function getData(response) {

    FTresponse = response;
    var dt = response.getDataTable();  

    var side_html = '<table id="sidebartable"> \
                       <thead> \
                         <tr> \
                         </tr> \
                       </thead> \
                       <tbody>';

    for (var i = 0; i < dt.getNumberOfRows(); i++) {
      var description = dt.getValue(i,3);
      var latlng= dt.getValue(i,2);
      var title = dt.getValue(i,0);
      var name = dt.getValue(i,1);
      var type = dt.getValue(i, 4);

      var pt = new google.maps.LatLng(latlng);
    
      var newString = "";

      var description_split = description.split("");
      var limit = 70;
      for (var j = 0; j < limit; j++) {
        //console.log("typeof:" + typeof(description_split[j]));
        if (description_split[j]) {
          newString += description_split[j];
          /* existence check */
          //console.log("--- exists ---");
          //console.log("typeof:" + typeof(description_split[j]));
          //console.log(description_split[j].length);
          //console.log(description_split[j]);
        }
      }


      side_html += '<tr> \
                      <td style="padding-top: 5px"><a href="javascript:myFTclick(' + i + ')">' + title + '</a><hr></td> \
                    </tr> \
                    <tr> \
                      <td style="padding-left: 5px; line-height: 80%">By: ' + name + '</td> \
                    </tr> \
                    <tr> \
                      <td style="padding-left: 5px" id="myTD">Description: ' + newString + '...</td> \
                    </tr> \
                    <tr> \
                      <td style="padding-left: 5px; padding-bottom:5px; line-height: 80%">Type: ' + type + ' </td> \
                    </tr>';
    }
    side_html += '</tbody> \
                </table>';

    document.getElementById("sidebar").innerHTML = side_html; 

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



function openFtInfoWindow(position, title, name, description, type) {
     // Set up and create the infowindow
     console.log('moo');
     if (!infoWindow) infoWindow = new google.maps.InfoWindow();
     var content = '<div class="FT_infowindow" style="font-size: 11px">' +
     '<strong>'+title+'</strong>'+
     '<br><strong>By: </strong>'+name+
     '<br><strong>Description: </strong>'+description+
     '<br><strong>Type: </strong>'+type+
     '</div>';

     infoWindow.setOptions({
       content: content,
       pixelOffset: null,
       position: position,
       
     });

     // Infowindow-opening event handler
     infoWindow.open(map);

     //map.trigger(position, name, description);
}

function myFTclick(row) {
  //console.log( FTresponse );
  if (row) {
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

;(function($) {

  //new var
  var map, FTresponse, geocoder;
  var $mapCanvas;
  var $sidebar = $('#sidebar');
  var $typecontrols = $('.field-settype');
  var info_window;
  var query = "";
  var info = null;
  var Marker_TableID = '2441665';
  var mrkr_array = [];
  var gmarkers = [];
  var global_suppressInfoWindows = true;
  var sidebarEnabled = true;
  var descCharLimit = 40;

  var DEBUG = true;

  // == MAP SETTINGS =================================== //

  //var latlng = new google.maps.LatLng(31.22, 29.85);
  var latlng = new google.maps.LatLng(31.241572, 29.982376);
  var defaults = {
    center: latlng,
    zoom: 11,
    streetViewControl: false,
    mapTypeControl: false,
    zoomControl: true,
    zoomControlOptions:{
        style: google.maps.ZoomControlStyle.SMALL,
        position: google.maps.ControlPosition.LEFT_CENTER
    },
    scaleControl: false,
    panControl: false,
    styles: alexMapStyle,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  // == DEFAULT QUERY =================================== //

  var queryText = encodeURIComponent("SELECT 'Title', 'Name', 'Lat', 'Description', 'Type' FROM " + Marker_TableID );
  var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + queryText);

  var type_queryText = encodeURIComponent("SELECT 'Type' FROM " + Marker_TableID);
  var type_query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + type_queryText);


  // == FUNCTIONS: NOM =================================== //
  
  //set infowindow 
  function windowControl(e) {
    info_window.setOptions({
      content: e.infoWindowHtml,
      position: e.latLng,
      pixelOffset: e.pixelOffset
    });
    info_window.open(map);
  }


  function getData(response) {

    if (!response) {
      alert('no response');
      return false;
    }

    if (response.isError()) {
      alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
      return false;
    }

    var FTresponse = response;

    $sidebar.trigger('loadLayer', [response]);
    
    $mapCanvas.height($sidebar.height());

  } // End getData

  function typeControlsData(response) {

    if (!response) {
      alert('no response');
      return false;
    }

    if (response.isError()) {
      alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
      return false;
    }

    $typecontrols.trigger('loadLayer', [response]);

  }

  // == MAP INIT =================================== //

  $mapCanvas = $('#map_canvas');

  var htmlTypeContent = ['<ul>'];

  // clear marker windows button - not working
  $sidebar.find('.clearmarkers').bind('click', function(e) {
    e.preventDefault();
    $mapCanvas.gmap('clear', 'markers');
  });

  // typecontrols - gets type from query, adds checkboxes, creates active and hide classes
  $typecontrols.bind('loadLayer', function(e, response) {
    var $this = $(this),
        _res = response;
        _tbl = _res.getDataTable(),
        _row_count = _tbl.getNumberOfRows();
    var type;

    if ( DEBUG ) {
      console.log( typeof( _tbl ) );
      console.log( _tbl );
    }

    if ( $this.find('input').length === 0 ) {
      for (var i = 0; i < _row_count; i++) {
        type = _tbl.getValue(i, 0);
        if ( $this.find('input.'+type).length === 0 )
          $this.append('<input type="checkbox" value="'+type+'" name="type" class="checkbox '+type+' active" id="type-'+type+'" checked="checked" /> \
          <label for="type-'+type+'" class="active">'+type+'</label>');
      }
    }
  });

  //associates checkbox status w hide and active classes
  $('input.checkbox').live('change', function(e) {
    var $this = $(this),
        type = $this.val();

    if ( DEBUG ) {
      console.log( $sidebar.find('.'+type).length );
    }
    
    if ( ! $this.attr('checked') ) {
      $this.next().removeClass('active');
      $sidebar.find('.'+type).parent().parent().addClass('hide');
    } else {
      // the label
      $this.next().addClass('active');
      $sidebar.find('.'+type).parent().parent().removeClass('hide');
    }

    $sidebar.find('.'+type).siblings().removeClass('active');
    if ( ! $sidebar.find('.'+type).hasClass('active') )
      $sidebar.find('.'+type).parent().parent().addClass('active');
  });

  // sidebar - finds data from query
  $sidebar.bind('loadLayer', function(e, response) {
    var $this = $(this);
    var _res = response;
    var _tbl = _res.getDataTable();
    var _row_count = _tbl.getNumberOfRows();
    var _col_count = _tbl.getNumberOfColumns();
    var _col_label = _tbl.getColumnLabel(0);
    var name, pt, desc, type;
    var htmlSidebarContent = [];

    htmlSidebarContent[0] = "<ul>";

    for (var i = 0; i < _row_count; i++) {
      var id = i;
      title = _tbl.getValue(i, 0);
      name = _tbl.getValue(i, 1);
      pt = _tbl.getValue(i, 2),
          lat = pt.split(',')[0],
          lng = pt.split(',')[1];
      var latLng = new google.maps.LatLng(lat, lng);
      // setting character limit
      desc = _tbl.getValue(i, 3).substr(0, descCharLimit) + " ...";
      type = _tbl.getValue(i, 4);
      var sidebarContent = "";

      //adds marker from query data
      //$mapCanvas.gmap('addMarker', { 'position': pt, 'bounds': true }, function(map, marker) {

        // sidebar content
        var sidebarContent = "<li><h2><a data-markerid='"+id+"' class='"+type+"' rel='"+pt+"' href='#markerid-"+id+"'>"+name+"</a></h2><p>"+desc+"</p><div class='type'>"+type+"</div><div class='latlng'>"+pt+"</div></li>";
        htmlSidebarContent[(i+1)] = sidebarContent;
        
        // html info window content
        var htmlInfoWindowContent = "<h2 class='tooltip-header'>"+name+"</h2><p class='tooltip-desc'>"+desc+"</p>";

        // new marker
        var new_marker = new google.maps.Marker({
          content: htmlInfoWindowContent,
          position: latLng,
          map: map  
        });

        // add marker to global list
        gmarkers.push(new_marker);
        
        //only allows single infowindow to open
        if ( sidebarEnabled ) {
          
          $mapCanvas.gmap('addMarker', { 'position': pt, 'bounds': true } ).click(function(e) {
            $mapCanvas.gmap('openInfoWindow', { 'content': htmlInfoWindowContent }, this);
          });
          // add a tool tip window instead of just activate
            $(new_marker).click(function(e) {
              //iw.open(map, new_marker);
              $mapCanvas.gmap('openInfoWindow', { 'content': htmlInfoWindowContent }, this);
              //$('.tooltip-header').trigger('load_scaffolding');
            });

        } else {

          // activate a tool tip window instead of add
          $mapCanvas.gmap('addMarker', { 'position': pt, 'bounds': true } ).click(function(e) {
            $mapCanvas.gmap('openInfoWindow', { 'content': htmlInfoWindowContent }, this);
          });

        }


      //});

      //htmlSidebarContent[-1] = "</ul>";
      htmlSidebarContent[(htmlSidebarContent.length+1)] = "</ul>";

      $sidebar.find('.inner').html(htmlSidebarContent.join(""));

    }

    /*
      mod
    */

    //binds link in sidebar to infowindow
    $this.find('#sidebar .mod-type-selector .inner a').live('click.loadInfoWindow', function(e) {
      e.preventDefault();
      var $this = $(this),
          marker_id = parseInt($this.data("markerid")),
          pt = $this.attr('rel');

      $this.parent().parent().siblings().removeClass('active');
      $this.parent().parent().siblings().find('a.active').removeClass('active');
      if ( ! $this.hasClass('active') ) {
        $this.parent().parent().addClass('active');
        $this.addClass('active');
      }

      if (gmarkers[marker_id]) {
        if ( DEBUG ) {
          console.log(marker_id);
        }

        google.maps.event.trigger(gmarkers[marker_id], 'click');

        //$('.tooltip-header').trigger('load_scaffolding');
      }
      
    });

  });

  $('.tooltip-header').bind('load_scaffolding', function(e) {

    $(this).each(function(e) {
    
      var $this = $(this);
          $tt_lining = $this.parent(),
          $tt_inner = $tt_lining.parent(),
          $tt_container = $tt_lining.parent();

      $tt_container.addClass('mod');

    });

  });
  
  $mapCanvas.gmap(defaults).bind('init', function(e, map) {
   
    // info_window 

    info_window = new google.maps.InfoWindow();

    query.send(getData);
    type_query.send(typeControlsData);

  });

  // == TEST CALL =================================== //

  //console.log( query.send(getDataDiag) );


})(jQuery);


