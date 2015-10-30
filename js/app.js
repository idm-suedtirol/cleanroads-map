var cleanroads = angular.module('cleanroads', []);

cleanroads.controller('CleanRoadsCtrl', function ($scope) {
	$scope.init = function(){
		$scope.i18n = i18n
		$scope.lang = navigator.language.substring(0,navigator.language.indexOf('-')) || navigator.userLanguage.substring(navigator.userLanguage.indexOf('-')) || 'it';
		$('#'+$scope.lang).addClass("active");
		var view = new ol.View({
		    units: 'm',
		    zoom:11,
		    center:[1230000,5785000]
		});
		var box = document.getElementById('popup');
		var popup = new ol.Overlay({
  			element: box,
			autoPan: true,
	  		autoPanAnimation: {
				duration: 250
  			},
			positioning:'bottom-left',
			offset:	[0,-40]
		});
		var map = new ol.Map({
  			layers: [
				new ol.layer.Tile({
		      			source: new ol.source.XYZ({
    					url: 'http://a1.acetate.geoiq.com/tiles/acetate/{z}/{x}/{y}.png' })
				})
			],
			target: 'map',
			view: view,
			overlays:[popup]
		});
		map.on('click', function(evt) {
			var feature = map.forEachFeatureAtPixel(evt.pixel, 
		 		function(feature, layer) {
					$scope.feature = feature;
					self.icon = getIconByFeature(feature);
					$scope.updatePopup();
					var coordinate = $scope.feature.getGeometry().getCoordinates();
					popup.setPosition(coordinate);   
			 	}
			); 
		});
		$scope.$watch('lang',function(){
			$scope.updatePopup();
		});
		$scope.updatePopup = function(){
			if($scope.feature){
				var date = moment($scope.feature.getProperties()['rel_time']);
				var content = '<h2>'+$scope.i18n[$scope.lang]['station']+' <span class="stationname">'+$scope.feature.getProperties()['station_name']+'</span></h2>'+
				'<div><label>'+$scope.i18n[$scope.lang]['roadTemperature']+'</label> <div>'+$scope.feature.getProperties()['rel_temperatura_suolo']+'</div></div>'+
				'<div><label>'+$scope.i18n[$scope.lang]['airTemperature']+'</label> <div>'+$scope.feature.getProperties()['rel_temperatura_ambientale']+'</div></div>'+
				'<div><label>'+$scope.i18n[$scope.lang]['wind']+'</label> <div>'+$scope.feature.getProperties()['rel_velocita_vento']+'</div></div>'+
				'<div><label>'+$scope.i18n[$scope.lang]['humidity']+'</label> <div>'+$scope.feature.getProperties()['rel_umidita_relativa']+'</div></div>'+
				'<div class="footer"><img src="'+self.icon+'"><div>'+$scope.i18n[$scope.lang]['updatedOn']+' '+date.locale($scope.lang).format('HH.mm DD/MM/YY')+'</div></div>';
				box.innerHTML=content;
			}
		}
		var  params = {
                        request:'GetFeature',
                        typeName:'edi:cleanroads_stations',
                        outputFormat:'text/javascript',
                        format_options: 'callback: getJson'
	        };
		$.ajax({
                	url : 'http://geodata.integreen-life.bz.it/geoserver/wfs?'+$.param(params),
	                dataType : 'jsonp',
        	        crossDomain: true,
                	jsonpCallback : 'getJson',
	                success : function(data) {
				displayPoints(data);
                	},
	                error : function() {
        	                console.log('problems with data transfer');
                	}
	        });
		function getIconByFeature(feature){
			var temp = feature.getProperties()['rel_temperatura_map'];
			var weather = feature.getProperties()['rel_precipitazione_map'];
			console.log(temp);
			console.log(weather);
			var image = 'img/pin-dx-street.png';
			if (temp === 0){
				switch (weather){
					case 0: image = 'img/pin-dx-temp.png';break;
					case 11: image = 'img/pin-dx-temp-rain-01.png';break;
					case 12: image = 'img/pin-dx-temp-rain-02.png';break;
					case 13: image = 'img/pin-dx-temp-rain-03.png';break;
					case 21: image = 'img/pin-dx-temp-snow-01.png';break;
					case 22: image = 'img/pin-dx-temp-snow-02.png';break;
					case 23: image = 'img/pin-dx-temp-snow-03.png';break;
				}
			}else if (temp === 1){
				switch (weather){
					case 0: image = 'img/pin-dx-street.png';break;
					case 11: image = 'img/pin-dx-rain-01.png';break;
					case 12: image = 'img/pin-dx-rain-02.png';break;
					case 13: image = 'img/pin-dx-rain-03.png';break;
					case 21: image = 'img/pin-dx-snow-01.png';break;
					case 22: image = 'img/pin-dx-snow-02.png';break;
					case 23: image = 'img/pin-dx-snow-03.png';break;
				}
			}
			return image;
		}
		
		var customStyleFunction = function(feature) {
			var image = getIconByFeature(feature);
			return [new ol.style.Style({
				image: new ol.style.Icon(({src:image,anchor:[0,0],anchorOrigin:'bottom-left',scale:0.5}))
			})]
		}
		function displayPoints(data){
			var vectorSource = new ol.source.Vector({
			  features: (new ol.format.GeoJSON()).readFeatures(data)
			});
			var cleanRoadsLayer = new ol.layer.Vector({
				source: vectorSource,
				style: customStyleFunction
			});
			map.addLayer(cleanRoadsLayer);	
		}
	};
	/*
		var selectClick = new ol.interaction.Select({
		  condition: ol.events.condition.click
		});
	map.addInteraction(selectClick);*/
});
