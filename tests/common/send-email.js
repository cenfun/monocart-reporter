module.exports = async (reportData, capacity) => {
    const emailOptions = {
        // https://nodemailer.com/smtp/
        transport: {
            service: 'Hotmail',
            auth: {
                user: '',
                pass: ''
            }
        },
        // https://nodemailer.com/message/
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
                    <li>Url: ${reportData.use.url}</li>
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

    if (!emailOptions.transport.auth.user) {
        return;
    }

    const info = await capacity.sendEmail(emailOptions).catch((e) => {
        console.error(e);
    });
    if (info) {
        console.log(info);
    }
};
