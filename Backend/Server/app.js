const express = require("express");
const eventController = require("./0_presentation/eventController");
const ticketController = require("./0_presentation/ticketController");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.post("/events", eventController.postEvent);
app.get("/events/:id", eventController.getEvent);
app.get("/tickets/:id", ticketController.getTicket);

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
