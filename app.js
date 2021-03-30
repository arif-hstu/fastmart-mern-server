
const express = require('express')
const app = express()
const port = 5000;

// require env variables
require('dotenv').config();

// require middlewares
const bodyParser = require('body-parser');
const cors = require('cors');

// apply middlewares
app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// require mongoClient
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rqnu2.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

/*
*	handle database requests
*
*****************************************/
// use connect method to to connect to the server
MongoClient.connect(url, function(err, client) {
	console.log('connection successful');
	// define database collection
	const productCollection = client.db(process.env.DB_NAME).collection('events');
	// handle events data request
	app.get('/allProducts', (req, res) => {
		productCollection.find({})
		.toArray((err, documents) => {
			res.send(documents);
			console.log('product list sent to client')
		})
	})


	/*
	*
	* handle all product post
	*
	*************************/
	// app.post('/addProducts', (req, res) => {
	// 	productCollection.insertMany(req.body)
	// 	.then(res=> console.log(res));
	// 	console.log(req.body)
	// 	res.send('your data sent to database');
	// })
}) 


/*
*	handle general requests
*
*****************************************/
app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.listen(process.env.PORT || port);