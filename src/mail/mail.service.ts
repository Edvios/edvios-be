import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST'),
            port: this.configService.get<number>('SMTP_PORT'),
            secure: true, // true for 465, false for other ports
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_PASS'),
            },
        });
    }

    async sendVerificationEmail(email: string, token: string) {
        const appUrl = this.configService.get<string>('APP_URL');
        const verificationUrl = `${appUrl}/auth/verify-email?token=${token}`;

        const mailOptions = {
            from: `"Edvios" <${this.configService.get<string>('SMTP_USER')}>`,
            to: email,
            subject: 'Verify Your Email - Edvios',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4CAF50; text-align: center;">Welcome to Edvios!</h2>
          <p>Hi there,</p>
          <p>Thank you for signing up. Please verify your email address to activate your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
          </div>
          <p>If the button above doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">This link will expire in 24 hours. If you did not create an account, please ignore this email.</p>
        </div>
      `,
        };

        try {
            console.log(`Attempting to send verification email to: ${email}`);
            const result = await this.transporter.sendMail(mailOptions);
            console.log(`Email sent successfully: ${result.messageId}`);
            return result;
        } catch (error) {
            console.error('Error sending verification email:', error);
            throw new Error('Failed to send verification email');
        }
    }
}
