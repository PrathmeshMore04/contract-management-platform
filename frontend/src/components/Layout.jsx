import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, FilePenLine, PlusCircle } from 'lucide-react';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Blueprints',
      href: '/blueprints',
      icon: FilePenLine,
    },
    {
      name: 'New Contract',
      href: '/create',
      icon: PlusCircle,
    },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="app-layout">
      <nav className="app-nav">
        <div className="app-nav__container">
          <div className="app-nav__content">
            <div className="app-nav__logo">
              <h1 className="app-nav__logo-text">ContractFlow</h1>
            </div>

            <div className="app-nav__tabs">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`nav-tab ${active ? 'nav-tab--active' : ''}`}
                  >
                    <Icon
                      size={18}
                      className={`nav-tab__icon ${active ? 'nav-tab__icon--active' : ''}`}
                    />
                    <span className="nav-tab__text">{item.name}</span>
                    {active && (
                      <div className="nav-tab__indicator" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      <main className="app-main">
        {children}
      </main>
    </div>
  );
};

export default Layout;
