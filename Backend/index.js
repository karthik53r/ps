const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());

app.post('/fetch', async (req, res) => {
  var getArea =require('./authenticate');
  const a=req.body.area.toUpperCase();
  var ans=await getArea(a);
  console.log("After getArea "+ans);
  // console.log("Area "+ area + " ");
  res.json(ans);
});

app.listen(8080, function () {
  console.log('Server started on port 8080');
});
