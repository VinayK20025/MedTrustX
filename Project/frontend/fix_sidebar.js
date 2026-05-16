const fs = require('fs');
const file = '/root/MedTrustX/Project/frontend/src/components/layout/Sidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace occurrences where items list is missing ]}
content = content.replace(/},\n\];/g, '},\n  ]}\n];');

fs.writeFileSync(file, content);
console.log('Fixed missing braces in Sidebar.tsx');
