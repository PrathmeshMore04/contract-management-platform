import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Edit, Trash2, Plus, FilePenLine, Save, Type, Calendar, PenTool, CheckSquare } from 'lucide-react';
import { createBlueprint, deleteBlueprint, getBlueprints, getBlueprintById, updateBlueprint } from '../services/api';
import toast from 'react-hot-toast';
import SkeletonLoader from './SkeletonLoader';
import './Blueprints.css';

const Blueprints = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const mode = useMemo(() => {
    if (location.pathname.startsWith('/blueprints/edit/')) return 'edit';
    if (location.pathname === '/blueprints/new') return 'new';
    return 'list';
  }, [location.pathname]);

  // Shared list state
  const [blueprints, setBlueprints] = useState([]);
  const [loadingList, setLoadingList] = useState(mode === 'list');

  // Builder state (new/edit)
  const isEditMode = mode === 'edit';
  const [blueprintName, setBlueprintName] = useState('');
  const [fields, setFields] = useState([]);
  const [saving, setSaving] = useState(false);
  const [fetchingBlueprint, setFetchingBlueprint] = useState(isEditMode);
  const [selectedFieldType, setSelectedFieldType] = useState('text');
  const [fieldLabel, setFieldLabel] = useState('');

  const fieldTypes = [
    { value: 'text', label: 'Text', icon: Type },
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'signature', label: 'Signature', icon: PenTool },
    { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  ];

  const fetchBlueprints = async () => {
    try {
      setLoadingList(true);
      const response = await getBlueprints();
      setBlueprints(response.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch blueprints');
    } finally {
      setLoadingList(false);
    }
  };

  // List view: fetch on mount
  useEffect(() => {
    if (mode === 'list') {
      fetchBlueprints();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Edit view: load blueprint by id
  useEffect(() => {
    if (mode !== 'edit' || !id) return;

    const loadBlueprint = async () => {
      try {
        setFetchingBlueprint(true);
        const response = await getBlueprintById(id);
        const blueprint = response.data;

        if (!blueprint) {
          toast.error('Blueprint not found');
          navigate('/blueprints');
          return;
        }

        setBlueprintName(blueprint.name || '');
        setFields(blueprint.fields || []);
      } catch (error) {
        toast.error(error.message || 'Failed to load blueprint');
        navigate('/blueprints');
      } finally {
        setFetchingBlueprint(false);
      }
    };

    loadBlueprint();
  }, [mode, id, navigate]);

  const handleDelete = async (blueprintId, blueprintNameForConfirm) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${blueprintNameForConfirm}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteBlueprint(blueprintId);
      toast.success('Blueprint deleted successfully');
      fetchBlueprints();
    } catch (error) {
      const errorMessage = error.message || error.error || 'Failed to delete blueprint';
      toast.error(errorMessage);
    }
  };

  const handleAddField = () => {
    if (!fieldLabel.trim()) {
      toast.error('Please enter a field label');
      return;
    }

    const newField = {
      label: fieldLabel.trim(),
      fieldType: selectedFieldType,
      position: { x: 0, y: 0 },
    };

    setFields((prev) => [...prev, newField]);
    setFieldLabel('');
    toast.success('Field added successfully');
  };

  const handleRemoveField = (index) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
    toast.success('Field removed');
  };

  const handleSaveBlueprint = async () => {
    if (!blueprintName.trim()) {
      toast.error('Please enter a blueprint name');
      return;
    }

    if (fields.length === 0) {
      toast.error('Please add at least one field');
      return;
    }

    setSaving(true);
    try {
      const blueprintData = { name: blueprintName.trim(), fields };

      if (isEditMode) {
        await updateBlueprint(id, blueprintData);
        toast.success('Blueprint updated successfully!');
      } else {
        await createBlueprint(blueprintData);
        toast.success('Blueprint saved successfully!');
      }

      navigate('/blueprints');
    } catch (error) {
      const errorMessage = error.message || error.error || 'Failed to save blueprint';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const renderMockInput = (fieldType) => {
    switch (fieldType) {
      case 'text':
        return (
          <input type="text" disabled placeholder="Enter text..." className="field-card__mock-input" />
        );
      case 'date':
        return <input type="date" disabled className="field-card__mock-input" />;
      case 'signature':
        return <div className="field-card__signature-area">Signature area</div>;
      case 'checkbox':
        return (
          <label className="field-card__checkbox-label">
            <input type="checkbox" disabled className="field-card__checkbox" />
            <span>Check this option</span>
          </label>
        );
      default:
        return null;
    }
  };

  if (mode === 'new' || mode === 'edit') {
    if (fetchingBlueprint) {
      return (
        <div className="blueprint-builder">
          <div className="blueprint-builder__header">
            <div className="skeleton skeleton--text" style={{ width: '200px', height: '32px', marginBottom: '0.5rem' }} />
            <div className="skeleton skeleton--text" style={{ width: '300px', height: '16px' }} />
          </div>
          <div className="blueprint-builder__skeleton">
            <SkeletonLoader count={2} />
          </div>
        </div>
      );
    }

    return (
      <div className="blueprint-builder">
        <div className="blueprint-builder__header">
          <h1 className="blueprint-builder__title">{isEditMode ? 'Edit Blueprint' : 'Create Blueprint'}</h1>
          <p className="blueprint-builder__subtitle">Build your contract template</p>
        </div>

        <div className="blueprint-builder__form-group">
          <label htmlFor="blueprint-name" className="blueprint-builder__label">
            Blueprint Name
          </label>
          <input
            id="blueprint-name"
            type="text"
            value={blueprintName}
            onChange={(e) => setBlueprintName(e.target.value)}
            placeholder="Enter blueprint name..."
            className="blueprint-builder__input"
          />
        </div>

        <div className="blueprint-builder__split-view">
          <div className="blueprint-builder__tools-panel">
            <h2 className="blueprint-builder__panel-title">Add Field</h2>

            <div className="blueprint-builder__form-fields">
              <div className="blueprint-builder__form-group">
                <label htmlFor="field-type" className="blueprint-builder__label">
                  Field Type
                </label>
                <select
                  id="field-type"
                  value={selectedFieldType}
                  onChange={(e) => setSelectedFieldType(e.target.value)}
                  className="blueprint-builder__select"
                >
                  {fieldTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="blueprint-builder__form-group">
                <label htmlFor="field-label" className="blueprint-builder__label">
                  Field Label
                </label>
                <input
                  id="field-label"
                  type="text"
                  value={fieldLabel}
                  onChange={(e) => setFieldLabel(e.target.value)}
                  placeholder="Enter field label..."
                  className="blueprint-builder__input"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleAddField();
                  }}
                />
              </div>

              <button onClick={handleAddField} className="btn btn--secondary">
                <Plus size={18} />
                <span>Add Field</span>
              </button>
            </div>
          </div>

          <div className="blueprint-builder__preview-canvas">
            <h2 className="blueprint-builder__panel-title">Preview</h2>

            {fields.length === 0 ? (
              <div className="blueprint-builder__empty-state">
                <Plus size={48} className="blueprint-builder__empty-icon" />
                <p className="blueprint-builder__empty-text">Add fields to see preview</p>
              </div>
            ) : (
              <div className="blueprint-builder__preview-fields">
                <AnimatePresence>
                  {fields.map((field, index) => (
                    <motion.div
                      key={`${field.label}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="field-card"
                    >
                      <button
                        onClick={() => handleRemoveField(index)}
                        className="field-card__delete-btn"
                        aria-label="Remove field"
                      >
                        <Trash2 size={16} />
                      </button>

                      <label className="field-card__label">{field.label}</label>
                      {renderMockInput(field.fieldType)}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        <div className="blueprint-builder__actions">
          <button
            onClick={handleSaveBlueprint}
            disabled={saving || !blueprintName.trim() || fields.length === 0}
            className="btn btn--primary"
          >
            <Save size={18} />
            <span>{saving ? (isEditMode ? 'Updating...' : 'Saving...') : isEditMode ? 'Update Blueprint' : 'Save Blueprint'}</span>
          </button>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="blueprints-list">
      <div className="blueprints-list__header">
        <div className="blueprints-list__header-content">
          <h1 className="blueprints-list__title">Blueprints</h1>
          <p className="blueprints-list__subtitle">Manage your contract templates</p>
        </div>
        <button onClick={() => navigate('/blueprints/new')} className="btn btn--primary">
          <Plus size={18} />
          <span>Create Blueprint</span>
        </button>
      </div>

      {loadingList ? (
        <div className="blueprints-list__skeleton">
          <SkeletonLoader count={3} />
        </div>
      ) : blueprints.length === 0 ? (
        <div className="blueprints-list__empty">
          <FilePenLine size={48} className="blueprints-list__empty-icon" />
          <p className="blueprints-list__empty-text">No blueprints found</p>
          <button onClick={() => navigate('/blueprints/new')} className="btn btn--primary">
            <Plus size={18} />
            <span>Create Your First Blueprint</span>
          </button>
        </div>
      ) : (
        <div className="blueprints-list__grid">
          {blueprints.map((blueprint, index) => (
            <motion.div
              key={blueprint._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="blueprint-card"
            >
              <div className="blueprint-card__content">
                <h3 className="blueprint-card__name">{blueprint.name}</h3>
                <p className="blueprint-card__fields-count">
                  {blueprint.fields?.length || 0} field{blueprint.fields?.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="blueprint-card__actions">
                <button onClick={() => navigate(`/blueprints/edit/${blueprint._id}`)} className="btn btn--icon btn--edit">
                  <Edit size={18} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(blueprint._id, blueprint.name)}
                  className="btn btn--icon btn--delete"
                >
                  <Trash2 size={18} />
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blueprints;
