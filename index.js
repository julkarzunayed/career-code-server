const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vpoctao.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

        const jobsCollection = client.db("careerCode").collection('jobs');
        const applicationCollection = client.db("careerCode").collection('applications');

        //Jobs APIs
        app.get('/jobs', async (req, res) => {

            const hr_email = req.query.email;
            const query = {}
            if(hr_email){
                query.hr_email = hr_email;
            };
            const cursor = jobsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        //can be done but we will not do
        // app.get('/myAddedJobs', async (req, res) => {
        //     const hr_email = req.query.email;
        //     console.log(hr_email);
        //     const query = { hr_email: hr_email, };
        //     const result = await jobsCollection.find(query).toArray();
        //     res.send(result);
        // })

        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await jobsCollection.findOne(query);
            res.send(result);
        });

        app.post('/jobs', async (req, res) => {
            const newJob = req.body;
            const result = await jobsCollection.insertOne(newJob);
            res.send(result)
        }) 

        //Application API

        app.get('/applications', async (req, res) => {
            const email = req.query.email;
            const query = {
                applicant: email
            };
            const result = await applicationCollection.find(query).toArray();

            //bad way to aggregate data
            for(const application of result ){
                const jobId = application.jobId;
                const jobQuery = {_id: new ObjectId(jobId)};
                const job = await jobsCollection.findOne(jobQuery)
                application.company = job.company;
                application.title = job.title;
                application.location = job.location;
                application.company_logo = job.company_logo;

            }
            res.send(result);

        });

        app.get('/applications/job/:job_id', async (req, res) => {
            const jobId = req.params.job_id;
            const query = {jobId : jobId};
            const result = await applicationCollection.find(query).toArray();
            res.send(result);
        })

        app.post('/applications', async (req, res) => {
            const application = req.body;
            const result = await applicationCollection.insertOne(application);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send("Career Code is Cooking.");
});

app.listen(port, () => {
    console.log(`Career Code is running on port: ${port}`)
})