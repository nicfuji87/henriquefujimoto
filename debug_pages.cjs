const https = require('https');

const token = "EAAU3IEhLIIUBQiZBWAAi1EWh1GixmHpDtqtMRc32SGKbal9w4MdfmdAzhEjTJfCWWe3ZAkqRNZAFlPYDPMJpvuwsw72szk2qrrgKoZAjKAmyJMKx0gLdvAFYVPsJaauBMyx9qBwqZC6EiEMUWwx5ZCclfYtYqRPSZCZC4CEJPc5ZCduCHtOitKjEfbo19Jpdhp50s";
const url = `https://graph.facebook.com/v19.0/me?fields=id,name,accounts{name,instagram_business_account}&access_token=${token}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log(JSON.stringify(JSON.parse(data), null, 2));
    });
}).on('error', (err) => {
    console.error(err);
});
