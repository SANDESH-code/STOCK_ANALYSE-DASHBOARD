const crypto = require('crypto');

const generateTicketCode = () => {
  return 'TKT-' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

const generateQRHash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

const verifyTicketHash = (data, hash) => {
  const computed = crypto.createHash('sha256').update(data).digest('hex');
  return computed === hash;
};

module.exports = {
  generateTicketCode,
  generateQRHash,
  verifyTicketHash
};
