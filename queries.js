// var promise = require('bluebird');
// var options = {
//     promiseLib: promise
// };

var pgp = require('pg-promise')();
var connectionString = "postgres://db_admin:Control123@localhost/db_pg_test";

var db = pgp(connectionString);

module.exports = {
    getWayToTarget: getWayToTarget
};

function getWayToTarget(req, res, next) {
    var targetId = parseInt(req.params.target);
    var sourceId = parseInt(req.params.source);
    console.log("target: ", targetId);

    var query = "SELECT seq, id1 AS node, id2 AS edge, cost " + 
                "FROM pgr_dijkstra('SELECT gid AS id, source::integer, target::integer, st_length(geom) AS cost " + 
                "                   FROM public.ways', $1, $2, false, false);";
    
    // console.log("QUERY: ", query);
    var promiseQuery = db.any(query, [sourceId, targetId])
        .then(function (data) {
            console.log("DATA:", data);
            
            var ways = [];
            var features = [];
            
            for (var index = 0; index < data.length; index++) {
                var edge = data[index].edge;
                
                ways.push(edge);
                console.log(features);
                
                var feature = getLinestringFromDb(edge);
                
                features[index] = feature;
                console.log(feature);
            }
            
            console.log("***********COLLECTION***********");
            console.log(features);
            
            var collection = {
                type: "FeatureCollection",
                features: features
            };
            console.log(collection);
            var geoJsonToGM = JSON.stringify(collection, null, 2);
            console.log(geoJsonToGM);
            return geoJsonToGM;
           //res.send(geoJsonToGM);
        
        })
        .then(function(json) {
           res.status(200).send(json);
        })
        .catch(function (error) {
            console.log(" -- ERROR:", error);
         }); 
    
    

               
   
}

function getLinestringFromDb(edgeId) {
    
    var wayGeomQuery = "select ST_AsGeoJSON(ST_Transform(geom, 4326)) from ways where gid = $1;";
    
    var res = {};
    
    var promiseQuery = db.any(wayGeomQuery, edgeId)
                .then(function (data) {
                    // console.log(data); 
                    var feature = {
                        type: "Feature",
                        geometry: JSON.parse(data[0].st_asgeojson)
                    };
                    
                    
                    res = feature;      
                    console.log(JSON.stringify(feature));
                                         
                    return feature;
                })
                .then(function(json) {
                    res.send(json);
                });
                
    return res;
}


// "{"type":"LineString","coordinates":[[-7363188.56415306,-1966709.49396243],[-7363186.9920179,-1966718.42049043],[-7363185.41361925,-1966728.21342103],[-7363185.11297188,-1966728.58098419],[-7363183.65984296,-1966728.31843907],[-7363177.54667993,-1966727.110 (...)"
// "{"type":"LineString","coordinates":[[-66.1446482703277,-17.393759093492],[-66.1446341475972,-17.3938356150596],[-66.1446199686009,-17.3939195637205],[-66.1446172678397,-17.3939227146085],[-66.1446042141605,-17.3939204639742],[-66.1445492986826,-17.39391011 (...)"
