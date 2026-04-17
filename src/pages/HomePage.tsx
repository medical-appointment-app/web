import { useEffect, useState, type ReactNode } from 'react';
import {
  Alert, Button, Card, Col, Descriptions, Row, Skeleton, Space, Typography,
} from 'antd';
import {
  CalendarOutlined, ContactsOutlined, EnvironmentOutlined, InfoCircleOutlined,
  MailOutlined, PhoneOutlined, SafetyOutlined,
} from '@ant-design/icons';
import { contentApi } from '../api/content';
import { doctorApi } from '../api/doctor';
import { useLocale } from '../i18n/LocaleContext';
import type { ContentPageResponse, DoctorResponse } from '../types';

const { Title, Paragraph, Text } = Typography;

// Pick an icon + accent color based on keywords in the content page title.
const getTitleDecoration = (title: string): { icon: ReactNode; color: string } => {
  const t = title.toLowerCase();
  if (t.includes('book') || t.includes('appointment') || t.includes('how')) {
    return { icon: <CalendarOutlined />, color: '#1677ff' };
  }
  if (t.includes('privacy') || t.includes('policy') || t.includes('terms')) {
    return { icon: <SafetyOutlined />, color: '#52c41a' };
  }
  if (t.includes('contact') || t.includes('reach')) {
    return { icon: <ContactsOutlined />, color: '#fa8c16' };
  }
  return { icon: <InfoCircleOutlined />, color: '#722ed1' };
};

// Build a URL-safe, stable DOM id for a content page so quick-jump links can
// scroll to it reliably even when slugs contain spaces or non-ASCII characters.
const sectionIdFor = (page: ContentPageResponse): string => {
  const base = page.slug?.trim() || page.title;
  const slug = base
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-');
  return `content-${slug || page.id}`;
};

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// Map well-known contact field labels to icons.
const contactFieldIcon = (label: string): ReactNode => {
  const l = label.toLowerCase();
  if (l.includes('phone') || l.includes('tel')) return <PhoneOutlined />;
  if (l.includes('mail')) return <MailOutlined />;
  if (l.includes('address') || l.includes('location')) return <EnvironmentOutlined />;
  return <InfoCircleOutlined />;
};

// Try to parse "1. foo. 2. bar. 3. baz." into a numbered list of items.
const parseNumberedList = (body: string): string[] | null => {
  const trimmed = body.trim();
  if (!/^\d+\.\s/.test(trimmed)) return null;
  const items = trimmed
    .split(/\s*\d+\.\s+/)
    .map((s) => s.trim().replace(/\.$/, ''))
    .filter(Boolean);
  return items.length >= 2 ? items : null;
};

// Try to parse labeled fields like "Phone: x — Email: y — Address: z".
const parseLabeledFields = (body: string): Array<{ label: string; value: string }> | null => {
  if (!/\w+:\s/.test(body)) return null;
  const parts = body
    .split(/\s*(?:—|–|\||\n|\r\n)\s*|(?:\s-\s)/)
    .map((p) => p.trim())
    .filter(Boolean);
  const fields = parts
    .map((p) => {
      const match = p.match(/^([^:]{1,30}):\s*(.+)$/);
      return match ? { label: match[1].trim(), value: match[2].trim() } : null;
    })
    .filter((f): f is { label: string; value: string } => f !== null);
  return fields.length >= 2 ? fields : null;
};

const renderBody = (body: string): ReactNode => {
  const steps = parseNumberedList(body);
  if (steps) {
    return (
      <ol style={{ paddingLeft: 0, margin: 0, listStyle: 'none' }}>
        {steps.map((step, idx) => (
          <li key={idx} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
            <span
              style={{
                flexShrink: 0,
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#e6f4ff',
                color: '#1677ff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {idx + 1}
            </span>
            <span style={{ lineHeight: '28px' }}>{step}</span>
          </li>
        ))}
      </ol>
    );
  }

  const fields = parseLabeledFields(body);
  if (fields) {
    return (
      <Descriptions column={1} size="small" colon={false}>
        {fields.map((field, idx) => (
          <Descriptions.Item
            key={idx}
            label={
              <Space size={6}>
                {contactFieldIcon(field.label)}
                <Text strong>{field.label}</Text>
              </Space>
            }
          >
            {field.value}
          </Descriptions.Item>
        ))}
      </Descriptions>
    );
  }

  return (
    <Paragraph style={{ whiteSpace: 'pre-line', margin: 0, lineHeight: 1.7 }}>
      {body}
    </Paragraph>
  );
};

export default function HomePage() {
  const { t, locale } = useLocale();
  const [pages, setPages] = useState<ContentPageResponse[]>([]);
  const [doctor, setDoctor] = useState<DoctorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([contentApi.getAll(locale), doctorApi.get()])
      .then(([contentPages, doctorInfo]) => {
        setPages(contentPages);
        setDoctor(doctorInfo);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [locale]);

  if (loading) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div>
      {doctor && (
        <Card style={{ marginBottom: 24, background: '#f0f7ff', border: 'none' }}>
          <Title level={3} style={{ margin: 0 }}>
            Dr. {doctor.firstName} {doctor.lastName}
          </Title>
          <Paragraph type="secondary" style={{ margin: 0 }}>
            {doctor.email}
            {doctor.slotDurationMinutes && ` \u00b7 ${t('home.doctor.slotSuffix', { minutes: doctor.slotDurationMinutes })}`}
          </Paragraph>
        </Card>
      )}

      {pages.length > 0 && (
        <Card
          size="small"
          style={{ marginBottom: 24, background: '#fafafa' }}
          styles={{ body: { padding: '12px 16px' } }}
        >
          <Space size={[8, 8]} wrap>
            <Text type="secondary" style={{ marginRight: 4 }}>
              {t('home.jumpTo')}
            </Text>
            {pages.map((page) => {
              const { icon, color } = getTitleDecoration(page.title);
              return (
                <Button
                  key={page.id}
                  size="small"
                  shape="round"
                  onClick={() => scrollToSection(sectionIdFor(page))}
                  icon={<span style={{ color }}>{icon}</span>}
                >
                  {page.title}
                </Button>
              );
            })}
          </Space>
        </Card>
      )}

      <Row gutter={[24, 24]}>
        {pages.map((page) => {
          const { icon, color } = getTitleDecoration(page.title);
          const sectionId = sectionIdFor(page);
          return (
            <Col xs={24} md={12} key={page.id}>
              <Card
                id={sectionId}
                title={
                  <Space size={10}>
                    <span style={{ color, fontSize: 18 }}>{icon}</span>
                    <span>{page.title}</span>
                  </Space>
                }
                bordered
                style={{ height: '100%', scrollMarginTop: 80 }}
                styles={{ body: { paddingTop: 20 } }}
              >
                {renderBody(page.body)}
              </Card>
            </Col>
          );
        })}
        {pages.length === 0 && (
          <Col span={24}>
            <Paragraph type="secondary">{t('home.empty')}</Paragraph>
          </Col>
        )}
      </Row>
    </div>
  );
}
