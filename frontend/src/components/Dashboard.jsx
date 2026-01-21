import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Activity, CheckCircle2, Filter, Lock, User, LogOut } from 'lucide-react';
import { getContracts, updateContractStatus } from '../services/api';
import toast from 'react-hot-toast';
import StatusBadge from './StatusBadge';
import { TableRowSkeleton, CardSkeleton } from './SkeletonLoader';
import './Dashboard.css';

const Dashboard = () => {
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || 'admin';
  });

  // Fetch contracts on mount and when role changes
  useEffect(() => {
    fetchContracts();
  }, [userRole]);

  // Handle role change (mock login)
  const handleRoleChange = (newRole) => {
    setUserRole(newRole);
    localStorage.setItem('userRole', newRole);
    toast.success(`Switched to ${newRole.charAt(0).toUpperCase() + newRole.slice(1)} view`);
    fetchContracts(); // Refresh contracts with new role
  };

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await getContracts();
      setContracts(response.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch contracts');
    } finally {
      setLoading(false);
    }
  };

  // Apply filter when contracts or filter changes
  useEffect(() => {
    let filtered = [...contracts];

    switch (filter) {
      case 'active':
        filtered = contracts.filter(
          contract => contract?.status !== 'Locked' && contract?.status !== 'Revoked'
        );
        break;
      case 'pending':
        filtered = contracts.filter(
          contract => contract?.status === 'Created' || 
                     contract?.status === 'Approved' || 
                     contract?.status === 'Sent'
        );
        break;
      case 'signed':
        filtered = contracts.filter(contract => contract?.status === 'Signed');
        break;
      case 'all':
      default:
        filtered = contracts;
        break;
    }

    setFilteredContracts(filtered);
  }, [contracts, filter]);

  // Handle status update
  const handleStatusUpdate = async (contractId, newStatus) => {
    setUpdatingStatus(contractId);

    try {
      await updateContractStatus(contractId, newStatus);
      toast.success(`Contract status updated to ${newStatus}`);
      await fetchContracts();
    } catch (error) {
      const errorMessage = error.message || error.error || 'Failed to update status';
      toast.error(errorMessage);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Get contract name
  const getContractName = (contract) => {
    return contract.contractName || `Contract-${contract._id?.slice(-6) || 'N/A'}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate stats
  const stats = {
    total: contracts.length,
    pending: contracts.filter(c => 
      c?.status === 'Created' || 
      c?.status === 'Approved' || 
      c?.status === 'Sent'
    ).length,
    signed: contracts.filter(c => c?.status === 'Signed').length,
  };

  // Check if user has permission for a status transition
  const hasPermissionForStatus = (targetStatus) => {
    // Admin has all permissions
    if (userRole === 'admin') {
      return true;
    }

    // Approver can transition to 'Approved' or 'Sent'
    if (userRole === 'approver') {
      return targetStatus === 'Approved' || targetStatus === 'Sent';
    }

    // Signer can transition to 'Signed'
    if (userRole === 'signer') {
      return targetStatus === 'Signed';
    }

    return false;
  };

  const getActionsForStatus = (currentStatus) => {
    const allActions = [];
    
    switch (currentStatus) {
      case 'Created':
        if (hasPermissionForStatus('Approved')) {
          allActions.push({ label: 'Approve', nextStatus: 'Approved', variant: 'primary' });
        }
        // Revoke can be done by admin (handled by permission check)
        if (userRole === 'admin') {
          allActions.push({ label: 'Revoke', nextStatus: 'Revoked', variant: 'danger' });
        }
        break;
      case 'Approved':
        if (hasPermissionForStatus('Sent')) {
          allActions.push({ label: 'Send', nextStatus: 'Sent', variant: 'primary' });
        }
        break;
      case 'Sent':
        if (hasPermissionForStatus('Signed')) {
          allActions.push({ label: 'Sign', nextStatus: 'Signed', variant: 'success' });
        }
        // Revoke can be done by admin
        if (userRole === 'admin') {
          allActions.push({ label: 'Revoke', nextStatus: 'Revoked', variant: 'danger' });
        }
        break;
      case 'Signed':
        // Lock can be done by admin
        if (userRole === 'admin') {
          allActions.push({ label: 'Lock', nextStatus: 'Locked', variant: 'secondary' });
        }
        break;
      case 'Locked':
      case 'Revoked':
      default:
        break;
    }

    return allActions;
  };

  const getActionButtonClass = (variant) => {
    switch (variant) {
      case 'primary':
        return 'action-btn action-btn--primary';
      case 'success':
        return 'action-btn action-btn--success';
      case 'danger':
        return 'action-btn action-btn--danger';
      case 'secondary':
        return 'action-btn action-btn--secondary';
      default:
        return 'action-btn action-btn--primary';
    }
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__subtitle">Manage and track your contracts</p>
        </div>
        
        {/* Role Selector (Mock Login) */}
        <div className="dashboard__role-selector">
          <div className="role-selector">
            <User size={18} className="role-selector__icon" />
            <span className="role-selector__label">Role:</span>
            <select
              value={userRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="role-selector__select"
            >
              <option value="admin">Admin</option>
              <option value="approver">Approver</option>
              <option value="signer">Signer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="dashboard__stats">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="dashboard__stats">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="stat-card"
          >
            <div className="stat-card__content">
              <div className="stat-card__info">
                <p className="stat-card__label">Total Contracts</p>
                <p className="stat-card__value">{stats.total}</p>
              </div>
              <div className="stat-card__icon stat-card__icon--primary">
                <FileText size={24} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="stat-card"
          >
            <div className="stat-card__content">
              <div className="stat-card__info">
                <p className="stat-card__label">Pending</p>
                <p className="stat-card__value">{stats.pending}</p>
              </div>
              <div className="stat-card__icon stat-card__icon--amber">
                <Activity size={24} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="stat-card"
          >
            <div className="stat-card__content">
              <div className="stat-card__info">
                <p className="stat-card__label">Signed</p>
                <p className="stat-card__value">{stats.signed}</p>
              </div>
              <div className="stat-card__icon stat-card__icon--emerald">
                <CheckCircle2 size={24} />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="dashboard__filters">
        <Filter className="dashboard__filter-icon" size={20} />
        <div className="dashboard__filter-buttons">
          {['all', 'active', 'pending', 'signed'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`filter-btn ${filter === filterOption ? 'filter-btn--active' : ''}`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
        <span className="dashboard__filter-count">
          Showing {filteredContracts.length} of {contracts.length}
        </span>
      </div>

      {/* Contracts Table */}
      {loading ? (
        <div className="contracts-table">
          {/* Table Header Skeleton */}
          <div className="contracts-table__header">
            <div className="contracts-table__header-cell contracts-table__header-cell--name">
              <div className="skeleton skeleton--header" />
            </div>
            <div className="contracts-table__header-cell contracts-table__header-cell--blueprint">
              <div className="skeleton skeleton--header" />
            </div>
            <div className="contracts-table__header-cell contracts-table__header-cell--status">
              <div className="skeleton skeleton--header" />
            </div>
            <div className="contracts-table__header-cell contracts-table__header-cell--date">
              <div className="skeleton skeleton--header" />
            </div>
            <div className="contracts-table__header-cell contracts-table__header-cell--actions">
              <div className="skeleton skeleton--header" />
            </div>
          </div>
          {/* Skeleton Rows */}
          <div className="contracts-table__body">
            <TableRowSkeleton columns={5} />
            <TableRowSkeleton columns={5} />
            <TableRowSkeleton columns={5} />
            <TableRowSkeleton columns={5} />
            <TableRowSkeleton columns={5} />
          </div>
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="dashboard__empty">
          <FileText className="dashboard__empty-icon" size={48} />
          <p className="dashboard__empty-text">
            {filter === 'all'
              ? 'No contracts found. Create a contract to get started.'
              : `No contracts found for filter: ${filter}`
            }
          </p>
        </div>
      ) : (
        <div className="contracts-table">
          {/* Table Header */}
          <div className="contracts-table__header">
            <div className="contracts-table__header-cell contracts-table__header-cell--name">
              <p>Contract Name</p>
            </div>
            <div className="contracts-table__header-cell contracts-table__header-cell--blueprint">
              <p>Blueprint</p>
            </div>
            <div className="contracts-table__header-cell contracts-table__header-cell--status">
              <p>Status</p>
            </div>
            <div className="contracts-table__header-cell contracts-table__header-cell--date">
              <p>Created Date</p>
            </div>
            <div className="contracts-table__header-cell contracts-table__header-cell--actions">
              <p>Actions</p>
            </div>
          </div>

          {/* Table Rows */}
          <div className="contracts-table__body">
            {filteredContracts.map((contract, index) => {
              const currentStatus = contract?.status || 'Created';
              const actions = getActionsForStatus(currentStatus);
              const isUpdating = updatingStatus === contract?._id;

              return (
                <motion.div
                  key={contract?._id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="contract-row"
                >
                  <div className="contract-row__cell contract-row__cell--name">
                    <p className="contract-row__name">{getContractName(contract)}</p>
                  </div>
                  <div className="contract-row__cell contract-row__cell--blueprint">
                    <p className="contract-row__blueprint">{contract?.blueprintId?.name || 'N/A'}</p>
                  </div>
                  <div className="contract-row__cell contract-row__cell--status">
                    <StatusBadge status={contract?.status || 'Created'} />
                  </div>
                  <div className="contract-row__cell contract-row__cell--date">
                    <p className="contract-row__date">{formatDate(contract?.createdAt)}</p>
                  </div>
                  <div className="contract-row__cell contract-row__cell--actions">
                    {actions.length > 0 ? (
                      <div className="contract-row__actions">
                        {actions.map((action) => {
                          const hasPermission = hasPermissionForStatus(action.nextStatus);
                          const isDisabled = isUpdating || !hasPermission;
                          
                          return (
                            <button
                              key={`${contract?._id || index}-${action.nextStatus}`}
                              onClick={() => handleStatusUpdate(contract?._id, action.nextStatus)}
                              disabled={isDisabled}
                              className={`${getActionButtonClass(action.variant)} ${isDisabled ? 'action-btn--disabled' : ''}`}
                              title={!hasPermission ? `Requires ${action.nextStatus === 'Approved' || action.nextStatus === 'Sent' ? 'Approver' : action.nextStatus === 'Signed' ? 'Signer' : 'Admin'} role` : ''}
                            >
                              {action.label}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="contract-row__no-actions">
                        <Lock size={14} /> No Actions
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
