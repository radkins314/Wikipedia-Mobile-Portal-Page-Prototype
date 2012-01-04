(geofill = function() {
  var _self;
  var formatted_location;
  var language_code;
  var address_container_id, tabs_1_id, tabs_2_id;
  var geocodeaddress_callback;
  var lat = false, lng = false;
  var languages = { beijing: 'zh', maharashtra: 'mr', delhi: 'hi',  'west bengal': 'bn', us: 'en', gb: 'en' }
  var lexicon = {
    bn: { search: 'অনুসন্ধান',     welcome: 'স্বাগতম',      homepage: 'প্রথম পাতা',    wikipedia: 'উইকিপিডিয়া, একটি মুক্ত বিশ্বকোষ' },
    de: { search: 'Suche',      welcome: 'Willkommen', homepage: 'Hauptseite', wikipedia: 'Wikipedia<br /><small>Die freie Enzyklopädie</small>'},
    en: { search: 'Search',     welcome: 'Welcome',    homepage: 'Home Page',  wikipedia: 'Wikipedia<br /><small>The free encyclopedia</small>'},
    fr: { search: 'Rechercher', welcome: 'Bienvenue',  homepage: 'Accueil',    wikipedia: "Wikipédia<br /><small>L'encyclopédie libre</small>"},
    hi: { search: 'खोजें',         welcome: 'सवागत हैं',     homepage: 'पहला पन्ना',    wikipedia: 'विकिपीडिया'},
    mr: { search: 'शोधा',         welcome: 'स्वागत आहे',    homepage: 'होम',         wikipedia: 'विकिपीडिया'},
    zh: { search: '搜索',       welcome: '歡迎',       homepage: '首页',       wikipedia: '维基百科<br />自由的百科全书'}
  };
  var geocoder = new google.maps.Geocoder();
  var isblank = function(a) { return typeof a == "undefined" || a == null || a == "" || a == [] };
  var setLatLngCookie = function(_lat, _lng) {
    latLng(_lat, _lng);
    $.cookie("geotestLat", _lat);
    $.cookie("geotestLng", _lng);
  };
  var getLanguageFromCountryCode = function (cc) {
    if (isblank(cc)) return 'en';
    lcc = cc.toLowerCase();
    var lc = languages[lcc];
    if (isblank(lc)) {
      return lcc;
    } else {
      return lc;
    }
  };
  var getLatLngCookie = function() {
    lat = $.cookie("geotestLat"); lng = $.cookie("geotestLng");
    return (lat && lng) ? { 'lat': lat, 'lng': lng } : false;
  };
  geocoder_results = function(results, status) {
    var ac, addr, i, j, r, long_name, short_name, region_name;
    var formatted_address;
    if (status == google.maps.GeocoderStatus.OK) {
      r = results[0] || results[1];
      formatted_address = r.formatted_address; // fallback
      for (i=0;i<results.length;i++) {
        r = results[i];
        if (r.types[0] == "administrative_area_level_2") {
          formatted_address = r.formatted_address;
        }
      }
      for (i=0;i<results.length;i++) {
        r = results[i];
        ac = r.address_components;
        for (j=0;j<ac.length;j++) {
          addr = ac[j];
          if (addr.types[0] == "administrative_area_level_1") {
            region_name = addr.long_name;
          } else if (addr.types[0] == "country") {
            long_name = addr.long_name;
            short_name = addr.short_name;
            formattedLocation(formatted_address);
            if (long_name == "India") {
              setLanguageCode(region_name);
            } else if (long_name == "China") {
              setLanguageCode(region_name);
            } else {
              setLanguageCode(short_name);
            }
            if (!isblank(geocodeaddress_callback)) geocodeaddress_callback(language_code);
            return;
          }
        }
      }
    } else {
      alert("Reverse Geocoder failed due to: " + status);
    }
  };
  var reverseGeocodeAddress = function(latlng) {
    //console.log("latlng", latlng);
    geocoder.geocode({'latLng': latlng}, geocoder_results);
  };
  var formattedLocation = function(loc) {
    if (isblank(loc)) {
      return formatted_location;
    } else {
      formatted_location = loc;
      $(address_container_id).html(loc);
      addressCookie(loc);
    }
  };
  var mapLanguageCode = function(cc) {
    var lc = 'en';
    if (!isblank(cc)) {
      lc = getLanguageFromCountryCode(cc);
      addressCookie(lc);
    }
    return lc;
  };
  var setLanguageCode = function(cc) {
    //console.log("cc: "+cc.toLowerCase());
    language_code = mapLanguageCode(cc);
    _self.setLanguage(language_code);
    addressCookie(language_code);
  };
  var latLng = function(_lat, _lng) {
    if (isblank(_lat) || isblank(_lng)) {
      return (lat && lng) ? { 'lat': lat, 'lng': lng } : false;
    } else {
      lat = _lat; lng = _lng;
    }
  };
  var addressCookie = function(where) {
    if (isblank(where)) {
      return $.cookie("geotestAddress");
    } else {
      $.cookie("geotestAddress", where);
    }
  };
  var languageCodeCookie = function(where) {
    if (isblank(where)) {
      return $.cookie("geotestLanguageCode");
    } else {
      $.cookie("geotestLanguageCode", where);
    }
  };
  return {
    init: function(addr_container, lc_container) {
      _self = this;
      $(window).load(_self.setNearMe);
    },
    setup: function(location) {
      var lat = location.coords.latitude;
      var lng = location.coords.longitude;
      setLatLngCookie(lat, lng);
      reverseGeocodeAddress(new google.maps.LatLng(lat,lng));
    },
    setOptions: function(opts) {
      geocodeaddress_callback = opts.geocode_address_callback;
      address_container_id = opts.address_container_id;
      tabs_1_id = opts.tabs_1_id;
      tabs_2_id = opts.tabs_2_id;
    },
    geocodeAddress: function(where, callback) {
      geocodeaddress_callback = callback;
      geocoder.geocode({'address': where}, geocoder_results);
    },
    pageLoad: function() {
      var addrval = addressCookie();
      if (isblank(addrval)) {
        navigator.geolocation.getCurrentPosition(_self.setup);
      } else {
        $(address_container_id).html(addrval);
      }
    },
    clearInput: function() {
      $(address_container_id).html('');
      addressCookie("");
    },
    setNearMe: function() {
      navigator.geolocation.getCurrentPosition(_self.setup);
    },
    getLocalSearchTerm: function(lc) {
      return lexicon[lc].search;
    },
    getLocalTabs1Title: function(lc) {
      return lexicon[lc].welcome;
    },
    getLocalTabs2Title: function(lc) {
      return lexicon[lc].homepage;
    },
    getLocalWikipedia: function(lc) {
      return lexicon[lc].wikipedia;
    },
    getLanguage: function(val) {
      return language_code;
    },
    setLanguage: function(val) {
      var sel = $("#languageselection").get(0);
      var i, k, o, m, opts = sel.options;
      for (i=0;i<opts.length;i++) {
        o = opts[i];
        m = o.value.match(/\/\/([^\.]+)\./);
        if (m != null) {
          k = m[1];
          if (k == val) {
            o.selected = 'selected';
            sel.selectedIndex = i;
            return;
          }
        }
      }
    }
  }
}()).init();
