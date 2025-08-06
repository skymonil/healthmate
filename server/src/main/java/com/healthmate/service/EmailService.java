package com.healthmate.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            System.out.println("[EmailService] Preparing to send OTP to: " + toEmail);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Your HealthMate OTP");

            String htmlContent = """
                <html>
                    <body style="font-family: 'Segoe UI', sans-serif; background-color: #F9FAFB; padding: 20px;">
                        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                            <h1 style="color: #10B981; text-align:center;">HealthMate Verification</h1>
                            <p style="font-size: 16px; color: #0F172A;">
                                Thank you for registering with <strong>HealthMate</strong>!
                            </p>
                            <p style="font-size: 16px; color: #0F172A;">
                                Your One-Time Password (OTP) is:
                            </p>
                            <div style="font-size: 24px; font-weight: bold; color: #14B8A6; margin: 20px 0; text-align:center;">
                                %s
                            </div>
                            <p style="font-size: 14px; color: #0F172A;">
                                Please enter this OTP in the app to verify your account. This code is valid for 10 minutes.
                            </p>
                            <p style="font-size: 14px; color: #0F172A;">If you didn’t request this email, you can safely ignore it.</p>
                        </div>
                    </body>
                </html>
            """.formatted(otp);

            helper.setText(htmlContent, true); // true = isHtml

            mailSender.send(mimeMessage);

            System.out.println("[EmailService] OTP email sent to: " + toEmail);

        } catch (MessagingException e) {
            System.err.println("[EmailService] Failed to send OTP email to: " + toEmail);
            e.printStackTrace();
            throw new RuntimeException("Failed to send OTP email. Please try again later.");
        }
    }
}
