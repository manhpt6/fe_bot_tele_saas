import { useGetOrdersQuery, useConfirmOrderMutation } from '../api/orderApi';
import { ShoppingCart, CheckCircle, Clock, XCircle, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Pagination } from '../components/ui/Pagination';
import { useDebounce } from '../hooks/useDebounce';

export const OrdersPage = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: pageResponse, isLoading } = useGetOrdersQuery({
    page,
    size: 10,
    keyword: debouncedSearchTerm
  });
  
  const orders = pageResponse?.content || [];
  const [confirmOrder, { isLoading: isConfirming }] = useConfirmOrderMutation();

  const handleConfirm = async (orderCode: string) => {
    if (window.confirm(`Xác nhận đã nhận tiền cho đơn hàng ${orderCode}? Hệ thống sẽ tự động giao hàng (nếu là AUTO).`)) {
      try {
        await confirmOrder(orderCode).unwrap();
        toast.success('Xác nhận thành công!');
      } catch (err) {
        toast.error('Lỗi khi xác nhận đơn hàng');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-white">Quản lý Đơn hàng</h1>
        <p className="text-gray-400 mt-1">Theo dõi giao dịch và duyệt đơn hàng thủ công</p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm mã đơn, tên khách..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="glass rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/30">
                <th className="p-4 font-semibold text-slate-300">Mã đơn</th>
                <th className="p-4 font-semibold text-slate-300">Khách hàng</th>
                <th className="p-4 font-semibold text-slate-300">Tổng tiền</th>
                <th className="p-4 font-semibold text-slate-300">Thanh toán</th>
                <th className="p-4 font-semibold text-slate-300">Trạng thái</th>
                <th className="p-4 font-semibold text-slate-300">Ngày tạo</th>
                <th className="p-4 font-semibold text-slate-300 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">Đang tải dữ liệu...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <ShoppingCart size={48} className="mb-2 opacity-20" />
                      <p>Chưa có đơn hàng nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-700/20 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-mono font-medium text-white">{order.orderCode}</td>
                    <td className="p-4">
                      <div className="text-blue-300 font-medium">{order.customer.firstName}</div>
                      <div className="text-xs text-slate-400">@{order.customer.username}</div>
                    </td>
                    <td className="p-4 text-green-400 font-medium">{order.totalAmount.toLocaleString()}đ</td>
                    <td className="p-4 text-sm text-slate-300">
                      <div className="flex items-center space-x-1">
                        <span>{order.paymentMethod === 'BANK_TRANSFER' ? '🏦 Ngân hàng' : '💳 Ví'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 w-max ${
                        order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'PAID' ? 'bg-blue-500/20 text-blue-400' :
                        order.status === 'PENDING' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {order.status === 'COMPLETED' && <CheckCircle size={12} />}
                        {order.status === 'PENDING' && <Clock size={12} />}
                        {order.status === 'CANCELLED' && <XCircle size={12} />}
                        <span>{order.status}</span>
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      {order.status === 'PENDING' && order.paymentMethod === 'BANK_TRANSFER' && (
                        <button 
                          onClick={() => handleConfirm(order.orderCode)}
                          disabled={isConfirming}
                          className="btn bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white px-3 py-1 text-sm disabled:opacity-50"
                        >
                          Duyệt đơn
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {pageResponse && (
          <Pagination
            currentPage={pageResponse.pageNumber}
            totalPages={pageResponse.totalPages}
            totalElements={pageResponse.totalElements}
            pageSize={pageResponse.pageSize}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
};
