import { useEffect, useState } from 'react';
import {
  Card, Col, Row, Skeleton, Alert, Tag, Typography,
  Pagination, Select, Space,
} from 'antd';
import { catalogApi } from '../api/catalog';
import type { CatalogItemResponse, PagedResponse } from '../types';

const { Title, Text } = Typography;
const PAGE_SIZE = 12;

export default function CatalogPage() {
  const [result, setResult] = useState<PagedResponse<CatalogItemResponse> | null>(null);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    catalogApi
      .getItems({ category, page, size: PAGE_SIZE })
      .then(setResult)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [category, page]);

  // Derive category list from loaded items for the filter dropdown.
  const categories = result
    ? [...new Set(result.content.map((i) => i.category))].sort()
    : [];

  if (error) return <Alert type="error" message={error} />;

  return (
    <div>
      <Space style={{ marginBottom: 24 }} wrap>
        <Title level={3} style={{ margin: 0 }}>Services &amp; Products</Title>
        <Select
          allowClear
          placeholder="Filter by category"
          style={{ width: 200 }}
          value={category}
          onChange={(val) => { setCategory(val); setPage(0); }}
          options={categories.map((c) => ({ value: c, label: c }))}
        />
      </Space>

      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {result?.content.map((item) => (
              <Col xs={24} sm={12} lg={8} key={item.id}>
                <Card
                  title={item.name}
                  extra={<Tag color="blue">{item.category}</Tag>}
                  bordered
                >
                  {item.description && (
                    <Typography.Paragraph type="secondary">{item.description}</Typography.Paragraph>
                  )}
                  <Text strong style={{ fontSize: 18 }}>
                    ${Number(item.price).toFixed(2)}
                  </Text>
                  {!item.available && (
                    <Tag color="red" style={{ marginLeft: 8 }}>Unavailable</Tag>
                  )}
                </Card>
              </Col>
            ))}
          </Row>

          {result && result.totalPages > 1 && (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Pagination
                current={page + 1}
                pageSize={PAGE_SIZE}
                total={result.totalElements}
                onChange={(p) => setPage(p - 1)}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
