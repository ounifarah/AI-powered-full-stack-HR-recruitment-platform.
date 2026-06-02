const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

function getCvAbsolutePath(cvPath) {
    if (!cvPath) {
        throw new Error('Missing CV path.');
    }

    const cvRelPath = cvPath.startsWith('/') ? cvPath.substring(1) : cvPath;
    return path.join(__dirname, '..', cvRelPath);
}

async function extractCvText(cvPath) {
    const absolutePath = getCvAbsolutePath(cvPath);

    if (!fs.existsSync(absolutePath)) {
        throw new Error('CV file not found on disk.');
    }

    const ext = path.extname(absolutePath).toLowerCase();

    if (ext === '.pdf') {
        let pdfParse;
        try {
            pdfParse = require('pdf-parse');
        } catch (err) {
            throw new Error('PDF parser is not available. Please reinstall backend dependencies.');
        }

        const dataBuffer = fs.readFileSync(absolutePath);
        const parsed = await pdfParse(dataBuffer);
        return parsed.text || '';
    }

    if (ext === '.docx') {
        const result = await mammoth.extractRawText({ path: absolutePath });
        return result.value || '';
    }

    return fs.readFileSync(absolutePath, 'utf-8');
}

module.exports = {
    extractCvText,
    getCvAbsolutePath
};
