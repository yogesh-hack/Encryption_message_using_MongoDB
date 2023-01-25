
# Simple Encryption and Decryption Application

## Initialized framework -> express
```js
const express = require('express')
const app = express();
var parser = require('body-parser');
app.use(parser.urlencoded({ extended: false }))
app.use(parser.json())
```
## create HTTP server
```js
const http  =require('http').createServer(app);
```

## Include Mongo Db
```js
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://yogesh:9911208930@cluster0.yjdbx2j.mongodb.net/test"
const client = new MongoClient(uri);
```

## set encryptted algorithms
```js
const crypto = require('crypto');
const algorithm = 'aes-256-cbc'

// set private key  => lenght must be 32 character
const key = 'yogesh-computers-programming-tec'

// set random 16 digit initilization vector
const iv  = crypto.randomBytes(16);
```
## set template engine
```js
app.set("view engine","ejs");
``

## start the server
```js
const port = process.env.PORT || 3000
http.listen(port, () => {
    console.log(`server started running....,${port}`)
 ```
 app.use(function(req,res,next){
        res.locals.userValue = null;
        res.locals.decryptdata = null;
        next();
    })
## connect mongoDB server
```js
app.get('/',function(req,res){
   res.render('index')
 });
 ```

## convert plain text to encrypted text which is comming from textarea (`index.ejs`)
```js
    app.post('/',async function (req,result){
        const message = {
            data : req.body.text
        }
        
        await client.connect();
        
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
        result.render("index",{
             userValue : encryptiondata,
        })
    })
```
## convert encrypted text to plain text which is comming from textarea (`index.ejs`)
```js 
    app.post('/d', async function(req,result) {
        const encrypted = {
            data : req.body.decrypt
        }
       
        await client.connect();
      

        const obj = client.db('login_data').collection('string')
        const out = await obj.findOne({encrypteddata : encrypted.data})
      
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
```

