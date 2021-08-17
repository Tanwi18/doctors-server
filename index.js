const express=require('express');
require('dotenv').config();
const bodyParser =require('body-parser');
const cors=require('cors');
console.log(process.env.DB_USER)
console.log(process.env.DB_PASS)
const { MongoClient } = require('mongodb');
const fileUpload= require('express-fileupload');

// DB_PASS:ourdoctors1356
// DB_USER:doctor
// DB_NAME:doctor's-portal

const uri = `mongodb+srv://doctor:ourdoctors1356@cluster0.kfttk.mongodb.net/doctor's-portal?retryWrites=true&w=majority`;

const app=express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors')); //creating doctors folder
app.use(fileUpload());

app.get('/',(req,res)=>{
    res.send('It is server for doctor');
})



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("doctor's-portal").collection("appointment");
  const doctorsCollection = client.db("doctor's-portal").collection("doctors");
  console.log('db connected successfully')

  app.post('/addAppointment',(req,res)=>{
      const appointment=req.body;
      console.log(appointment)
      collection.insertOne(appointment)
      .then(result=>{
          console.log(result)
          res.send(result);
      })

  })

  app.post('/appointmentByDate',(req,res)=>{
    const date=req.body;
    const email = req.body.email;
    console.log(date.date)

    doctorsCollection.find({email:email})
    .toArray((err,doctors)=>{
        const filter={date:date.date}
        if(doctors.length===0){
            filter.email=email;
        }
        collection.find(filter)
        .toArray((err,documents)=>{
            console.log(email,date.date,doctors,documents)
            res.send(documents)
    })
   
    })
})

app.post('/addADoctor',(req,res)=>{
    const file=req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    console.log(name,email,file)
    file.mv(`${__dirname}/doctors/${file.name}`,err=>{
        if(err){
            console.log(err);
            return res.status(500).send({msg:'faiiled to upload'});
        }
        
        doctorsCollection.insertOne({name,email,img:file.name})
        .then(result=>{
            console.log(result)
            res.send(result);
        })
        return res.send({name:file.name,path:`/${file.name}`})
    })
})

});


app.listen(process.env.PORT||5000);