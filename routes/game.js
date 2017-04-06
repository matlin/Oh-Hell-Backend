var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('No game has been created.');
});

//change to post
router.get('/create/', (req, res, next) {
  res.send('Created new game');
});

router.get('/:id'), (req, res, next) {
  //give game info for that player
});

module.exports = router;
