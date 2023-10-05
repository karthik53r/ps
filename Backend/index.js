const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());



app.use(cors());

app.post('/fetch', async (req, res) => {
   
 
  let a=req.body.area.toUpperCase()
  console.log(`'${a}'`)
  res.json(req.body.area);
});

app.listen(8080, function () {
  console.log('Server started on port 8080');
});
