import { CheckCircle2, XCircle, Send, Clock, FileCheck } from 'lucide-react';
import './Badge.css';

const Badge = ({ status = 'Created' }) => {
  const getBadgeConfig = (status) => {
    switch (status) {
      case 'Signed':
        return {
          icon: CheckCircle2,
          modifier: 'signed'
        };
      case 'Revoked':
        return {
          icon: XCircle,
          modifier: 'revoked'
        };
      case 'Sent':
        return {
          icon: Send,
          modifier: 'sent'
        };
      case 'Approved':
        return {
          icon: FileCheck,
          modifier: 'approved'
        };
      case 'Created':
      default:
        return {
          icon: Clock,
          modifier: 'created'
        };
    }
  };

  const config = getBadgeConfig(status);
  const Icon = config.icon;

  return (
    <span className={`status-badge status-badge--${config.modifier}`}>
      <Icon size={14} className="status-badge__icon" />
      <span className="status-badge__text">{status}</span>
    </span>
  );
};

export default Badge;
