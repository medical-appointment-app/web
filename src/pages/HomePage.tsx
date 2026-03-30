import { useEffect, useState } from 'react';
import { Card, Col, Row, Skeleton, Typography, Alert } from 'antd';
import { contentApi } from '../api/content';
import { doctorApi } from '../api/doctor';
import type { ContentPageResponse, DoctorResponse } from '../types';

const { Title, Paragraph } = Typography;

export default function HomePage() {
  const [pages, setPages] = useState<ContentPageResponse[]>([]);
  const [doctor, setDoctor] = useState<DoctorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([contentApi.getAll(), doctorApi.get()])
      .then(([contentPages, doctorInfo]) => {
        setPages(contentPages);
        setDoctor(doctorInfo);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div>
      {doctor && (
        <Card style={{ marginBottom: 32, background: '#f0f7ff', border: 'none' }}>
          <Title level={3} style={{ margin: 0 }}>
            Dr. {doctor.firstName} {doctor.lastName}
          </Title>
          <Paragraph type="secondary" style={{ margin: 0 }}>
            {doctor.email}
            {doctor.slotDurationMinutes && ` · ${doctor.slotDurationMinutes}-minute appointments`}
          </Paragraph>
        </Card>
      )}

      <Row gutter={[24, 24]}>
        {pages.map((page) => (
          <Col xs={24} md={12} key={page.id}>
            <Card title={page.title} bordered>
              <Paragraph style={{ whiteSpace: 'pre-line' }}>{page.body}</Paragraph>
            </Card>
          </Col>
        ))}
        {pages.length === 0 && (
          <Col span={24}>
            <Paragraph type="secondary">No content pages yet.</Paragraph>
          </Col>
        )}
      </Row>
    </div>
  );
}
