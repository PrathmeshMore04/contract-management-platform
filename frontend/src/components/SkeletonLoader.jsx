import { motion } from 'framer-motion';
import './SkeletonLoader.css';

const SkeletonLoader = ({ count = 3, className = '' }) => {
  return (
    <div className={`skeleton-loader ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.1,
          }}
          className="skeleton-loader__item"
        />
      ))}
    </div>
  );
};

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 5 }) => {
  return (
    <div className="table-row-skeleton">
      {Array.from({ length: columns }).map((_, index) => {
        let widthClass = 'table-row-skeleton__cell--medium';
        if (index === 0) {
          widthClass = 'table-row-skeleton__cell--wide';
        } else if (index === columns - 1) {
          widthClass = 'table-row-skeleton__cell--wide';
        }
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.1,
            }}
            className={`table-row-skeleton__cell ${widthClass}`}
          />
        );
      })}
    </div>
  );
};

// Card Skeleton
export const CardSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className="card-skeleton"
    >
      <div className="card-skeleton__content">
        <div className="card-skeleton__info">
          <div className="card-skeleton__line card-skeleton__line--short" />
          <div className="card-skeleton__line card-skeleton__line--medium" />
        </div>
        <div className="card-skeleton__icon" />
      </div>
    </motion.div>
  );
};

// Field Skeleton (for forms)
export const FieldSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className="field-skeleton"
    >
      <div className="field-skeleton__label" />
      <div className="field-skeleton__input" />
    </motion.div>
  );
};

export default SkeletonLoader;
