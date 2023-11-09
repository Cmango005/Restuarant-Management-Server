const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
console.log(process.env.DB_PASS)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h0tacow.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const foodCollection = client.db('restaurantMenu').collection('menu');
        const orderCollection = client.db('restaurantMenu').collection('order');
        app.get('/menu', async (req, res) => {
            const cursor = foodCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/detail/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const options = {
                projection: { FoodName: 1, FoodImage: 1, FoodCategory: 1, Price: 1, MadeBy: 1, FoodOrigin: 1, Description: 1, Quantity: 1, OrderNumber: 1 }
            };
            const result = await foodCollection.findOne(query, options);
            res.send(result);
        })
        app.get('/order', async (req, res) => {
            console.log(req.query);
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
                console.log(query)
            }
            const cursor = orderCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        app.post('/order', async (req, res) => {
            const order = req.body;
            console.log(order);
            const result = await orderCollection.insertOne(order);
            res.send(result)
        })

        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await orderCollection.deleteOne(query);
            res.send(result)
        })
        app.get('/menu/my', async (req, res) => {
            if (req.query?.email) {

                query = { email: req.query.email }
                console.log(query)
            }
            const cursor = foodCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        app.post('/menu', async (req, res) => {
            const newMenu = req.body;
            console.log(newMenu);
            const result = await foodCollection.insertOne(newMenu);
            res.send(result)
        })
        app.put('/menu/:id', async (req, res) => {

            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const newUpdate = req.body;
            const product = {
                $set: {
                    FoodName: newUpdate.FoodName,
                    FoodImage: newUpdate.FoodImage,
                    FoodCategory: newUpdate.FoodCategory,
                    Price: newUpdate.Price,
                    Description: newUpdate.Description,
                    Quantity: newUpdate.Quantity
                }
            }
            const result = await foodCollection.updateOne(filter, product, options);
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('restaurant is running')
})
app.listen(port, () => {
    console.log(`restaurant server is running ${port}`)
})