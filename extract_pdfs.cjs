const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

async function extractText(filePath) {
    try {
        console.log(`Extracting text from ${filePath}...`);
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        fs.writeFileSync(filePath + '.txt', data.text);
        console.log(`Successfully extracted text to ${filePath}.txt`);
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
    }
}

async function main() {
    const docsDir = path.join(__dirname, 'docs');
    const files = fs.readdirSync(docsDir);
    for (const file of files) {
        if (file.toLowerCase().endsWith('.pdf')) {
            await extractText(path.join(docsDir, file));
        }
    }
}

main();
