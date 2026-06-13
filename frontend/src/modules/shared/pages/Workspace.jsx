import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';
import Chat from '../../../components/Chat';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    Loader2, ArrowLeft, Plus, CheckCircle, XCircle, Clock,
    FileText, Upload, Paperclip, Activity, Package,
    Download, User, ChevronDown
} from 'lucide-react';

// ── Helpers ─────────────────────────────────────────────────────────────────

const statusBadge = (status) => {
    const map = {
        todo:      'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
        in_review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
        done:      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        rejected:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        pending:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        approved:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    };
    return map[status] || 'bg-gray-100 text-gray-500';
};

const fmt = (date) => date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (date) => date ? new Date(date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

const activityLabel = (action, meta) => {
    switch (action) {
        case 'task_created':      return `Task created: "${meta.taskTitle}"`;
        case 'task_updated':      return `Task "${meta.taskTitle}" moved to ${meta.newStatus?.replace('_', ' ')}`;
        case 'task_closed':       return `Task closed`;
        case 'file_uploaded':     return `File uploaded: "${meta.fileName}"`;
        case 'deliverable_submitted': return `Deliverable submitted: "${meta.fileName}"`;
        case 'deliverable_approved':  return `Deliverable approved: "${meta.fileName}"`;
        case 'deliverable_rejected':  return `Deliverable rejected: "${meta.fileName}"`;
        default:                  return action.replace(/_/g, ' ');
    }
};

// ── Sub-components ───────────────────────────────────────────────────────────

const TasksTab = ({ gigId, tasks = [], isHirer, queryClient }) => {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', deadline: '' });
    const [expandedTask, setExpandedTask] = useState(null);

    const createMut = useMutation({
        mutationFn: (data) => api.post(`/workspaces/${gigId}/tasks`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['workspace', gigId]);
            queryClient.invalidateQueries(['workspace-activities', gigId]);
            setShowForm(false);
            setForm({ title: '', description: '', deadline: '' });
            toast.success('Task created');
        },
        onError: (e) => toast.error(e.response?.data?.message || 'Failed to create task'),
    });

    const updateMut = useMutation({
        mutationFn: ({ taskId, status }) => api.patch(`/workspaces/tasks/${taskId}`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries(['workspace', gigId]);
            queryClient.invalidateQueries(['workspace-activities', gigId]);
            toast.success('Task updated');
        },
        onError: (e) => toast.error(e.response?.data?.message || 'Failed to update task'),
    });

    return (
        <div className="space-y-4">
            {isHirer && (
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors"
                    >
                        <Plus size={16} /> Add Task
                    </button>
                </div>
            )}

            <AnimatePresence>
                {showForm && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }}
                        className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-6 space-y-4 overflow-hidden"
                    >
                        <h3 className="font-bold text-gray-900 dark:text-white">New Task</h3>
                        <input
                            required placeholder="Task title"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                        />
                        <textarea
                            placeholder="Description (optional)"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
                            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Deadline</label>
                            <input
                                required type="date"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
                            <button type="submit" disabled={createMut.isPending} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 flex items-center gap-2">
                                {createMut.isPending ? <Loader2 size={14} className="animate-spin" /> : null} Create Task
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {tasks.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-bold">No tasks yet</p>
                    {isHirer && <p className="text-sm mt-1">Create a task above to get started.</p>}
                </div>
            )}

            {tasks.map((task) => (
                <div key={task._id} className="bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                    <button
                        onClick={() => setExpandedTask(expandedTask === task._id ? null : task._id)}
                        className="w-full text-left p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{task.title}</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide ${statusBadge(task.status)}`}>
                                        {task.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock size={11} /> Due {fmt(task.deadline)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <ChevronDown size={18} className={`text-gray-400 transition-transform ${expandedTask === task._id ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {expandedTask === task._id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="px-5 pb-5 space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                                    {task.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-2">
                                        {/* Intern: can submit (moves to in_review) */}
                                        {!isHirer && task.status === 'todo' && (
                                            <button
                                                onClick={() => updateMut.mutate({ taskId: task._id, status: 'in_review' })}
                                                disabled={updateMut.isPending}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
                                            >
                                                <Upload size={14} /> Submit for Review
                                            </button>
                                        )}

                                        {/* Intern: rejected → can resubmit */}
                                        {!isHirer && task.status === 'rejected' && (
                                            <button
                                                onClick={() => updateMut.mutate({ taskId: task._id, status: 'in_review' })}
                                                disabled={updateMut.isPending}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors"
                                            >
                                                <Upload size={14} /> Resubmit
                                            </button>
                                        )}

                                        {/* Hirer: in_review → approve or reject */}
                                        {isHirer && task.status === 'in_review' && (
                                            <>
                                                <button
                                                    onClick={() => updateMut.mutate({ taskId: task._id, status: 'done' })}
                                                    disabled={updateMut.isPending}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors"
                                                >
                                                    <CheckCircle size={14} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => updateMut.mutate({ taskId: task._id, status: 'rejected' })}
                                                    disabled={updateMut.isPending}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors"
                                                >
                                                    <XCircle size={14} /> Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
};

// ── Files Tab ────────────────────────────────────────────────────────────────

const FilesTab = ({ gigId, queryClient }) => {
    const fileInput = useRef(null);
    const [dragging, setDragging] = useState(false);

    const { data: files = [], isLoading } = useQuery({
        queryKey: ['workspace-files', gigId],
        queryFn: async () => {
            const { data } = await api.get(`/workspaces/${gigId}/files`);
            return data || [];
        },
    });

    const uploadMut = useMutation({
        mutationFn: (file) => {
            const fd = new FormData();
            fd.append('file', file);
            return api.post(`/workspaces/${gigId}/files`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['workspace-files', gigId]);
            queryClient.invalidateQueries(['workspace-activities', gigId]);
            toast.success('File uploaded');
        },
        onError: (e) => toast.error(e.response?.data?.message || 'Upload failed'),
    });

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) uploadMut.mutate(file);
    };

    const formatSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="space-y-5">
            {/* Upload Zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInput.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                    dragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
            >
                {uploadMut.isPending ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        <p className="text-sm font-bold text-gray-500">Uploading...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Drag & drop or click to upload</p>
                        <p className="text-xs text-gray-400">Max 20 MB per file</p>
                    </div>
                )}
                <input ref={fileInput} type="file" className="hidden" onChange={(e) => { if (e.target.files[0]) uploadMut.mutate(e.target.files[0]); }} />
            </div>

            {/* File List */}
            {isLoading && <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-500" /></div>}

            {!isLoading && files.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-bold text-sm">No files yet</p>
                </div>
            )}

            <div className="space-y-2">
                {files.map((file) => (
                    <div key={file._id} className="flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 hover:border-indigo-200 transition-colors">
                        <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center shrink-0">
                            <Paperclip size={18} className="text-indigo-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{file.fileName}</p>
                            <p className="text-xs text-gray-400">
                                {file.uploadedBy?.name} · {formatSize(file.fileSize)} · {fmtTime(file.createdAt)}
                            </p>
                        </div>
                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" download className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-600 transition-colors">
                            <Download size={16} />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Deliverables Tab ─────────────────────────────────────────────────────────

const DeliverablesTab = ({ gigId, isHirer, queryClient }) => {
    const [showSubmit, setShowSubmit] = useState(false);
    const [submitForm, setSubmitForm] = useState({ fileId: '', taskId: '', note: '' });
    const [reviewingId, setReviewingId] = useState(null);
    const [remarks, setRemarks] = useState('');

    const { data: deliverables = [], isLoading: dlLoading } = useQuery({
        queryKey: ['workspace-deliverables', gigId],
        queryFn: async () => {
            const { data } = await api.get(`/workspaces/${gigId}/deliverables`);
            return data || [];
        },
    });

    const { data: files = [] } = useQuery({
        queryKey: ['workspace-files', gigId],
        queryFn: async () => {
            const { data } = await api.get(`/workspaces/${gigId}/files`);
            return data || [];
        },
    });

    const submitMut = useMutation({
        mutationFn: (payload) => api.post(`/workspaces/${gigId}/deliverables`, payload),
        onSuccess: () => {
            queryClient.invalidateQueries(['workspace-deliverables', gigId]);
            queryClient.invalidateQueries(['workspace-activities', gigId]);
            setShowSubmit(false);
            setSubmitForm({ fileId: '', taskId: '', note: '' });
            toast.success('Deliverable submitted');
        },
        onError: (e) => toast.error(e.response?.data?.message || 'Failed to submit'),
    });

    const reviewMut = useMutation({
        mutationFn: ({ id, action }) => api.patch(`/workspaces/deliverables/${id}/${action}`, { remarks }),
        onSuccess: () => {
            queryClient.invalidateQueries(['workspace-deliverables', gigId]);
            queryClient.invalidateQueries(['workspace', gigId]);
            queryClient.invalidateQueries(['workspace-activities', gigId]);
            setReviewingId(null);
            setRemarks('');
            toast.success('Review saved');
        },
        onError: (e) => toast.error(e.response?.data?.message || 'Review failed'),
    });

    return (
        <div className="space-y-5">
            {!isHirer && (
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowSubmit(!showSubmit)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors"
                    >
                        <Package size={15} /> Submit Deliverable
                    </button>
                </div>
            )}

            <AnimatePresence>
                {showSubmit && !isHirer && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-6 space-y-4 overflow-hidden"
                    >
                        <h3 className="font-bold text-gray-900 dark:text-white">Submit Deliverable</h3>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Select File</label>
                            <select
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                value={submitForm.fileId}
                                onChange={(e) => setSubmitForm({ ...submitForm, fileId: e.target.value })}
                            >
                                <option value="">— Choose a file from workspace —</option>
                                {files.map((f) => (
                                    <option key={f._id} value={f._id}>{f.fileName}</option>
                                ))}
                            </select>
                            {files.length === 0 && <p className="text-xs text-amber-500 mt-1">Upload a file first in the Files tab.</p>}
                        </div>
                        <textarea
                            placeholder="Add a note (optional)"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[70px]"
                            value={submitForm.note}
                            onChange={(e) => setSubmitForm({ ...submitForm, note: e.target.value })}
                        />
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowSubmit(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
                            <button
                                onClick={() => submitMut.mutate(submitForm)}
                                disabled={!submitForm.fileId || submitMut.isPending}
                                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
                            >
                                {submitMut.isPending ? <Loader2 size={14} className="animate-spin" /> : null} Submit
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {dlLoading && <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-500" /></div>}

            {!dlLoading && deliverables.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                    <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-bold">No deliverables yet</p>
                </div>
            )}

            <div className="space-y-4">
                {deliverables.map((d) => (
                    <div key={d._id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                                    <User size={16} className="text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{d.fileId?.fileName || 'File'}</p>
                                    <p className="text-xs text-gray-400">By {d.submittedBy?.name} · {fmtTime(d.createdAt)}</p>
                                </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wide ${statusBadge(d.status)}`}>
                                {d.status}
                            </span>
                        </div>

                        {d.note && <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">"{d.note}"</p>}

                        {d.fileId?.fileUrl && (
                            <a href={d.fileId.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-indigo-600 hover:underline text-sm font-bold">
                                <Download size={14} /> Download
                            </a>
                        )}

                        {d.remarks && (
                            <div className={`p-3 rounded-xl text-sm ${d.status === 'approved' ? 'bg-green-50 dark:bg-green-900/10 text-green-700' : 'bg-red-50 dark:bg-red-900/10 text-red-700'}`}>
                                <strong>Remarks:</strong> {d.remarks}
                            </div>
                        )}

                        {/* Hirer Review Actions */}
                        {isHirer && d.status === 'pending' && (
                            reviewingId === d._id ? (
                                <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                                    <textarea
                                        placeholder="Leave remarks (optional for approval, recommended for rejection)"
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm outline-none"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => reviewMut.mutate({ id: d._id, action: 'approve' })}
                                            disabled={reviewMut.isPending}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl"
                                        >
                                            <CheckCircle size={14} /> Approve
                                        </button>
                                        <button
                                            onClick={() => reviewMut.mutate({ id: d._id, action: 'reject' })}
                                            disabled={reviewMut.isPending}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl"
                                        >
                                            <XCircle size={14} /> Reject
                                        </button>
                                        <button onClick={() => setReviewingId(null)} className="px-4 py-2 text-sm font-bold text-gray-500">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setReviewingId(d._id)}
                                    className="mt-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/30 rounded-xl text-sm font-bold hover:bg-yellow-100 transition-colors"
                                >
                                    Review
                                </button>
                            )
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Activity Tab ─────────────────────────────────────────────────────────────

const ActivityTab = ({ gigId }) => {
    const { data: activities = [], isLoading } = useQuery({
        queryKey: ['workspace-activities', gigId],
        queryFn: async () => {
            const { data } = await api.get(`/workspaces/${gigId}/activities`);
            return data || [];
        },
        refetchInterval: 15000,
    });

    return (
        <div>
            {isLoading && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-500" /></div>}
            {!isLoading && activities.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                    <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-bold text-sm">No activity yet</p>
                </div>
            )}
            <div className="relative pl-6">
                {activities.length > 0 && <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />}
                <div className="space-y-5">
                    {activities.map((a) => (
                        <div key={a._id} className="relative">
                            <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white dark:border-gray-900 shadow" />
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{a.userId?.name || 'User'}</span>
                                    <span className="text-xs text-gray-400">{fmtTime(a.createdAt)}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{activityLabel(a.action, a.meta || {})}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ── Main Workspace Page ──────────────────────────────────────────────────────

const TABS = ['Tasks', 'Files', 'Deliverables', 'Activity'];
const TAB_ICONS = [FileText, Paperclip, Package, Activity];

const Workspace = () => {
    const { gigId } = useParams();
    const { userInfo } = useSelector((state) => state.auth);
    const queryClient = useQueryClient();
    const isHirer = userInfo?.role === 'hirer' || userInfo?.role === 'admin';
    const [activeTab, setActiveTab] = useState(0);

    const { data: workspace, isLoading, isError } = useQuery({
        queryKey: ['workspace', gigId],
        queryFn: async () => {
            const { data } = await api.get(`/workspaces/${gigId}`);
            return data; // interceptor already unwraps .data
        },
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <p className="text-gray-500 font-bold">Loading Workspace...</p>
            </div>
        );
    }

    if (isError || !workspace) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-2">
                    <XCircle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-xl font-black text-gray-800 dark:text-white">Workspace not found</h2>
                <p className="text-gray-400 text-sm max-w-sm">This workspace doesn't exist or you don't have access to it.</p>
                <Link to="/workspaces" className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700">
                    Back to Workspaces
                </Link>
            </div>
        );
    }

    const { gig, tasks } = workspace;
    const TabIcon = TAB_ICONS[activeTab];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6" style={{ minHeight: 'calc(100vh - 80px)' }}>

            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div>
                    <Link to="/workspaces" className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:underline mb-2">
                        <ArrowLeft size={14} /> Workspaces
                    </Link>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex flex-wrap items-center gap-3">
                        {gig.title}
                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs uppercase font-black tracking-widest">
                            Workspace
                        </span>
                    </h1>
                    <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-gray-400 font-bold">
                        <span className={`px-2.5 py-1 rounded-lg uppercase tracking-wider ${statusBadge(gig.status)}`}>{gig.status.replace('-', ' ')}</span>
                        {gig.deadline && <span className="flex items-center gap-1"><Clock size={11} /> Deadline: {fmt(gig.deadline)}</span>}
                        {isHirer && gig.hiredInternId && <span>Intern: <span className="text-gray-600 dark:text-gray-200">{gig.hiredInternId.name}</span></span>}
                        {!isHirer && gig.ownerId && <span>Client: <span className="text-gray-600 dark:text-gray-200">{gig.ownerId.name}</span></span>}
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: 0 }}>

                {/* Left: Tabs */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl flex flex-col overflow-hidden">
                    {/* Tab Bar */}
                    <div className="flex border-b border-gray-100 dark:border-gray-700 shrink-0">
                        {TABS.map((tab, i) => {
                            const Icon = TAB_ICONS[i];
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(i)}
                                    className={`flex items-center gap-2 px-5 py-4 text-sm font-bold border-b-2 transition-all ${
                                        activeTab === i
                                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'
                                    }`}
                                >
                                    <Icon size={15} /> {tab}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                {activeTab === 0 && <TasksTab gigId={gigId} tasks={tasks} isHirer={isHirer} queryClient={queryClient} />}
                                {activeTab === 1 && <FilesTab gigId={gigId} queryClient={queryClient} />}
                                {activeTab === 2 && <DeliverablesTab gigId={gigId} isHirer={isHirer} queryClient={queryClient} />}
                                {activeTab === 3 && <ActivityTab gigId={gigId} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right: Chat */}
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden flex flex-col" style={{ minHeight: '500px' }}>
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
                        <h3 className="font-black text-gray-900 dark:text-white text-sm">Project Chat</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Private between you and {isHirer ? 'the intern' : 'the client'}</p>
                    </div>
                    <div className="flex-1 min-h-0">
                        <Chat gigId={gigId} isEmbedded={true} />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Workspace;
