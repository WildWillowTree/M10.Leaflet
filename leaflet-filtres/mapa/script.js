var map = L.map('mapid').on('load', onMapLoad).setView([41.400, 2.206], 9);
map.locate({setView: true, maxZoom: 16});
	
var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map);

//en el clusters almaceno todos los markers
let markers = L.markerClusterGroup();
let data_markers = [], kind_array = [], food_options = [];
let i = 0, j = 0;
let newOption = new Option(), all = new Option();
let selector = document.querySelector("#kind_food_selector");
let marker = null;
let markersList = [];
let txt = "";
let img = new Image();


async function onMapLoad() {
	//CRIDA A LA API
	data_markers = await fetch('http://localhost:8080/mapa/api/apiRestaurants.php',{
		headers: {
			Accept: "application/json"
		}
		})
		.then (data_markers => data_markers.json())

	//ARRAY DE FOOD_OPTIONS
	for(i = 0; i < data_markers.length; i++){
		food_options = (data_markers[i].kind_food).split(",");
		for (j = 0; j < food_options.length; j++){		
			kind_array.push(food_options[j]);
		}
		food_options = kind_array.filter(function(el, pos){
			return kind_array.indexOf(el) == pos;
		});				
	}
	//OPCIONS DEL SELECT
	all = new Option("Todos", "Todos");
	all.className = "all";
	selector.appendChild(all);

	for(i = 0; i < food_options.length; i++){
		newOption = new Option(food_options[i], food_options[i]);
		newOption.className = food_options[i];
		selector.appendChild(newOption);
	}
	//MOSTRAR MARKERS DELS RESTAURANTS AL CARREGAR
	for(item of data_markers){
		item.kind_food = (item.kind_food).split(",");
		photo = item.photo;
		img = '<img src=' + item.photo + '>';

		txt = item.name + '<br>' + item.adress + '<br>' + item.kind_food + '<br>' + ' lat: ' + item.lat + ' long: ' + item.lng + '<br>' + img;
		marker = L.marker([item.lat, item.lng], {name: item.name, adress: item.adress, kind_food: item.kind_food, photo: img}).bindPopup(txt);
		markersList.push(marker);
		map.addLayer(marker);
	}
		/*
	FASE 3.1
		1) Relleno el data_markers con una petición a la api
		2) Añado de forma dinámica en el select los posibles tipos de restaurantes
		3) Llamo a la función para --> render_to_map(data_markers, 'all'); <-- para mostrar restaurantes en el mapa
	*/
}

$('#kind_food_selector').on('change', function() {
  console.log(this.value);
  render_to_map(data_markers, this.value);
});

function render_to_map(data_markers,filter){
	//ELIMINAR ELS MARKERS
	for(i=0;i<markersList.length;i++) {
		map.removeLayer(markersList[i]);
	}  
	//MOSTRAR ELS MARKERS "TDODOS"
	if(filter == "Todos"){
		for(i=0;i<markersList.length;i++) {
			map.addLayer(markersList[i]);
		}
	}
	//FILTRAR MARKERS SEGONS EL TIPUS DE RESTAURANT
	for(i = 0; i < data_markers.length; i++){
		for(j = 0; j < data_markers[i].kind_food.length; j++){		
			if(filter == data_markers[i].kind_food[j]){
				marker = L.marker([data_markers[i].lat, data_markers[i].lng], {name: data_markers[i].name, adress: data_markers[i].adress, kind_food: data_markers[i].kind_food}).bindPopup(txt);
				markersList.push(marker);
				map.addLayer(marker);
				j = data_markers[i].kind_food.length;
			}
		};
	}
	/*
	FASE 3.2
		1) Limpio todos los marcadores
		2) Realizo un bucle para decidir que marcadores cumplen el filtro, y los agregamos al mapa
	*/				
}

//GEOLOCALITZACIÓ

if ('geolocation' in navigator){
	console.log('geolocation avalaible');
	const watchID = navigator.geolocation.watchPosition((position) => {
		(position.coords.latitude, position.coords.longitude);		  
	});
}else{
	console.log('geolocation not avalaible');
	alert('geolocation not avalaible');
}
function onLocationFound(e) {
    let radius = e.accuracy;
    L.marker(e.latlng).addTo(map) .bindPopup("You are here").openPopup();
}
map.on('locationfound', onLocationFound);