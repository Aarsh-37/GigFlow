import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import logger from '../config/logger.js';

const generateInvoice = async (invoiceData) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const fileName = `invoice-${invoiceData.orderId}-${Date.now()}.pdf`;
            const filePath = path.join('invoices', fileName);

            // Ensure invoices directory exists
            if (!fs.existsSync('invoices')) {
                fs.mkdirSync('invoices');
            }

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Add content to the PDF
            doc.fillColor('#444444')
                .fontSize(20)
                .text('GigFlow Invoice', 110, 57)
                .fontSize(10)
                .text('The Future of Freelancing', 110, 80)
                .moveDown();

            doc.fontSize(10)
                .text(`Invoice Number: ${invoiceData.orderId}`, 50, 200)
                .text(`Invoice Date: ${new Date().toLocaleDateString()}`, 50, 215)
                .text(`Amount: ${invoiceData.currency} ${invoiceData.amount}`, 50, 230)
                .moveDown();

            doc.text(`Client: ${invoiceData.clientName}`, 50, 260)
                .text(`Freelancer: ${invoiceData.freelancerName}`, 50, 275)
                .moveDown();

            doc.end();

            stream.on('finish', () => {
                logger.info(`Invoice generated: ${filePath}`);
                resolve(filePath);
            });

        } catch (error) {
            logger.error(`Error generating invoice: ${error.message}`);
            reject(error);
        }
    });
};

export { generateInvoice };
