import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import { useAuth } from '../../context/AuthContext';
import { uploadProfilePhoto } from '../../services/storage';
import { Camera, Upload, Check, User } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface FinishSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FinishSetupModal: React.FC<FinishSetupModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, updateAvatar } = useAuth();
  const { showToast } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(profile?.avatar_url || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('error', 'File Too Large', 'Please select an image smaller than 2 MB.');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      onClose();
      return;
    }

    setIsUploading(true);
    try {
      const publicUrl = await uploadProfilePhoto(user.id, selectedFile);
      await updateAvatar(publicUrl);
      showToast('success', 'Profile Photo Updated', 'Your photo is securely stored and cached.');
      onClose();
    } catch (err: any) {
      showToast('error', 'Upload Failed', err.message || 'Could not upload photo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Finish Setup — Add Your Profile Photo"
      subtitle="Complete your student identity card for the ERP dashboard"
      maxWidth="md"
    >
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl overflow-hidden bg-slate-800 border-2 border-dashed border-blue-500/50 flex items-center justify-center shadow-glow-blue transition-all">
              {preview ? (
                <img src={preview} alt="Profile Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-slate-500" />
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-transform hover:scale-105"
              title="Select photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          <p className="text-xs text-slate-400 mt-4">
            Supports JPG, PNG or WebP (max 2 MB). Client-side compressed to ~512px.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-left text-xs text-slate-300 space-y-1">
          <p className="font-semibold text-slate-200">Student Profile Identity:</p>
          <p className="text-slate-400">Name: <span className="text-slate-200">{profile?.full_name || 'Anshul Shrivastava'}</span></p>
          <p className="text-slate-400">Enrollment / ID: <span className="text-slate-200">{profile?.student_id || 'ASET-IT-2026-031'}</span></p>
          <p className="text-slate-400">Institution: <span className="text-slate-200">{profile?.university || 'Amity University Gwalior'}</span></p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            {isUploading ? (
              <span>Compressing & Saving...</span>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Save Profile Photo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
