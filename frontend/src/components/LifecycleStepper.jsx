import { CheckCircle2, Circle } from 'lucide-react';
import './LifecycleStepper.css';

const LifecycleStepper = ({ currentStatus = 'Created' }) => {
  const steps = ['Created', 'Approved', 'Sent', 'Signed'];
  
  const getStatusIndex = (status) => {
    if (!status) return 0;
    const index = steps.indexOf(status);
    return index !== -1 ? index : 0;
  };

  const currentIndex = getStatusIndex(currentStatus);

  return (
    <div className="lifecycle-stepper">
      <div className="lifecycle-stepper__container">
        {/* Progress Line */}
        <div className="lifecycle-stepper__progress-line">
          <div
            className="lifecycle-stepper__progress-fill"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isPast = index < currentIndex;

          return (
            <div key={step} className="lifecycle-stepper__step">
              <div
                className={`lifecycle-stepper__step-circle ${
                  isCompleted ? 'lifecycle-stepper__step-circle--completed' : 'lifecycle-stepper__step-circle--pending'
                }`}
              >
                {isPast ? (
                  <CheckCircle2 size={20} className="lifecycle-stepper__step-icon" />
                ) : (
                  <Circle size={20} className="lifecycle-stepper__step-icon" />
                )}
              </div>
              <span
                className={`lifecycle-stepper__step-label ${
                  isCurrent 
                    ? 'lifecycle-stepper__step-label--current' 
                    : isPast 
                    ? 'lifecycle-stepper__step-label--past' 
                    : 'lifecycle-stepper__step-label--pending'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LifecycleStepper;
