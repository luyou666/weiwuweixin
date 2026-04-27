const zh = require('./zh.json');
const en = require('./en.json');
console.log('zh keys:', Object.keys(zh).join(', '));
console.log('en keys:', Object.keys(en).join(', '));
console.log('zh.settings keys count:', Object.keys(zh.settings).length);
console.log('zh.about keys count:', Object.keys(zh.about).length);
console.log('en.settings keys count:', Object.keys(en.settings).length);
console.log('en.about keys count:', Object.keys(en.about).length);