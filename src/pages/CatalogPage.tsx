import { useMemo, useState } from 'react';
import { Card, Col, Pagination, Row, Select, Space, Tag, Typography } from 'antd';
import { catalogApi } from '../api/catalog';
import { useLocale } from '../i18n/LocaleContext';
import { useAsyncData } from '../hooks/useAsyncData';
import AsyncState from '../components/AsyncState';
import type { CatalogItemResponse, PagedResponse } from '../types';

const { Title, Text } = Typography;
const PAGE_SIZE = 12;

export default function CatalogPage() {
  const { t } = useLocale();
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(0);

  const { data, loading, error } = useAsyncData<PagedResponse<CatalogItemResponse>>(
    () => catalogApi.getItems({ category, page, size: PAGE_SIZE }),
    [category, page],
  );

  const categories = useMemo(
    () => (data ? [...new Set(data.content.map((i) => i.category))].sort() : []),
    [data],
  );

  const handleCategoryChange = (next: string | undefined) => {
    setCategory(next);
    setPage(0);
  };

  return (
    <div>
      <Space style={{ marginBottom: 24 }} wrap>
        <Title level={3} style={{ margin: 0 }}>{t('catalog.title')}</Title>
        <Select
          allowClear
          placeholder={t('catalog.filter')}
          style={{ width: 220 }}
          value={category}
          onChange={handleCategoryChange}
          options={categories.map((c) => ({ value: c, label: c }))}
        />
      </Space>

      <AsyncState loading={loading} error={error}>
        {data && (
          <>
            <Row gutter={[24, 24]}>
              {data.content.map((item) => (
                <Col xs={24} sm={12} lg={8} key={item.id}>
                  <CatalogItemCard item={item} />
                </Col>
              ))}
            </Row>

            {data.totalPages > 1 && (
              <CatalogPagination
                current={page}
                total={data.totalElements}
                onChange={setPage}
              />
            )}
          </>
        )}
      </AsyncState>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

interface CatalogItemCardProps {
  item: CatalogItemResponse;
}

function CatalogItemCard({ item }: CatalogItemCardProps) {
  const { t } = useLocale();
  return (
    <Card title={item.name} extra={<Tag color="blue">{item.category}</Tag>} bordered>
      {item.description && (
        <Typography.Paragraph type="secondary">{item.description}</Typography.Paragraph>
      )}
      <Text strong style={{ fontSize: 18 }}>
        ${Number(item.price).toFixed(2)}
      </Text>
      {!item.available && (
        <Tag color="red" style={{ marginLeft: 8 }}>{t('catalog.unavailable')}</Tag>
      )}
    </Card>
  );
}

interface CatalogPaginationProps {
  current: number;
  total: number;
  onChange: (page: number) => void;
}

function CatalogPagination({ current, total, onChange }: CatalogPaginationProps) {
  return (
    <div style={{ textAlign: 'center', marginTop: 32 }}>
      <Pagination
        current={current + 1}
        pageSize={PAGE_SIZE}
        total={total}
        onChange={(p) => onChange(p - 1)}
        showSizeChanger={false}
      />
    </div>
  );
}
