import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import type {
  IEmailProvider,
  EmailSendResult,
  EmailAttachment,
} from './email-provider.interface.js';

@Injectable()
export class ResendEmailProvider implements IEmailProvider {
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly logger = new Logger(ResendEmailProvider.name);

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  }

  async send(
    to: string,
    subject: string,
    html: string,
    attachments?: EmailAttachment[],
  ): Promise<EmailSendResult> {
    try {
      const emailPayload = {
        from: this.fromEmail,
        to,
        subject,
        html,
        ...(attachments && attachments.length > 0
          ? {
              attachments: attachments.map((att) => ({
                filename: att.filename,
                content: Buffer.from(att.content, 'base64'),
              })),
            }
          : {}),
      };

      const { data, error } = await this.resend.emails.send(emailPayload);

      if (error) {
        this.logger.error(`Resend error: ${error.message}`);
        return { id: '', success: false };
      }

      this.logger.log(`Email sent to ${to}, id: ${data?.id}`);
      return { id: data?.id ?? '', success: true };
    } catch (err) {
      this.logger.error(
        `Failed to send email: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
      return { id: '', success: false };
    }
  }
}
