require('dotenv').config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require("cors");
const app = express();

const port = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5cknjnc.mongodb.net/?retryWrites=true&w=majority`;

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
        // Connect the client to the server (optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });

        const productCollection = client.db("assignment-10DB").collection("product");
        console.log(productCollection);

        app.post("/product", async (req, res) => {
            const newProduct = req.body;
            console.log("New Product:", newProduct);
            const result = await productCollection.insertOne(newProduct);
            console.log(result);
            res.send(result);
        });

        app.get("/product", async (req, res) => {
            const result = await productCollection.find().toArray();
            res.send(result);
        });

        app.get("/product/:id", async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            };
            const result = await productCollection.findOne(query);
            console.log(result);
            res.send(result);
        });

        app.put("/product/:id", async (req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
            console.log("id", id, updatedProduct);
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const product = {
              $set: {
                name: updatedProduct.name, 
                price: updatedProduct.price, 
                brand: updatedProduct.brand, 
                rating: updatedProduct.rating, 
                description: updatedProduct.description, 
                product_img: updatedProduct.product_img
              },
            };
            const result = await productCollection.updateOne(
              filter,
              product,
              options
            );
            res.send(result);
          });

        
        // My Cart
        
        const cartCollection = client.db("assignment-10DB").collection("cart");
        console.log(cartCollection);
        
        app.get("/cart", async (req, res) => {
            
            const userCart = await cartCollection.find(/* Your query here */).toArray();
            res.send(userCart);
        });
        
        app.post("/cart", async (req, res) => {
            const newCartItem = { ...req.body, userEmail: req.userEmail };
            const result = await cartCollection.insertOne(newCartItem);
            console.log("Cart:", result);
            res.send(result);
        });

        // app.post("/cart", async (req, res) => {
        //     const newCartItem = req.body;
        //     console.log("New Product:", newCartItem);
        //     const result = await productCollection.insertOne(newCartItem);
        //     console.log(result);
        //     res.send(result);
        // });

        app.delete("/cart/:id", async (req, res) => {
            const id = req.params.id;
            console.log("delete", id);
            const query = {
              _id: new ObjectId(id),
            };
            const result = await cartCollection.deleteOne(query);
            console.log(result);
            res.send(result);
          });
        

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Assignment-10-Server is running...");
});

app.listen(port, () => {
    console.log(`Assignment-10-Server is Running on port ${port}`);
});
