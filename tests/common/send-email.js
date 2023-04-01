const EC = require('eight-colors');
module.exports = async (reportData, capacity) => {
    const emailOptions = {
        transport: {
            // change to your email service, or use SMTP host and port: https://nodemailer.com/smtp/
            service: 'Hotmail',
            auth: {
                // pass secrets from environment variables, do not store secrets in the source code
                user: process.env.USERNAME,
                pass: process.env.PASSWORD
            }
        },
        // Message configuration: https://nodemailer.com/message/
        message: {
            from: '',
            to: '',
            cc: '',
            bcc: '',

            subject: `${reportData.name} - ${reportData.dateH}`,
            attachments: [{
                path: reportData.htmlPath
            }],

            html: `
                <h3>${reportData.name}</h3>
                <ul>
                    <li>Env: STG</li>
                    <li>Type: Smoke</li>
                    <li>Url: ${reportData.metadata.url}</li>
                    <li>Workers: ${capacity.config.workers}</li>
                    <li>Date: ${reportData.dateH}</li>
                    <li>Duration: ${reportData.durationH}</li>
                </ul>
                
                ${reportData.summaryTable}

                <p>Please check attachment html for detail.</p>

                <p>Thanks,</p>
            `
        }
    };

    // console.log('email html', emailOptions.message.html);

    if (!emailOptions.transport.auth.pass) {
        EC.logRed('[email] require a password');
        return;
    }

    const info = await capacity.sendEmail(emailOptions).catch((e) => {
        console.error(e);
    });
    if (info) {
        console.log(info);
    }
};
