const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 8;
};

const validatePhoneNumber = (phone) => {
  const regex = /^\d{10}$/;
  return regex.test(phone);
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhoneNumber
};
