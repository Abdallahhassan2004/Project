function parsePrice(price) {
    if (typeof price === 'string') {
        // Remove currency symbols, spaces, and commas
        const cleanedPrice = price.replace(/[EGP£$,\s]/g, '');
        const parsed = parseFloat(cleanedPrice);
        return isNaN(parsed) ? 0 : parsed;
    } else if (typeof price === 'number') {
        return isNaN(price) ? 0 : price;
    }
    return 0;
}

module.exports = parsePrice; 