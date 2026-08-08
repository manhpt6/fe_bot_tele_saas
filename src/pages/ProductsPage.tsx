import { useState } from 'react';
import { useGetProductsQuery, useDeleteProductMutation, useCreateProductMutation, useUpdateProductMutation } from '../api/productApi';
import { useGetCategoriesQuery } from '../api/categoryApi';
import { Plus, Edit2, Trash2, Package, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProductsPage = () => {
  const { data: products = [], isLoading } = useGetProductsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [deleteProduct] = useDeleteProductMutation();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: 0,
    categoryId: '',
    description: '',
    deliveryMode: 'AUTO',
    isActive: true
  });

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        slug: product.slug,
        price: product.price,
        categoryId: product.categoryId?.toString() || (categories.length > 0 ? categories[0].id.toString() : ''),
        description: product.description || '',
        deliveryMode: product.deliveryMode,
        isActive: product.isActive
      });
    } else {
      setEditingId(null);
      setFormData({ 
        name: '', 
        slug: '', 
        price: 0, 
        categoryId: categories.length > 0 ? categories[0].id.toString() : '',
        description: '', 
        deliveryMode: 'AUTO', 
        isActive: true 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error('Vui lòng chọn danh mục!');
      return;
    }
    try {
      const payload = { ...formData, categoryId: Number(formData.categoryId) };
      if (editingId) {
        await updateProduct({ id: editingId, data: payload }).unwrap();
        toast.success('Đã cập nhật sản phẩm!');
      } else {
        await createProduct(payload).unwrap();
        toast.success('Đã thêm sản phẩm mới!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Lỗi khi lưu sản phẩm');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await deleteProduct(id).unwrap();
        toast.success('Đã xóa sản phẩm');
      } catch (err) {
        toast.error('Lỗi khi xóa sản phẩm');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý Sản phẩm</h1>
          <p className="text-gray-400 mt-1">Thêm, sửa, xóa các mặt hàng trong BotShop</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn btn-primary flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18} />
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      <div className="glass rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/30">
                <th className="p-4 font-semibold text-slate-300">Sản phẩm</th>
                <th className="p-4 font-semibold text-slate-300">Giá (VND)</th>
                <th className="p-4 font-semibold text-slate-300">Tồn kho</th>
                <th className="p-4 font-semibold text-slate-300">Giao hàng</th>
                <th className="p-4 font-semibold text-slate-300">Trạng thái</th>
                <th className="p-4 font-semibold text-slate-300 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Đang tải dữ liệu...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <Package size={48} className="mb-2 opacity-20" />
                      <p>Chưa có sản phẩm nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-slate-700/20 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-white">{product.name}</div>
                      <div className="text-xs text-slate-400">/{product.slug}</div>
                    </td>
                    <td className="p-4 text-blue-400 font-medium">{product.price.toLocaleString()}đ</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.stockCount > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {product.stockCount}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{product.deliveryMode === 'AUTO' ? 'Tự động' : 'Thủ công'}</td>
                    <td className="p-4">
                      {product.isActive ? (
                        <span className="text-green-400 text-sm">Đang bán</span>
                      ) : (
                        <span className="text-slate-500 text-sm">Đã ẩn</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => handleOpenModal(product)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
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
      </div>

      {/* Modal Thêm Sản Phẩm */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass w-full max-w-md p-6 rounded-2xl border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Tên sản phẩm</label>
                <input required type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Mã (Slug)</label>
                <input required type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Danh mục</label>
                <select required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})}>
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Giá (VNĐ)</label>
                <input required type="number" min="0" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Loại Giao Hàng</label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" value={formData.deliveryMode} onChange={(e) => setFormData({...formData, deliveryMode: e.target.value})}>
                  <option value="AUTO">Tự động (Giao tài khoản trong kho)</option>
                  <option value="MANUAL">Thủ công (Admin tự nhắn tin)</option>
                </select>
              </div>
              <button type="submit" disabled={isCreating} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg mt-4 disabled:opacity-50">
                {isCreating ? 'Đang lưu...' : 'Lưu Sản Phẩm'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
