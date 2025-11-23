export interface IMailService {
    sendMail(to: string, subject: string, htmlBody: string): Promise<void>;
}