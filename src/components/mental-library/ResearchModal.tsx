
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  study: {
    title: string;
    institution: string;
    abstract: string;
    field: string;
    fullContent: React.ReactNode;
  } | null;
}

export const ResearchModal: React.FC<ResearchModalProps> = ({
  isOpen,
  onClose,
  study
}) => {
  if (!study) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" dir="rtl">
        <DialogHeader className="mb-4">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-2xl font-bold">{study.title}</DialogTitle>
            <Badge className="bg-primary/10 text-primary font-normal">
              {study.field}
            </Badge>
          </div>
          <DialogDescription className="text-sm mt-2">
            {study.institution}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="research-content prose prose-lg max-w-none pb-6">
            {study.fullContent}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
