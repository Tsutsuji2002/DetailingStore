using System.Net;
using System.Net.Mail;
using DetailingStore.Api.DTOs;

namespace DetailingStore.Api.Services
{
    /// <summary>
    /// Service for sending email notifications using SMTP
    /// </summary>
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        /// <summary>
        /// Sends a confirmation email to customer after service request submission.
        /// Uses fire-and-forget pattern - returns immediately without blocking.
        /// Logs errors but does not throw exceptions.
        /// </summary>
        public async Task<bool> SendServiceRequestConfirmationAsync(
            string recipientEmail,
            string customerName,
            ServiceRequestDto requestDetails)
        {
            try
            {
                // Load SMTP configuration from appsettings.json
                var smtpHost = _configuration["EmailSettings:SmtpHost"];
                var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
                var smtpUsername = _configuration["EmailSettings:SmtpUsername"];
                var smtpPassword = _configuration["EmailSettings:SmtpPassword"];
                var senderEmail = _configuration["EmailSettings:SenderEmail"];
                var senderName = _configuration["EmailSettings:SenderName"];

                // Validate SMTP configuration
                if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUsername) 
                    || string.IsNullOrEmpty(smtpPassword) || string.IsNullOrEmpty(senderEmail))
                {
                    _logger.LogError("SMTP configuration is incomplete. Cannot send email.");
                    return false;
                }

                // Build HTML email template
                var emailBody = BuildEmailTemplate(customerName, requestDetails);

                // Create email message
                using var message = new MailMessage
                {
                    From = new MailAddress(senderEmail, senderName ?? "Detailing Store"),
                    Subject = "Xác nhận yêu cầu dịch vụ - Service Request Confirmation",
                    Body = emailBody,
                    IsBodyHtml = true
                };

                message.To.Add(new MailAddress(recipientEmail, customerName));

                // Configure SMTP client
                using var smtpClient = new SmtpClient(smtpHost, smtpPort)
                {
                    Credentials = new NetworkCredential(smtpUsername, smtpPassword),
                    EnableSsl = true,
                    Timeout = 10000 // 10 seconds timeout
                };

                // Send email asynchronously (fire-and-forget pattern)
                await smtpClient.SendMailAsync(message);

                _logger.LogInformation(
                    "Confirmation email sent successfully to {Email} for service request {RequestId}",
                    recipientEmail, requestDetails.Id);

                return true;
            }
            catch (SmtpException ex)
            {
                // Log SMTP-specific errors but don't throw
                _logger.LogError(ex, 
                    "SMTP error sending confirmation email to {Email} for service request {RequestId}",
                    recipientEmail, requestDetails.Id);
                return false;
            }
            catch (Exception ex)
            {
                // Log general errors but don't throw (non-blocking)
                _logger.LogError(ex, 
                    "Failed to send confirmation email to {Email} for service request {RequestId}",
                    recipientEmail, requestDetails.Id);
                return false;
            }
        }

        public async Task<bool> SendContactMessageAsync(
            string senderName,
            string senderPhone,
            string senderEmail,
            string message)
        {
            try
            {
                var smtpHost = _configuration["EmailSettings:SmtpHost"];
                var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
                var smtpUsername = _configuration["EmailSettings:SmtpUsername"];
                var smtpPassword = _configuration["EmailSettings:SmtpPassword"];
                var senderEmailConfig = _configuration["EmailSettings:SenderEmail"];
                var senderName_config = _configuration["EmailSettings:SenderName"];

                if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUsername)
                    || string.IsNullOrEmpty(smtpPassword) || string.IsNullOrEmpty(senderEmailConfig))
                {
                    _logger.LogWarning("SMTP configuration incomplete. Contact message not sent.");
                    return false;
                }

                var subject = $"[Liên hệ mới] {System.Net.WebUtility.HtmlEncode(senderName)}";
                var body = $@"
<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;'>
  <h2 style='color:#2c3e50;border-bottom:2px solid #3498db;padding-bottom:10px;'>Lời nhắn từ khách hàng</h2>
  <table style='width:100%;border-collapse:collapse;'>
    <tr><td style='padding:8px;border-bottom:1px solid #e0e0e0;font-weight:bold;width:35%;'>Họ tên:</td>
        <td style='padding:8px;border-bottom:1px solid #e0e0e0;'>{System.Net.WebUtility.HtmlEncode(senderName)}</td></tr>
    <tr><td style='padding:8px;border-bottom:1px solid #e0e0e0;font-weight:bold;'>Điện thoại:</td>
        <td style='padding:8px;border-bottom:1px solid #e0e0e0;'>{System.Net.WebUtility.HtmlEncode(senderPhone)}</td></tr>
    <tr><td style='padding:8px;border-bottom:1px solid #e0e0e0;font-weight:bold;'>Email:</td>
        <td style='padding:8px;border-bottom:1px solid #e0e0e0;'>{System.Net.WebUtility.HtmlEncode(senderEmail)}</td></tr>
  </table>
  <div style='margin-top:16px;padding:16px;background:#f8f9fa;border-radius:8px;'>
    <strong>Nội dung:</strong>
    <p style='margin-top:8px;white-space:pre-wrap;'>{System.Net.WebUtility.HtmlEncode(message)}</p>
  </div>
