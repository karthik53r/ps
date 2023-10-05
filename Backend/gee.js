var ee = require('@google/earthengine');

function runThis(name) {
  var districts = ee.FeatureCollection("projects/ee-syedhu987/assets/india_dist_sorted")

  var ROI=districts.filter(ee.Filter.eq('DISTRICT',`'${name}'`));
  console.log(ROI.geometry().area().divide(10000).getInfo());

 
  var s1Collection = ee.ImageCollection('COPERNICUS/S1_GRD')
      .filterBounds(ROI)
      .filter(ee.Filter.eq('instrumentMode', 'IW'))
      .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
      .filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))
      .filter(ee.Filter.eq('resolution_meters', 10))
      .select('VH');

  // var beforeStart='2022-05-01';
  // var beforeEnd='2022-05-01';
  // var afterStart='2022-05-15';
  // var afterEnd='2022-05-16';

  var beforeStart = '2018-07-15'
  var beforeEnd = '2018-08-10'
  var afterStart = '2018-08-10'
  var afterEnd = '2018-08-23'

  var beforeCollection = s1Collection.filterDate(beforeStart, beforeEnd).mosaic().clip(ROI);
  var afterCollection = s1Collection.filterDate(afterStart, afterEnd).mosaic().clip(ROI);

  // console.log(beforeCollection);
  // console.log(afterCollection);

  ////Map.addLayer(beforeCollection, { min: -25, max: 0 }, 'Before Floods', 0);
  ////Map.addLayer(afterCollection, { min: -25, max: 0 }, 'After Floods', 0);

  // A. Speckle Filter
  var smoothingRadius = 50;

  var difference = afterCollection.focal_median(smoothingRadius, 'circle', 'meters')
      .divide(beforeCollection.focal_median(smoothingRadius, 'circle', 'meters'));

  var diffThreshold = 1.25;
  var flooded = difference.gt(diffThreshold).rename('water').selfMask();

  // B. Mask out permanent/semi-permanent water bodies
  var permanentWater = ee.Image("JRC/GSW1_4/GlobalSurfaceWater")
      .select('seasonality').gte(10).clip(ROI);

  flooded = flooded.where(permanentWater, 0).selfMask();

  // C. Mask out areas with steep slopes
  var slopeThreshold = 5;
  var terrain = ee.Algorithms.Terrain(ee.Image("WWF/HydroSHEDS/03VFDEM"));
  var slope = terrain.select('slope');
  flooded = flooded.updateMask(slope.lt(slopeThreshold));

  // D. Remove isolated pixels
  var connectedPixelThreshold = 8;
  var connections = flooded.connectedPixelCount();
  flooded = flooded.updateMask(connections.gt(connectedPixelThreshold));

  ////Map.addLayer(flooded, { min: 0, max: 1, palette: ['black'] }, 'Flood Extent');

  //E. Calculate Flood Area
  var flood_stats = flooded.multiply(ee.Image.pixelArea()).reduceRegion({
      reducer: ee.Reducer.sum(),
      geometry: ROI,
      scale: 10,
      maxPixels: 1e12,
  });

  // var floodAreaHa = ee.Number(flood_stats.get('water')).divide(10000).round().getInfo();
  var floodAreaHa = ee.Number(flood_stats.get('water')).divide(10000).round().getInfo();
  console.log('Flooded Area (Ha)', floodAreaHa);

  // // Query an Earth Engine Image Collection
  // const collection = ee.ImageCollection('COPERNICUS/S2')
  //   .filterDate('2021-10-01', '2021-10-15');

  // // Perform some operations on the collection
  // const count = collection.size().getInfo();
  // console.log(`Number of images in the collection: ${count}`);

  //   // Run an Earth Engine script.
  // var image = new ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED");
  // image.get////Map({min: 0, max: 1000}, function(////Map) {
  //   console.log(////Map);
  // });
}
module.exports=runThis;