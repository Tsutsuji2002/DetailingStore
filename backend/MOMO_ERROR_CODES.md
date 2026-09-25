# Momo Payment Error Codes Reference

This document describes the error code mapping for Momo payment integration.

## Overview

The `MomoErrorMapper` utility class provides mapping between Momo result codes and user-friendly Vietnamese error messages. This ensures customers receive clear, actionable error messages when payment issues occur.

## Usage

### In Services

```csharp
// Map result code to Vietnamese message
var userMessage = MomoErrorMapper.MapResultCodeToVietnameseMessage(resultCode);

// Get technical description for logging
var technicalDescription = MomoErrorMapper.MapResultCodeToTechnicalDescription(resultCode);

// Check specific error types
bool isSuccess = MomoErrorMapper.IsSuccess(resultCode);
bool isCancelled = MomoErrorMapper.IsUserCancelled(resultCode);
bool isTimeout = MomoErrorMapper.IsTimeout(resultCode);
bool isConfigError = MomoErrorMapper.IsConfigurationError(resultCode);
```

### In API Responses

The error mapper is automatically used in:
- Payment initiation responses (when Momo API returns an error)
- Payment status queries (provides user-friendly status messages)
- IPN processing logs (for troubleshooting)

## Common Error Codes

### Success
| Code | Vietnamese Message | Technical Description |
|------|-------------------|----------------------|
| 0 | Giao dịch thành công | Success |

### Authentication & Configuration Errors
| Code | Vietnamese Message | Technical Description |
|------|-------------------|----------------------|
| 9 | Mã đối tác không hợp lệ. Vui lòng liên hệ quản trị viên. | Invalid partner code |
| 10 | Dữ liệu yêu cầu không hợp lệ | Invalid request data |
| 11 | Số tiền thanh toán không hợp lệ | Invalid amount |
| 12 | Loại tiền tệ không hợp lệ | Invalid currency |
| 13 | Chữ ký không hợp lệ | Invalid signature |
| 20 | Khóa truy cập không hợp lệ. Vui lòng liên hệ quản trị viên. | Invalid access key |
| 21 | Mã yêu cầu không hợp lệ | Invalid request ID |
| 22 | Mã đơn hàng không hợp lệ | Invalid order ID |

### Wallet & Balance Errors
| Code | Vietnamese Message | Technical Description |
|------|-------------------|----------------------|
| 1001 | Số dư tài khoản không đủ để thanh toán | Insufficient balance |
| 1002 | Giao dịch bị từ chối bởi nhà phát hành | Transaction declined by issuer |
| 1003 | Tài khoản Momo không tồn tại hoặc chưa được kích hoạt | Account not found or inactive |
| 1004 | Giao dịch vượt quá hạn mức của ví Momo | Transaction exceeds wallet limit |
| 1005 | URL không hợp lệ hoặc không an toàn | Invalid or unsafe URL |
| 1006 | Giao dịch không tìm thấy | Transaction not found |
| 1007 | Đã xảy ra lỗi khi thực hiện giao dịch | Transaction execution error |
| 1017 | Giao dịch không tồn tại hoặc đã bị hủy | Transaction does not exist or cancelled |
| 1026 | Giao dịch bị từ chối do vi phạm giới hạn giao dịch | Transaction rejected due to limit violation |

### Transaction Status Errors
| Code | Vietnamese Message | Technical Description |
|------|-------------------|----------------------|
| 2001 | Giao dịch không tồn tại | Transaction does not exist |
| 2007 | Giao dịch đã được xác nhận trước đó | Transaction already confirmed |
| 2011 | Giao dịch đã bị hủy bởi người dùng | Transaction cancelled by user |
| 2019 | Giao dịch đã bị hủy do timeout (quá thời gian chờ) | Transaction cancelled due to timeout |

### Network & System Errors
| Code | Vietnamese Message | Technical Description |
|------|-------------------|----------------------|
| 3001 | Lỗi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại. | Network connection error |
| 3002 | Hệ thống Momo đang bận. Vui lòng thử lại sau. | System busy |
| 3003 | Yêu cầu quá thời gian chờ. Vui lòng thử lại. | Request timeout |

