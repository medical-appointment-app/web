import { Button, Popconfirm, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { appointmentsApi } from '../api/appointments';
import { useLocale } from '../i18n/LocaleContext';
import { useAsyncData } from '../hooks/useAsyncData';
import AsyncState from '../components/AsyncState';
import type { AppointmentResponse, AppointmentStatus } from '../types';

const { Title } = Typography;

const STATUS_COLOR: Record<AppointmentStatus, string> = {
  LOCKED: 'orange',
  PENDING: 'blue',
  CONFIRMED: 'green',
  CANCELLED: 'red',
  COMPLETED: 'default',
};

const STATUSES: AppointmentStatus[] = [
  'LOCKED', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED',
];

const CANCELLABLE_STATUSES: ReadonlySet<AppointmentStatus> = new Set([
  'LOCKED', 'PENDING', 'CONFIRMED',
]);

const isCancellable = (status: AppointmentStatus): boolean =>
  CANCELLABLE_STATUSES.has(status);

export default function MyAppointmentsPage() {
  const { t } = useLocale();
  const { data, loading, error, reload } = useAsyncData<AppointmentResponse[]>(
    () => appointmentsApi.getMyAppointments(),
    [],
  );

  const handleCancel = async (id: number) => {
    try {
      await appointmentsApi.cancel(id);
      message.success(t('mine.cancel.success'));
      reload();
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  const columns = useAppointmentColumns({ onCancel: handleCancel });

  return (
    <div>
      <Title level={3}>{t('mine.title')}</Title>
      <AsyncState loading={loading} error={error} skeletonRows={5}>
        <Table
          columns={columns}
          dataSource={data ?? []}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: t('mine.empty') }}
        />
      </AsyncState>
    </div>
  );
}

// ── Columns ──────────────────────────────────────────────────────────────────

interface UseAppointmentColumnsProps {
  onCancel: (id: number) => void;
}

function useAppointmentColumns({
  onCancel,
}: UseAppointmentColumnsProps): ColumnsType<AppointmentResponse> {
  const { t } = useLocale();
  const statusLabel = (status: AppointmentStatus) => t(`status.${status}` as const);

  return [
    {
      title: t('mine.col.dateTime'),
      dataIndex: 'scheduledAt',
      key: 'scheduledAt',
      render: (val: string) => dayjs(val).format(t('date.tableFormat')),
      sorter: (a, b) => a.scheduledAt.localeCompare(b.scheduledAt),
      defaultSortOrder: 'descend',
    },
    {
      title: t('mine.col.duration'),
      dataIndex: 'durationMinutes',
      key: 'durationMinutes',
      render: (val: number | null) =>
        val ? t('mine.duration.minutes', { minutes: val }) : '—',
      width: 100,
    },
    {
      title: t('mine.col.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: AppointmentStatus) => (
        <Tag color={STATUS_COLOR[status]}>{statusLabel(status)}</Tag>
      ),
      filters: STATUSES.map((s) => ({ text: statusLabel(s), value: s })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: t('mine.col.notes'),
      dataIndex: 'notes',
      key: 'notes',
      render: (val: string | null) => val ?? '—',
      ellipsis: true,
    },
    {
      title: t('mine.col.action'),
      key: 'action',
      width: 120,
      render: (_, record) =>
        isCancellable(record.status) ? (
          <CancelButton onConfirm={() => onCancel(record.id)} />
        ) : null,
    },
  ];
}

// ── Sub-components ───────────────────────────────────────────────────────────

interface CancelButtonProps {
  onConfirm: () => void;
}

function CancelButton({ onConfirm }: CancelButtonProps) {
  const { t } = useLocale();
  return (
    <Popconfirm
      title={t('mine.cancel.confirm')}
      onConfirm={onConfirm}
      okText={t('mine.cancel.yes')}
      cancelText={t('mine.cancel.no')}
    >
      <Button danger size="small">{t('mine.cancel')}</Button>
    </Popconfirm>
  );
}
