import { useEffect, useState } from 'react';
import {
  Table, Tag, Button, Alert, Skeleton, Typography, Popconfirm, message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { appointmentsApi } from '../api/appointments';
import type { AppointmentResponse, AppointmentStatus } from '../types';

const { Title } = Typography;

const STATUS_COLOR: Record<AppointmentStatus, string> = {
  LOCKED:    'orange',
  PENDING:   'blue',
  CONFIRMED: 'green',
  CANCELLED: 'red',
  COMPLETED: 'default',
};

export default function MyAppointmentsPage() {
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
      message.success('Appointment cancelled.');
      load();
    } catch (err: unknown) {
      message.error((err as Error).message);
    }
  };

  const columns: ColumnsType<AppointmentResponse> = [
    {
      title: 'Date & Time',
      dataIndex: 'scheduledAt',
      key: 'scheduledAt',
      render: (val: string) => dayjs(val).format('MMM D, YYYY · HH:mm'),
      sorter: (a, b) => a.scheduledAt.localeCompare(b.scheduledAt),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Duration',
      dataIndex: 'durationMinutes',
      key: 'durationMinutes',
      render: (val: number | null) => (val ? `${val} min` : '—'),
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: AppointmentStatus) => (
        <Tag color={STATUS_COLOR[status]}>{status}</Tag>
      ),
      filters: (['LOCKED', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as AppointmentStatus[])
        .map((s) => ({ text: s, value: s })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (val: string | null) => val ?? '—',
      ellipsis: true,
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_, record) =>
        record.status === 'CONFIRMED' || record.status === 'PENDING' || record.status === 'LOCKED' ? (
          <Popconfirm
            title="Cancel this appointment?"
            onConfirm={() => handleCancel(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger size="small">Cancel</Button>
          </Popconfirm>
        ) : null,
    },
  ];

  if (loading) return <Skeleton active paragraph={{ rows: 5 }} />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div>
      <Title level={3}>My Appointments</Title>
      <Table
        columns={columns}
        dataSource={appointments}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: "You don't have any appointments yet." }}
      />
    </div>
  );
}
