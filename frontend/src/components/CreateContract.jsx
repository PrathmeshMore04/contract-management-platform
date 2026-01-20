import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getBlueprints, createContract } from '../services/api';
import toast from 'react-hot-toast';
import LifecycleStepper from './LifecycleStepper';
import './CreateContract.css';

const CreateContract = () => {
  const [blueprints, setBlueprints] = useState([]);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState('');
  const [selectedBlueprint, setSelectedBlueprint] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingBlueprints, setFetchingBlueprints] = useState(true);
  const [contractStatus, setContractStatus] = useState('Created'); // For viewing mode

  // Fetch blueprints on mount
  useEffect(() => {
    const fetchBlueprints = async () => {
      try {
        setFetchingBlueprints(true);
        const response = await getBlueprints();
        setBlueprints(response.data || []);
      } catch (error) {
        toast.error(error.message || 'Failed to fetch blueprints');
      } finally {
        setFetchingBlueprints(false);
      }
    };

    fetchBlueprints();
  }, []);

  // Handle blueprint selection
  const handleBlueprintSelect = (e) => {
    const blueprintId = e.target.value;
    setSelectedBlueprintId(blueprintId);
    
    if (blueprintId) {
      const blueprint = blueprints.find(bp => bp._id === blueprintId);
      setSelectedBlueprint(blueprint);
      // Initialize form data with empty values for each field
      const initialData = {};
      if (blueprint?.fields) {
        blueprint.fields.forEach(field => {
          initialData[field.label] = field.fieldType === 'checkbox' ? false : '';
        });
      }
      setFormData(initialData);
    } else {
      setSelectedBlueprint(null);
      setFormData({});
    }
  };

  // Handle form field changes
  const handleFieldChange = (fieldLabel, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldLabel]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBlueprintId) {
      toast.error('Please select a blueprint');
      return;
    }

    setLoading(true);

    try {
      const contractData = {
        blueprintId: selectedBlueprintId,
        data: formData
      };

      await createContract(contractData);
      
      toast.success('Contract created successfully!');
      
      // Reset form
      setSelectedBlueprintId('');
      setSelectedBlueprint(null);
      setFormData({});
    } catch (error) {
      const errorMessage = error.message || error.error || 'Failed to create contract';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check if contract is read-only (Signed or Locked)
  const isReadOnly = contractStatus === 'Signed' || contractStatus === 'Locked';

  // Render form field based on type
  const renderField = (field, isReadOnly) => {
    if (!field || !field.label) return null;
    const value = formData[field.label] || '';

    if (isReadOnly) {
      // Read-only mode - show as plain text
      return (
        <div className="contract-field__readonly">
          {field.fieldType === 'checkbox' ? (
            <span>{value ? '✓ Checked' : '☐ Unchecked'}</span>
          ) : field.fieldType === 'date' ? (
            <span>{value || 'Not set'}</span>
          ) : field.fieldType === 'signature' ? (
            <div className="contract-field__signature-readonly">
              {value || 'No signature'}
            </div>
          ) : (
            <span>{value || '—'}</span>
          )}
        </div>
      );
    }

    // Edit mode - show inputs
    switch (field.fieldType) {
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.label, e.target.value)}
            className="contract-field__input contract-field__input--underscore"
            required
          />
        );
      
      case 'checkbox':
        return (
          <label className="contract-field__checkbox-label">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleFieldChange(field.label, e.target.checked)}
              className="contract-field__checkbox"
            />
            <span className="contract-field__checkbox-text">Check this box</span>
          </label>
        );
      
      case 'signature':
        return (
          <div className="contract-field__signature-wrapper">
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field.label, e.target.value)}
              placeholder="Enter signature or signature data"
              className="contract-field__input contract-field__input--signature"
              rows="4"
            />
          </div>
        );
      
      case 'text':
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.label, e.target.value)}
            className="contract-field__input contract-field__input--underscore"
            placeholder={`Enter ${field.label.toLowerCase()}`}
            required
          />
        );
    }
  };

  return (
    <div className="contract-form">
      {/* Header */}
      <div className="contract-form__header">
        <h1 className="contract-form__title">Create Contract</h1>
        <p className="contract-form__subtitle">Select a blueprint and fill in the contract details</p>
      </div>

      {/* Blueprint Selection */}
      <div className="blueprint-selector">
        <label htmlFor="blueprint-select" className="blueprint-selector__label">
          Select Blueprint
        </label>
        <select
          id="blueprint-select"
          value={selectedBlueprintId}
          onChange={handleBlueprintSelect}
          className="blueprint-selector__select"
          disabled={fetchingBlueprints}
        >
          <option value="">-- Select a Blueprint --</option>
          {blueprints.map((blueprint) => (
            <option key={blueprint._id} value={blueprint._id}>
              {blueprint.name}
            </option>
          ))}
        </select>
        {fetchingBlueprints && (
          <div className="blueprint-selector__loading">
            <div className="skeleton skeleton--text" />
            <div className="skeleton skeleton--input" />
          </div>
        )}
      </div>

      {/* Contract Paper View */}
      {selectedBlueprint && selectedBlueprint?.fields && selectedBlueprint?.fields?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="contract-form__document-wrapper"
        >
          {/* Lifecycle Stepper */}
          <div className="contract-form__stepper">
            <LifecycleStepper currentStatus={contractStatus} />
          </div>

          {/* Paper Container */}
          <div className="contract-document">
            {/* Document Header */}
            <div className="contract-document__header">
              <h2 className="contract-document__title">
                {selectedBlueprint?.name || 'Contract'}
              </h2>
              <p className="contract-document__subtitle">
                Contract Document
              </p>
            </div>

            {/* Contract Fields */}
            <form onSubmit={handleSubmit} className="contract-document__form">
              {selectedBlueprint?.fields?.map((field, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="contract-field"
                >
                  <label
                    htmlFor={`field-${index}`}
                    className="contract-field__label"
                  >
                    {field.label}
                  </label>
                  {renderField(field, isReadOnly)}
                </motion.div>
              ))}

              {/* Submit Button */}
              {!isReadOnly && (
                <div className="contract-document__actions">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn--primary btn--full"
                  >
                    {loading ? 'Creating Contract...' : 'Create Contract'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </motion.div>
      )}

      {selectedBlueprint && (!selectedBlueprint.fields || selectedBlueprint.fields.length === 0) && (
        <div className="contract-form__warning">
          This blueprint has no fields. Please add fields to the blueprint first.
        </div>
      )}
    </div>
  );
};

export default CreateContract;
