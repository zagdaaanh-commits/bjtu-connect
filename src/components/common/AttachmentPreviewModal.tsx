'use client';

import React from 'react';
import { Modal } from './Modal';
import { Attachment } from '../../types/portal';
import { FileText, Download, CheckCircle, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface AttachmentPreviewModalProps {
  attachment: Attachment | null;
  onClose: () => void;
}

export const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({
  attachment,
  onClose,
}) => {
  const [downloaded, setDownloaded] = React.useState(false);

  if (!attachment) return null;

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <Modal
      isOpen={!!attachment}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-academic-700" />
          <span className="font-semibold text-slate-800">{attachment.name}</span>
          <span className="text-xs text-slate-400">({attachment.size})</span>
        </div>
      }
    >
      <div className="space-y-4">
        {attachment.type === 'image' && attachment.previewUrl ? (
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center max-h-[460px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={attachment.previewUrl}
              alt={attachment.name}
              className="max-h-[460px] w-auto object-contain"
            />
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl p-8 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-academic-100 flex items-center justify-center text-academic-700 shadow-inner">
              <FileText className="w-10 h-10" />
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 text-lg">{attachment.name}</h4>
              <p className="text-xs text-slate-500 mt-1">
                Document Type: {attachment.type.toUpperCase()} • Size: {attachment.size} • Verified Academic Format
              </p>
            </div>

            <div className="w-full max-w-md bg-white p-4 rounded-lg border border-slate-200 text-left text-xs text-slate-600 font-mono space-y-1 shadow-xs">
              <div className="text-slate-400 mb-2 font-sans font-medium flex items-center justify-between">
                <span>PREVIEW METADATA</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">SHA-256 VERIFIED</span>
              </div>
              <div>Author: BJTU Portal User</div>
              <div>Target Course: Data Structures & Rail Algorithms (CS201)</div>
              <div>Pages / Sections: 4 Pages • 2 Figures • LaTeX Derived</div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-academic-700 hover:bg-academic-800 rounded-lg shadow-sm transition-all"
          >
            {downloaded ? (
              <>
                <CheckCircle className="w-4 h-4 text-white" />
                <span>Downloaded Successfully</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Attachment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
