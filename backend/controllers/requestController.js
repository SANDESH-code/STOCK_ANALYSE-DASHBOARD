const RequestModel = require('../models/requestModel');
const TicketModel = require('../models/ticketModel');

class RequestController {
  static async createRequest(req, res) {
    try {
      const { ticket_id, offered_price } = req.body;

      if (!ticket_id || !offered_price) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const ticket = await TicketModel.getById(ticket_id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      const requestId = await RequestModel.create(ticket_id, req.userId, ticket.seller_id, offered_price);

      res.status(201).json({
        message: 'Request created successfully',
        requestId
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getMyRequests(req, res) {
    try {
      const requests = await RequestModel.getBuyerRequests(req.userId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getReceivedRequests(req, res) {
    try {
      const requests = await RequestModel.getSellerRequests(req.userId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateRequestStatus(req, res) {
    try {
      const { status, rejection_reason } = req.body;
      const requestId = req.params.id;

      if (!['Accepted', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const request = await RequestModel.getById(requestId);
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      if (request.seller_id !== req.userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      await RequestModel.updateStatus(requestId, status, rejection_reason);

      if (status === 'Accepted') {
        await TicketModel.updateStatus(request.ticket_id, 'Sold');
      }

      res.json({ message: `Request ${status.toLowerCase()} successfully` });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getRequestById(req, res) {
    try {
      const request = await RequestModel.getById(req.params.id);
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = RequestController;
