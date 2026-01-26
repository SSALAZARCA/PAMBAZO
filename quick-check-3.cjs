const bcrypt = require('bcrypt');
async function check() {
    const h = '$2b$10$hcXsG5ClLCycN7Ygjv01fuUQDXBdUerpgNgjdPNbICWbqOxX5nIku';
    const pws = ['admin123', 'pambazo123', '123456', 'pambaso123', 'admin', 'password'];
    for (const p of pws) {
        console.log(p, await bcrypt.compare(p, h));
    }
}
check();
