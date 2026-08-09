import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useGetUnreadCountQuery } from '../../api/notificationApi';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export const AdminLayout = () => {
  const { data: unreadData } = useGetUnreadCountQuery(undefined, { pollingInterval: 5000 });
  const [previousTotal, setPreviousTotal] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (unreadData?.count !== undefined) {
      if (previousTotal !== undefined && unreadData.count > previousTotal) {
        toast('🔔 CÓ ĐƠN HÀNG MỚI!', { 
          icon: '🚀', 
          duration: 8000,
          style: {
            background: '#1e293b',
            color: '#3b82f6',
            fontWeight: 'bold',
            border: '1px solid #3b82f6',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
          }
        });
        
        // Play notification sound
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.volume = 0.5;
          audio.play();
        } catch (e) {
          console.error("Couldn't play sound");
        }
      }
      setPreviousTotal(unreadData.count);
    }
  }, [unreadData?.count]);

  return (
    <div className="flex min-h-screen bg-[var(--bg-color)]">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
