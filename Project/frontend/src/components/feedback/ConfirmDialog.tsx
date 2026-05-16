'use client';
import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/feedback/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  loading?: boolean;
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'default', loading,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <ModalHeader title={title} onClose={onClose} />
      <ModalBody>
        <div className="flex items-start gap-4">
          {variant !== 'default' && (
            <div className={`p-2 rounded-lg flex-shrink-0 ${variant === 'danger' ? 'bg-emergency/10' : 'bg-warning/10'}`}>
              <AlertTriangle className={`w-5 h-5 ${variant === 'danger' ? 'text-emergency-light' : 'text-warning-light'}`} />
            </div>
          )}
          <p className="text-sm text-gray-300 leading-relaxed">{message}</p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" size="sm" onClick={onClose}>{cancelLabel}</Button>
        <Button variant={variant === 'danger' ? 'danger' : 'primary'} size="sm" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