### Refund Errors
| Code | Vietnamese Message | Technical Description |
|------|-------------------|----------------------|
| 4001 | Giao dịch không thể hoàn tiền | Transaction cannot be refunded |
| 4010 | Yêu cầu hoàn tiền không hợp lệ | Invalid refund request |
| 4011 | Yêu cầu hoàn tiền bị từ chối | Refund request rejected |
| 4100 | Giao dịch đang được xử lý hoàn tiền | Refund in progress |

### Unknown Errors
| Code | Vietnamese Message | Technical Description |
|------|-------------------|----------------------|
| Other | Giao dịch thất bại (Mã lỗi: XXX). Vui lòng thử lại sau. | Unknown error code: XXX |
| null | Đã xảy ra lỗi không xác định. Vui lòng thử lại sau. | Unknown error - null result code |

## Helper Methods

### IsSuccess(int? resultCode)
Returns `true` if the result code is 0 (success), otherwise `false`.

```csharp
if (MomoErrorMapper.IsSuccess(resultCode)) {
    // Handle success
}
```

### IsUserCancelled(int? resultCode)
Returns `true` if the transaction was cancelled by the user (code 2011).

```csharp
if (MomoErrorMapper.IsUserCancelled(resultCode)) {
    // User cancelled - don't show error, just close dialog
}
```

### IsTimeout(int? resultCode)
Returns `true` if the transaction timed out (codes 2019 or 3003).

```csharp
if (MomoErrorMapper.IsTimeout(resultCode)) {
    // Transaction timed out - offer to retry
}
```

### IsConfigurationError(int? resultCode)
Returns `true` if the error is related to system configuration/authentication (codes 9, 13, 20, 21, 22, 1005).

```csharp
if (MomoErrorMapper.IsConfigurationError(resultCode)) {
    // Log critical alert - configuration issue needs admin attention
}
```

## Integration Points

### MomoPaymentService
The error mapper is used in:
1. **InitiateBookingPaymentAsync** - Maps Momo API errors to Vietnamese messages when payment initiation fails
2. **InitiateOrderPaymentAsync** - Same as above for product orders
3. **ProcessIpnNotificationAsync** - Logs technical descriptions and user messages for failed payments
4. **GetPaymentStatusAsync** - Returns user-friendly status messages based on transaction result code

### Logging
All payment operations log both:
- **Technical Description** - For developers and system administrators (in English)
- **Vietnamese Message** - For end users (in Vietnamese)
- **Momo Result Code** - The numeric code for reference

Example log output:
```
Momo payment creation failed for transaction {TransactionId}: 
  ResultCode=1001, 
  Technical=Insufficient balance, 
  Message=Số dư tài khoản không đủ để thanh toán
```

## Testing

To test error mapping:

1. **Insufficient Balance (1001)**
   - Use a test Momo account with 0 balance
   - Expected message: "Số dư tài khoản không đủ để thanh toán"

2. **User Cancellation (2011)**
   - Scan QR code but cancel in Momo app
   - Expected message: "Giao dịch đã bị hủy bởi người dùng"

3. **Configuration Error (9, 13, 20)**
   - Use invalid credentials in sandbox
   - Expected messages include "Vui lòng liên hệ quản trị viên"

4. **Timeout (2019, 3003)**
   - Wait 15 minutes without completing payment
   - Expected message: "Giao dịch đã bị hủy do timeout (quá thời gian chờ)"

## Notes

- All user-facing messages are in Vietnamese for better UX
- Technical descriptions are in English for developer logs
- Unknown error codes return a generic message with the code number
- Configuration errors suggest contacting administrator
- The mapper is a static utility class with no dependencies
- All methods are null-safe and handle null result codes gracefully

## Future Enhancements

1. Add more specific error messages for sandbox vs production
2. Include suggested actions for each error type
3. Add localization support for multiple languages
4. Create error analytics dashboard showing common error types
5. Implement automatic retry logic for transient errors (3002, 3003)
