// Numbering System Utilities
// Format: ENQ-XXX/DD-MMM-YY (daily reset), ORD-XXX/MMM-YY (monthly reset), LR: continuous

export const generateEnquiryNumber = (date = new Date()) => {
    // Get stored counter for today
    const dateKey = formatDate(date);
    const stored = localStorage.getItem(`enquiryCounter_${dateKey}`);
    const count = stored ? parseInt(stored) + 1 : 1;

    // Save new counter
    localStorage.setItem(`enquiryCounter_${dateKey}`, count.toString());

    const paddedCount = String(count).padStart(3, '0');
    return `ENQ-${paddedCount}/${dateKey}`;
};

export const generateOrderNumber = (date = new Date()) => {
    // Get stored counter for this month
    const monthKey = formatMonth(date);
    const stored = localStorage.getItem(`orderCounter_${monthKey}`);
    const count = stored ? parseInt(stored) + 1 : 1;

    // Save new counter
    localStorage.setItem(`orderCounter_${monthKey}`, count.toString());

    const paddedCount = String(count).padStart(3, '0');
    return `ORD-${paddedCount}/${monthKey}`;
};

export const getNextLRNumber = () => {
    const stored = localStorage.getItem('lastLRNumber');
    const lastLR = stored ? parseInt(stored) : 19984; // Starting from 19985
    const nextLR = lastLR + 1;

    localStorage.setItem('lastLRNumber', nextLR.toString());
    return nextLR.toString();
};

export const formatDate = (date = new Date()) => {
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
};

export const formatMonth = (date = new Date()) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = String(date.getFullYear()).slice(-2);
    return `${month}-${year}`;
};

export const formatDisplayNumber = (lrNumber, orderNumber) => {
    return `${lrNumber} / ${orderNumber}`;
};

export const getEnquiryExpiry = (createdDate) => {
    const created = new Date(createdDate);
    const expiry = new Date(created);
    expiry.setDate(expiry.getDate() + 7); // 7 days from creation
    return expiry;
};

export const isEnquiryExpired = (createdDate) => {
    const expiry = getEnquiryExpiry(createdDate);
    return new Date() > expiry;
};

export const getExpiryCountdown = (createdDate) => {
    const expiry = getEnquiryExpiry(createdDate);
    const now = new Date();
    const diff = expiry - now;

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `Expires in ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Expires in ${hours} hour${hours > 1 ? 's' : ''}`;
    return 'Expires soon';
};

// Reset counters (for testing/admin purposes)
export const resetDailyCounter = () => {
    const dateKey = formatDate();
    localStorage.removeItem(`enquiryCounter_${dateKey}`);
};

export const resetMonthlyCounter = () => {
    const monthKey = formatMonth();
    localStorage.removeItem(`orderCounter_${monthKey}`);
};
