import React from 'react';
import { Outlet } from 'react-router';
import { SITE_TITLE } from '~/config';
import { Header } from './header';

export interface PublicLayoutProps {
  children?: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <div className="min-h-screen">
      <Header
        companyName={SITE_TITLE}
        navigationItems={[]}
        showMobileMenu={showMobileMenu}
        onMobileMenuToggle={handleMobileMenuToggle}
      />
      <main className="pt-16">{children || <Outlet />}</main>
    </div>
  );
}
