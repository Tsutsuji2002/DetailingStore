import React from 'react';
import './PasswordRulesChecker.css';

export interface PasswordValidationResult {
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isValid: boolean;
  score: number;
}

export function validatePasswordRules(password: string): PasswordValidationResult {
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const score = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  const isValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  return {
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    isValid,
    score
  };
}

interface Props {
  password?: string;
  confirmPassword?: string;
  showMatchStatus?: boolean;
}

const PasswordRulesChecker: React.FC<Props> = ({
  password = '',
  confirmPassword,
  showMatchStatus = true
}) => {
  const result = validatePasswordRules(password);

  const getStrengthInfo = (score: number) => {
    if (!password) return { label: 'Chưa nhập', colorClass: 'weak', percent: 0, barColor: '#e2e8f0' };
    if (score <= 2) return { label: '🔴 Yếu (Cần thêm độ phức tạp)', colorClass: 'weak', percent: (score / 5) * 100, barColor: '#ef4444' };
    if (score <= 4) return { label: '🟡 Trung Bình (Khá an toàn)', colorClass: 'fair', percent: (score / 5) * 100, barColor: '#f59e0b' };
    return { label: '🟢 Rất Mạnh (An toàn tuyệt đối)', colorClass: 'very-strong', percent: 100, barColor: '#16a34a' };
  };

  const strength = getStrengthInfo(result.score);
  const isConfirming = confirmPassword !== undefined && confirmPassword.length > 0;
  const isMatched = password && confirmPassword === password;

  return (
    <div className="password-rules-card">
      <div className="password-strength-wrap">
        <div className="password-strength-header">
          <span>Độ mạnh mật khẩu:</span>
          <span className={`strength-label ${strength.colorClass}`}>{strength.label}</span>
        </div>
        <div className="strength-bar-bg">
          <div
            className="strength-bar-fill"
            style={{ width: `${strength.percent}%`, backgroundColor: strength.barColor }}
          />
        </div>
      </div>

      <p className="rules-hint">
        Yêu cầu: tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt (!@#$%^&*)
      </p>

      {showMatchStatus && isConfirming && (
        <div className={`pass-match-badge ${isMatched ? 'matched' : 'mismatched'}`}>
          {isMatched ? '✅ Mật khẩu xác nhận trùng khớp' : '❌ Mật khẩu xác nhận chưa trùng khớp'}
        </div>
      )}
    </div>
  );
};

export default PasswordRulesChecker;
