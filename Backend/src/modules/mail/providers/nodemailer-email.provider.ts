import { Injectable, Logger } from '@nestjs/common';
import type {
  IEmailProvider,
  EmailSendResult,
} from './email-provider.interface.js';

@Injectable()
export class NodemailerEmailProvider implements IEmailProvider {
  private readonly logger = new Logger(NodemailerEmailProvider.name);

  async send(
    to: string,
    subject: string,
    html: string,
  ): Promise<EmailSendResult> {
    this.logger.warn(
      `Nodemailer provider not yet implemented. Email to ${to} dropped.`,
    );
    return { id: '', success: false };
  }
}
