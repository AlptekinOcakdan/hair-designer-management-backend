import {IMailService} from "../abstract/IMailService";
import nodemailer from 'nodemailer';
import logger from "../../../interfaces/logger/Logger";
import {EMAIL_HOST, EMAIL_PORT, SENDER_EMAIL, SENDER_EMAIL_PASSWORD} from "../../../interfaces/utils/constants";

export class NodemailerService implements IMailService{
    // nodemailer 10 ships its own types without a Transporter export
    private transporter: ReturnType<typeof nodemailer.createTransport>;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: EMAIL_HOST,
            port: Number(EMAIL_PORT),
            secure: false, // 587 için false, 465 için true
            auth: {
                user: SENDER_EMAIL,
                pass: SENDER_EMAIL_PASSWORD,
            },
        });
    }

    async sendMail(to: string, subject: string, htmlBody: string): Promise<void> {
        try {
            const info = await this.transporter.sendMail({
                from: `"Proje Adı" <${process.env.SMTP_USER}>`,
                to: to,
                subject: subject,
                html: htmlBody,
            });

            logger.info(`Mail sent: ${info.messageId}`);
        } catch (error) {
            logger.error("Error sending email: ", error);
            throw new Error("Email sending failed");
        }
    }
}