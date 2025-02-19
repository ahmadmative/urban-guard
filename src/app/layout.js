import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Urban Guard Dashboard',
  description: 'Surveillance and Security Dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0F172A]`}>
        <div className="flex h-screen overflow-hidden bg-[#0F172A]">
          <Sidebar />
          <main className="relative flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
