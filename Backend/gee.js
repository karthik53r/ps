var ee = require('@google/earthengine');
const { json } = require('body-parser');

console.log("gee.js");

async function runThis(name) {
  return new Promise(async (resolve, reject) => {
    try {
      if (name == undefined) {
        return resolve(0);
      }

      var districts = await ee.FeatureCollection("users/karanknit/india_dist_sorted");
      var ROI = await districts.filter(ee.Filter.eq('DISTRICT', name));
      var landarea=ROI.geometry().area().divide(10000).getInfo();
      console.log(landarea);

      var s1Collection = await ee.ImageCollection('COPERNICUS/S1_GRD')
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

        var beforeCollection =await s1Collection.filterDate(beforeStart, beforeEnd).mosaic().clip(ROI);
        var afterCollection =await s1Collection.filterDate(afterStart, afterEnd).mosaic().clip(ROI);

        // console.log(beforeCollection);
        // console.log(afterCollection);

        ////Map.addLayer(beforeCollection, { min: -25, max: 0 }, 'Before Floods', 0);
        ////Map.addLayer(afterCollection, { min: -25, max: 0 }, 'After Floods', 0);

        // A. Speckle Filter
        var smoothingRadius = 50;

        var difference = await afterCollection.focal_median(smoothingRadius, 'circle', 'meters')
            .divide(beforeCollection.focal_median(smoothingRadius, 'circle', 'meters'));

        var diffThreshold = 1.25;
        var flooded = await difference.gt(diffThreshold).rename('water').selfMask();

        // B. Mask out permanent/semi-permanent water bodies
        var permanentWater =await ee.Image("JRC/GSW1_4/GlobalSurfaceWater")
            .select('seasonality').gte(10).clip(ROI);

        flooded =await flooded.where(permanentWater, 0).selfMask();

        // C. Mask out areas with steep slopes
        var slopeThreshold = 5;
        var terrain = await ee.Algorithms.Terrain(ee.Image("WWF/HydroSHEDS/03VFDEM"));
        var slope =await  terrain.select('slope');
        flooded = await flooded.updateMask(slope.lt(slopeThreshold));

        // D. Remove isolated pixels
        var connectedPixelThreshold = 8;
        var connections = await flooded.connectedPixelCount();
        flooded = await flooded.updateMask(connections.gt(connectedPixelThreshold));

        ////Map.addLayer(flooded, { min: 0, max: 1, palette: ['black'] }, 'Flood Extent');

        //E. Calculate Flood Area
        var flood_stats =await flooded.multiply(ee.Image.pixelArea()).reduceRegion({
            reducer: ee.Reducer.sum(),
            geometry: ROI,
            scale: 10,
            maxPixels: 1e12,
        });

        // var floodAreaHa = ee.Number(flood_stats.get('water')).divide(10000).round().getInfo();
        var floodAreaHa = await ee.Number(flood_stats.get('water')).divide(10000).round().getInfo();
        console.log('Flooded Area (Ha)', floodAreaHa);

      resolve({"landarea":landarea,"floodAreaHa":floodAreaHa});
    } catch (error) {
      // If an error occurs during execution, reject the promise with the error.
      reject(error);
    }
  });
}

module.exports = runThis;
