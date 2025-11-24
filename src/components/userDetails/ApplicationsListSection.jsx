import React, { useState, useEffect } from 'react';
import VisaApplyListService from '../../services/visaApplyList/visaApplyList.services';
import Loader from '../Loader';
import { env } from '../../utils/env';

const ApplicationsListSection = () => {
  // Base URL for images
  const BASE_URL = env.baseUrl || 'https://9zqwrzw6-2030.inc1.devtunnels.ms';

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // If relative path, prepend base URL
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${BASE_URL}${cleanPath}`;
  };
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalDocs: 0,
  });
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [pagination.page, statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await VisaApplyListService.getApplicationsList({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
      });

      if (response?.success && response?.data) {
        setApplications(response.data.docs || []);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.data.pagination?.totalPages || 1,
          totalDocs: response.data.pagination?.totalDocs || 0,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700' },
      submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
      payment_pending: { label: 'Payment Pending', color: 'bg-amber-100 text-amber-700' },
      under_review: { label: 'Under Review', color: 'bg-indigo-100 text-indigo-700' },
      additional_docs_required: { label: 'Docs Required', color: 'bg-orange-100 text-orange-700' },
      approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
      rejected: { label: 'Rejected', color: 'bg-rose-100 text-rose-700' },
      cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700' },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${config.color}`}>
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
    });
  };

  const formatDateTime = (dateString) => {
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
        <h2 className="text-2xl font-bold text-slate-900">Applications List</h2>
        <p className="mt-1 text-sm text-slate-600">
          View and manage your visa applications
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="payment_pending">Payment Pending</option>
          <option value="under_review">Under Review</option>
          <option value="additional_docs_required">Additional Docs Required</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-slate-400"
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
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No applications found</h3>
          <p className="mt-2 text-sm text-slate-600">
            {statusFilter ? 'Try adjusting your filters' : 'You haven\'t submitted any applications yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app._id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-4">
                    {app.country?.icon && (
                      <img
                        src={getImageUrl(app.country.icon)}
                        alt={app.country.name}
                        className="h-12 w-12 rounded-lg object-cover"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {app.country?.name || 'Unknown Country'}
                        </h3>
                        {getStatusBadge(app.status)}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        Application ID: <span className="font-mono">{app.applicationId}</span>
                      </p>
                      {app.tripPurpose && (
                        <p className="mt-1 text-sm text-slate-500">
                          Purpose: {app.tripPurpose.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Admin Notes Section */}
                  {app.adminNotes && app.adminNotes.length > 0 && (
                    <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <svg
                          className="h-4 w-4 text-indigo-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        <h4 className="text-sm font-semibold text-indigo-900">
                          Admin Notes ({app.adminNotes.length})
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {app.adminNotes.map((note) => (
                          <div
                            key={note._id}
                            className="rounded-lg border border-indigo-100 bg-white p-3"
                          >
                            <p className="text-sm text-slate-900">{note.note}</p>
                            <p className="mt-2 text-xs text-slate-500">
                              {formatDateTime(note.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 text-right">
                  {app.submittedAt && (
                    <p className="text-sm text-slate-600">
                      Submitted: {formatDate(app.submittedAt)}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    Created: {formatDate(app.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4">
              <div className="text-sm text-slate-600">
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalDocs} total)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicationsListSection;

