var express = require('express');
var app = express();
const https = require('https')
const fs = require('fs')


app.use(express.json());

app.post('/', function(req, res) {
  console.log(req.body);
  var admissionRequest = req.body;
  console.log(admissionRequest);
  // Get a reference to the pod spec
  var object = admissionRequest.request.object;

  console.log(`validating the ${object.metadata.name} pod`);

  var admissionResponse = {
    allowed: false
  };

  var found = false;
  for (var container of object.spec.containers) {
    if (container.image.includes(process.env.CONTAINER_REGISTRY) === false) {
      console.log(`${container.name} is not using the allowed registry`);

      admissionResponse.status = {
        status: 'Failure',
        message: `${container.name} is not using the allowed registry`,
        reason: `${container.name} is not using the allowed registry`,
        code: 402
      };

      found = true;
    };
  };

  if (!found) {
    admissionResponse.allowed = true;
  }

  var admissionReview = {
    response: admissionResponse
  };

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(admissionReview));
  res.status(200).end();
});


https.createServer({
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem')
}, app).listen(3000, () => {
  console.log('Listening...')
})



