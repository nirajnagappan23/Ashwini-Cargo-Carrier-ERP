import Tesseract from 'tesseract.js';

/**
 * Parses an LR image to extract key trip details.
 * @param {File} imageFile - The uploaded image file.
 * @returns {Promise<Object>} - Extracted details.
 */
export const parseLR = async (imageFile) => {
    try {
        const result = await Tesseract.recognize(
            imageFile,
            'eng',
            { logger: m => console.log(m) }
        );

        const text = result.data.text;
        console.log("OCR Extracted Text:", text);

        // --- Extraction Logic with Regex ---

        // 1. LR Number
        // Matches "LR No: 19893" or "LR No. 19893"
        const lrMatch = text.match(/LR\s*No[\.:\s]+(\d+)/i);
        const lrNumber = lrMatch ? lrMatch[1] : null;

        // 2. Truck Number
        // Matches "Truck/No.: TN81AY3420" or similar
        // Adjust regex to be flexible with spaces and chars
        const truckMatch = text.match(/Truck[\/\.]?No\.?[\.:\s]+([A-Z0-9]+)/i);
        const vehicleNo = truckMatch ? truckMatch[1] : null;

        // 3. Payment Status
        // Matches "Payment Status: Paid" or "To Pay"
        const payMatch = text.match(/Payment\s*Status[\.:\s]+(Paid|To\s?Pay)/i);
        const paymentStatus = payMatch ? payMatch[1].replace('ToPay', 'To Pay') : null;

        // Determine Payment Mode based on status
        // If "Paid", check if Consignor or Consignee paid? 
        // Image says "GST Payable by: Consignor" or "Remaining Amount to be paid by: Consignor"
        // Let's look for "Paid by"
        // Simple logic: if Payment Status is To Pay -> Mode is 'To Pay'.
        // If Payment Status is Paid -> Mode is 'Paid'.
        const paymentMode = paymentStatus === 'To Pay' ? 'To Pay' : 'Paid';

        // 4. Total Freight
        // Matches "Total Freight 105,000" or "Total Freight: 105,000"
        // We look for digits and optional commas at the end of the line containing Total Freight
        const freightMatch = text.match(/Total\s*Freight[\s\.:]+([\d,]+)/i);
        const totalFreight = freightMatch ? parseFloat(freightMatch[1].replace(/,/g, '')) : null;

        // 5. Consignee Details
        // Consignee block usually starts with "Consignee:"
        // We try to grab the line after "Consignee:" or the same line
        const consigneeMatch = text.match(/Consignee[:\s\-\.]*([^\n]+)/i);
        // Note: It might be "Consignee: M/s. DIRECTORATE..."
        const consigneeName = consigneeMatch ? consigneeMatch[1].trim() : null;

        // 6. Description / Material
        // This is tricky. We look for lines starting with digits (1, 2, 3) between "Product / Material" and "Total"
        // Or just capture the whole block roughly.
        // For now, let's try to find lines that start with a number number like "1 " followed by text
        // Example: "1 Potato Washer cum Peeler"
        const itemMatches = text.matchAll(/^\s*\d+\s+([^\n\d]+)/gm);
        let description = "";
        for (const match of itemMatches) {
            if (match[1] && !match[1].includes("Total")) {
                description += match[1].trim() + ", ";
            }
        }
        if (description) description = description.slice(0, -2); // Remove trailing comma

        // Return the constructed object
        return {
            lrNumber,
            vehicleNo,
            paymentMode,
            totalFreight,
            consigneeName,
            description,
            rawText: text // Useful for debugging
        };

    } catch (error) {
        console.error("OCR Parsing Error:", error);
        throw new Error("Failed to scan image. Please ensure it's clear.");
    }
};
