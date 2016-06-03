var express = require('express');
var router = express.Router();

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

var db = require('../queries');

router.get('/api/way/:source/:target', db.getWayToTarget);

module.exports = router;

