import { useEffect, useState } from 'react';
import {
  Table, Tag, Button, Alert, Skeleton, Typography, Popconfirm, message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { appointmentsApi } from '../api/appointments';
import { useLocale } from '../i18n/LocaleContext';
import type { AppointmentResponse, AppointmentStatus } from '../types';

const { Title } = Typography;

const STATUS_COLOR: Record<AppointmentStatus, string> = {
  LOCKED:    'orange',
  PENDING:   'blue',
  CONFIRMED: 'green',
  CANCELLED: 'red',
  COMPLETED: 'default',
};

const STATUSES: AppointmentStatus[] = ['LOCKED', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

export default function MyAppointmentsPage() {
  const { t } = useLocale();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    appointmentsApi
      .getMyAppointments()
      .then(setAppointments)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (id: number) => {
    try {
      await appointmentsApi.cancel(id);
      message.success(t('mine.cancel.success'));
      load();
    } catch (err: unknown) {
      message.error((err as Error).message);
    }
  };

  const statusLabel = (status: AppointmentStatus) =>
    t(`status.${status}` as const);

  const columns: ColumnsType<AppointmentResponse> = [
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
      render: (val: number | null) => (val ? t('mine.duration.minutes', { minutes: val }) : '—'),
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
        record.status === 'CONFIRMED' || record.status === 'PENDING' || record.status === 'LOCKED' ? (
          <Popconfirm
            title={t('mine.cancel.confirm')}
            onConfirm={() => handleCancel(record.id)}
            okText={t('mine.cancel.yes')}
            cancelText={t('mine.cancel.no')}
          >
            <Button danger size="small">{t('mine.cancel')}</Button>
          </Popconfirm>
        ) : null,
    },
  ];

  if (loading) return <Skeleton active paragraph={{ rows: 5 }} />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div>
      <Title level={3}>{t('mine.title')}</Title>
      <Table
        columns={columns}
        dataSource={appointments}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: t('mine.empty') }}
      />
    </div>
  );
}
