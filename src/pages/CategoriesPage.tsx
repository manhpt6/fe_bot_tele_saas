import { useState } from 'react';
import { useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from '../api/categoryApi';
import { Plus, Edit2, Trash2, FolderTree, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Pagination } from '../components/ui/Pagination';
import { useDebounce } from '../hooks/useDebounce';

export const CategoriesPage = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: pageResponse, isLoading } = useGetCategoriesQuery({
    page,
    size: 10,
    keyword: debouncedSearchTerm
  });
  
  const categories = pageResponse?.content || [];
  
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true
  });

  const handleOpenModal = (category?: any) => {
    if (category) {
      setEditingId(category.id);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        isActive: category.isActive
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', slug: '', description: '', isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCategory({ id: editingId, data: formData }).unwrap();
        toast.success('Đã cập nhật danh mục!');
      } else {
        await createCategory(formData).unwrap();
        toast.success('Đã thêm danh mục mới!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Lỗi khi lưu danh mục');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này? Các sản phẩm thuộc danh mục có thể bị ảnh hưởng!')) {
      try {
        await deleteCategory(id).unwrap();
        toast.success('Đã xóa danh mục');
      } catch (err) {
        toast.error('Lỗi khi xóa danh mục. Có thể danh mục này đang chứa sản phẩm.');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý Danh mục</h1>
          <p className="text-gray-400 mt-1">Phân loại các sản phẩm trong BotShop</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn btn-primary flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18} />
          <span>Thêm danh mục</span>
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm danh mục..." 
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
                <th className="p-4 font-semibold text-slate-300">ID</th>
                <th className="p-4 font-semibold text-slate-300">Tên Danh mục</th>
                <th className="p-4 font-semibold text-slate-300">Mô tả</th>
                <th className="p-4 font-semibold text-slate-300">Trạng thái</th>
                <th className="p-4 font-semibold text-slate-300 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Đang tải dữ liệu...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <FolderTree size={48} className="mb-2 opacity-20" />
                      <p>Chưa có danh mục nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-slate-700/20 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-slate-400">#{cat.id}</td>
                    <td className="p-4">
                      <div className="font-medium text-white">{cat.name}</div>
                      <div className="text-xs text-slate-400">/{cat.slug}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-400">{cat.description || '-'}</td>
                    <td className="p-4">
                      {cat.isActive ? (
                        <span className="text-green-400 text-sm">Hoạt động</span>
                      ) : (
                        <span className="text-slate-500 text-sm">Đã ẩn</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => handleOpenModal(cat)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass w-full max-w-md p-6 rounded-2xl border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Sửa Danh Mục' : 'Thêm Danh Mục'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Tên danh mục</label>
                <input required type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Mã (Slug)</label>
                <input required type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Mô tả (tùy chọn)</label>
                <textarea className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} />
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500" />
                <label htmlFor="isActive" className="text-sm text-gray-300">Đang hoạt động</label>
              </div>
              <button type="submit" disabled={isCreating} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg mt-4 disabled:opacity-50">
                {isCreating ? 'Đang lưu...' : 'Lưu Danh Mục'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
