import React, { useState, useEffect } from 'react';
import DocumentDetailsListService from '../../services/documentDetailsList/documentDetailsList.services';
import VisaApplyListService from '../../services/visaApplyList/visaApplyList.services';
import Loader from '../Loader';

const DocumentDetailsSection = () => {
  const [applicationDetails, setApplicationDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewDocument, setPreviewDocument] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // const DOCUMENT_BASE_URL = 'https://9zqwrzw6-2030.inc1.devtunnels.ms/';
  const DOCUMENT_BASE_URL = "visa-phase2.itfuturz.in";

  const buildDocumentUrl = (filePath) => {
    if (!filePath) return null;
    if (/^https?:\/\//i.test(filePath)) {
      return filePath;
    }
    const cleanedPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    return `${DOCUMENT_BASE_URL}${cleanedPath}`;
  };

  const handleViewDocument = (doc) => {
    const url = buildDocumentUrl(doc.fileUrl);
    if (!url) return;

    setPreviewDocument({
      title: doc.checklistItem?.title || doc.documentType || 'Document',
      url,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPreviewDocument(null);
  };

  useEffect(() => {
    fetchDocumentDetails();
  }, []);

  const fetchDocumentDetails = async () => {
    setLoading(true);
    setError('');
    setApplicationDetails(null);

    try {
      // First, get the applications list to get an application ID
      const applicationsResponse = await VisaApplyListService.getApplicationsList({
        page: 1,
        limit: 1,
      });

      let applicationId = null;

      if (applicationsResponse?.success && applicationsResponse?.data?.docs?.length > 0) {
        // Use the first (most recent) application
        applicationId = applicationsResponse.data.docs[0].applicationId;
      } else if (applicationsResponse?.data?.docs?.length > 0) {
        // Handle alternative response structure
        applicationId = applicationsResponse.data.docs[0].applicationId;
      }

      if (!applicationId) {
        setError('No applications found. Please submit an application first.');
        setLoading(false);
        return;
      }

      // Now fetch the document details for this application
      const response = await DocumentDetailsListService.getApplicationDetails({
        applicationId: applicationId,
      });

      console.log('DocumentDetails API Response:', response);

      // Handle different response structures
      if (response?.success === true && response?.data) {
        // Standard success response with nested data
        setApplicationDetails(response.data);
      } else if (response?.status === 200 && response?.data) {
        // Handle case where status is 200 instead of success: true
        setApplicationDetails(response.data);
      } else if (response?.applicationId) {
        // Response data is directly in response (not nested in data property)
        setApplicationDetails(response);
      } else if (response?.data && !response?.success && response?.status !== 200) {
        // Response has data but indicates failure
        setError(response?.message || 'Failed to fetch application details');
      } else {
        // No data in response
        setError(response?.message || 'No application details found');
      }
    } catch (err) {
      console.error('DocumentDetails API Error:', err);
      const errorMessage = 
        err?.response?.data?.message || 
        err?.message || 
        'Failed to fetch application details. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
      approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
      rejected: { label: 'Rejected', color: 'bg-rose-100 text-rose-700' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getVerificationStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'bg-slate-100 text-slate-700' },
      approved: { label: 'Verified', color: 'bg-emerald-100 text-emerald-700' },
      rejected: { label: 'Rejected', color: 'bg-rose-100 text-rose-700' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Document Details</h2>
        <p className="mt-1 text-sm text-slate-600">
          View detailed information and documents for your applications
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12 rounded-2xl border border-slate-200 bg-white">
          <div className="text-center">
            <Loader size="lg" className="mx-auto" />
            <p className="mt-4 text-sm text-slate-600">Loading document details...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-rose-600 mt-0.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-rose-900">Error</h3>
              <p className="mt-1 text-sm text-rose-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Application Details */}
      {applicationDetails && !loading && (
        <div className="space-y-6">
          {/* Application Overview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Application Overview</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-slate-500">Application ID</p>
                <p className="mt-1 text-base font-mono text-slate-900">{applicationDetails.applicationId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Status</p>
                <div className="mt-1">
                  {getStatusBadge(applicationDetails.status)}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Country</p>
                <p className="mt-1 text-base text-slate-900">{applicationDetails.country?.name || '—'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Trip Purpose</p>
                <p className="mt-1 text-base text-slate-900">{applicationDetails.tripPurpose?.name || '—'}</p>
              </div>
              {applicationDetails.submittedAt && (
                <div>
                  <p className="text-sm font-medium text-slate-500">Submitted At</p>
                  <p className="mt-1 text-base text-slate-900">{formatDate(applicationDetails.submittedAt)}</p>
                </div>
              )}
              {applicationDetails.estimatedProcessingDate && (
                <div>
                  <p className="text-sm font-medium text-slate-500">Estimated Processing Date</p>
                  <p className="mt-1 text-base text-slate-900">{formatDate(applicationDetails.estimatedProcessingDate)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Documents ({applicationDetails.documents?.length || 0})
            </h3>
            {applicationDetails.documents && applicationDetails.documents.length > 0 ? (
              <div className="space-y-4">
                {applicationDetails.documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-base font-semibold text-slate-900">
                            {doc.checklistItem?.title || doc.documentType || 'Document'}
                          </h4>
                          {getVerificationStatusBadge(doc.verificationStatus)}
                        </div>
                        <div className="space-y-1 text-sm text-slate-600">
                          <p>Type: {doc.documentType}</p>
                          {doc.checklistItem && (
                            <>
                              {doc.checklistItem.isMandatory && (
                                <p className="text-amber-600">Required</p>
                              )}
                              {doc.checklistItem.fileFormat && (
                                <p>Format: {doc.checklistItem.fileFormat}</p>
                              )}
                            </>
                          )}
                          {doc.verifiedAt && (
                            <p>Verified: {formatDate(doc.verifiedAt)}</p>
                          )}
                          {doc.rejectionReason && (
                            <p className="text-rose-600">Rejection Reason: {doc.rejectionReason}</p>
                          )}
                        </div>
                      </div>
                      {doc.fileUrl && (
                        <button
                          type="button"
                          onClick={() => handleViewDocument(doc)}
                          className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No documents found</p>
            )}
          </div>

          {/* Payment Information */}
          {applicationDetails.payment && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-slate-500">Amount</p>
                  <p className="mt-1 text-base text-slate-900">
                    {applicationDetails.payment.currency} {applicationDetails.payment.amount}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Status</p>
                  <p className="mt-1 text-base text-slate-900">{applicationDetails.payment.paymentStatus}</p>
                </div>
                {applicationDetails.payment.transactionId && (
                  <div>
                    <p className="text-sm font-medium text-slate-500">Transaction ID</p>
                    <p className="mt-1 text-base font-mono text-slate-900">{applicationDetails.payment.transactionId}</p>
                  </div>
                )}
                {applicationDetails.payment.paidAt && (
                  <div>
                    <p className="text-sm font-medium text-slate-500">Paid At</p>
                    <p className="mt-1 text-base text-slate-900">{formatDate(applicationDetails.payment.paidAt)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {applicationDetails.adminNotes && applicationDetails.adminNotes.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Admin Notes ({applicationDetails.adminNotes.length})
              </h3>
              <div className="space-y-3">
                {applicationDetails.adminNotes.map((note, index) => (
                  <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-900">{note.note}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <span>{note.createdBy?.name || 'Admin'}</span>
                      <span>•</span>
                      <span>{formatDate(note.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {isModalOpen && previewDocument && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-8"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-5xl rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Document Preview</p>
                <h4 className="text-xl font-semibold text-slate-900">{previewDocument.title}</h4>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                aria-label="Close preview"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-4 h-[70vh] rounded-xl border border-slate-200">
              <iframe
                src={previewDocument.url}
                title={previewDocument.title}
                className="h-full w-full rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDetailsSection;

