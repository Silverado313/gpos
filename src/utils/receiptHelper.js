/**
 * Utility for generating professional receipt messages and sharing links.
 */

const DOMAIN = 'https://gpos-web.web.app';

/**
 * Generates a professional text summary for a sale.
 */
export const generateReceiptMessage = (sale, settings) => {
    const businessName = settings?.businessName || 'GPOS Business';
    const currency = sale.currency || 'PKR';
    const total = sale.total?.toFixed(2);
    const date = sale.createdAt?.toDate ? sale.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString();
    const invoiceUrl = `${DOMAIN}/invoice/${sale.id}`;

    return `*Receipt from ${businessName}*
--------------------------
*Transaction ID:* #${sale.id.slice(-6).toUpperCase()}
*Date:* ${date}
*Items:* ${sale.items?.length || 0}
*Total Amount:* ${currency} ${total}
--------------------------
View your digital receipt here:
${invoiceUrl}

Thank you for shopping with us!`;
};

/**
 * Generates a WhatsApp sharing link.
 */
export const getWhatsAppLink = (phone, message) => {
    // Remove non-numeric characters from phone
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

/**
 * Generates an SMS sharing link.
 */
export const getSMSLink = (phone, message) => {
    const cleanPhone = phone.replace(/\D/g, '');
    // Using & as separator for iOS/Android compatibility in some browsers, 
    // but ? is standard for the first parameter.
    return `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
};
