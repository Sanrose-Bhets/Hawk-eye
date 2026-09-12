export interface EmailSendResult {
  id: string;
  success: boolean;
}

export interface EmailAttachment {
  filename: string;
  content: string; // base64 encoded
  contentType?: string;
}

export interface IEmailProvider {
  send(
    to: string,
    subject: string,
    html: string,
    attachments?: EmailAttachment[],
  ): Promise<EmailSendResult>;
}

export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER');
