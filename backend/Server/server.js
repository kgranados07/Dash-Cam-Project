// Import Express
const express = require('express');
// Init express app
const app = express();

//Defines port
const PORT = process.env.PORT || 3000;

// Parce JSON
app.use(express.json);

// Home Page Route
app.get('/',(req,res)=>{
    res.send('hey motherfuckers. welcome to my sickass awesome server i made with my bare hands');
});

// API route
app.get('/api/status', (req, res) => {
    res.json({ status: 'Online', timestamp: new Date() });
});

//Start Server
app.listen(PORT, () => {
    console.log(`Server is running and listening on http://localhost:${PORT}`);
});