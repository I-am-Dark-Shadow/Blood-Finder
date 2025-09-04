import TestRequest from '../models/testRequestModel.js';
import Donation from '../models/donationModel.js';
import BloodStock from '../models/bloodStockModel.js';
import puppeteer from 'puppeteer';
import { Parser } from 'json2csv';
import cloudinary from '../config/cloudinary.js';

// 1. Fetch paginated patient records for the table display
export const fetchPatientRecords = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const records = await TestRequest.find({ testLab: req.user._id, status: 'Completed' })
            .populate('patient', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
            
        const totalRecords = await TestRequest.countDocuments({ testLab: req.user._id, status: 'Completed' });

        res.json({
            records,
            currentPage: page,
            totalPages: Math.ceil(totalRecords / limit)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 2. Export records as either PDF or CSV
export const exportPatientRecords = async (req, res) => {
    const { format, year, month } = req.query;
    
    try {
        // Build the date query
        const query = { testLab: req.user._id, status: 'Completed' };
        if (year) {
            const startDate = new Date(parseInt(year), month ? parseInt(month) - 1 : 0, 1);
            const endDate = new Date(parseInt(year), month ? parseInt(month) : 12, 0, 23, 59, 59);
            query.createdAt = { $gte: startDate, $lte: endDate };
        }

        const records = await TestRequest.find(query).populate('patient', 'name').sort({ createdAt: -1 });

        if (records.length === 0) {
            return res.status(404).send("No records found for the selected period.");
        }
        
        // --- CSV EXPORT ---
        if (format === 'csv') {
            const fields = ['patient.name', 'tests', 'createdAt', 'status', 'totalPrice'];
            const opts = { fields, header: true };
            const parser = new Parser(opts);
            const csv = parser.parse(records);
            res.header('Content-Type', 'text/csv');
            res.attachment(`patient-records-${year}${month ? '-'+month : ''}.csv`);
            return res.send(csv);
        }

        // --- PDF EXPORT ---
        if (format === 'pdf') {
            const htmlContent = generatePdfHtml(records, req.user, { year, month });
            const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
            const page = await browser.newPage();
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
            const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
            await browser.close();

            res.header('Content-Type', 'application/pdf');
            res.attachment(`patient-records-${year}${month ? '-'+month : ''}.pdf`);
            return res.send(pdfBuffer);
        }

        return res.status(400).send("Invalid format specified.");

    } catch (error) {
         res.status(500).json({ message: 'Server Error while exporting', error: error.message });
    }
};


// 3. NEW FUNCTION: Securely download a single test report
export const downloadReport = async (req, res) => {
    try {
        const { requestId } = req.params;
        const testRequest = await TestRequest.findById(requestId);

        // Security Check
        if (!testRequest || !testRequest.report || !testRequest.report.data) {
            return res.status(404).json({ message: 'Report not found.' });
        }

        if (
            testRequest.patient.toString() !== req.user._id.toString() &&
            testRequest.testLab.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: 'You are not authorized to download this report.' });
        }

        res.set('Content-Type', testRequest.report.contentType);
        res.send(testRequest.report.data);

    } catch (error) {
        console.error('Error serving report from DB:', error);
        res.status(500).json({ message: 'Could not download report.' });
    }
};


// Helper function to generate professional HTML for the PDF
const generatePdfHtml = (records, labInfo, period) => {
    const totalRevenue = records.reduce((sum, record) => sum + (record.totalPrice || 0), 0);
    const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const reportPeriod = period.month ? `${monthNames[period.month]}, ${period.year}` : `Year ${period.year}`;

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; }
                .container { max-width: 800px; margin: auto; padding: 30px; }
                .header { display: flex; justify-content: space-between; align-items: start; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                .header h1 { margin: 0; color: #b91c1c; }
                .lab-info { text-align: right; font-size: 12px; }
                .title { text-align: center; margin: 30px 0; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 14px; }
                th { background-color: #f7fafc; }
                .total-row td { font-weight: bold; background-color: #f7fafc; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div>
                        <h1>Blood Finder</h1>
                        <p>Patient Records Report</p>
                    </div>
                    <div class="lab-info">
                        <strong>${labInfo.name}</strong><br>
                        ${labInfo.address || ''}<br>
                        ${labInfo.city || ''}, ${labInfo.zipcode || ''}<br>
                        ${labInfo.email}
                    </div>
                </div>
                <div class="title">
                    <h2>Report for ${reportPeriod}</h2>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Patient Name</th>
                            <th>Tests Performed</th>
                            <th>Total Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${records.map(rec => `
                            <tr>
                                <td>${new Date(rec.createdAt).toLocaleDateString()}</td>
                                <td>${rec.patient.name}</td>
                                <td>${rec.tests.join(', ')}</td>
                                <td>$${(rec.totalPrice || 0).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="3" style="text-align: right;">Total Revenue:</td>
                            <td>$${totalRevenue.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="footer">
                    Generated on ${new Date().toLocaleString()}
                </div>
            </div>
        </body>
        </html>
    `;
};


// NEW FUNCTION for Blood Bank Reports
export const getBloodBankReportData = async (req, res) => {
    const { year, groupBy = 'month' } = req.query;
    const bloodBankId = req.user._id;

    try {
        // --- 1. Data for Donations Chart (Bar Chart) ---
        const matchStage = {
            bloodBank: bloodBankId,
            donationDate: {
                $gte: new Date(parseInt(year), 0, 1),
                $lt: new Date(parseInt(year) + 1, 0, 1)
            }
        };

        const groupStage = {
            _id: { month: { $month: "$donationDate" } },
            totalDonations: { $sum: "$quantity" }
        };
        
        const donationsData = await Donation.aggregate([
            { $match: matchStage },
            { $group: groupStage },
            { $sort: { '_id.month': 1 } }
        ]);

        // --- 2. Data for Stock Distribution (Doughnut Chart) ---
        // This shows the CURRENT stock, it does not depend on the date filter.
        const stockData = await BloodStock.aggregate([
            { $match: { bloodBank: bloodBankId } },
            { $group: { _id: '$bloodGroup', totalUnits: { $sum: '$quantity' } } }
        ]);

        res.json({
            donationsData,
            stockData
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};