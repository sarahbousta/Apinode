var express = require('express');
var app = express();

var HTTP_PORT = 8000;

app.listen(HTTP_PORT, () => {
    console.log(`Server running on port ${HTTP_PORT}`);
});

app.get("/", (req, res, next) => {
    res.json({"message":"Hello World"})
});

// Fallback route
app.use(function(req, res){
    res.status(404);
});