const bcrypt = require('bcrypt');
async function check() {
    const h = '$2b$10$g8lOFVQyDjHL9tkas2voke.wXPO2b/K3e8XhBgTv5w2cqJhki2zI6';
    const pws = ['admin123', 'pambazo123', '123456', 'pambaso123', 'admin', 'password'];
    for (const p of pws) {
        console.log(p, await bcrypt.compare(p, h));
    }
}
check();
