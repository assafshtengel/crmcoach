
// React hooks for toast notifications
import { 
  useToast as useToastOriginal,
  toast as toastOriginal 
} from "@/components/ui/toast";

// Re-export the hooks and functions
export const useToast = useToastOriginal;
export const toast = toastOriginal;

// Default export for backward compatibility
export default useToastOriginal;
