const bcrypt = require('bcrypt');
async function check() {
    const h = '$2b$12$LQv3c1yqBwlVHpPjrCyeNOGTcLdGcFWYuAEmnEOVxe6EKm5UjWS9q';
    const pws = ['admin123', 'pambazo123', '123456', 'pambaso123'];
    for (const p of pws) {
        console.log(p, await bcrypt.compare(p, h));
    }
}
check();
