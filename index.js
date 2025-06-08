require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Room Booking API is running');
});
app.get("/test",(req,res)=>{
 res.send("you visited hi")
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
