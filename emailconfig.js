const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // .g., 'gmail'
    auth: {
        user: 'medicalhealthassets@gmail.com',
        pass: 'sywc fvih tosk islk',
    },
});

const setMailOptions = (to, html)=>{
    return {from: '"HealthSupport" <your-email@example.com>',
    to,
    subject: 'Info from HealthSupport!',
    html}
};

module.exports={transporter, setMailOptions}