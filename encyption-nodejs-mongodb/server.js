// !===========================initialized framework -> express==========================

const express = require('express')
const app = express();
var parser = require('body-parser');
app.use(parser.urlencoded({ extended: false }))
app.use(parser.json())

// create HTTP server
const http  =require('http').createServer(app);

// !==========================include Mongo DB=============================

const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://yogesh:9911208930@cluster0.yjdbx2j.mongodb.net/test"
const client = new MongoClient(uri);

    // !===========================set encryptted algorithms====================================

const crypto = require('crypto');
const algorithm = 'aes-256-cbc'

// set private key  => lenght must be 32 character
const key = 'yogesh-computers-programming-tec'

// set random 16 digit initilization vector
const iv  = crypto.randomBytes(16);

//? ==================== set template engine ================================
app.set("view engine","ejs");

// start the server
const port = process.env.PORT || 3000
http.listen(port, () => {
    console.log(`server started running....,${port}`)

    //!========================== connect mongoDB server here=============================
    // route to show all encrypted messages
    // app.get("/", async function (request,result) {
    //     // Connect to the MongoDB cluster
    //     await client.connect();
    //     result.render("index",{
    //         data : 'this is sample data'
    //     })
    // })

    app.use(function(req,res,next){
        res.locals.userValue = null;
        res.locals.decryptdata = null;
        next();
    })
     
    app.get('/',function(req,res){
        // res.render('home',{
        //     topicHead : 'Student Form',
        // });
        res.render('index')

        // console.log('user accessing Home page');
    });
    // app.post('/',function(req,res){
    //     var message = {
    //         data : req.body.text
    //     }
    //      console.log(message)
        // res.render('home',{
        //     userValue : student,
        //     topicHead : 'Student Form'
        // });
        // res.render('index',{
        //     userValue : message
        // });
        //res.json(student);
         
    // });
    app.post('/',async function (req,result){
        const message = {
            data : req.body.text
        }
        // console.log(message)
        // Connect to the MongoDB cluster
        await client.connect();
        // Make the appropriate DB calls
        // console.log("connect with Databases:");
        const cipher = crypto.createCipheriv(algorithm,key,iv);
        let  encryptiondata = cipher.update(message.data,'utf-8','hex');
        encryptiondata += cipher.final('hex');
        // convert initilization vector into base64 string
        const base64data = Buffer.from(iv,'binary').toString('base64');
        // save encryption string aliong with initilizatin vector in database
        const data = client.db('login_data').collection('string');
        await data.insertOne({
            iv: base64data,
            encrypteddata: encryptiondata
        });
        // const cursor = data.find();
        // replace console.dir with your callback to access individual elements
        // await cursor.forEach(console.log)
        result.render("index",{
             userValue : encryptiondata,
        })
    })


    app.post('/d', async function(req,result) {
        const encrypted = {
            data : req.body.decrypt
        }
        // console.log(encrypted)
        await client.connect();
        // console.log("Decryptd data is runnning....")

        const obj = client.db('login_data').collection('string')
        const out = await obj.findOne({encrypteddata : encrypted.data})
        // console.log(out)
        // console.log(out._id)
        if(obj == null){
            result.status(401).send("Not found")
            return
        }
        const original = Buffer.from(out.iv, 'base64')
        const decipher = crypto.createDecipheriv(algorithm, key, original);
        let decryptdata = decipher.update(out.encrypteddata, 'hex','utf-8');
        decryptdata += decipher.final('utf-8')
        result.render("index",{ 
            decryptdata : decryptdata
       })
    })

})