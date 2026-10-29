// Entry point - start server (turn on your server)
const express = require("express"); // imports the express web framework (tool) to create a server
const eventController = require("./0_presentation/eventController"); // imports the presentation layer

const app = express(); // Created an express app instance (server)
const PORT = 3000;

// Routing
// Route parameters: any user request (e.g., /orders/1) is passed to orderController.getOrder
app.get("/events/:id", eventController.getEvent); // Defines a route for GET /orders/:id

// Starts the server
// Confirms that it's running at http://localhost:3000
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
});