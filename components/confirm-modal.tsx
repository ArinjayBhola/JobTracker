'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  isPending?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isPending = false,
}: ConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-bold tracking-tight">
                {title}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground/80 mt-1">
                {description}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>
        <DialogFooter className="bg-muted/30 p-4 flex sm:flex-row gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 sm:flex-none hover:bg-muted font-medium"
          >
            {cancelText}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 sm:flex-none bg-destructive hover:bg-destructive/90 shadow-sm font-medium"
          >
            {isPending ? 'Deleting...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
