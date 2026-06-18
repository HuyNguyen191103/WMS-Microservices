"use client";

import type { FormEventHandler, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CrudFormDialogProps = {
  open: boolean;
  title: string;
  description: string;
  children: ReactNode;
  isSubmitting: boolean;
  submitText: string;
  submittingText?: string;
  submitDisabled?: boolean;
  error?: string;
  contentClassName?: string;
  formClassName?: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export function CrudFormDialog({
  open,
  title,
  description,
  children,
  isSubmitting,
  submitText,
  submittingText = "Saving...",
  submitDisabled,
  error,
  contentClassName,
  formClassName = "space-y-4",
  onOpenChange,
  onSubmit,
}: CrudFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={contentClassName}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form className={formClassName} onSubmit={onSubmit}>
          {children}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || submitDisabled}>
              {isSubmitting ? submittingText : submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
