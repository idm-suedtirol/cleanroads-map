var cleanroads = angular.module('cleanroads', []);

cleanroads.controller('CleanRoadsCtrl', function ($scope) {
	$scope.init = function(){
		$scope.i18n = i18n
		$scope.lang = navigator.language.substring(0,navigator.language.indexOf('-')) || navigator.userLanguage.substring(navigator.userLanguage.indexOf('-')) || 'it';
		$('#'+$scope.lang).addClass("active");
		var view = new ol.View({
		    units: 'm',
		    resolution:100,	
		    center:[1235000,5805000],
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
    						url: 'https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
						 attributions: [
    							new ol.Attribution({
      								html: '&copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    							}),
    							ol.source.OSM.ATTRIBUTION
  						], 
					})
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
				var iconPos,contentPos;
	 	               	if ($scope.feature.getGeometry().getCoordinates()[0]<view.getCenter()[0]){
                	                popup.setPositioning("bottom-right");
                        	}else{
                	                popup.setPositioning("bottom-left");
					iconPos = 'left:0;right:auto';
					contentPos = 'float:right';
				}

				var content = '<a href="#" class="close" id="closeSign">&#x274c;</a><h2>'+$scope.i18n[$scope.lang]['station']+' <span class="stationname">'+$scope.feature.getProperties()['station_name']+'</span></h2>'+
				'<div><label>'+$scope.i18n[$scope.lang]['roadTemperature']+'</label> <div>'+$scope.feature.getProperties()['rel_temperatura_suolo']+'</div></div>'+
				'<div><label>'+$scope.i18n[$scope.lang]['airTemperature']+'</label> <div>'+$scope.feature.getProperties()['rel_temperatura_ambientale']+'</div></div>'+
				'<div><label>'+$scope.i18n[$scope.lang]['wind']+'</label> <div>'+$scope.feature.getProperties()['rel_velocita_vento']+'</div></div>'+
				'<div><label>'+$scope.i18n[$scope.lang]['humidity']+'</label> <div>'+$scope.feature.getProperties()['rel_umidita_relativa']+'</div></div>'+
				'<img src="'+self.icon+'" class="popup-icon" style="'+iconPos+'"><div class="footer" style="'+contentPos+'">'+$scope.i18n[$scope.lang]['updatedOn']+' '+date.locale($scope.lang).format('HH.mm DD/MM/YY')+'</div>';
				box.innerHTML = content;
				$('#closeSign').click(function(){
					popup.setPosition(undefined);
				});
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
			var positioning = 'dx';
			if (feature.getGeometry().getCoordinates()[0]<view.getCenter()[0]){
				positioning = 'sn';
			}
			var image = 'img/pin-'+positioning+'-street.png';
			if (temp === 0){
				switch (weather){
					case 0: image = 'img/pin-'+positioning+'-temp.png';break;
					case 11: image = 'img/pin-'+positioning+'-temp-rain-01.png';break;
					case 12: image = 'img/pin-'+positioning+'-temp-rain-02.png';break;
					case 13: image = 'img/pin-'+positioning+'-temp-rain-03.png';break;
					case 21: image = 'img/pin-'+positioning+'-temp-snow-01.png';break;
					case 22: image = 'img/pin-'+positioning+'-temp-snow-02.png';break;
					case 23: image = 'img/pin-'+positioning+'-temp-snow-03.png';break;
				}
			}else if (temp === 1){
				switch (weather){
					case 0: image = 'img/pin-'+positioning+'-street.png';break;
					case 11: image = 'img/pin-'+positioning+'-rain-01.png';break;
					case 12: image = 'img/pin-'+positioning+'-rain-02.png';break;
					case 13: image = 'img/pin-'+positioning+'-rain-03.png';break;
					case 21: image = 'img/pin-'+positioning+'-snow-01.png';break;
					case 22: image = 'img/pin-'+positioning+'-snow-02.png';break;
					case 23: image = 'img/pin-'+positioning+'-snow-03.png';break;
				}
			}
			return image;
		}
		
		var customStyleFunction = function(feature) {
			var image = getIconByFeature(feature);
			var anchor = 'bottom-left';
			if (feature.getGeometry().getCoordinates()[0]<view.getCenter()[0]){
				anchor = 'bottom-right';
			}	
			return [new ol.style.Style({
				image: new ol.style.Icon(({src:image,anchor:[0,0],anchorOrigin:anchor,scale:0.5}))
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
});
