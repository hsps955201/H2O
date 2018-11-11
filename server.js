const express = require('express')
const app = express()
var cors = require('cors')
var router = express.Router();
const port = 9999
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
var geolib = require('geolib')
//connect front end
app.use(express.static(__dirname + '/public'));


var allowedOrigins = ['http://104.215.183.94:9999',
                      'http://104.215.183.94:9999/loc?',
                        'https://www.bing.com/fd/ls/lsp.aspx',
                        'http://104.215.183.94:9999/dat?'
                    ];
app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
app.get('/loc', function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    var url = "mongodb://140.113.216.18:27019/"
    MongoClient.connect(url, function(err, client) {
        if (err) throw err;
        console.log('mongodb is running!');
        var db = client.db('predict');
    
        db.collection("date_2016_01_07").find().toArray(function(err, result) {
            if (err) console.log("err");
            if (result) {
                var value = sendback(result, req.query.x, req.query.y)
            }
            client.close();
            
            var url = "mongodb://140.113.216.18:27019/"
            MongoClient.connect(url, function(err, client) {
                if (err) console.log("err");
                console.log('mongodb is running!');
                var db = client.db('q450_4');
                db.collection("q450").find({lat : {$lt :25.050061601357022, $gt : 25.048978245998175}}).toArray(function(err, result) {
                    if (err) throw err;
                    if (result) {
                        sendback2(result, value) 
                    }  
                    client.close();
                    //if (result) sendback1(result, value, idx)  
                })    
            
            })       
        })      
        
    })
    //console.log(req.query.lat);    
    
    //console.log(value)
    //console.log(inverse)
    
    function sendback(data, x, y){
        var now = {latitude: Number(x), longitude: Number(y)};
        console.log(now)
        var spots = {
        "0": {latitude: 25.1826, longitude: 121.5297},
        "1": {latitude: 25.0377, longitude: 121.5149},
        "2": {latitude: 25.1621, longitude: 121.5445},
        "3": {latitude: 25.1095, longitude: 121.4697},
        "4": {latitude: 25.0780, longitude: 121.5429},
        "5": {latitude: 25.1163, longitude: 121.5138},
        "6": {latitude: 25.1175, longitude: 121.5372},
        "7": {latitude: 25.0903, longitude: 121.5030},
        "8": {latitude: 25.0794, longitude: 121.5755},
        "9": {latitude: 25.1757, longitude: 121.5224},
        "10": {latitude: 25.0378, longitude: 121.5646},
        "11": {latitude: 25.0780, longitude: 121.5429},
        "12": {latitude: 25.1291, longitude: 121.5771},
        "13": {latitude: 25.0487, longitude: 121.5504},
        "14": {latitude: 25.0144, longitude: 121.5395},
        "15": {latitude: 25.1335, longitude: 121.4693}
        }
        var distance = new Array(16)
        var inverse = new Array(16)
        var amount = 0
        for (var i = 0; i < 16; i++) { 
            distance[i] = geolib.findNearest(now, spots, i)
            inverse[i]= 1/(distance[i]['distance']*distance[i]['distance'])        
            amount += inverse[i]
            //amount += distance[i]['distance']
        }
        console.log(x, y)
        //console.log(distance)
        //console.log( distance[0]['key'])
        //console.log( distance[1]['key'])
    
        var value = 0
        for (var i =0 ; i<16; i++){
            //distance[i]['distance']/=amount
            inverse[i]/=amount
            value += inverse[i]*data[0][String(i)]  //guess[i]      
            //console.log(distance[i]['key'],distance[i]['distance'])
            console.log(value)
        }
        return value

    }
    function sendback2(result, value) {
        var idx = 0;
        if (value === 0) {
            idx = 0
        }
        else if (value < 200) {
            idx = 1
        }
        else if (value < 450) {
            idx = 6
        }
        else {
            if (result[0]['flooding'] < 0.5) {
                idx = 2
            }
            else if (result[0]['flooding'] < 0.7) {
                idx = 3
            }
            else if (result[0]['flooding'] < 1) {
                idx = 4
            }
            else {
                idx = 5
            }
        }

        // req.on('end',function(){        
        //     res.end(JSON.stringify(value, data[0]['flooding'], idx))
        // //console.log(JSON.stringify(value))
        // });
        var result2 = {}
        result2.value = value
        result2.data = result[0]['flooding']
        result2.idx = idx 
        res.send(JSON.stringify(result2));
    }
 //Connect to the db
 //25.049104755323288
   
    
});



// app.get('/dat', function(req, res) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.send(req.query);
//     //console.log(dates);
//     var url = "mongodb://140.113.216.18:27019/"
//     MongoClient.connect(url, function(err, client) {
//         if (err) throw err;
//         console.log('mongodb is running!');
//         var db = client.db('predict');    
//             db.collection("date_2016_01_07").find().toArray(function(err, result) {
//             if (err) throw err;
//             num = result[0]['0']
//             console.log(result[0]['0'])  
//             if (result) sendback(result, req.query.x, req.query.y)          
//             client.close();
//         })      
        
//     })
// });




app.listen(port, function() {
    console.log("Listening on " + port);
});