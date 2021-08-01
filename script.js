mapboxgl.accessToken = 'pk.eyJ1IjoiYm9iLXVzZXIiLCJhIjoiY2tycDM0MjE4MGZsejJ1bXcwczNka3hnNSJ9.JlXSoboCjRDRyUaoHDeUSw';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-73.97, 40.6453531],
    zoom: 11,
});
var theme = document.getElementById("menu");
var inputs = theme.getElementsByTagName('input');

async function getInspectionData() {
  var datas = await fetch('https://data.cityofnewyork.us/resource/jzhd-m6uv.json');
  return datas;
}

getInspectionData().then((data) => data.json())
.then((res) => {
  console.log(res);
  var mapArrLoc = []

  function switchTheme(currentTheme) {
    currentTheme.preventDefault();
    var themeId = currentTheme.target.id;
    map.setStyle('mapbox://styles/mapbox/' + themeId);
  }
  for(let j = 0; j < inputs.length; j++) {
    inputs[j].onclick = switchTheme;
  }

  function addSource() {
    map.addSource('points', {
      'type': 'geojson',
      'data': {
        'type': 'FeatureCollection',
        'features': mapArrLoc 
  
      } 
    }); 
  }
  function addLayer() {
    map.addLayer({
      'id': 'points',
      'type': 'symbol',
      'source': 'points',
      'layout': {
        'icon-image': 'custom-marker',
        'text-field': ['get', 'title'],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-offset': [0, 1.25],
        'text-anchor': 'top'
      }
    }); //end add layer
  }

  function mapLocationsPoints() {
    map.on('style.load', () => {
      map.loadImage(
        'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
        (error, image) => {
          if(error) {
            console.error(error);
          }
          map.addImage('custom-marker', image);
          addSource();
          addLayer();

          map.on('click', 'points', function(e) {
            var coords = e.features[0].geometry.coordinates.slice();
            var desc = e.features[0].properties.description;

            while(Math.abs(e.lngLat.lng - coords[0]) > 180) {
              coords[0] += e.lngLat.lng > coords[0] ? 360 : -360 
            }

            new mapboxgl.Popup().setLngLat(coords).setHTML(desc).addTo(map);

          });
          map.on("mouseover", "points", function() {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on("mouseout", "points", function() {
            map.getCanvas().style.cursor = '';
          });
        } 
      ); 
    }) 
  }  
  mapLocationsPoints();
  for(let i = 0; i < 1000; i++) {
    if(res[i].borough == "Brooklyn") {

      if(res[i].inspection_result == "Violation Issued" || res[i].inspection_result == "Warning") {
        var mapObj = {
          'type': 'feature',
          'geometry': {
            'type': 'Point',
            'coordinates': [res[i].longitude, res[i].latitude]
          },
          'properties': {
            'title': res[i].business_name,
            'description': `<b>${res[i].business_name}</b><br><b>${res[i].building_number}</b><hr><br><br><p>Inspection Result: ${res[i].inspection_result}</p><br>
              <p>Inspection Date: ${res[i].inspection_date}<br></p>
              <p>Industry: ${res[i].industry}</p>`
          }
        }
        
        mapArrLoc.push(mapObj);
        
      } 
    } 
  } 

})
.catch((error) => {
  console.error(error);
}); 