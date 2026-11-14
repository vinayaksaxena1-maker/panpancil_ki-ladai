const fs = require('fs');
const content = fs.readFileSync('D:/PAnfight/assets/web/assets/main-BdC6c7qp.js', 'utf8');

const regex = /\{tile:[^}]+\}/g;
let m;
let count = 0;
while ((m = regex.exec(content)) !== null && count < 15) {
    console.log(m[0]);
    count++;
}
