import './StatusBadge.css';

const StatusBadge = ({ status = 'Created' }) => {
  const getStatusModifier = (status) => {
    switch (status) {
      case 'Created':
        return 'created';
      case 'Approved':
        return 'approved';
      case 'Sent':
        return 'sent';
      case 'Signed':
        return 'signed';
      case 'Revoked':
        return 'revoked';
      default:
        return 'created';
    }
  };

  const modifier = getStatusModifier(status);

  return (
    <span className={`status-badge status-badge--${modifier}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
