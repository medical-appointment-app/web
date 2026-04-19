import { Alert, Skeleton } from 'antd';
import type { ReactNode } from 'react';

interface AsyncStateProps {
  loading: boolean;
  error: string | null;
  skeletonRows?: number;
  children: ReactNode;
}

/**
 * Shared loading / error wrapper. While `loading` is true a skeleton is
 * rendered; if `error` is set an Ant Design alert is shown; otherwise the
 * children render normally.
 */
export default function AsyncState({
  loading,
  error,
  skeletonRows = 4,
  children,
}: AsyncStateProps) {
  if (loading) return <Skeleton active paragraph={{ rows: skeletonRows }} />;
  if (error) return <Alert type="error" message={error} />;
  return <>{children}</>;
}
