'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const Sidebar = () => {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Overview',
      href: '/',
      icon: '📊',
    },
    {
      name: 'Live Feeds',
      href: '/live-feeds',
      icon: '📡',
    },
    // {
    //   name: 'Global View',
    //   href: '/global-view',
    //   icon: '🌐',
    // },
    // {
    //   name: 'AI Analytics',
    //   href: '/analytics',
    //   icon: '🤖',
    // },
  ];

  return (
    <div className="flex h-screen w-64 flex-col bg-[#1E293B] text-gray-100">
      <div className="flex flex-col items-center p-6 space-y-4">
        <div className="relative h-16 w-full">
          <Image
            src="/assets/images/DHAlogo.png"
            alt="DHA Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500"></div>
          <span className="ml-3 text-xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
            Urban Guard
          </span>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="px-6 text-sm font-semibold uppercase text-gray-400">
          Dashboards
        </h2>
        <nav className="mt-4 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-[#2D3B4F] hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar; 