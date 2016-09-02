var express = require('express'),
    exphbs  = require('express-handlebars'),
    request = require('request'),
    fs      = require('fs'),
    app     = express(),
    konst   = require('./public/konst.json');

app.use('/static', express.static(__dirname + '/public'));

app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: 'hbs'
}));
app.set('view engine', '.hbs');
app.set('views', __dirname + '/views');

app.get('/', function (req, res) {

  // Collect addresses for the images in this array.
  var imageAddresses = [];
  for (var i = 0; i < konst.length; i++) {

    for (var j = 0; j < konst[i].media.length; j++) {

      imageAddresses.push(konst[i].media[j]);
    }
  }

  for (var i = 0; i < imageAddresses.length; i++) {

    var arr = imageAddresses[i].split("/");
    var imageName = arr[arr.length - 1];

    // Don't try to save all images yet. Make it work first.
    if (i > 2) break;

    //console.log(imageNames[i]);
    //console.log(imageName);

    request(imageAddresses[i], function(error, response, body) {
      if (!error && response.statusCode == 200) {
        fs.writeFile('./images/' + imageName, body, 'binary', function(err) {});
      }
      else if (error) {
        console.log(error);
      }
    });
  }

  res.send(imageAddresses);
  //res.render('home');
});

app.get('/getimages', function (req, res) {

  console.log('test');
});

app.listen(3000, function() {
  console.log('App listening on port 3000');
});
