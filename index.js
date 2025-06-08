
const express = require('express');
const mongoose = require("mongoose")
const app = express();

const room = require("./models/Room")

mongoose.connect("mongodb+srv://alyshawerr:AlyAli@user.yu5pjdd.mongodb.net/?retryWrites=true&w=majority&appName=user")
.then(()=>{
  console.log("connected succesfully")
}).catch((error)=>{
  console.log("error",error)
})
const PORT = 3000;
//mongodb+srv://alyshawer:<AlyAli>@user.yu5pjdd.mongodb.net/?retryWrites=true&w=majority&appName=user
app.get('/', (req, res) => {
  res.send('Hello, world!');
});
app.get("/test",(req,res)=>{
 res.send("you visited hi")
})

app.put("/test",(req,res)=>{
 res.send("you visited hi")
})
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
