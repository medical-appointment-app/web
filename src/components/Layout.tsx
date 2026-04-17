import { Layout as AntLayout, Menu, Select, Space } from 'antd';
import {
  HomeOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  FileTextOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useLocale } from '../i18n/LocaleContext';
import { SUPPORTED_LOCALES, type Locale } from '../i18n/locales';

const { Header, Content, Footer } = AntLayout;

export default function Layout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t, locale, setLocale } = useLocale();

  const navItems = [
    { key: '/',                icon: <HomeOutlined />,     label: t('nav.home') },
    { key: '/catalog',         icon: <ShoppingOutlined />, label: t('nav.services') },
    { key: '/appointments',    icon: <CalendarOutlined />, label: t('nav.book') },
    { key: '/my-appointments', icon: <FileTextOutlined />, label: t('nav.mine') },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, whiteSpace: 'nowrap' }}>
          🏥 Medical App
        </span>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[pathname]}
          items={navItems}
          onClick={({ key }) => navigate(key)}
          style={{ flex: 1, minWidth: 0 }}
        />
        <Space size={8}>
          <GlobalOutlined style={{ color: '#fff' }} aria-label={t('language.label')} />
          <Select<Locale>
            size="small"
            value={locale}
            onChange={setLocale}
            aria-label={t('language.label')}
            options={SUPPORTED_LOCALES.map((opt) => ({ value: opt.value, label: opt.label }))}
            style={{ width: 72 }}
          />
        </Space>
      </Header>

      <Content style={{ padding: '32px 48px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center', color: '#888' }}>
        Medical App © {new Date().getFullYear()}
      </Footer>
    </AntLayout>
  );
}
