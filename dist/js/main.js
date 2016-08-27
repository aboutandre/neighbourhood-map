var poiMap = function() {

    this.Zoom = 10;
    this.mapOptions = {
        zoom: this.Zoom,
        panControl: true,
        disableDefaultUI: true,
        center: new google.maps.LatLng(53.551086, 9.993682),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        // Google map styling from https://snazzymaps.com/
        styles: [{
            "featureType": "landscape",
            "stylers": [{
                "hue": "#FFBB00"
            }, {
                "saturation": 43
            }, {
                "lightness": 37.599999999999994
            }, {
                "gamma": 1
            }]
        }, {
            "featureType": "road.highway",
            "stylers": [{
                "hue": "#FFC200"
            }, {
                "saturation": -61.8
            }, {
                "lightness": 45.599999999999994
            }, {
                "gamma": 1
            }]
        }, {
            "featureType": "road.arterial",
            "stylers": [{
                "hue": "#FF0300"
            }, {
                "saturation": -100
            }, {
                "lightness": 51.19999999999999
            }, {
                "gamma": 1
            }]
        }, {
            "featureType": "road.local",
            "stylers": [{
                "hue": "#FF0300"
            }, {
                "saturation": -100
            }, {
                "lightness": 52
            }, {
                "gamma": 1
            }]
        }, {
            "featureType": "water",
            "stylers": [{
                "hue": "#0078FF"
            }, {
                "saturation": -13.200000000000003
            }, {
                "lightness": 2.4000000000000057
            }, {
                "gamma": 1
            }]
        }, {
            "featureType": "poi",
            "stylers": [{
                "hue": "#00FF6A"
            }, {
                "saturation": -1.0989010989011234
            }, {
                "lightness": 11.200000000000017
            }, {
                "gamma": 1
            }]
        }]
    };

    this.map =
        new google.maps.Map(document.getElementById('map'), this.mapOptions);
};

