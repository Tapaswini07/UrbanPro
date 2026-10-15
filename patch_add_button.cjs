const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /onClick=\{\(\) => setAdminTab\('add-survey'\)\}/g,
  `onClick={() => { setAdminTab('add-survey'); setEditingSurveyId(null); setSurveyForm(initialSurveyForm); }}`
);

fs.writeFileSync('src/App.tsx', code);
