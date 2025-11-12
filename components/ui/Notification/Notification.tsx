import { forwardRef, useCallback, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import useTimeout from '@/lib/hooks/useTimeout';

type NotificationType = 'default' | 'info' | 'success' | 'warning' | 'error';

export interface NotificationProps extends React.HTMLAttributes<HTMLDivElement> {
  closable?: boolean;
  customIcon?: ReactNode | string;
  duration?: number;
  onClose?: (event?: ReactMouseEvent<HTMLButtonElement>) => void;
  title?: string;
  triggerByToast?: boolean;
  type?: NotificationType;
  width?: number | string;
}

type CloseButtonProps = {
  absolute?: boolean;
  className?: string;
  onClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
};

const CloseButton = ({ absolute, className, onClick }: CloseButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Close notification"
    className={cn(
      'inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      absolute && 'absolute right-2 top-2',
      className,
    )}
  >
    <X className="h-4 w-4" aria-hidden="true" />
  </button>
);

const STATUS_ICON_MAP: Record<NotificationType, { className: string; Icon: typeof Info }> = {
  default: { Icon: Info, className: 'text-muted-foreground' },
  info: { Icon: Info, className: 'text-sky-500' },
  success: { Icon: CheckCircle2, className: 'text-emerald-500' },
  warning: { Icon: AlertTriangle, className: 'text-amber-500' },
  error: { Icon: AlertCircle, className: 'text-destructive' },
};

const StatusIcon = ({ type = 'default' }: { type?: NotificationType }) => {
  const { Icon, className } = STATUS_ICON_MAP[type] ?? STATUS_ICON_MAP.default;
  return <Icon className={cn('h-5 w-5', className)} aria-hidden="true" />;
};

const Notification = forwardRef<HTMLDivElement, NotificationProps>((props, ref) => {
  const {
    className,
    children,
    closable = false,
    customIcon,
    duration = 3000,
    onClose,
    style,
    title,
    triggerByToast,
    type = 'default',
    width = 350,
    ...rest
  } = props;

  const [display, setDisplay] = useState<'show' | 'hiding' | 'hide'>('show');

  const { clear } = useTimeout(onClose ? () => onClose() : undefined, duration, duration > 0);

  const handleClose = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      setDisplay('hiding');
      onClose?.(event);
      clear();
      if (!triggerByToast) {
        setTimeout(() => {
          setDisplay('hide');
        }, 400);
      }
    },
    [onClose, clear, triggerByToast],
  );

  if (display === 'hide') {
    return null;
  }

  const notificationClass = cn(
    'notification relative flex items-start gap-3 rounded-lg border border-border bg-background p-4 text-sm shadow-lg transition-opacity',
    display === 'hiding' && 'opacity-0',
    className,
  );

  const contentClass = cn(
    'notification-content flex w-full items-start gap-3',
    !children && 'no-child',
  );

  const titleClass = cn('notification-title font-semibold', children ? 'mb-2' : '');
  const descriptionClass = cn(
    'notification-description text-sm text-muted-foreground',
    !title && children ? 'mt-1' : '',
  );

  const customIconNode = typeof customIcon === 'string' ? <span>{customIcon}</span> : customIcon;

  const mergedStyle: CSSProperties = { width, ...style };

  return (
    <div ref={ref} {...rest} className={notificationClass} style={mergedStyle}>
      <div className={contentClass}>
        {type && type !== 'default' && !customIcon ? (
          <div className="mr-1.5 mt-0.5">
            <StatusIcon type={type} />
          </div>
        ) : null}
        {customIconNode && <div className="mr-1.5">{customIconNode}</div>}
        <div className="mr-6 flex-1">
          {title ? <div className={titleClass}>{title}</div> : null}
          {children ? <div className={descriptionClass}>{children}</div> : null}
        </div>
      </div>
      {closable ? (
        <CloseButton className="notification-close" absolute onClick={handleClose} />
      ) : null}
    </div>
  );
});

Notification.displayName = 'Notification';

export default Notification;
