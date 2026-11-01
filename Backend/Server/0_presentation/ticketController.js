// Presentation layer: the controller does NOT access the DB directly, this delegates to the service
const TicketService = require("../1_business/ticketService");

// Controller function: Get a specific order by ID
// This is mapped in Express server with: app.get("/orders/:id", orderController.getOrder)
exports.getTicket = async(req, res) => {
    try {

        // Extract the :id parameter from the request URL and convert it to an base10 integer
        // Example: GET /orders/1 -> orderId = 1
        const TicketId = parseInt(req.params.id, 10);
        // Delegate to Business layer: ask the service to retrieve the order by ID
        const ticket = await TicketService.getTicketById(TicketId);

        // If no order is found, then return 404 not found error message
        if(!ticket) {
            return res.status(404).json({message: "ticket not found lol jk lmao"});
        }
        // If order does exit, then return it as a JSON response to the client (to browser, react app, etc.)
        res.json(ticket);

    } catch (err) {
        // Error handling: log the error and return 500 internal server error
        console.error("Controller Error:", err.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}