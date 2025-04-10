
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  // Filter out duplicate toasts based on title and description
  const uniqueToasts = toasts.reduce((acc, toast) => {
    const key = `${toast.title}-${toast.description}`;
    if (!acc.some(t => `${t.title}-${t.description}` === key)) {
      acc.push(toast);
    }
    return acc;
  }, [] as typeof toasts);

  return (
    <ToastProvider>
      {uniqueToasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
