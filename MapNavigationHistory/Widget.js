define([
  'dojo/_base/array',
  'dojo/_base/declare',
  'dojo/_base/lang',

  'dojo/router',
  'dojo/hash',
  'dojo/on',

  'esri/geometry/webMercatorUtils',

  'jimu/BaseWidget'
], function(
  array, declare, lang,
  router, hash, on,
  webMercatorUtils,
  BaseWidget
) {
  return declare([BaseWidget], {

    postCreate: function() {
      this.inherited(arguments);

      router.register('/:longitude/:latitude/:zoomLevel', lang.hitch(this, 'handleHashChange'));
      router.startup();
      if (hash() === '') {
        router.go('/');
      }
      this.own(on(this.map, 'extent-change', lang.hitch(this, 'updateLocationHash')));
    },

    handleHashChange: function(evt) {
      this.changeLocation(evt);
    },
    changeLocation: function(evt) {
      if (!this.hashUpdating) {
        this.mapUpdating = true;
        var zoom = evt.params.zoomLevel || this.map.getLevel();
        this.map.centerAndZoom([evt.params.longitude, evt.params.latitude], zoom).then(lang.hitch(this, function() {
          this.mapUpdating = false;
       }));
      }
    },
    updateLocationHash: function(evt) {
      if (!this.mapUpdating) {
        this.hashUpdating = true;
        var x = (evt.extent.xmax + evt.extent.xmin) / 2,
          y = (evt.extent.ymax + evt.extent.ymin) / 2;
        var geographicLocation = webMercatorUtils.xyToLngLat(x, y);
        var currentHash = hash().split('/');
        currentHash[1] = geographicLocation[0].toFixed(4);
        currentHash[2] = geographicLocation[1].toFixed(4);
        currentHash[3] = this.map.getLevel();
        hash(currentHash.join('/'));
        this.hashUpdating = false;
      }
    }
  });
});