import { Button, Card, Col, Descriptions, Row, Space, Typography } from 'antd';
import {
  CalendarOutlined, ContactsOutlined, EnvironmentOutlined, InfoCircleOutlined,
  MailOutlined, PhoneOutlined, SafetyOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import { contentApi } from '../api/content';
import { doctorApi } from '../api/doctor';
import { useLocale } from '../i18n/LocaleContext';
import type { ContentPageResponse, DoctorResponse } from '../types';
import { useAsyncData } from '../hooks/useAsyncData';
import AsyncState from '../components/AsyncState';

const { Title, Paragraph, Text } = Typography;

// ── Pure helpers ─────────────────────────────────────────────────────────────

interface TitleDecoration {
  icon: ReactNode;
  color: string;
}

const getTitleDecoration = (title: string): TitleDecoration => {
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
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const contactFieldIcon = (label: string): ReactNode => {
  const l = label.toLowerCase();
  if (l.includes('phone') || l.includes('tel')) return <PhoneOutlined />;
  if (l.includes('mail')) return <MailOutlined />;
  if (l.includes('address') || l.includes('location')) return <EnvironmentOutlined />;
  return <InfoCircleOutlined />;
};

const parseNumberedList = (body: string): string[] | null => {
  const trimmed = body.trim();
  if (!/^\d+\.\s/.test(trimmed)) return null;
  const items = trimmed
    .split(/\s*\d+\.\s+/)
    .map((s) => s.trim().replace(/\.$/, ''))
    .filter(Boolean);
  return items.length >= 2 ? items : null;
};

interface LabeledField {
  label: string;
  value: string;
}

const parseLabeledFields = (body: string): LabeledField[] | null => {
  if (!/\w+:\s/.test(body)) return null;
  const parts = body
    .split(/\s*(?:—|–|\||\n|\r\n)\s*|(?:\s-\s)/)
    .map((p) => p.trim())
    .filter(Boolean);
  const fields = parts
    .map<LabeledField | null>((p) => {
      const match = p.match(/^([^:]{1,30}):\s*(.+)$/);
      return match ? { label: match[1].trim(), value: match[2].trim() } : null;
    })
    .filter((f): f is LabeledField => f !== null);
  return fields.length >= 2 ? fields : null;
};

// ── Main component ───────────────────────────────────────────────────────────

interface HomeData {
  pages: ContentPageResponse[];
  doctor: DoctorResponse | null;
}

const fetchHomeData = async (locale: string): Promise<HomeData> => {
  const [pages, doctor] = await Promise.all([contentApi.getAll(locale), doctorApi.get()]);
  return { pages, doctor };
};

export default function HomePage() {
  const { t, locale } = useLocale();
  const { data, loading, error } = useAsyncData<HomeData>(
    () => fetchHomeData(locale),
    [locale],
  );

  return (
    <AsyncState loading={loading} error={error} skeletonRows={6}>
      {data && (
        <div>
          {data.doctor && <DoctorHeaderCard doctor={data.doctor} />}

          {data.pages.length > 0 && <QuickJumpBar pages={data.pages} />}

          <Row gutter={[24, 24]}>
            {data.pages.map((page) => (
              <Col xs={24} md={12} key={page.id}>
                <ContentPageCard page={page} />
              </Col>
            ))}
            {data.pages.length === 0 && (
              <Col span={24}>
                <Paragraph type="secondary">{t('home.empty')}</Paragraph>
              </Col>
            )}
          </Row>
        </div>
      )}
    </AsyncState>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

interface DoctorHeaderCardProps {
  doctor: DoctorResponse;
}

function DoctorHeaderCard({ doctor }: DoctorHeaderCardProps) {
  const { t } = useLocale();
  const slotSuffix = doctor.slotDurationMinutes
    ? ` \u00b7 ${t('home.doctor.slotSuffix', { minutes: doctor.slotDurationMinutes })}`
    : '';

  return (
    <Card style={{ marginBottom: 24, background: '#f0f7ff', border: 'none' }}>
      <Title level={3} style={{ margin: 0 }}>
        Dr. {doctor.firstName} {doctor.lastName}
      </Title>
      <Paragraph type="secondary" style={{ margin: 0 }}>
        {doctor.email}{slotSuffix}
      </Paragraph>
    </Card>
  );
}

interface QuickJumpBarProps {
  pages: ContentPageResponse[];
}

function QuickJumpBar({ pages }: QuickJumpBarProps) {
  const { t } = useLocale();
  return (
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
  );
}

interface ContentPageCardProps {
  page: ContentPageResponse;
}

function ContentPageCard({ page }: ContentPageCardProps) {
  const { icon, color } = getTitleDecoration(page.title);
  const sectionId = sectionIdFor(page);

  return (
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
      <ContentBody body={page.body} />
    </Card>
  );
}

interface ContentBodyProps {
  body: string;
}

function ContentBody({ body }: ContentBodyProps) {
  const steps = parseNumberedList(body);
  if (steps) return <NumberedSteps items={steps} />;

  const fields = parseLabeledFields(body);
  if (fields) return <LabeledFieldsList fields={fields} />;

  return (
    <Paragraph style={{ whiteSpace: 'pre-line', margin: 0, lineHeight: 1.7 }}>
      {body}
    </Paragraph>
  );
}

interface NumberedStepsProps {
  items: string[];
}

function NumberedSteps({ items }: NumberedStepsProps) {
  return (
    <ol style={{ paddingLeft: 0, margin: 0, listStyle: 'none' }}>
      {items.map((step, idx) => (
        <li
          key={idx}
          style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}
        >
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

interface LabeledFieldsListProps {
  fields: LabeledField[];
}

function LabeledFieldsList({ fields }: LabeledFieldsListProps) {
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
