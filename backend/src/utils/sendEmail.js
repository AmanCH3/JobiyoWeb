import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, 
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Successfully sent to ${options.email}. Message ID: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`[EMAIL] Failed to send email to ${options.email}:`, error.message);
        throw error; // Re-throw to let the caller handle it
    }
};

export default sendEmail;
