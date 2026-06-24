const TicketModel = require('../models/ticketModel');
const { generateTicketCode } = require('../utils/qrGenerator');
const { getAIPriceRecommendation } = require('../utils/priceRecommendation');

class TicketController {
  static async createTicket(req, res) {
    try {
      const { event_name, event_type, event_date, event_location, seat_number, seat_row, original_price, selling_price, quantity, description } = req.body;
      
      if (!event_name || !event_type || !event_date || !original_price || !selling_price) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const suggested_price = getAIPriceRecommendation(original_price, event_date);
      const ticket_code = generateTicketCode();
      const image_path = req.file ? `/uploads/${req.file.filename}` : null;

      const ticketData = {
        ticket_code,
        event_name,
        event_type,
        event_date,
        event_location,
        seat_number,
        seat_row,
        original_price: parseFloat(original_price),
        selling_price: parseFloat(selling_price),
        suggested_price,
        image_path,
        seller_id: req.userId,
        quantity: parseInt(quantity) || 1,
        description
      };

      const ticketId = await TicketModel.create(ticketData);

      res.status(201).json({
        message: 'Ticket created successfully',
        ticketId,
        ticket_code,
        suggested_price
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getAllTickets(req, res) {
    try {
      const filters = {
        event_type: req.query.event_type,
        min_price: req.query.min_price ? parseFloat(req.query.min_price) : null,
        max_price: req.query.max_price ? parseFloat(req.query.max_price) : null,
        search: req.query.search
      };

      const tickets = await TicketModel.getAll(filters);
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getTicketById(req, res) {
    try {
      const ticket = await TicketModel.getById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getSellerTickets(req, res) {
    try {
      const tickets = await TicketModel.getSellerTickets(req.userId);
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async deleteTicket(req, res) {
    try {
      const ticket = await TicketModel.getById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      if (ticket.seller_id !== req.userId && req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      await TicketModel.delete(req.params.id);
      res.json({ message: 'Ticket deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getDashboardStats(req, res) {
    try {
      const stats = await TicketModel.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = TicketController;
