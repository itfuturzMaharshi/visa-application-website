import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ApplicationFormService from '../../services/applicationForm/applicationForm.services';

// Helper function to format field labels (e.g., "firstName" -> "First Name")
const formatLabel = (label) => {
  if (!label) return '';
  // If label is already formatted with spaces, return as is
  if (label.includes(' ')) {
    return label
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  // Convert camelCase/PascalCase to Title Case
  return label
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

// Helper function to format section names
const formatSectionName = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// File Preview Modal Component
const FilePreviewModal = ({ file, onClose }) => {
  if (!file) return null;

  const isImage = file.type?.startsWith('image/');
  const fileUrl = file instanceof File ? URL.createObjectURL(file) : file;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            {isImage ? 'Image Preview' : 'Document Preview'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-6">
          <div
            className="relative mx-auto overflow-hidden rounded-xl bg-slate-100"
            style={{ maxHeight: '70vh' }}
          >
            {isImage ? (
              <img
                src={fileUrl}
                alt="Preview"
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-12">
                <svg
                  className="h-16 w-16 text-slate-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  {file.name || 'Document'}
                </p>
                <p className="text-xs text-slate-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 underline"
                >
                  Open in new tab
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ApplicationFormModal = ({
  open,
  onClose,
  countryId,
  countryCode,
  tripPurposeId,
  tripPurposeCode,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formConfig, setFormConfig] = useState(null);
  const [formData, setFormData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [activeUploadMenu, setActiveUploadMenu] = useState(null);
  const [filePreviews, setFilePreviews] = useState({});
  const [previewModal, setPreviewModal] = useState({ show: false, file: null });
  const fileInputRefs = useRef({});

  // Fetch form configuration when modal opens
  useEffect(() => {
    if (open && !formConfig) {
      fetchFormConfig();
    }
  }, [open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormConfig(null);
      setFormData({});
      setFieldErrors({});
      setError(null);
      setActiveUploadMenu(null);
      setFilePreviews({});
      setPreviewModal({ show: false, file: null });
    }
  }, [open]);

  const fetchFormConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApplicationFormService.getApplicationConfig({
        countryId,
        countryCode,
        tripPurposeId,
        tripPurposeCode,
      });
      
      if (response?.data) {
        setFormConfig(response.data);
        // Initialize form data with empty values
        const initialData = {};
        // Use formConfig.sections (not formConfig.formSections) based on backend response
        const sections = response.data.formConfig?.sections || [];
        sections.forEach((section) => {
          section.fields?.forEach((field) => {
            if (field.fieldType === 'checkbox') {
              initialData[field.fieldName] = false;
            } else if (field.fieldType === 'file') {
              initialData[field.fieldName] = null;
            } else {
              initialData[field.fieldName] = '';
            }
          });
        });
        setFormData(initialData);
      }
    } catch (err) {
      setError('Failed to load form configuration. Please try again.');
      console.error('Error fetching form config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    // Clear error for this field when user starts typing
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleFileSelect = (file, fieldName) => {
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors((prev) => ({
        ...prev,
        [fieldName]: 'File size should be less than 5MB.',
      }));
      return;
    }

    handleInputChange(fieldName, file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreviews((prev) => ({
        ...prev,
        [fieldName]: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryClick = (fieldName) => {
    const input = fileInputRefs.current[fieldName];
    if (input) {
      input.click();
    }
    setActiveUploadMenu(null);
  };

  const handleCameraClick = (fieldName) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use back camera on mobile
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file, fieldName);
      }
    };
    input.click();
    setActiveUploadMenu(null);
  };

  const handleFilePreview = (fieldName) => {
    const file = formData[fieldName];
    if (file) {
      setPreviewModal({ show: true, file });
    }
  };

  const validateField = (field, value) => {
    if (field.isRequired) {
      if (value === null || value === undefined || value === '') {
        return `${formatLabel(field.fieldLabel)} is required`;
      }
      if (Array.isArray(value) && value.length === 0) {
        return `${formatLabel(field.fieldLabel)} is required`;
      }
      if (value instanceof File && !value) {
        return `${formatLabel(field.fieldLabel)} is required`;
      }
    }

    // Email validation
    if (field.fieldType === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(value))) {
        return 'Please enter a valid email address';
      }
    }

    // Number validation
    if (field.fieldType === 'number' && value) {
      if (isNaN(Number(value)) || value === '') {
        return 'Please enter a valid number';
      }
    }

    // Custom validation rules
    if (field.validation && typeof field.validation === 'object') {
      const validation = field.validation;
      if (validation.minLength && String(value || '').length < validation.minLength) {
        return `Minimum length is ${validation.minLength} characters`;
      }
      if (validation.maxLength && String(value || '').length > validation.maxLength) {
        return `Maximum length is ${validation.maxLength} characters`;
      }
      if (validation.min && Number(value) < validation.min) {
        return `Minimum value is ${validation.min}`;
      }
      if (validation.max && Number(value) > validation.max) {
        return `Maximum value is ${validation.max}`;
      }
    }

    return null;
  };

  const validateForm = () => {
    // Use formConfig.sections based on backend response
    const sections = formConfig?.formConfig?.sections || [];
    if (sections.length === 0) return false;

    const errors = {};
    let isValid = true;

    sections.forEach((section) => {
      section.fields?.forEach((field) => {
        const value = formData[field.fieldName];
        const error = validateField(field, value);
        if (error) {
          errors[field.fieldName] = error;
          isValid = false;
        }
      });
    });

    setFieldErrors(errors);
    return isValid;
  };

  // Prepare FormData for submission with files as binary
  const prepareFormDataForSubmission = (data) => {
    const hasFiles = Object.values(data).some((value) => value instanceof File);
    
    if (hasFiles) {
      // Use FormData when files are present
      const formData = new FormData();
      
      // Add metadata fields at root level (as backend expects)
      if (countryId) formData.append('countryId', countryId);
      if (countryCode) formData.append('countryCode', countryCode);
      if (tripPurposeId) formData.append('tripPurposeId', tripPurposeId);
      if (tripPurposeCode) formData.append('tripPurposeCode', tripPurposeCode);
      
      // Separate files from other form data
      const formDataObj = {};
      const fileFields = {};
      
      Object.keys(data).forEach((key) => {
        const value = data[key];
        
        if (value instanceof File) {
          // Store file separately - will append to FormData
          fileFields[key] = value;
        } else if (value !== null && value !== undefined && value !== '') {
          // Add to formData object
          if (typeof value === 'boolean') {
            formDataObj[key] = value;
          } else if (typeof value === 'number') {
            formDataObj[key] = value;
          } else if (typeof value === 'object') {
            formDataObj[key] = value;
          } else {
            formDataObj[key] = String(value);
          }
        }
      });
      
      // Append formData as JSON string (backend will parse it)
      formData.append('formData', JSON.stringify(formDataObj));
      
      // Append files with their field names
      // Note: Backend might need to handle files differently
      // For now, we'll append them with their field names
      Object.keys(fileFields).forEach((key) => {
        formData.append(key, fileFields[key]);
      });
      
      return { isFormData: true, data: formData };
    } else {
      // Use regular JSON for non-file submissions
      return { isFormData: false, data };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(fieldErrors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }

    // Validate required metadata
    if (!countryId || !countryCode || !tripPurposeId || !tripPurposeCode) {
      setError('Missing required information. Please try again.');
      return;
    }

    setSubmitting(true);
    try {
      const { isFormData, data } = prepareFormDataForSubmission(formData);
      
      // Debug logging
      console.log('Submitting application with:', {
        countryId,
        countryCode,
        tripPurposeId,
        tripPurposeCode,
        hasFiles: isFormData,
      });
      
      if (isFormData) {
        // Submit using FormData (for file uploads)
        // Log FormData contents for debugging
        console.log('FormData entries:');
        for (const [key, value] of data.entries()) {
          if (value instanceof File) {
            console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
          } else {
            console.log(`${key}: ${value}`);
          }
        }
        await ApplicationFormService.submitApplicationWithFormData(data);
      } else {
        // Submit using regular JSON (no files)
        await ApplicationFormService.submitApplication({
          countryId,
          countryCode,
          tripPurposeId,
          tripPurposeCode,
          formData: data,
        });
      }
      
      // Close modal first
      onClose();
      
      // Show success alert that auto-closes and redirects
      await Swal.fire({
        icon: 'success',
        title: 'Application Submitted!',
        text: 'Your visa application has been submitted successfully.',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
      
      // Redirect to Profile page after alert closes
      navigate('/user-details');
    } catch (err) {
      console.error('Error submitting application:', err);
      // Error is already handled by the service with toast
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const value = formData[field.fieldName];
    const error = fieldErrors[field.fieldName];
    const hasError = !!error;
    const formattedLabel = formatLabel(field.fieldLabel);
    const filePreview = filePreviews[field.fieldName];
    const hasFile = value instanceof File;

    switch (field.fieldType) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <div key={field.fieldName} className="space-y-2">
            <label htmlFor={field.fieldName} className="block text-sm font-semibold text-slate-700">
              {formattedLabel}
              {field.isRequired && (
                <span className="ml-1 text-rose-500">*</span>
              )}
            </label>
            <input
              id={field.fieldName}
              name={field.fieldName}
              type={field.fieldType}
              value={field.fieldType === 'number' ? (value || '') : String(value || '')}
              onChange={(e) =>
                handleInputChange(
                  field.fieldName,
                  field.fieldType === 'number' 
                    ? (e.target.value === '' ? '' : Number(e.target.value))
                    : e.target.value
                )
              }
              placeholder={field.placeholder || `Enter ${formattedLabel.toLowerCase()}`}
              required={field.isRequired}
              className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 placeholder:text-slate-400 ${
                hasError
                  ? 'border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-200 bg-white focus:border-indigo-500 focus:ring-indigo-200 hover:border-slate-300'
              }`}
            />
            {field.helpText && (
              <p className="text-xs text-slate-500 mt-1">{field.helpText}</p>
            )}
            {error && (
              <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.fieldName} className="space-y-2">
            <label htmlFor={field.fieldName} className="block text-sm font-semibold text-slate-700">
              {formattedLabel}
              {field.isRequired && (
                <span className="ml-1 text-rose-500">*</span>
              )}
            </label>
            <textarea
              id={field.fieldName}
              name={field.fieldName}
              value={String(value || '')}
              onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
              placeholder={field.placeholder || `Enter ${formattedLabel.toLowerCase()}`}
              required={field.isRequired}
              rows={4}
              className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 resize-y placeholder:text-slate-400 ${
                hasError
                  ? 'border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-200 bg-white focus:border-indigo-500 focus:ring-indigo-200 hover:border-slate-300'
              }`}
            />
            {field.helpText && (
              <p className="text-xs text-slate-500 mt-1">{field.helpText}</p>
            )}
            {error && (
              <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.fieldName} className="space-y-2">
            <label htmlFor={field.fieldName} className="block text-sm font-semibold text-slate-700">
              {formattedLabel}
              {field.isRequired && (
                <span className="ml-1 text-rose-500">*</span>
              )}
            </label>
            <select
              id={field.fieldName}
              name={field.fieldName}
              value={String(value || '')}
              onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
              required={field.isRequired}
              className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 appearance-none bg-white ${
                hasError
                  ? 'border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200 hover:border-slate-300'
              }`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem',
              }}
            >
              <option value="">Select {formattedLabel.toLowerCase()}</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {field.helpText && (
              <p className="text-xs text-slate-500 mt-1">{field.helpText}</p>
            )}
            {error && (
              <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div key={field.fieldName} className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {formattedLabel}
              {field.isRequired && (
                <span className="ml-1 text-rose-500">*</span>
              )}
            </label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <label
                  key={option.value}
                  htmlFor={`${field.fieldName}-${option.value}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer"
                >
                  <input
                    id={`${field.fieldName}-${option.value}`}
                    type="radio"
                    name={field.fieldName}
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
                    required={field.isRequired}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                  />
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
            {field.helpText && (
              <p className="text-xs text-slate-500 mt-1">{field.helpText}</p>
            )}
            {error && (
              <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.fieldName} className="space-y-2">
            <label htmlFor={field.fieldName} className="flex items-center gap-3 cursor-pointer">
              <input
                id={field.fieldName}
                name={field.fieldName}
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => handleInputChange(field.fieldName, e.target.checked)}
                required={field.isRequired}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
              />
              <span className="text-sm font-semibold text-slate-700">
                {formattedLabel}
                {field.isRequired && (
                  <span className="ml-1 text-rose-500">*</span>
                )}
              </span>
            </label>
            {field.helpText && (
              <p className="text-xs text-slate-500 ml-7 mt-1">{field.helpText}</p>
            )}
            {error && (
              <p className="text-xs text-rose-600 font-medium ml-7 mt-1 flex items-center gap-1">
                <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={field.fieldName} className="space-y-2">
            <label htmlFor={field.fieldName} className="block text-sm font-semibold text-slate-700">
              {formattedLabel}
              {field.isRequired && (
                <span className="ml-1 text-rose-500">*</span>
              )}
            </label>
            <input
              id={field.fieldName}
              name={field.fieldName}
              type="date"
              value={String(value || '')}
              onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
              required={field.isRequired}
              max={new Date().toISOString().split('T')[0]} // Prevent future dates for DOB
              className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 placeholder:text-slate-400 ${
                hasError
                  ? 'border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-200 bg-white focus:border-indigo-500 focus:ring-indigo-200 hover:border-slate-300'
              }`}
            />
            {field.helpText && (
              <p className="text-xs text-slate-500 mt-1">{field.helpText}</p>
            )}
            {error && (
              <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
          </div>
        );

      case 'file':
        return (
          <div key={field.fieldName} className="space-y-2">
            <label htmlFor={field.fieldName} className="block text-sm font-semibold text-slate-700">
              {formattedLabel}
              {field.isRequired && (
                <span className="ml-1 text-rose-500">*</span>
              )}
            </label>
            <div className="flex items-start gap-3">
              {/* Upload Button */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveUploadMenu(
                      activeUploadMenu === field.fieldName ? null : field.fieldName
                    );
                  }}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 ${
                    hasError
                      ? 'border-rose-300 bg-rose-50 text-rose-700 focus:border-rose-500 focus:ring-rose-200'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 focus:border-indigo-500 focus:ring-indigo-200'
                  }`}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span>Upload</span>
                </button>

                {/* Upload Options Dropdown */}
                {activeUploadMenu === field.fieldName && (
                  <div className="absolute top-full left-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-xl">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGalleryClick(field.fieldName);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-900 transition hover:bg-slate-50 first:rounded-t-xl"
                    >
                      <svg
                        className="h-5 w-5 text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Choose from Gallery</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCameraClick(field.fieldName);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-900 transition hover:bg-slate-50 last:rounded-b-xl"
                    >
                      <svg
                        className="h-5 w-5 text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>Take Photo</span>
                    </button>
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  ref={(el) => {
                    fileInputRefs.current[field.fieldName] = el;
                  }}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileSelect(file, field.fieldName);
                    }
                  }}
                />
              </div>

              {/* File Preview */}
              {hasFile && (
                <div
                  onClick={() => handleFilePreview(field.fieldName)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 cursor-pointer hover:bg-slate-100 transition"
                >
                  {filePreview && value?.type?.startsWith('image/') ? (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-indigo-100">
                      <svg
                        className="h-5 w-5 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-700 truncate max-w-[200px]">
                      {value.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {(value.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInputChange(field.fieldName, null);
                      setFilePreviews((prev) => {
                        const newPreviews = { ...prev };
                        delete newPreviews[field.fieldName];
                        return newPreviews;
                      });
                    }}
                    className="ml-auto rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            {field.helpText && (
              <p className="text-xs text-slate-500 mt-1">{field.helpText}</p>
            )}
            {error && (
              <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Close upload menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeUploadMenu && !event.target.closest('.relative')) {
        setActiveUploadMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeUploadMenu]);

  if (!open) return null;

  // Use formConfig.sections based on backend response
  const sections = formConfig?.formConfig?.sections || [];
  
  // Sort sections by sectionOrder
  const sortedSections = sections.length > 0
    ? [...sections].sort(
        (a, b) => (a.sectionOrder || 0) - (b.sectionOrder || 0)
      )
    : [];

  // Sort fields within each section by displayOrder
  const sortedSectionsWithFields = sortedSections.map((section) => ({
    ...section,
    fields: [...(section.fields || [])].sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
    ),
  }));

  return (
    <>
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 px-4 py-10 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[36px] border border-white/10 bg-white shadow-[0_40px_140px_rgba(3,9,32,0.45)] flex flex-col relative z-[61]"
          onClick={(event) => event.stopPropagation()}
        >
          {/* Header - Original color theme */}
          <div className="relative bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 px-6 sm:px-8 py-6 sm:py-8 text-white">
            <div className="flex items-start justify-between gap-6 pr-12 sm:pr-16">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                  Visa Application
                </p>
                <h3 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
                  Complete Your Application
                </h3>
                <p className="mt-1 text-sm text-white/70">
                  Please fill in all required fields to proceed.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 h-10 w-10 rounded-full border border-white/30 bg-slate-900/80 text-lg text-white/80 shadow-lg transition hover:text-white"
              aria-label="Close application form"
            >
              ✕
            </button>
          </div>

          {/* Form Content - Scrollable */}
          <div className="flex-1 overflow-y-auto bg-white px-4 sm:px-6 lg:px-8 py-6 relative">
            {loading ? (
              <div className="flex flex-col items-center gap-4 py-16">
                <span className="inline-flex h-12 w-12 animate-spin rounded-full border-2 border-indigo-400/30 border-t-indigo-400" />
                <p className="text-sm text-slate-500">Loading form...</p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
                <button
                  onClick={fetchFormConfig}
                  className="ml-4 text-indigo-600 hover:text-indigo-700 underline font-medium"
                >
                  Retry
                </button>
              </div>
            ) : sortedSectionsWithFields.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                No form configuration available.
              </p>
            ) : (
              <form id="application-form" onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                {sortedSectionsWithFields.map((section, sectionIndex) => (
                  <div
                    key={section.sectionName || sectionIndex}
                    className="rounded-3xl border border-slate-100 bg-slate-50 p-5 sm:p-6 lg:p-8 shadow-sm"
                  >
                    <h4 className="mb-5 sm:mb-6 text-lg sm:text-xl font-semibold text-slate-900 border-b border-slate-200 pb-3">
                      {formatSectionName(section.sectionName)}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                      {section.fields?.map((field) => (
                        <div
                          key={field.fieldName}
                          className={field.fieldType === 'textarea' || field.fieldType === 'radio' || field.fieldType === 'checkbox' ? 'md:col-span-2' : ''}
                        >
                          {renderField(field)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </form>
            )}
          </div>

          {/* Submit Button - Fixed at bottom with proper z-index */}
          {!loading && !error && sortedSectionsWithFields.length > 0 && (
            <div className="sticky bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 backdrop-blur-sm py-4 sm:py-6 px-4 sm:px-6 lg:px-8 z-[62] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="application-form"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {submitting ? (
                    <>
                      <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Preview Modal */}
      {previewModal.show && (
        <FilePreviewModal
          file={previewModal.file}
          onClose={() => setPreviewModal({ show: false, file: null })}
        />
      )}
    </>
  );
};

export default ApplicationFormModal;
