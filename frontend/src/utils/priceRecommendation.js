export const getAIPriceRecommendation = (originalPrice, eventDate) => {
  const now = new Date();
  const eventTime = new Date(eventDate);
  const hoursDiff = (eventTime - now) / (1000 * 60 * 60);

  if (hoursDiff < 6) {
    return Math.round(originalPrice * 0.7);
  } else if (hoursDiff < 24) {
    return Math.round(originalPrice * 0.85);
  } else if (hoursDiff < 48) {
    return Math.round(originalPrice * 0.95);
  } else {
    return originalPrice;
  }
};
