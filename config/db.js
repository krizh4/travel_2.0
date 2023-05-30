const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const dbName = 'travelPage';

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    
    // TESTIN AREA
    // const database = client.db("TravelPageDatabase");
    // const blogposts = database.collection("Blog Collection");

    // const cursor = blogposts.find({});
    // const allBlogs = await cursor.toArray();
    

    // console.log(allBlogs);    
    // TESTING AREA

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    console.log("Closes");
  }
}

async function getData(query) {
    try {
        const database = client.db("TravelPageDatabase");
        const blogposts = database.collection("Blog Collection");
        
        if (query){
          console.log("Running on Query");
          const allBlogs = await blogposts.findOne({_id: new ObjectId(query)});
          return allBlogs
        } else {
          console.log("Running on Else");
          const cursor = blogposts.find({});
          const allBlogs = await cursor.toArray();
          return allBlogs;
        }
    } finally {
        console.log("hello World");
    }

}

exports.run = run;
exports.getData = getData;

// run().catch(console.dir);