import { useState } from 'react';
import { useGetAccountsQuery, useDeleteAccountMutation, useImportExcelMutation, useAddBulkAccountsMutation } from '../api/accountApi';
import { useGetProductsQuery } from '../api/productApi';
import { Users, Upload, Trash2, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { Pagination } from '../components/ui/Pagination';
import { useDebounce } from '../hooks/useDebounce';

export const AccountsPage = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: pageResponse, isLoading: accountsLoading } = useGetAccountsQuery({
    page,
    size: 10,
    keyword: debouncedSearchTerm
  });
  
  const accounts = pageResponse?.content || [];
  
  const { data: productPage } = useGetProductsQuery({ size: 100 });
  const products = productPage?.content || [];
  
  const [deleteAccount] = useDeleteAccountMutation();
  const [importExcel, { isLoading: isImporting }] = useImportExcelMutation();
  
  const [activeTab, setActiveTab] = useState<'LIST' | 'IMPORT'>('LIST');
  const [importMode, setImportMode] = useState<'MANUAL' | 'TEXTAREA' | 'EXCEL'>('MANUAL');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [manualData, setManualData] = useState<string[]>([]);
  const [bulkText, setBulkText] = useState<string>('');
  
  const [addBulkAccounts, { isLoading: isAddingManual }] = useAddBulkAccountsMutation();

  const selectedProduct = products.find(p => p.id.toString() === selectedProductId);
  const accountFormatFields = selectedProduct?.accountFormat?.split('|').filter(f => f.trim() !== '') || ['Tài khoản', 'Mật khẩu'];
  
  if (manualData.length !== accountFormatFields.length && selectedProductId) {
    setManualData(new Array(accountFormatFields.length).fill(''));
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa account này?')) {
      try {
        await deleteAccount(id).unwrap();
        toast.success('Đã xóa account');
      } catch (err) {
        toast.error('Lỗi khi xóa account');
      }
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error('Vui lòng chọn sản phẩm');
      return;
    }
    
    if (importMode === 'EXCEL') {
      if (!file) {
        toast.error('Vui lòng chọn file Excel');
        return;
      }
      try {
        const res = await importExcel({ productId: Number(selectedProductId), file }).unwrap();
        toast.success(`Đã nạp thành công ${res.successCount} account`);
        setFile(null);
        setActiveTab('LIST');
      } catch (err: any) {
        toast.error(err?.data || 'Lỗi khi nạp account');
      }
    } else if (importMode === 'TEXTAREA') {
      if (!bulkText.trim()) {
        toast.error('Vui lòng nhập dữ liệu');
        return;
      }
      
      const lines = bulkText.split('\n').filter(line => line.trim() !== '');
      const accountDataList = lines.map(line => line.split('|').map(s => s.trim()));
      
      try {
        await addBulkAccounts({ 
          productId: Number(selectedProductId), 
          accountDataList 
        }).unwrap();
        toast.success(`Đã nạp ${accountDataList.length} account thành công`);
        setBulkText('');
      } catch (err: any) {
        toast.error(err?.data || 'Lỗi khi thêm account');
      }
    } else {
      if (manualData.some(d => !d.trim())) {
        toast.error('Vui lòng điền đầy đủ các trường');
        return;
      }
      try {
        await addBulkAccounts({ 
          productId: Number(selectedProductId), 
          accountDataList: [manualData] 
        }).unwrap();
        toast.success('Đã thêm 1 account thành công');
        setManualData(new Array(accountFormatFields.length).fill(''));
      } catch (err: any) {
        toast.error(err?.data || 'Lỗi khi thêm account');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-white">Kho Tài Khoản</h1>
        <p className="text-gray-400 mt-1">Quản lý và nạp tài khoản hàng loạt bằng Excel</p>
      </div>

      <div className="flex space-x-4 border-b border-slate-700/50">
        <button 
          onClick={() => setActiveTab('LIST')}
          className={`py-3 px-4 font-medium border-b-2 transition-colors ${activeTab === 'LIST' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
        >
          Danh sách Account
        </button>
        <button 
          onClick={() => setActiveTab('IMPORT')}
          className={`py-3 px-4 font-medium border-b-2 transition-colors flex items-center space-x-2 ${activeTab === 'IMPORT' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
        >
          <Upload size={18} />
          <span>Nạp Account (Excel)</span>
        </button>
      </div>

      {activeTab === 'LIST' ? (
        <div className="glass rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="p-4 border-b border-slate-700/50 flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Tìm kiếm account (email, user...)" 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-800/30">
                  <th className="p-4 font-semibold text-slate-300">ID</th>
                  <th className="p-4 font-semibold text-slate-300">Dữ liệu (Tài khoản)</th>
                  <th className="p-4 font-semibold text-slate-300">Trạng thái</th>
                  <th className="p-4 font-semibold text-slate-300">Ngày bán</th>
                  <th className="p-4 font-semibold text-slate-300 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {accountsLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">Đang tải dữ liệu...</td>
                  </tr>
                ) : accounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      <div className="flex flex-col items-center">
                        <Users size={48} className="mb-2 opacity-20" />
                        <p>Kho đang trống</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  accounts.slice(0, 100).map((acc) => (
                    <tr key={acc.id} className="border-b border-slate-700/20 hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 text-slate-400">#{acc.id}</td>
                      <td className="p-4 font-mono text-sm text-blue-300">
                        <div className="truncate max-w-[200px]">{Array.isArray(acc.accountData) ? acc.accountData.join(' | ') : acc.accountData}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          acc.status === 'AVAILABLE' ? 'bg-green-500/20 text-green-400' :
                          acc.status === 'SOLD' ? 'bg-slate-500/20 text-slate-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {acc.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-sm">
                        {acc.soldAt ? new Date(acc.soldAt).toLocaleString() : '-'}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDelete(acc.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
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
      ) : (
        <div className="glass p-6 rounded-xl border border-slate-700/50 max-w-2xl">
          <form onSubmit={handleImport} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Chọn sản phẩm cần nạp</label>
              <select 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
              >
                <option value="">-- Chọn sản phẩm --</option>
                {products.filter(p => p.deliveryMode === 'AUTO').map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Kho: {p.stockCount})</option>
                ))}
              </select>
            </div>
            
            {selectedProductId && (
              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => setImportMode('MANUAL')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${importMode === 'MANUAL' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  Nhập từng Account
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('TEXTAREA')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${importMode === 'TEXTAREA' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  Dán từ Notepad
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('EXCEL')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${importMode === 'EXCEL' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  Nạp từ file Excel
                </button>
              </div>
            )}

            {selectedProductId && importMode === 'MANUAL' && (
              <div className="space-y-4 p-4 border border-slate-700/50 rounded-xl bg-slate-800/30">
                <p className="text-sm text-slate-400 mb-2">Hệ thống tự động sinh form dựa trên Định dạng của sản phẩm:</p>
                {accountFormatFields.map((field, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-slate-300 mb-1">{field}</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={manualData[idx] || ''}
                      onChange={(e) => {
                        const newData = [...manualData];
                        newData[idx] = e.target.value;
                        setManualData(newData);
                      }}
                      placeholder={`Nhập ${field}`}
                      required
                    />
                  </div>
                ))}
              </div>
            )}

            {selectedProductId && importMode === 'TEXTAREA' && (
              <div className="space-y-4 p-4 border border-slate-700/50 rounded-xl bg-slate-800/30">
                <p className="text-sm text-slate-400 mb-2">Dán danh sách tài khoản (Mỗi tài khoản 1 dòng, ngăn cách các trường bởi dấu <code className="text-blue-400">|</code>)</p>
                <div className="font-mono text-xs bg-slate-900/50 p-3 rounded-lg border border-slate-700 mb-2">
                  <div className="text-slate-500 mb-1">Cấu trúc chuẩn:</div>
                  <div className="text-green-400">{accountFormatFields.join('|')}</div>
                </div>
                <textarea
                  rows={8}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm leading-relaxed"
                  placeholder={`acc1|pass1|2fa\nacc2|pass2|2fa`}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  required
                />
              </div>
            )}

            {selectedProductId && importMode === 'EXCEL' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Upload file Excel (.xlsx)</label>
                <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-slate-800/30">
                  <input 
                    type="file" 
                    accept=".xlsx, .xls"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-upload"
                    required={importMode === 'EXCEL'}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload size={32} className="text-slate-400 mb-3" />
                    <span className="text-slate-300 font-medium">
                      {file ? file.name : 'Nhấn để chọn file Excel'}
                    </span>
                    <span className="text-slate-500 text-sm mt-2 font-mono">
                      Cột A: {accountFormatFields[0] || 'Dữ liệu'} <br/>
                      {accountFormatFields.length > 1 && accountFormatFields.slice(1).map((f, i) => `Cột ${String.fromCharCode(66 + i)}: ${f}`).join(', ')}
                    </span>
                  </label>
                </div>
              </div>
            )}

            {selectedProductId && (
              <button 
                type="submit" 
                disabled={isImporting || isAddingManual}
                className="w-full btn btn-primary py-3 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg disabled:opacity-70"
              >
                {(isImporting || isAddingManual) ? <span className="animate-spin text-xl">⭮</span> : <Upload size={18} />}
                <span>{(isImporting || isAddingManual) ? 'Đang nạp dữ liệu...' : 'Tiến hành Nạp'}</span>
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
