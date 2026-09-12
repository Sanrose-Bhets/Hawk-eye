export interface EmailSendResult {
  id: string;
  success: boolean;
}

export interface IEmailProvider {
  send(to: string, subject: string, html: string): Promise<EmailSendResult>;
}

export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER');
