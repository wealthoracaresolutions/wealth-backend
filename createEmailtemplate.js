const getEmailTemplate = (name, message,hasBtn,buttonText,buttonLink) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Template</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
                color: #333;
            }
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #fff;
                border: 1px solid #ddd;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            .email-header {
                background-color: #1abc9c;
                color: #fff;
                text-align: center;
                padding: 20px 10px;
            }
            .email-header h1 {
                margin: 0;
                font-size: 24px;
            }
            .email-body {
                padding: 20px;
            }
            .email-body p {
                margin: 0 0 10px;
                line-height: 1.6;
            }
            .email-footer {
                text-align: center;
                padding: 15px;
                background-color: #f9f9f9;
                font-size: 14px;
                color: #777;
            }
            .email-footer a {
                color: #1abc9c;
                text-decoration: none;
            }
            .btn {
                display: inline-block;
                background-color: #1abc9c;
                color: #fff;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 4px;
                font-size: 16px;
                margin-top: 10px;
                color:white
            }
            .btn:hover {
                background-color: #16a085;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <h1>Welcome to HealthSupport!</h1>
            </div>
            <div class="email-body">
                <p>Dear ${name},</p>
                <p>${message}</p>
                ${hasBtn&&`<a href=${buttonLink} class="btn">${buttonText}</a>`}
                
                <p>If you have any questions or need assistance, feel free to reply to this email or contact our support team at any time.</p>
            </div>
            <div class="email-footer">
                <p>Thank you for choosing HealthSupport!</p>
                <p><a href="healthsupportservices.onrender.com">Visit our website</a> | <a href="mailto:support@healthsupport.com">Contact Support</a></p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Example usage:
const emailHTML = getEmailTemplate(
    "Stephen",
    "We’re thrilled to have you on board! At HealthSupport, we’re committed to providing you with the best medical and health support services."
);

// console.log(emailHTML);
module.exports=getEmailTemplate
