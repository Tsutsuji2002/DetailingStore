# MomoPaymentModal Component

## Overview

The `MomoPaymentModal` component provides a complete payment flow UI for Momo QR code payments. It handles payment initiation, QR code display, payment status polling, and success/error states.

## Features

- ✅ Payment initiation for bookings or orders
- ✅ QR code display for Momo payment
- ✅ Automatic payment status polling (every 3 seconds)
- ✅ Success animation with auto-redirect
- ✅ Error handling with retry capability
- ✅ Loading states and spinner animations
- ✅ Responsive design for mobile and desktop
- ✅ Automatic cleanup of polling intervals

## Usage

```tsx
import { MomoPaymentModal } from '@/components/payment';

function BookingConfirmation() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const booking = { id: 'booking-123', totalPrice: 500000 };

  return (
    <>
      <button onClick={() => setShowPaymentModal(true)}>
        Thanh toán với Momo
      </button>

      <MomoPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        bookingId={booking.id}
        amount={booking.totalPrice}
      />
    </>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | Yes | Controls modal visibility |
| `onClose` | `() => void` | Yes | Callback when modal is closed |
| `bookingId` | `string` | No* | Service booking ID to pay for |
| `orderId` | `string` | No* | Product order ID to pay for |
| `amount` | `number` | Yes | Payment amount in VND |

\* Either `bookingId` or `orderId` must be provided

## Component States

1. **Loading**: Initial state while initiating payment with Momo API
2. **QR**: Displays QR code and payment information
3. **Polling**: Actively checking payment status (every 3 seconds)
4. **Success**: Payment completed successfully, redirects after 2 seconds
5. **Error**: Payment failed, shows error message with retry option

## Payment Flow

1. User clicks payment button → Modal opens
2. Component calls `paymentApi.initiateBookingPayment()` or `initiateOrderPayment()`
3. QR code is displayed from Momo API response
4. Component starts polling payment status every 3 seconds
5. On success: Shows success animation → redirects to `/bookings/success`
6. On failure: Shows error message with retry button
7. Polling timeout: 5 minutes (100 polls × 3 seconds)

## Styling

The component uses CSS custom properties for theming:

```css
--bg-card: Background color for modal
--border-color: Border color
--text-primary: Primary text color
--text-secondary: Secondary text color
--text-muted: Muted text color
--bg-secondary: Secondary background color
--bg-tertiary: Tertiary background color
```

## Cleanup

The component automatically cleans up polling intervals when:
- Modal is closed
- Component is unmounted
- Payment completes (success or failure)
- Polling timeout is reached

## Error Handling

Common error scenarios:
- Network errors: Shows "Không thể kết nối đến cổng thanh toán"
- Validation errors: Shows specific error from API
- Timeout: Shows "Hết thời gian chờ thanh toán"
- Payment failed: Shows "Thanh toán thất bại" with retry option

## Dependencies

- `react-icons/fi`: For icons (FiX, FiCheckCircle, FiAlertCircle, FiLoader)
- `@/services/api/paymentApi`: Payment API service
- `@/features/paymentSlice`: Redux slice (optional, not used in this implementation)

## Browser Compatibility

- Supports all modern browsers
- Uses `window.setInterval` for polling
- CSS animations for smooth transitions
- Responsive design for mobile devices

## Accessibility

- Modal closes on overlay click
- Close button with X icon
- Keyboard accessible (ESC to close - implement if needed)
- Screen reader friendly labels

## Future Enhancements

- [ ] Add keyboard shortcuts (ESC to close)
- [ ] Add sound notification on payment success
- [ ] Add progress bar for polling timeout
- [ ] Add deep link support for Momo app
- [ ] Add payment history view
- [ ] Add webhook notification support for instant updates
