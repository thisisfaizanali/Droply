import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  description: string;
  icon?: LucideIcon;
  iconColor?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "primary" | "danger" | "warning" | "success" | "default";
  onConfirm: () => void;
  isDangerous?: boolean;
  warningMessage?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  icon: Icon,
  iconColor = "text-organic-accent-700",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  isDangerous = false,
  warningMessage,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[32px] bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
            {title}
          </DialogTitle>
        </DialogHeader>

        {isDangerous && warningMessage && (
          <div className="rounded-lg bg-organic-accent-100 p-4 text-organic-accent-800">
            <div className="flex items-start gap-3">
              {Icon && <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${iconColor}`} />}
              <div>
                <p className="font-medium">This action cannot be undone</p>
                <p className="mt-1 text-sm">{warningMessage}</p>
              </div>
            </div>
          </div>
        )}
        <p>{description}</p>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {Icon && <Icon className="mr-1 h-4 w-4" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
