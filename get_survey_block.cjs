const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const match = code.match(/\{adminTab === 'add-survey' && \([\s\S]*?\{adminTab === 'add-quotation'/);
fs.writeFileSync('survey_block.txt', match[0]);
