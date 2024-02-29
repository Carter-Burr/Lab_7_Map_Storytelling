
// 1. Declare the maps, script panels, and different thematic layers.
let map, scriptPanel = scrollama(), stateLayer, countyLayer;

// 2. Intialize the layout.

history.scrollRestoration = "manual"; // make sure the geo-narrative will be scrolled to the cover page even after a page refresh.
window.scrollTo(0, 0); // scroll the geo-narrative to the coverpage
adjustStoryboardlSize(); // force a browser window resize.
window.addEventListener("resize", adjustStoryboardlSize); // // ask the browser window listen to the resize event, thereby force a viewport resize whenever adjusting the window size.

// 3. Define Generic window resize listener event
function adjustStoryboardlSize() {

  const scenes = document.getElementsByClassName("scene");
  const storyboard = document.getElementById("storyboard");

  // 3.1 determine the height of each scene element
  let sceneH = Math.floor(window.innerHeight * 0.75);
  for (const scene of scenes) {
    scene.style.height = sceneH + "px";
  }
  
  // 3.2 determin the height of the storyboard.
  let storyboardHeight = window.innerHeight;
  let storyboardMarginTop = (window.innerHeight - storyboardHeight) / 2;

  storyboard.style.height = storyboardHeight + "px";
  storyboard.style.top = storyboardMarginTop + "px"

  // 3.3 tell scrollama/script panel to update new element dimensions
  scriptPanel.resize();
}

// 4. Initialize the mapbox
mapboxgl.accessToken =
  'pk.eyJ1IjoiY2FydGIyMCIsImEiOiJjbG9vdTlka2gwMXZlMnJwdHhkZGJ5ZHZsIn0.pe21frQ6A_Q5QZjbW9JfbA'; // Assign the access token

map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/light-v10',
  zoom: 7, // starting zoom
  minZoom: 3,
  maxZoom: 10,
  center: [-122.25, 47.63], // starting center
  scrollZoom: false,
  boxZoom: false,
  doubleClickZoom: false
});  // Declare the map object

// An alternative way to disable map zoom when using scroll
// map.scrollZoom.disable();


// 5. define the asynchronous function to load geojson data and then performs the dependent actions.
async function geojsonFetch() {

  // 6 wait till the data of washington state and county are fully loaded.
  let response, state, county;
  response = await fetch("assets/stadiums.json");
  stadium = await response.json();
  response = await fetch("assets/States_Played.json");
  state = await response.json();


  // 7. Trigger operations inside of the the ()=> {} funciton while loading the map.
  map.on('load', () => {

    // 8. add map source and declare layers.
    map.addSource('stadiums', {
      type: 'geojson',
      data: stadium
    });


    map.addSource('states', {
      type: 'geojson',
      data: state
    });

    stadiumPoints = {
      'id': 'stadium-points',
      'type': 'circle',
      'source': 'stadiums',
      'paint': {
          'circle-radius': 10,
          'circle-color': 'purple'
        }
    }

    stateLayer = {
      'id': 'state-polygons',
      'type': 'fill',
      'source': 'states',
      'minzoom': 2,
      'paint': {
        'fill-color': [
          'match',
          ['get', 'played'],
          1, 'gray',  // If 'played' is 1, color it gray
          2, 'purple',  // If 'played' is 2, color it purple
          'transparent'  // Default color
        ],
        'fill-opacity': 0.5
      }
    }

    // 9. Initialize the script panel
    scriptPanel
      .setup({
        step: ".scene", // all the scenes.
        offset: 0.33, // the location of the enter and exit trigger
        debug: false // toggler on or off the debug mode.
      })
      .onStepEnter(handleSceneEnter)
      .onStepExit(handleSceneExit);
    
    // 10. This function performs when a scene enters the storyboard
    function handleSceneEnter(response) {

      var index = response.index; // capture the id of the current scene. 

      if (index === 0) { // When enter the first scene

        map.flyTo({
          center: [-122.55, 47.63],
          zoom: 10,
          pitch: 0,
          speed: 0.5
        }); // fly to a new location

        if (typeof (map.getSource('stadiums')) == 'undefined') { //if the map source 'state-src' does not exist
          map.addSource('stadiums', {
            type: 'geojson',
            data: stadium
          }); // reload the map source of 'state-src'
        } else {
          map.getSource('stadiums').setData(stadium); // if the map source does not exist, relaod the data state to the pre-defined map source 'state-src'.

        }

        if (!map.getLayer("stadium-points")) { // if the map layer 'state-polygons' does not exit
          map.addLayer(stadiumPoints);
        }
        
        document.getElementById("cover").style.visibility = "hidden"; // Hide the cover page

      } else if (index === 1) { // When enter the second scene.
        map.flyTo({
          center: [-115.28, 36.09],
          zoom: 9,
          pitch: 60,
          speed: 0.5

        });

      } else if (index === 2) {
        //Relocate to Seattle
        map.flyTo({
          center: [-90.2, 29.9511291309622],
          zoom: 10,
          pitch: 0,
          speed: 0.5

        });

      } else if (index === 3) {
        //Relocate to Portland
        map.flyTo({
          center: [-95.5, 29.68],
          zoom: 12,
          pitch: 20,
          speed: 0.5

        });
        
// change the base map
      } else if (index === 4) {
        //Relocate to Portland
        map.flyTo({
          center: [-109.5, 40.68],
          zoom: 3.5,
          pitch: 20,
          speed: 0.5

        });
        map.removeLayer("stadium-points");

        if (typeof (map.getSource('states')) == 'undefined') { //if the map source 'state-src' does not exist
          map.addSource('states', {
            type: 'geojson',
            data: state
          }); // reload the map source of 'state-src'
        } else {
          map.getSource('states').setData(state); // if the map source does not exist, relaod the data state to the pre-defined map source 'state-src'.

        }

        if (!map.getLayer("state-polygons")) { // if the map layer 'state-polygons' does not exit
          map.addLayer(stateLayer);
        }



      }
// change the
    }

    // 11. This function performs when a scene exists the storyboard
    function handleSceneExit(response) {
      var index = response.index;

      if (index === 0) {
        if (response.direction == 'down') { 
          document.getElementById("cover").style.visibility = "hidden"; // when you scroll down, the cover page will be hided.
        } else {
          document.getElementById("cover").style.visibility = "visible"; // when you scroll up, the cover page will be shown.
        }
      } else if (index === 1) {
        
      } else if (index === 2) {
        
      } else if (index === 3) {
      
      } else if (index === 4) {

        if (response.direction == 'up') { 
          map.removeLayer("state-polygons");
          if (typeof (map.getSource('stadiums')) == 'undefined') { //if the map source 'state-src' does not exist
          map.addSource('stadiums', {
            type: 'geojson',
            data: stadium
          }); // reload the map source of 'state-src'
        } else {
          map.getSource('stadiums').setData(stadium); // if the map source does not exist, relaod the data state to the pre-defined map source 'state-src'.

        }

        if (!map.getLayer("stadium-points")) { // if the map layer 'state-polygons' does not exit
          map.addLayer(stadiumPoints);
        }
        }

      } 
    }


  });


};

// 5 call the data loading function.
geojsonFetch();
