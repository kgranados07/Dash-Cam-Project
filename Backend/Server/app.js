const express = require("express");
const eventController = require("./0_presentation/eventController");
const ticketController = require("./0_presentation/ticketController");
const cameraController = require("./0_presentation/cameraController");
const userController = require("./0_presentation/userController");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.post("/events", eventController.postEvent);
app.post("/cameras", cameraController.postCamera);
app.post("/tickets", ticketController.postTicket);
app.post("/users", userController.postUser);
app.get("/events/:id", eventController.getEvent);
app.get("/tickets", ticketController.getTickets);
app.get("/tickets/:id", ticketController.getTicket);
app.patch("/tickets/:id/payment", ticketController.updatePayment);
app.get("/cameras/:id", cameraController.getCamera);
app.get("/users/:id", userController.getUser);
app.use(express.static('public'));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
