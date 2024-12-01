const csv = require('csv-parser');
const xlsx = require('xlsx');
const stream = require('stream');
const moment = require("moment");
const AppConstants = require('../constants');

exports.UploadAndParseDocument = async (req, res) => {
    try {
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const results = [];
        const errors = [];

        for (const file of req.files) {
            const fileResults = [];
            const fileErrors = [];

            // Check if file is CSV
            if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
                const bufferStream = new stream.PassThrough();
                bufferStream.end(file.buffer);

                await new Promise((resolve, reject) => {
                    bufferStream
                        .pipe(csv({ headers: AppConstants.EXPECTED_HEADERS, skipLines: 1 }))
                        .on('data', (row) => {
                            const missingHeaders = AppConstants.EXPECTED_HEADERS.filter(header => !(header in row));
                            if (missingHeaders.length > 0) {
                                fileErrors.push(`Missing headers: ${missingHeaders.join(', ')}`);
                            } else {
                                fileResults.push(row);
                            }
                        })
                        .on('end', resolve)
                        .on('error', (err) => {
                            fileErrors.push(err.message);
                            reject(err);
                        });
                });

            // Check if file is Excel
            } else if (
                file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.originalname.endsWith('.xlsx')
            ) {
                const workbook = xlsx.read(file.buffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

                const headers = rows[0];
                const missingHeaders = AppConstants.EXPECTED_HEADERS.filter(header => !headers.includes(header));
                if (missingHeaders.length > 0) {
                    fileErrors.push(`Missing headers: ${missingHeaders.join(', ')}`);
                } else {
                    rows.slice(1).forEach((row, index) => {
                        const rowData = {};
                        headers.forEach((header, i) => {
                            rowData[header] = row[i] || null;
                        });
                        fileResults.push(rowData);
                    });
                }
            } else {
                fileErrors.push('Unsupported file type');
            }

            if (fileResults.length > 0) results.push(...fileResults);
            if (fileErrors.length > 0) errors.push(...fileErrors);
        }

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        return res.status(200).json({ data: results });
    } catch (error) {
        console.error('Error parsing files:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};