// Start Knockout View Model
var koVM = function() {
    //Clear local storage to ensure a fresh start
    sessionStorage.clear();
    //Variable to allow to get out of binding. See:
    //http://alistapart.com/article/getoutbindingsituations
    var me = this;

    // Check for Google Maps. If any error is thrown we get a message in the console
    if (typeof google !== 'object' || typeof google.maps !== 'object') {
        console.log("error loading google maps api");
        $('#search-field').val("Error Loading Google Maps Api");
        $('#search-field').css({
            'background-color': 'rgba(255,0,0,0.5)'
        });
        //return early since we have no maps.  No POI in doing much else.
        return;
    }

    me.theMap = new poiMap();
    window.map = me.theMap.map;
    // Z-Index for each marker
    me.zNum = 1;
    me.fitToResult = ko.observable(true);
    me.fitWindow = ko.observable(true);
    me.onlyPOIName = ko.observable(false);
    me.POIListShow = ko.observable(true);
    me.rollupText = ko.observable('collapse list');
    me.rollupIconPath = ko.observable('img/collapseIcon.png');
    // Sets how wide the POI info window can be
    me.infoMaxWidth = Math.min(1200, $(window).width() * 0.8);
    // Sets the maximum number of Foursquare tips
    me.max4Stips = Math.max(1,
        Math.min(4, Math.floor($(window).height() / 200)));

    me.centerToPoint = function(POI, offsetIt) {
        if (offsetIt !== true) {
            me.theMap.map.setCenter(POI.marker.position);
        } else {
            var scale = Math.pow(2, me.theMap.map.getZoom());
            var mapHeight = $(window).height();
            var projection = me.theMap.map.getProjection();
            var pixPosition = projection.fromLatLngToPoint(POI.marker.position);
            var pixPosNew = new google.maps.Point(
                pixPosition.x,
                pixPosition.y - (mapHeight * 0.45 / scale)
            );
            var posLatLngNew = projection.fromPointToLatLng(pixPosNew);
            me.theMap.map.setCenter(posLatLngNew);
        }
    };

    //Sets active POI and retrieves info
    me.selectPoint = function(POI) {
        var oldPoint = me.currentPoint();
        me.centerToPoint(POI, true);
        me.currentPoint(POI);
        var storedContent = sessionStorage.getItem("infoKey" +
            me.currentPoint().name +
            me.currentPoint().lat() + me.currentPoint().long());
        if (storedContent) {
            me.infowindow.setContent(storedContent);
            me.infowindow.open(me.theMap.map, POI.marker);
            me.infowindow.isOpen = true;
            me.checkPano(true);
        } else {
            me.infowindow.setContent('<div class="info-window" id="POI-info">Loading...</div>');
            me.infowindow.open(me.theMap.map, POI.marker);
            me.infowindow.isOpen = true;
            me.foursquareInfo(POI);
        }
        // Increases the selected POI z-index to put in above others
        POI.marker.setZIndex(POI.marker.getZIndex() + 5000);
        if (POI.hovered() === true) {
            POI.hovered(false);
            me.mouseEnter(POI);
        } else {
            me.mouseBlur(POI);
        }
        if (oldPoint !== null && oldPoint !== undefined) {
            if (oldPoint.hovered() === true) {
                oldPoint.hovered(false);
                me.mouseEnter(oldPoint);
            } else {
                me.mouseBlur(oldPoint);
            }
        }
    };

    //Since it's not possible to sync the change of the icons on the map via CSS a little bit of JS is necessary here
    me.mouseEnter = function(POI) {
        if (POI.hovered() !== true) {
            POI.hovered(true);
            if (POI.marker.getZIndex() <= me.zNum) {
                POI.marker.setZIndex(POI.marker.getZIndex() + 5000);
            }
            if (me.currentPoint() === POI) {
                POI.marker.setIcon(POI.activeHoverIcon);
            } else {
                POI.marker.setIcon(POI.hoverIcon);
            }
        }
    };

    me.mouseBlur = function(POI) {
        if (POI.hovered() === true) {
            POI.hovered(false);
        }
        if (me.currentPoint() === POI) {
            POI.marker.setIcon(POI.activeIcon);
        } else {
            POI.marker.setIcon(POI.defaultIcon);
        }

    };


    //This goes through the observableArray below and creates all POIs
    me.POI = function(name, lat, long, category, iconPOI, iconList) {
        //Changes the default Google Maps Icons to use custom icons for the categories
        this.defaultIcon = iconPOI + '.svg';
        this.activeHoverIcon = iconPOI + '-hover-active' + '.svg';
        this.activeIcon = iconPOI + '-hover-active' + '.svg';
        this.hoverIcon = iconPOI + '-hover-active' + '.svg';
        this.name = name;
        this.lat = ko.observable(lat);
        this.long = ko.observable(long);
        this.category = category;
        this.iconPOI = iconPOI;
        this.iconList = iconList;
        this.hovered = ko.observable(false);

        this.marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, long),
            title: name,
            map: me.theMap.map,

            zIndex: me.zNum,
            icon: iconPOI + '.svg'
        });

        me.zNum++;
        // If the user clicks on the POI directly on the map this selects the POI
        google.maps.event.addListener(this.marker, 'click', function() {
            me.selectPoint(this);
        }.bind(this));

        google.maps.event.addListener(this.marker, 'mouseover', function() {
            me.mouseEnter(this);
        }.bind(this));

        google.maps.event.addListener(this.marker, 'mouseout', function() {
            me.mouseBlur(this);
        }.bind(this));
    };

    // Icons for the categories
    var touristSight = './img/tourist';
    var touristIcon = 'tourist-icon';

    var cinemaSight = './img/cinema';
    var cinemaIcon = 'cinema-icon';

    var parkSight = './img/park';
    var parkIcon = 'park-icon';

    var beachSight = './img/beach';
    var beachIcon = 'beach-icon';

    var foodSight = './img/food';
    var foodIcon = 'food-icon';

    var sportSight = './img/sport';
    var sportIcon = 'sport-icon';

    //Udacity Criteria: There are at least 5 locations hard-coded in the model
    //Although this list could be a separated JSON file
    me.points = ko.observableArray([
        new me.POI('Stadtpark', 53.596977, 10.020697, 'Park', parkSight, parkIcon),
        new me.POI('Savoy Kino', 53.554175, 10.014349, 'Cinema', cinemaSight, cinemaIcon),
        new me.POI('Planten un Blomen', 53.554453, 9.971059, 'Park', parkSight, parkIcon),
        new me.POI('Isemarkt', 53.581449, 9.982131, 'Local food', foodSight, foodIcon),
        new me.POI('Elbgold', 53.563070, 9.967049, 'Coffee shop', foodSight, foodIcon),
        new me.POI('Elbstrand', 53.544651, 9.905478, 'Beach', beachSight, beachIcon),
        new me.POI('Binnenalster', 53.566468, 10.006446, 'Lake', parkSight, parkIcon),
        new me.POI('Miniatur Wunderland', 53.543723, 9.988516, 'Museum', touristSight, touristIcon),
        new me.POI('Tierpark Hagenbeck', 53.5965764, 9.9383145, 'Zoo', touristSight, touristIcon),
        new me.POI('Volksparkstadion', 53.5871280, 9.8986004, 'Stadium', sportSight, sportIcon),
        new me.POI('Mercado', 53.5527728, 9.9318847, 'Shopping Mall', touristSight, touristIcon),
        new me.POI('Schanzen Park', 53.5653882, 9.9698728, 'Park', parkSight, parkIcon)
    ]);

    me.currentPoint = ko.observable('');

    me.pointFilter = ko.observable('');

    me.visiblePOI = ko.computed(function() {
        return ko.utils.arrayFilter(me.points(), function(POI) {
            // Filter list not working like here: http://jsfiddle.net/zf5k9rxq/
            if (me.onlyPOIName() === true) {
                console.log('Only POI name');
                return (me.pointFilter() === '*' ||
                    POI.name.toLowerCase().indexOf(me.pointFilter().toLowerCase()) !== -1);
            } else {
                return (me.pointFilter() === '*' ||
                    (POI.name.toLowerCase().indexOf(me.pointFilter().toLowerCase()) !== -1 ||
                        POI.category.toLowerCase().indexOf(me.pointFilter().toLowerCase()) !== -1));
            }
        });
    }, me);

    me.visiblePOI.subscribe(function() {
        me.toggleMarkers();
        if (me.infowindow.isOpen === true) {
            me.infowindow.close();
            me.infowindow.isOpen = false;
            me.infoWindowClosed();
        }
    });

    me.toggleMarkers = function() {
        var i;
        var pointsLen = me.points().length;
        for (i = 0; i < pointsLen; i++) {
            var mePOI = me.points()[i];
            mePOI.marker.setVisible(false);
            mePOI.hovered(false);
            if (me.currentPoint() === mePOI) {
                mePOI.marker.setIcon(mePOI.activeIcon);
            } else {
                mePOI.marker.setIcon(mePOI.defaultIcon);
            }
        }
        for (i = 0; i < pointsLen; i++) {
            var currentPOI = me.visiblePOI()[i];
            if (currentPOI) {
                currentPOI.marker.setVisible(true);
            }
        }
        if (me.fitToResult() === true) {
            console.log('Re-zoom on filter on');
            me.refitMap();
        }
    };

    me.refitMap = function() {
        var bounds = new google.maps.LatLngBounds();

        //Zoom only if at least one POI checks
        var pointsLen = me.visiblePOI().length;
        if (pointsLen >= 1) {
            for (var i = 0; i < pointsLen; i++) {
                bounds.extend(me.visiblePOI()[i].marker.position);
            }
            me.theMap.map.fitBounds(bounds);
        }
    };

    // Foursquare delivered data
    me.foursquareData = '';


    // Uses Foursquare API to return information about the places
    this.foursquareInfo = function(POI) {
        var url = 'https://api.foursquare.com/v2/venues/search?client_id=PO5KFWQYHH0D3DMKV1Q1H5CWA04W0R5MRGI10ED2SIHXBYVK&client_secret=VANWWD3TP1SPZCUN32Q4BGW0AHNM0V4KHWRUEPAHLD2JUZFX&v=20130815&ll=' +
            POI.lat() + ',' + POI.long() + '&query=\'' + POI.name + '\'&limit=1';

        // Fires the Foursquare API and builds the DOM with the delivered data
        $.getJSON(url)
            .done(function(response) {
                // Start POI window with the informations about it
                me.foursquareData = '<p class="location__info">Location info:</p>';
                var venue = response.response.venues[0];
                var venueId = venue.id;

                // Category of the POI
                var category = venue.categories.shortName;
                if (category !== null && category !== undefined) {
                    me.foursquareData += '<p class="location__attribute">Category: ' +
                        category + '</p>';
                }
                // Name of the POI
                var venueName = venue.name;
                if (venueName !== null && venueName !== undefined) {
                    me.foursquareData += '<p class="location__attribute">Name:</p>' +
                        '<p class="location__attribute-value"> ' + venueName + '</p>';
                }
                // Phone number if any
                var phoneNum = venue.contact.formattedPhone;
                if (phoneNum !== null && phoneNum !== undefined) {
                    me.foursquareData += '<p class="location__attribute">Phone:</p>' +
                        '<p class="location__attribute-value"> ' + phoneNum + '</p>';
                }
                // Twitter handle if any
                var twitterId = venue.contact.twitter;
                if (twitterId !== null && twitterId !== undefined) {
                    me.foursquareData += '<p class="location__attribute">Twitter name:</p>' +
                        '<p class="location__attribute-value"><a href="http://www.twitter.com/' + twitterId + '">@' + twitterId + '</a></p>';
                }
                // Address of the POI
                var address = venue.location.formattedAddress;
                if (address !== null && address !== undefined) {
                    me.foursquareData += '<p class="location__attribute">Address:</p>' +
                        '<p class="location__attribute-value"> ' + address + '<p>';
                }

                // Ammount of Foursquare check-ins
                var checkinCount = venue.stats.checkinsCount;
                if (checkinCount !== null && checkinCount !== undefined) {
                    me.foursquareData += '<p class="location__attribute">Number of checkins:</p>' +
                        '<p class="location__attribute-value"> ' + checkinCount + '</p>';
                }
                // Tips from visitors
                var tipCount = venue.stats.tipCount;
                if (tipCount > 0) {
                    me.foursquareTips(venueId, POI);
                } else {
                    // If there are no tips
                    me.foursquareData = me.foursquareData + '</p>';
                    // Now build the window
                    me.checkPano();
                }
            })
            .fail(function() {
                me.foursquareData = 'Fouresquare request failed';
                console.log('Error while loading information' +
                    'Foursquare has a unknown problem');
                // Fallback message in case of error
                me.checkPano();
            });

    };

    this.foursquareTips = function(venueId, POI) {
        // Foursquare tips
        var url = 'https://api.foursquare.com/v2/venues/' + venueId + '/tips' +
            '?client_id=PO5KFWQYHH0D3DMKV1Q1H5CWA04W0R5MRGI10ED2SIHXBYVK' +
            '&client_secret=VANWWD3TP1SPZCUN32Q4BGW0AHNM0V4KHWRUEPAHLD2JUZFX' +
            '&v=20130815';
        // https://developer.foursquare.com/docs/tips/listed
        $.getJSON(url)
            .done(function(response) {
                var tipCount = Math.min(me.max4Stips,
                    response.response.tips.count);
                me.foursquareData = me.foursquareData + '<p class="location__attribute">Local tips:</p><ul class="location__tips--list">';
                for (var i = 0; i < tipCount; i++) {
                    me.foursquareData = me.foursquareData + '<li class="location__tips--list-item"><i class="fa fa-quote-left"></i><span>' +
                        response.response.tips.items[i].text + '</span></li>';
                }

                me.foursquareData = me.foursquareData + '</ul></p>';
                me.checkPano();
            })
            .fail(function() {
                me.foursquareData = me.foursquareData + '</p>';
                console.log('Fouresquare failed to loads tip information' +
                    ' attempting to load what we have into the infowindow');
                me.checkPano();
            });
    };

    me.defaultBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(35.65, -97.7),
        new google.maps.LatLng(35.5, -97.4));
    me.theMap.map.fitBounds(me.defaultBounds);

    me.contentString = function(includePano) {
        var retStr = '<div id="POI-info" class="info-window">' +
            me.foursquareData;
        // Include a panorama if any is available
        if (includePano === true) {
            retStr = retStr +
                '<div id="panorama-picture"></div>';
        }
        retStr = retStr + '</div>';
        sessionStorage.setItem("infoKey" + me.currentPoint().name +
            me.currentPoint().lat() + me.currentPoint().long(), retStr);
        return retStr;
    };

    me.infowindow = new google.maps.InfoWindow({
        content: '<div id="POI-info">Loading...</div>',
        maxWidth: me.infoMaxWidth
    });

    me.pano = null;

    me.streetViewService = new google.maps.StreetViewService();

    me.checkPano = function(skipContent) {
        // Hide the panorama on xs
        if ($(window).width() <= 544) {
            if (skipContent !== true) {
                me.infowindow.setContent(me.contentString(false));
            }
            return;
        }
        // Streetview check
        me.streetViewService.getPanoramaByLocation(
            me.currentPoint().marker.position, 80,
            function(streetViewPanoramaData, status) {

                if (status === google.maps.StreetViewStatus.OK) {
                    if (skipContent !== true) {
                        me.infowindow.setContent(me.contentString(true));
                    }
                    if (me.pano !== null) {
                        me.pano.unbind("position");
                        me.pano.setVisible(false);
                    }
                    me.pano = new google.maps.StreetViewPanorama(
                        document.getElementById("panorama-picture"), {

                            navigationControl: true,
                            navigationControlOptions: {
                                style: google.maps.NavigationControlStyle.ANDROID
                            },
                            enableCloseButton: false,
                            addressControl: false,
                            linksControl: false
                        });
                    me.pano.setPano(streetViewPanoramaData.location.pano);
                    me.pano.setVisible(true);
                } else {
                    if (skipContent !== true) {
                        me.infowindow.setContent(me.contentString(false));
                    }
                }
            });
    };

    // Cleans the panorama when info window closes
    me.infoWindowClosed = function() {
        if (me.pano !== null && me.pano !== undefined) {
            me.pano.unbind("position");
            me.pano.setVisible(false);
            me.pano = null;
        }
        me.refitMap();
    };

    // Closes the info window on clicking close button
    google.maps.event.addListener(me.infowindow, 'closeclick', function() {
        me.infoWindowClosed();
    });

    // Closes the info window when clicking on the map
    google.maps.event.addListener(me.theMap.map, "click", function() {
        if (me.infowindow.isOpen === true) {
            me.infowindow.close();
            me.infowindow.isOpen = false;
            me.infoWindowClosed();
        }
    });

    google.maps.event.addDomListener(me.infowindow, 'domready', function() {
        $('#POI-info').click(function() {
            if ($(window).width() <= 544 && me.infowindow.isOpen === true) {
                me.infowindow.close();
                me.infowindow.isOpen = false;
                me.infoWindowClosed();
            }
        });
    });

    $(window).resize(function() {
        if (me.fitWindow()) {
            console.log('Fit map to window on!');
            // Refits map
            me.refitMap();
        }
    });
    me.refitMap();
};


//Starts the View Model
$(function() {
    ko.applyBindings(new koVM());
});