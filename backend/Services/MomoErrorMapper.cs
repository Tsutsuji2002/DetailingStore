namespace DetailingStore.Api.Services;

/// <summary>
/// Utility class for mapping Momo result codes to user-friendly Vietnamese error messages
/// </summary>
public static class MomoErrorMapper
{
    /// <summary>
    /// Maps a Momo result code to a user-friendly Vietnamese error message
    /// </summary>
    /// <param name="resultCode">The result code from Momo API response or IPN</param>
    /// <returns>User-friendly Vietnamese error message</returns>
    public static string MapResultCodeToVietnameseMessage(int? resultCode)
    {
        if (resultCode == null)
        {
            return "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.";
        }

        return resultCode switch
        {
            // Success
            0 => "Giao dịch thành công",

            // Authentication and Configuration Errors
            9 => "Mã đối tác không hợp lệ. Vui lòng liên hệ quản trị viên.",
            10 => "Dữ liệu yêu cầu không hợp lệ",
            11 => "Số tiền thanh toán không hợp lệ",
            12 => "Loại tiền tệ không hợp lệ",
            13 => "Chữ ký không hợp lệ",
            20 => "Khóa truy cập không hợp lệ. Vui lòng liên hệ quản trị viên.",
            21 => "Mã yêu cầu không hợp lệ",
            22 => "Mã đơn hàng không hợp lệ",

            // Wallet and Balance Errors
            1001 => "Số dư tài khoản không đủ để thanh toán",
            1002 => "Giao dịch bị từ chối bởi nhà phát hành",
            1003 => "Tài khoản Momo không tồn tại hoặc chưa được kích hoạt",
            1004 => "Giao dịch vượt quá hạn mức của ví Momo",
            1005 => "URL không hợp lệ hoặc không an toàn",
            1006 => "Giao dịch không tìm thấy",
            1007 => "Đã xảy ra lỗi khi thực hiện giao dịch",
            1017 => "Giao dịch không tồn tại hoặc đã bị hủy",
            1026 => "Giao dịch bị từ chối do vi phạm giới hạn giao dịch",

            // Transaction Status Errors
            2001 => "Giao dịch không tồn tại",
            2007 => "Giao dịch đã được xác nhận trước đó",
            2011 => "Giao dịch đã bị hủy bởi người dùng",
            2019 => "Giao dịch đã bị hủy do timeout (quá thời gian chờ)",

            // Network and System Errors
            3001 => "Lỗi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại.",
            3002 => "Hệ thống Momo đang bận. Vui lòng thử lại sau.",
            3003 => "Yêu cầu quá thời gian chờ. Vui lòng thử lại.",
            
            // Refund Errors
            4001 => "Giao dịch không thể hoàn tiền",
            4010 => "Yêu cầu hoàn tiền không hợp lệ",
            4011 => "Yêu cầu hoàn tiền bị từ chối",
            4100 => "Giao dịch đang được xử lý hoàn tiền",

            // Default for unknown codes
            _ => $"Giao dịch thất bại (Mã lỗi: {resultCode}). Vui lòng thử lại sau."
        };
    }

    /// <summary>
    /// Maps a Momo result code to an internal technical description (for logging)
    /// </summary>
    /// <param name="resultCode">The result code from Momo API response or IPN</param>
    /// <returns>Technical description of the error</returns>
    public static string MapResultCodeToTechnicalDescription(int? resultCode)
    {
        if (resultCode == null)
        {
            return "Unknown error - null result code";
        }

        return resultCode switch
        {
            0 => "Success",
            9 => "Invalid partner code",
            10 => "Invalid request data",
            11 => "Invalid amount",
            12 => "Invalid currency",
            13 => "Invalid signature",
            20 => "Invalid access key",
            21 => "Invalid request ID",
            22 => "Invalid order ID",
            1001 => "Insufficient balance",
            1002 => "Transaction declined by issuer",
            1003 => "Account not found or inactive",
            1004 => "Transaction exceeds wallet limit",
            1005 => "Invalid or unsafe URL",
            1006 => "Transaction not found",
            1007 => "Transaction execution error",
            1017 => "Transaction does not exist or cancelled",
            1026 => "Transaction rejected due to limit violation",
            2001 => "Transaction does not exist",
            2007 => "Transaction already confirmed",
            2011 => "Transaction cancelled by user",
            2019 => "Transaction cancelled due to timeout",
            3001 => "Network connection error",
            3002 => "System busy",
            3003 => "Request timeout",
            4001 => "Transaction cannot be refunded",
            4010 => "Invalid refund request",
            4011 => "Refund request rejected",
            4100 => "Refund in progress",
            _ => $"Unknown error code: {resultCode}"
        };
    }

    /// <summary>
    /// Checks if a result code indicates a successful transaction
    /// </summary>
    /// <param name="resultCode">The result code to check</param>
    /// <returns>True if the result code indicates success, false otherwise</returns>
    public static bool IsSuccess(int? resultCode)
    {
        return resultCode == 0;
    }

    /// <summary>
    /// Checks if a result code indicates a user-initiated cancellation
    /// </summary>
    /// <param name="resultCode">The result code to check</param>
    /// <returns>True if the transaction was cancelled by the user</returns>
    public static bool IsUserCancelled(int? resultCode)
    {
        return resultCode == 2011;
    }

    /// <summary>
    /// Checks if a result code indicates a timeout error
    /// </summary>
    /// <param name="resultCode">The result code to check</param>
    /// <returns>True if the transaction timed out</returns>
    public static bool IsTimeout(int? resultCode)
    {
        return resultCode == 2019 || resultCode == 3003;
    }

    /// <summary>
    /// Checks if a result code indicates a configuration/authentication error
    /// </summary>
    /// <param name="resultCode">The result code to check</param>
    /// <returns>True if the error is related to system configuration</returns>
    public static bool IsConfigurationError(int? resultCode)
    {
        return resultCode switch
        {
            9 or 13 or 20 or 21 or 22 or 1005 => true,
            _ => false
        };
    }
}