</div>";

                using var mail = new MailMessage
                {
                    From = new MailAddress(senderEmailConfig, senderName_config ?? "Detailing Store"),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };
                // Send to shop's own email so admin receives the contact message
                mail.To.Add(new MailAddress(senderEmailConfig, senderName_config ?? "Detailing Store"));
                // Reply-To is the customer's email if provided
                if (!string.IsNullOrWhiteSpace(senderEmail))
                    mail.ReplyToList.Add(new MailAddress(senderEmail, senderName));

                using var smtp = new SmtpClient(smtpHost, smtpPort)
                {
                    Credentials = new NetworkCredential(smtpUsername, smtpPassword),
                    EnableSsl = true,
                    Timeout = 10000
                };

                await smtp.SendMailAsync(mail);
                _logger.LogInformation("Contact message from {Name} ({Phone}) sent to shop email.", senderName, senderPhone);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send contact message from {Name}.", senderName);
                return false;
            }
        }

        /// <summary>
        /// Builds HTML email template with service request details
        /// </summary>
        private string BuildEmailTemplate(string customerName, ServiceRequestDto requestDetails)
        {
            var vehicleYear = requestDetails.VehicleInfo.Year.HasValue 
                ? requestDetails.VehicleInfo.Year.Value.ToString() 
                : "N/A";

            var customerNotes = !string.IsNullOrEmpty(requestDetails.CustomerNotes)
                ? $@"
                <tr>
                    <td style='padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;'>Ghi chú:</td>
                    <td style='padding: 8px; border-bottom: 1px solid #e0e0e0;'>{System.Net.WebUtility.HtmlEncode(requestDetails.CustomerNotes)}</td>
                </tr>"
                : string.Empty;

            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Xác nhận yêu cầu dịch vụ</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <div style='background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;'>
        <h2 style='color: #2c3e50; margin-top: 0;'>Xác nhận yêu cầu dịch vụ</h2>
        <p style='color: #555; font-size: 16px;'>Xin chào {System.Net.WebUtility.HtmlEncode(customerName)},</p>
        <p style='color: #555; font-size: 16px;'>
            <strong>Thank you for your service request. We have received your request and will contact you shortly.</strong>
        </p>
        <p style='color: #555; font-size: 14px;'>
            Cảm ơn bạn đã gửi yêu cầu dịch vụ. Chúng tôi đã nhận được yêu cầu của bạn và sẽ liên hệ với bạn trong thời gian sớm nhất.
        </p>
    </div>

    <div style='background-color: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;'>
        <h3 style='color: #2c3e50; margin-top: 0; border-bottom: 2px solid #3498db; padding-bottom: 10px;'>
            Chi tiết yêu cầu dịch vụ
        </h3>
        
        <table style='width: 100%; border-collapse: collapse;'>
            <tr>
                <td style='padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold; width: 40%;'>Mã yêu cầu:</td>
                <td style='padding: 8px; border-bottom: 1px solid #e0e0e0;'>{requestDetails.Id}</td>
            </tr>
            <tr>
                <td style='padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;'>Dịch vụ:</td>
                <td style='padding: 8px; border-bottom: 1px solid #e0e0e0;'>{System.Net.WebUtility.HtmlEncode(requestDetails.RequestedServiceName)}</td>
            </tr>
            <tr>
                <td style='padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;'>Biển số xe:</td>
                <td style='padding: 8px; border-bottom: 1px solid #e0e0e0;'>{System.Net.WebUtility.HtmlEncode(requestDetails.VehicleInfo.LicensePlate)}</td>
            </tr>
            <tr>
                <td style='padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;'>Mẫu xe:</td>
                <td style='padding: 8px; border-bottom: 1px solid #e0e0e0;'>{System.Net.WebUtility.HtmlEncode(requestDetails.VehicleInfo.Model)}</td>
            </tr>
            <tr>
                <td style='padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;'>Năm sản xuất:</td>
                <td style='padding: 8px; border-bottom: 1px solid #e0e0e0;'>{vehicleYear}</td>
            </tr>
            <tr>
                <td style='padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;'>Ngày ưu tiên:</td>
                <td style='padding: 8px; border-bottom: 1px solid #e0e0e0;'>{requestDetails.PreferredDate:dd/MM/yyyy}</td>
            </tr>
            <tr>
                <td style='padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;'>Giờ ưu tiên:</td>
                <td style='padding: 8px; border-bottom: 1px solid #e0e0e0;'>{requestDetails.PreferredTime:HH:mm}</td>
            </tr>{customerNotes}
        </table>
    </div>

    <div style='background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;'>
        <p style='margin: 0; font-size: 14px; color: #666;'>
            <strong>Liên hệ:</strong><br>
            Email: {System.Net.WebUtility.HtmlEncode(requestDetails.CustomerEmail)}<br>
            Điện thoại: {System.Net.WebUtility.HtmlEncode(requestDetails.CustomerPhone)}
        </p>
    </div>

    <div style='margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;'>
        <p style='font-size: 12px; color: #888; margin: 0;'>
            Đây là email tự động, vui lòng không trả lời email này.<br>
            This is an automated email, please do not reply.
        </p>
    </div>
</body>
</html>";
        }
    }
}
