import React, { type ReactNode } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-linear-to-r from-white to-red-100 flex flex-col">
      <Navbar />
      <main className="grow container mx-auto p-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
