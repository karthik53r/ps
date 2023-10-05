// Require client library and private key.
var runThis = require("./gee.js");
var ee = require('@google/earthengine');
var privateKey = require('./geeps-400309-60423011bde6.json');

var runAnalysis = function () {
    ee.initialize(null, null, function () {
        try {
            runThis();

        } catch (e) {
            console.error('Analysis error: ' + e);
        }
        // ... run analysis ...
    }, function (e) {
        console.error('Initialization error: ' + e);
    });

};
// Authenticate using a service account.
ee.data.authenticateViaPrivateKey(privateKey, runAnalysis, function (e) {
    console.error('Authentication error: ' + e);
});