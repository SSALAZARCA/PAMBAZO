const bcrypt = require('bcrypt');
async function check() {
    const h = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9jm';
    const pws = ['admin123', 'pambazo123', '123456', 'pambaso123'];
    for (const p of pws) {
        console.log(p, await bcrypt.compare(p, h));
    }
}
check();
