const fs = require('fs');
const content = fs.readFileSync('D:/PAnfight/assets/web/assets/main-BdC6c7qp.js', 'utf8');
const idx = content.indexOf('image:"/assets/rooms/');
if (idx !== -1) {
    console.log(content.substring(idx - 60, idx + 1000));
} else {
    console.log("Not found");
}
