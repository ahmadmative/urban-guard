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
    {
      name: 'Events',
      href: '/events',
      icon: '📅',
    },
    {
      name: 'Alarms',
      href: '/alarms',
      icon: '🚨',
    }
  ];

  return (
    <div className="flex h-screen w-64 flex-col bg-[#242424] text-gray-100">
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
          {/* <div className="h-8 w-8 rounded-full bg-emerald-500"></div> */}
          <span className="ml-3 text-xl font-bold text-white">
            Urban Guard
          </span>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="px-6 text-sm font-semibold uppercase text-emerald-400">
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
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-gray-400 hover:bg-[#2d2d2d] hover:text-white'
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