import { ConfigService } from '@nestjs/config';
import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { MJMLJsonObject, MJMLParseResults, MJMLParsingOptions } from 'mjml-core';
import { SES } from 'aws-sdk';
import { compile } from 'handlebars';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { SupportedLanguages } from '../../enums';

export interface MessageContent {
  text: string;
  html?: string;
}

export interface SESMessageBodyContent {
  Data: string;
}

export interface SESMessageBody {
  Text: SESMessageBodyContent;
  Html?: SESMessageBodyContent;
}

export interface MailSendOptions {
  /**
   * The name of the mjml template in the s3 bucket
   */
  textTemplateName: string;
  htmlTemplateName?: string;
  options?: MJMLParsingOptions;
  /**
   * Email address of the recipient
   */
  language: SupportedLanguages;
  email: string;
  /**
   * Email subject
   */
  subject?: string;
  subjectTemplate?: string;
  source?: string;
  /**
   * The object passed to the handlebars renderer
   */
  data?: any;
}

@Injectable()
export class MailService {
  private readonly ses?: SES;

  constructor(
    @Inject(Logger)
    private readonly logger: Logger,
    @Inject(ConfigService)
    private readonly config: ConfigService,
  ) {
    const accessKeyId = this.config.get('accessKeyId');
    const secretAccessKey = this.config.get('secretAccessKey');
    const sessionToken = this.config.get('sessionToken') ?? undefined;
    if (accessKeyId && secretAccessKey) {
      this.ses = new SES({
        region: this.config.get('awsRegion') ?? 'eu-north-1',
        credentials: {
          accessKeyId,
          secretAccessKey,
          sessionToken,
        },
      });
    }
  }

  public async send(options: MailSendOptions) {
    try {
      this.logger.log('Loading the template');

      const textSource = this.loadTemplate(options.textTemplateName);

      const textTemplate = compile(textSource);
      const text = textTemplate(options.data);

      const message: MessageContent = { text: text };

      if (options.htmlTemplateName !== undefined) {
        const source = this.loadTemplate(options.htmlTemplateName);

        const template = compile(source);
        const mjmlTemplate = template(options.data);

        message.html = this.render(mjmlTemplate, options.options);
      }
      if (options.subjectTemplate !== undefined) {
        const source = this.loadTemplate(options.subjectTemplate);

        const subjectTemplate = compile(source);

        options.subject = subjectTemplate(options.data);
      }

      this.logger.log('Sending the email');
      await this.sendEmail(options.email, message, options.subject || '', options.source);
    } catch (err) {
      this.logger.error(err.message, err.stack);
    }
  }

  private async sendEmail(
    email: string,
    message: MessageContent,
    subject: string,
    source: string = this.config.get('sourceEmail') ?? 'test@test.com',
  ): Promise<void> {
    this.logger.debug(`Sending Email to: ${email}`);
    const messageBody: SESMessageBody = { Text: { Data: message.text } };

    const params = {
      Destination: {
        ToAddresses: [email],
        BccAddresses: [this.config.get('outboxEmail') ?? 'outbox@test.com'],
      },
      Message: {
        Body: messageBody,
        Subject: { Data: subject },
      },
      Source: `Nutritailor <${source}>`,
    };

    if (message.html !== undefined) {
      params.Message.Body.Html = { Data: message.html };
    }
    if (this.ses) {
      await this.ses.sendEmail(params).promise();
    } else {
      this.logger.debug('SES is disabled');
    }
  }

  private render(template: string | MJMLJsonObject, options?: MJMLParsingOptions): string {
    let result: MJMLParseResults;

    try {
      // use a require import, bc this packages does not support a normal typescript import
      // eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/no-var-requires
      const mjml = require('mjml');

      result = mjml(template, options);
    } catch (e) {
      this.logger.error(`Could not render the email template: ${e.message}`, e.stack);
      throw new InternalServerErrorException(`Could not render the email template: ${e.message}`);
    }

    if (result.errors && result.errors.length) {
      result.errors.forEach((error) =>
        this.logger.error(`Mjml Error in line ${error.line} with tag ${error.tagName}: ${error.formattedMessage}`),
      );
      throw new InternalServerErrorException(result.errors);
    }

    return result.html;
  }

  private loadTemplate(templateName: string): string {
    return readFileSync(resolve(process.cwd(), 'src', 'assets', 'email-templates', templateName), 'utf8');
  }
}
