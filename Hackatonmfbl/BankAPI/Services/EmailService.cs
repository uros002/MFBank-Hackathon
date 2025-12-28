using System.Net;
using System.Net.Mail;

namespace BankAPI.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        // Email WITH AI answer
        public async Task SendAnswerEmailAsync(string toEmail, string customerName, string question, string answer)
        {
            try
            {
                var smtpHost = _configuration["Email:SmtpHost"];
                var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
                var smtpUser = _configuration["Email:SmtpUser"];
                var smtpPassword = _configuration["Email:SmtpPassword"];
                var fromEmail = _configuration["Email:FromEmail"];
                var fromName = _configuration["Email:FromName"] ?? "MF Banka";

                using var client = new SmtpClient(smtpHost, smtpPort)
                {
                    Credentials = new NetworkCredential(smtpUser, smtpPassword),
                    EnableSsl = true
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail, fromName),
                    Subject = "Uspješno postavljen zahtjev - MF Banka",
                    Body = GenerateEmailBodyWithAnswer(customerName, question, answer),
                    IsBodyHtml = true
                };

                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
                
                _logger.LogInformation($"Email successfully sent to {toEmail}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email to {toEmail}");
                throw;
            }
        }

        // Email WITHOUT AI answer (just confirmation)
        public async Task SendConfirmationEmailAsync(string toEmail, string customerName, string question)
        {
            try
            {
                var smtpHost = _configuration["Email:SmtpHost"];
                var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
                var smtpUser = _configuration["Email:SmtpUser"];
                var smtpPassword = _configuration["Email:SmtpPassword"];
                var fromEmail = _configuration["Email:FromEmail"];
                var fromName = _configuration["Email:FromName"] ?? "MF Banka";

                using var client = new SmtpClient(smtpHost, smtpPort)
                {
                    Credentials = new NetworkCredential(smtpUser, smtpPassword),
                    EnableSsl = true
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail, fromName),
                    Subject = "Uspješno postavljen zahtjev - MF Banka",
                    Body = GenerateConfirmationEmailBody(customerName, question),
                    IsBodyHtml = true
                };

                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
                
                _logger.LogInformation($"Confirmation email successfully sent to {toEmail}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send confirmation email to {toEmail}");
                throw;
            }
        }

        public async Task SendOperatorEmail(string toEmail, string customerName, string question, string answer)
        {
            try
            {
                var smtpHost = _configuration["Email:SmtpHost"];
                var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
                var smtpUser = _configuration["Email:SmtpUser"];
                var smtpPassword = _configuration["Email:SmtpPassword"];
                var fromEmail = _configuration["Email:FromEmail"];
                var fromName = _configuration["Email:FromName"] ?? "MF Banka";

                using var client = new SmtpClient(smtpHost, smtpPort)
                {
                    Credentials = new NetworkCredential(smtpUser, smtpPassword),
                    EnableSsl = true
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail, fromName),
                    Subject = "Odgovor na Vaš zahtjev - MF Banka",
                    Body = GenerateEmailForOperatorAnswer(customerName, question, answer),
                    IsBodyHtml = true
                };

                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
                
                _logger.LogInformation($"Email successfully sent to {toEmail}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email to {toEmail}");
                throw;
            }
        }

        // Email template WITH answer
        private string GenerateEmailBodyWithAnswer(string customerName, string question, string answer)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #1a4d8f 0%, #2d6bb8 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ background: #f8fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
        .question-box {{ background: white; padding: 20px; border-left: 4px solid #4a90e2; margin: 20px 0; border-radius: 4px; }}
        .answer-box {{ background: #e8f0fe; padding: 20px; border-radius: 4px; margin: 20px 0; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>MF Banka</h1>
        </div>
        <div class='content'>
            <p>Poštovani/a {customerName},</p>
            <p>Hvala vam što ste nas kontaktirali.</p>
            
            <div class='question-box'>
                <strong>Vaše pitanje:</strong>
                <p>{question}</p>
            </div>
            
            <div class='answer-box'>
                <strong>Naš odgovor:</strong>
                <p>{answer}</p>
            </div>
            
            <p>Očekujte poziv od našeg operatera u roku od 15 minuta.</p>
            <p>Srdačan pozdrav,<br>Tim MF Banke</p>
        </div>
        <div class='footer'>
            <p>MF Banka | office@mfbanka.com | 080 051 055</p>
            <p>Ova poruka je automatski generisana. Molimo ne odgovarajte direktno na ovaj email.</p>
        </div>
    </div>
</body>
</html>";
        }

        // Email template WITHOUT answer (just confirmation)
        private string GenerateConfirmationEmailBody(string customerName, string question)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #1a4d8f 0%, #2d6bb8 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ background: #f8fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
        .question-box {{ background: white; padding: 20px; border-left: 4px solid #4a90e2; margin: 20px 0; border-radius: 4px; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>MF Banka</h1>
        </div>
        <div class='content'>
            <p>Poštovani/a {customerName},</p>
            <p>Hvala vam što ste nas kontaktirali.</p>
            
            <div class='question-box'>
                <strong>Vaše pitanje:</strong>
                <p>{question}</p>
            </div>
            
            <p>Očekujte poziv od našeg operatera u roku od 15 minuta.</p>
            <p>Srdačan pozdrav,<br>Tim MF Banke</p>
        </div>
        <div class='footer'>
            <p>MF Banka | office@mfbanka.com | 080 051 055</p>
            <p>Ova poruka je automatski generisana. Molimo ne odgovarajte direktno na ovaj email.</p>
        </div>
    </div>
</body>
</html>";
        }

           private string GenerateEmailForOperatorAnswer(string customerName, string question, string answer)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #1a4d8f 0%, #2d6bb8 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ background: #f8fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
        .question-box {{ background: white; padding: 20px; border-left: 4px solid #4a90e2; margin: 20px 0; border-radius: 4px; }}
        .answer-box {{ background: #e8f0fe; padding: 20px; border-radius: 4px; margin: 20px 0; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>MF Banka</h1>
        </div>
        <div class='content'>
            <p>Poštovani/a {customerName},</p>
            <p>Hvala vam što ste nas kontaktirali. Odgovor na Vaše pitanje se nalazi u prilogu.</p>
            
            <div class='question-box'>
                <strong>Vaše pitanje:</strong>
                <p>{question}</p>
            </div>
            
            <div class='answer-box'>
                <strong>Naš odgovor:</strong>
                <p>{answer}</p>
            </div>
            
            <p>Ukoliko imate drugih pitanja, slobodno pošaljite novi zahtjev putem našeg sajta.</p>
            <p>Takodje, da bi unaprijedili naš sistem, molimo Vas da ocjenite odgovor našeg operatera putem linka: http://localhost:3000/rate-operator.</p>
            <p>Srdačan pozdrav,<br>Tim MF Banke</p>
        </div>
        <div class='footer'>
            <p>MF Banka | office@mfbanka.com | 080 051 055</p>
        </div>
    </div>
</body>
</html>";
        }
    }

}

