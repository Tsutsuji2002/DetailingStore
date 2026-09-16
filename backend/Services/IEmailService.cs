using DetailingStore.Api.DTOs;

namespace DetailingStore.Api.Services
{
    /// <summary>
    /// Service interface for sending email notifications
    /// </summary>
    public interface IEmailService
    {
        /// <summary>
        /// Sends a confirmation email to customer after service request submission
        /// </summary>
        /// <param name="recipientEmail">Customer's email address</param>
        /// <param name="customerName">Customer's full name</param>
        /// <param name="requestDetails">Service request details for email body</param>
        /// <returns>True if email sent successfully, false otherwise</returns>
        Task<bool> SendServiceRequestConfirmationAsync(
            string recipientEmail,
            string customerName,
            ServiceRequestDto requestDetails);

        /// <summary>
        /// Sends a contact form message to the shop's admin email
        /// </summary>
        Task<bool> SendContactMessageAsync(
            string senderName,
            string senderPhone,
            string senderEmail,
            string message);
    }
}
