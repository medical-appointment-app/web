import { Layout as AntLayout, Menu } from 'antd';
import {
  HomeOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Header, Content, Footer } = AntLayout;

const NAV_ITEMS = [
  { key: '/',                icon: <HomeOutlined />,       label: 'Home' },
  { key: '/catalog',         icon: <ShoppingOutlined />,   label: 'Services' },
  { key: '/appointments',    icon: <CalendarOutlined />,   label: 'Book Appointment' },
  { key: '/my-appointments', icon: <FileTextOutlined />,   label: 'My Appointments' },
];

export default function Layout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, whiteSpace: 'nowrap' }}>
          🏥 Medical App
        </span>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[pathname]}
          items={NAV_ITEMS}
          onClick={({ key }) => navigate(key)}
          style={{ flex: 1, minWidth: 0 }}
        />
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
