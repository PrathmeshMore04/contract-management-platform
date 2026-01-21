import { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getBlueprints, createContract } from '../services/api';
import toast from 'react-hot-toast';
import LifecycleStepper from './LifecycleStepper';
import SignatureCanvas from 'react-signature-canvas';
import './CreateContract.css';

const CreateContract = () => {
  const [blueprints, setBlueprints] = useState([]);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState('');
  const [selectedBlueprint, setSelectedBlueprint] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingBlueprints, setFetchingBlueprints] = useState(true);
  const [contractStatus, setContractStatus] = useState('Created'); // For viewing mode

  const signatureFields = useMemo(() => {
    return (selectedBlueprint?.fields || []).filter((f) => f?.fieldType === 'signature' && f?.label);
  }, [selectedBlueprint]);

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

  const handleBlueprintSelect = (e) => {
    const blueprintId = e.target.value;
    setSelectedBlueprintId(blueprintId);
    
    if (blueprintId) {
      const blueprint = blueprints.find(bp => bp._id === blueprintId);
      setSelectedBlueprint(blueprint);
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

  const handleFieldChange = (fieldLabel, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldLabel]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBlueprintId) {
      toast.error('Please select a blueprint');
      return;
    }

    setLoading(true);

    try {
      const dataForSubmit = { ...formData };
      signatureFields.forEach((field) => {
        const ref = signatureRefs.current[field.label];
        if (!ref) return;
        if (ref.isEmpty()) {
          dataForSubmit[field.label] = '';
          return;
        }
        dataForSubmit[field.label] = ref.getTrimmedCanvas().toDataURL('image/png');
      });

      const contractData = {
        blueprintId: selectedBlueprintId,
        data: dataForSubmit
      };

      await createContract(contractData);
      
      toast.success('Contract created successfully!');
      
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

  const isReadOnly = contractStatus === 'Signed' || contractStatus === 'Locked';

  const renderField = (field, isReadOnly) => {
    if (!field || !field.label) return null;
    const value = formData[field.label] || '';

    if (isReadOnly) {
      return (
        <div className="contract-field__readonly">
          {field.fieldType === 'checkbox' ? (
            <span>{value ? '✓ Checked' : '☐ Unchecked'}</span>
          ) : field.fieldType === 'date' ? (
            <span>{value || 'Not set'}</span>
          ) : field.fieldType === 'signature' ? (
            <div className="contract-field__signature-readonly">
              {typeof value === 'string' && value.startsWith('data:image') ? (
                <img
                  src={value}
                  alt={`${field.label} signature`}
                  className="contract-field__signature-image"
                />
              ) : (
                <span>{value || 'No signature'}</span>
              )}
            </div>
          ) : (
            <span>{value || '—'}</span>
          )}
        </div>
      );
    }

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
            <div className="contract-field__signature-pad">
              <SignatureCanvas
                ref={(ref) => {
                  if (ref) signatureRefs.current[field.label] = ref;
                }}
                penColor="#111827"
                backgroundColor="rgba(255,255,255,1)"
                canvasProps={{
                  className: 'contract-field__signature-canvas',
                  'aria-label': `${field.label} signature pad`,
                }}
              />
            </div>
            <button
              type="button"
              className="contract-field__signature-clear"
              onClick={() => {
                const ref = signatureRefs.current[field.label];
                if (!ref) return;
                ref.clear();
                handleFieldChange(field.label, '');
              }}
            >
              Clear
            </button>
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
      <div className="contract-form__header">
        <h1 className="contract-form__title">Create Contract</h1>
        <p className="contract-form__subtitle">Select a blueprint and fill in the contract details</p>
      </div>

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

      {selectedBlueprint && selectedBlueprint?.fields && selectedBlueprint?.fields?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="contract-form__document-wrapper"
        >
          <div className="contract-form__stepper">
            <LifecycleStepper currentStatus={contractStatus} />
          </div>

          <div className="contract-document">
            <div className="contract-document__header">
              <h2 className="contract-document__title">
                {selectedBlueprint?.name || 'Contract'}
              </h2>
              <p className="contract-document__subtitle">
                Contract Document
              </p>
            </div>

            <form onSubmit={handleSubmit} className="contract-document__form">
              {selectedBlueprint?.fields?.map((field, index) => {
                const position = field.position || { x: 0, y: 0 };
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="contract-field"
                    style={{
                      position: 'absolute',
                      left: `${position.x}px`,
                      top: `${position.y}px`,
                    }}
                  >
                    <label
                      htmlFor={`field-${index}`}
                      className="contract-field__label"
                    >
                      {field.label}
                    </label>
                    {renderField(field, isReadOnly)}
                  </motion.div>
                );
              })}

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
