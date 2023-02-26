

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// import libraries
const f = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const express = require('express');
const bodyParser = require('body-parser');

// initialize firebase in order to access its services
admin.initializeApp(f.config().firebase);

// initialize express server
const app = express();
const main = express();

// add the path to receive request and set json as bodyParser to process the body
main.use('/api', app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

app.use(cors({ origin: true }));

// initialize the database and the collection
const db = admin.firestore();
const userCollection = 'users';


// define google cloud function name
exports.webApi = f.https.onRequest(main);


// Create new user
app.post('/users', async (req, res) => {
    try {
        const user = {
            firstName: req.body['firstName'],
            lastName: req.body['lastName'],
            id: req.body['email'],
            password: req.body['password'],
        }
        const newDoc = await db.collection(userCollection).add(user);
        res.status(201).send(`Created a new user: ${newDoc.id}`);
    } catch (error) {
        res.status(400).send(`User should cointain firstName, lastName, email`)
    }
});


app.get('/users', async (req, res) => {
    try {
        const userQuerySnapshot = await db.collection(userCollection).get();
        const users = [];
        userQuerySnapshot.forEach(
            (doc)=>{
                users.push({
                    id: doc.id,
                    data:doc.data()
            });
            }
        );
        res.status(200).json(users);
    } catch (error) {
        res.status(500).send(error);
    }
});

//get a single contact
app.get('/users/:userId', (req,res) => {

    const userId = req.params.id; 
    db.collection(userCollection).doc(userId).get()
    .then(user => {
        if(!user.exists) throw new Error('User not found');
        res.status(200).json({id:user.id, data:user.data()})})
    .catch(error => res.status(500).send(error));
        
});

// Update user
app.put('/users/:userId', async (req, res) => {
    await db.collection(userCollection).doc(req.params.userId).set(req.body,{merge:true})
    .then(()=> res.json({id:req.params.userId}))
    .catch((error)=> res.status(500).send(error))

});

