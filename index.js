require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())
// 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xlwti.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();
    const movieCollection = client.db("movieDB").collection("movies")
    const favoriteCollection = client.db("movieDB").collection("favorites")

    app.get("/topmovies", async (req,res) =>{
        const cursor = movieCollection.find().sort({ rating: -1 }).limit(6)
        const result = await cursor.toArray()
        res.send(result)
      })


    app.get("/movies", async (req,res) =>{
        const { search } = req.query
        let option = {}
        if(search){
          option = {title : { $regex : search , $options : 'i' }}
        }
        const result = await movieCollection.find(option).toArray()
        res.send(result)
      })
  
    app.get("/movies/:id", async (req,res)=>{
        const id = req.params.id
        const query = {_id : new ObjectId(id)}
        const result = await movieCollection.findOne(query)
        res.send(result)
    })



    app.get("/favorites", async (req,res) =>{
      const cursor = favoriteCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get("/favorites/:email", async (req,res)=>{
      const email = req.params.email
      const query = {email : email}
      const cursor = favoriteCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
  })



    app.post('/movies', async (req,res)=>{
        const newMovie = req.body
        // console.log(newMovie);
        const result = await movieCollection.insertOne(newMovie)
        res.send(result)
    })

    app.post('/favorites', async (req,res)=>{
        const newFavorite = req.body
        // console.log(newFavorite);
        const result = await favoriteCollection.insertOne(newFavorite)
        res.send(result)
    })

    app.put('/movies/:id',async (req, res)=>{
        const id = req.params.id
        const updatedMovie = req.body
        const filter = {_id : new ObjectId(id)}
        const options = { upsert: true }
        const movie = {
          $set: {
            poster: updatedMovie.poster, 
            title: updatedMovie.title, 
            genre: updatedMovie.genre, 
            year: updatedMovie.year, 
            rating: updatedMovie.rating, 
            duration: updatedMovie.duration, 
            summery: updatedMovie.summery
 
          }
        }

        const result = await movieCollection.updateOne(filter, movie, options)
        res.send(result)
    })

    app.delete("/movies/:id", async (req,res)=>{
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const result = await movieCollection.deleteOne(query)
      res.send(result)
    })


    app.delete("/favorites/:id", async (req,res)=>{
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const result = await favoriteCollection.deleteOne(query)
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req,res)=>{
    res.send("server is running")
})

app.listen(port, ()=>{
    console.log(`Server is running port ${port}`);
})
