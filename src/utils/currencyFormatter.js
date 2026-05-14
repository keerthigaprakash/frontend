/**
 * Formats a number as Indian Rupees (INR).
 * 
 * @param {number|string} amount - The amount to format.
 * @param {boolean} includeDecimals - Whether to include decimal places (default: false).
 * @returns {string} The formatted currency string.
 */
export const formatPrice = (amount, includeDecimals = false) => {
  const num = Number(amount);
  if (isNaN(num)) return '₹0';
  
  return '₹' + num.toLocaleString('en-IN', {
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0,
  });
};
