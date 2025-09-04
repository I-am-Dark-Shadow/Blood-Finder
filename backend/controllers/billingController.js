import TestRequest from '../models/testRequestModel.js';
import puppeteer from 'puppeteer';

export const getPatientsForBilling = async (req, res) => {
    try {
        const requests = await TestRequest.find({
            testLab: req.user._id,
            status: 'Completed',
            bill: { $exists: false }
        }).populate('patient', 'name email');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const generateBill = async (req, res) => {
    const { requestId } = req.params;
    const { testsWithPrices, totalPrice } = req.body;

    try {
        const testRequest = await TestRequest.findById(requestId).populate('patient', 'name email');
        if (!testRequest) return res.status(404).json({ message: 'Test request not found.' });

        // Step 1: Handle the uploaded test report from memory
        if (req.file) {
            testRequest.report = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
        }

        // Step 2: Generate the bill HTML
        const htmlContent = generateBillHtml(testRequest, JSON.parse(testsWithPrices), totalPrice, req.user);

        // Step 3: Create the PDF buffer for the bill
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        // Step 4: Update the database record
        testRequest.bill = {
            data: Buffer.from(pdfBuffer),
            contentType: 'application/pdf'
        };
        testRequest.testsWithPrices = JSON.parse(testsWithPrices);
        testRequest.totalPrice = totalPrice;
        testRequest.billGeneratedAt = new Date();

        await testRequest.save();

        res.json({ message: 'Bill and report saved successfully!', request: testRequest });

    } catch (error) {
        console.error('Error during bill generation:', error);
        res.status(500).json({ message: 'Server Error during bill generation.', error: error.message });
    }
};

export const downloadBill = async (req, res) => {
    try {
        const { requestId } = req.params;
        const testRequest = await TestRequest.findById(requestId);

        if (!testRequest || !testRequest.bill || !testRequest.bill.data) {
            return res.status(404).json({ message: 'Bill not found.' });
        }

        if (testRequest.patient.toString() !== req.user._id.toString() && testRequest.testLab.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to download this bill.' });
        }

        res.set('Content-Type', testRequest.bill.contentType);
        res.send(testRequest.bill.data);

    } catch (error) {
        console.error('Error serving bill from DB:', error);
        res.status(500).json({ message: 'Could not download bill.' });
    }
};

const generateBillHtml = (request, tests, total, lab) => {
    return `
    <!DOCTYPE html><html><head><style>body{font-family:sans-serif;margin:40px;color:#333}.container{border:1px solid #eee;padding:40px}.header{display:flex;justify-content:space-between;align-items:center;padding-bottom:20px;border-bottom:2px solid #b91c1c}.header h1{color:#b91c1c;margin:0;font-size:32px}.lab-info{text-align:right;font-size:12px}table{width:100%;border-collapse:collapse;margin-top:30px}th,td{padding:12px;text-align:left;border-bottom:1px solid #ddd}th{background-color:#f8f8f8}.total-row{font-weight:bold;font-size:18px}.total-row td{border-top:2px solid #333;padding-top:15px}</style></head><body><div class="container"><div class="header"><h1>INVOICE</h1><div class="lab-info"><strong>${lab.name}</strong><br>${lab.address}, ${lab.city}<br>${lab.email}</div></div><div style="margin-top:30px;display:flex;justify-content:space-between;font-size:14px"><div><strong>Billed To:</strong><br>${request.patient.name}<br>${request.patient.email}</div><div><strong>Invoice Date:</strong> ${new Date().toLocaleDateString()}<br><strong>Request ID:</strong> ${request._id}</div></div><table><thead><tr><th>Test Name</th><th>Price</th></tr></thead><tbody>${tests.map(t => `<tr><td>${t.name}</td><td>$${Number(t.price).toFixed(2)}</td></tr>`).join('')}</tbody><tfoot><tr class="total-row"><td style="text-align:right">Total Amount:</td><td>$${Number(total).toFixed(2)}</td></tr></tfoot></table></div></body></html>`;
};