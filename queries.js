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
    console.log("target: ", targetId);

    var query = "SELECT seq, id1 AS node, id2 AS edge, cost " + 
                "FROM pgr_dijkstra('SELECT gid AS id, source::integer, target::integer, st_length(geom) AS cost " + 
                "                   FROM public.ways', 1, " + targetId +  ", false, false);";
    
    // console.log("QUERY: ", query);
    return db.any(query, true)
        .then(function (data) {
        console.log("DATA:", data);
    })
        .catch(function (error) {
        console.log("ERROR:", error);
    }); 
}

