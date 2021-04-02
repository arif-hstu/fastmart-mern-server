
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


/***********
*	handle database requests
************/
// use connect method to to connect to the server
MongoClient.connect(url, function(err, client) {
	console.log('connection successful');
	// define database collection
	const productCollection = client.db(process.env.DB_NAME).collection('events');

	/***********
	*	handle GET requests
	************/
	// handle products data request
	app.get('/allProducts', (req, res) => {
		productCollection.find({})
			.toArray((err, documents) => {
				res.send(documents);
				console.log('product list sent to client')
			})
	})


	/***********
	*	handle POST requests
	************/
	// find many with the Array of ID
	app.post('/findProducts', (req, res) => {
		let objectIdList = [];
		req.body.cartData.map(productId => {
			const singleObjectId = ObjectId(productId);
			objectIdList.push(singleObjectId);
		})

		productCollection.find({ "_id": { "$in": objectIdList } })
			.toArray((err, documents) => {
				res.send(documents);
			})
	})

	// handle placed orders
	// define database collection
	const orderCollection = client.db(process.env.DB_NAME).collection('orders');
	// handle events data request
	app.post('/placeOrder', (req, res) => {
		orderCollection.insertOne(req.body)
			.then(result => {
				res.send(result.insertedId);
				console.log(result, 'placeOrder');
			})
	})

	// handle track order post request
	app.post('/trackOrder', (req, res) => {
		let trackError;
		const loggedInUser = req.body;
		if (loggedInUser.email) {

			orderCollection.find({ $and: [{ email: loggedInUser.email }] })
				.toArray((err, documents) => {
					res.send(documents);
				})
		}
	})

	// handle add product by admin
	app.post('/addProduct', (req, res) => {
		productCollection.insertOne(req.body)
			.then(res => console.log(req.body));
		res.send(JSON.stringify({
			response: 'Your product added successfully!'
		}));
	})


	// handle product deletion
	app.post('/deleteProduct', (req, res) => {
		productCollection.deleteOne({ "_id": ObjectId(req.body.deletedId) })
			.then(res => console.log(res))
			.catch(error => {
				console.log(error)
			})
		res.send(JSON.stringify({
			response: 'deleted'
		}));
	})
})


/************
*	handle general requests
*************/
app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.listen(process.env.PORT || port);