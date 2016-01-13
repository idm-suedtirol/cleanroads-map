var cleanroads = angular.module('cleanroads', []);

cleanroads.controller('CleanRoadsCtrl', function ($scope, $window) {
		var self = $scope;
		self.i18n = i18n;
		self.isMobile = mobileCheck();
		var language = $window.navigator.language||$window.navigator.userLanguage;
		var langIndex = language.indexOf('-');
		if (langIndex === -1)
			self.lang = language;
		else
			self.lang = language.substring(0, langIndex) || 'it';
		$('#'+self.lang).addClass("active");
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
		map.on('singleclick', function(evt) {
			var feature = map.forEachFeatureAtPixel(evt.pixel, 
		 		function(feature, layer) {
					self.feature = feature;
					self.icon = getIconByFeature(feature);
					self.updateInfos();
					if (!self.isMobile)
						self.positionPopup();
					else{
						self.mobilepop = true;
						self.$apply();				
					}
			 	}
			); 
		});
		self.$watch('lang',function(){
			self.updateInfos();
		});
		function mobileCheck() {
  			var check = false;
			  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
			return check;
		}
		self.updateInfos = function(){
			if(self.feature){
				var date = moment(self.feature.getProperties()['rel_time']);
				var iconPos,contentPos;
				var content = '<h2>'+self.i18n[self.lang]['station']+' <span class="stationname">'+self.feature.getProperties()['station_name']+'</span></h2>'+
				'<div><label>'+self.i18n[self.lang]['roadTemperature']+'</label> <div>'+self.feature.getProperties()['rel_temperatura_suolo']+'</div></div>'+
				'<div><label>'+self.i18n[self.lang]['airTemperature']+'</label> <div>'+self.feature.getProperties()['rel_temperatura_ambientale']+'</div></div>'+
				'<div><label>'+self.i18n[self.lang]['wind']+'</label> <div>'+self.feature.getProperties()['rel_velocita_vento']+'</div></div>'+
				'<div><label>'+self.i18n[self.lang]['humidity']+'</label> <div>'+self.feature.getProperties()['rel_umidita_relativa']+'</div></div>';
				if (self.isMobile){
					content += '<div class="footer">'+self.i18n[self.lang]['updatedOn']+'<br/> '+date.locale(self.lang).format('HH.mm DD/MM/YY')+'</div><img src="'+self.icon+'" height="66px" >';
					$('#info-overlay').html(content);	
				}else{
					content =  '<a href="#" class="close" id="closeSign"></a>' + content;
		 	               	if (self.feature.getGeometry().getCoordinates()[0]<view.getCenter()[0]){
        	        	                popup.setPositioning("bottom-right");
						iconPos = 'float:right;right:-16px';
                	        	}else{
                		                popup.setPositioning("bottom-left");
						iconPos = 'left:-16px;right:auto';
						contentPos = 'float:left;';
					}
					content += '<img src="'+self.icon+'" class="popup-icon" style="'+iconPos+'"><div class="footer" style="'+contentPos+'">'+self.i18n[self.lang]['updatedOn']+' <br/>'+date.locale(self.lang).format('HH.mm DD/MM/YY')+'</div>';
					box.innerHTML = content;
					$('#closeSign').click(function(){
						popup.setPosition(undefined);
					});
				}
			}
		}
		self.positionPopup = function(){
			var coordinate = self.feature.getGeometry().getCoordinates();
			popup.setPosition(coordinate);   
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
			else
				image = 'img/pin-'+positioning+'-street-offline.png';
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
	};
});
