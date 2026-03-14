import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from '../components/BottomNav';
import { ShoppingBag, Search, Plus, Minus, FileText, CreditCard, Package, Camera, Image as ImageIcon, FolderOpen, X, CheckCircle } from 'lucide-react';

export default function Order() {
  const [cart, setCart] = useState<{ id: string, name: string, price: number, qty: number }[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Prescription Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState<string | null>(null);
  
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();

  const medicinesList = [
    { id: '1', name: 'Paracetamol 500mg', price: 150, desc: 'Pain relief and fever reducer' },
    { id: '2', name: 'Amoxicillin 250mg', price: 349, desc: 'Antibiotic for bacterial infections' },
    { id: '3', name: 'Ibuprofen 400mg', price: 220, desc: 'Anti-inflammatory and pain relief' },
    { id: '4', name: 'Cetirizine 10mg', price: 120, desc: 'Allergy relief' },
    { id: '5', name: 'Vitamin C 1000mg', price: 450, desc: 'Immune system support' },
    { id: '6', name: 'Azithromycin 500mg', price: 550, desc: 'Antibiotic for respiratory infections' },
    { id: '7', name: 'Pantoprazole 500mg', price: 210, desc: 'Treats bacterial infections' },
    { id: '8', name: 'Aspirin 250mg', price: 85, desc: 'Pain relief and blood thinner' },
  ];

  useEffect(() => {
    if (!user) return;
    const storedOrders = localStorage.getItem(`orders_${user.uid}`);
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
  }, [user]);

  const filteredMedicines = medicinesList.filter(med => 
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    med.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (med: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === med.id);
      if (existing) {
        return prev.map(item => item.id === med.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...med, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleCheckout = async () => {
    if (!user || cart.length === 0) return;
    
    const newOrder = {
      id: Date.now().toString(),
      userId: user.uid,
      items: cart.map(c => `${c.qty}x ${c.name}`),
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      type: 'manual'
    };

    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    localStorage.setItem(`orders_${user.uid}`, JSON.stringify(updatedOrders));
    
    setCart([]);
    setShowCart(false);
    alert('Order placed successfully!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPrescriptionFile(file);
      if (file.type.startsWith('image/')) {
        setPrescriptionPreview(URL.createObjectURL(file));
      } else {
        setPrescriptionPreview('document');
      }
      setShowUploadModal(false);
    }
  };

  const handlePrescriptionSubmit = () => {
    if (!user || !prescriptionFile) return;
    
    const newOrder = {
      id: Date.now().toString(),
      userId: user.uid,
      items: ['Prescription Order'],
      total: 0, // To be calculated by pharmacy
      status: 'pending',
      createdAt: new Date().toISOString(),
      type: 'prescription'
    };

    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    localStorage.setItem(`orders_${user.uid}`, JSON.stringify(updatedOrders));
    
    setPrescriptionFile(null);
    setPrescriptionPreview(null);
    alert('Prescription submitted successfully! Our pharmacist will review it and update the price.');
  };

  const clearPrescription = () => {
    setPrescriptionFile(null);
    setPrescriptionPreview(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full relative">
      <div className="bg-white px-6 pt-12 pb-4 shadow-sm z-10 sticky top-0 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pharmacy</h1>
        <button 
          onClick={() => setShowCart(!showCart)}
          className="relative w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-200 transition-colors"
        >
          <ShoppingBag className="w-5 h-5" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
              {cart.reduce((sum, item) => sum + item.qty, 0)}
            </span>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {showCart ? (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Your cart is empty.</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center border-b border-gray-100 pb-4">
                      <div>
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <p className="text-emerald-600 font-medium">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1 border border-gray-200">
                        <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900"><Minus className="w-4 h-4" /></button>
                        <span className="font-bold w-4 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mb-6 text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-emerald-600">{formatCurrency(total)}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                >
                  <CreditCard className="w-5 h-5" /> Checkout
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="relative mb-6">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search medicines..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white shadow-sm"
              />
            </div>

            {/* Prescription Upload Section */}
            {!prescriptionFile ? (
              <button 
                onClick={() => setShowUploadModal(true)}
                className="w-full bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-center gap-4 hover:bg-blue-100 transition-colors text-left"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Upload Prescription</h3>
                  <p className="text-sm text-gray-600">Get medicines delivered quickly</p>
                </div>
              </button>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <CheckCircle className="w-5 h-5" />
                    Prescription uploaded successfully
                  </div>
                  <button onClick={clearPrescription} className="text-gray-400 hover:text-red-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {prescriptionPreview === 'document' ? (
                  <div className="bg-white p-4 rounded-xl flex items-center gap-3 mb-4 border border-emerald-100">
                    <FileText className="w-8 h-8 text-emerald-500" />
                    <span className="font-medium text-gray-700 truncate">{prescriptionFile.name}</span>
                  </div>
                ) : (
                  <div className="bg-white p-2 rounded-xl mb-4 border border-emerald-100">
                    <img src={prescriptionPreview!} alt="Prescription preview" className="w-full h-32 object-cover rounded-lg" />
                  </div>
                )}
                
                <button 
                  onClick={handlePrescriptionSubmit}
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200"
                >
                  Proceed with Prescription
                </button>
              </div>
            )}

            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {searchQuery ? 'Search Results' : 'Popular Medicines'}
            </h2>
            
            {filteredMedicines.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No medicines found matching "{searchQuery}"
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 mb-8">
                {filteredMedicines.map(med => (
                  <div key={med.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
                    <h3 className="font-bold text-gray-900 leading-tight mb-1">{med.name}</h3>
                    <p className="text-xs text-gray-500 mb-3 flex-1">{med.desc}</p>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="font-bold text-emerald-600">{formatCurrency(med.price)}</span>
                      <button 
                        onClick={() => addToCart(med)}
                        className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {orders.length > 0 && (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Your Orders</h2>
                <div className="space-y-3">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shrink-0">
                        {order.type === 'prescription' ? <FileText className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">Order #{order.id.slice(0, 6)}</h3>
                        <p className="text-xs text-gray-500">
                          {order.type === 'prescription' ? 'Prescription Review' : `${order.items.length} items • ${formatCurrency(order.total)}`}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${
                        order.status === 'pending' ? 'bg-amber-50 text-amber-600' : 
                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Upload Prescription</h2>
              <button onClick={() => setShowUploadModal(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Hidden file inputs */}
              <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraRef} onChange={handleFileUpload} />
              <input type="file" accept="image/*" className="hidden" ref={galleryRef} onChange={handleFileUpload} />
              <input type="file" accept=".pdf,image/*" className="hidden" ref={fileRef} onChange={handleFileUpload} />

              <button 
                onClick={() => cameraRef.current?.click()}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
              >
                <div className="w-12 h-12 bg-gray-100 group-hover:bg-emerald-100 rounded-full flex items-center justify-center text-gray-600 group-hover:text-emerald-600 transition-colors">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Capture using Camera</h3>
                  <p className="text-sm text-gray-500">Take a photo of your prescription</p>
                </div>
              </button>

              <button 
                onClick={() => galleryRef.current?.click()}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="w-12 h-12 bg-gray-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center text-gray-600 group-hover:text-blue-600 transition-colors">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Upload from Gallery</h3>
                  <p className="text-sm text-gray-500">Select an image from your photos</p>
                </div>
              </button>

              <button 
                onClick={() => fileRef.current?.click()}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-200 hover:border-amber-500 hover:bg-amber-50 transition-all text-left group"
              >
                <div className="w-12 h-12 bg-gray-100 group-hover:bg-amber-100 rounded-full flex items-center justify-center text-gray-600 group-hover:text-amber-600 transition-colors">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Upload from File Manager</h3>
                  <p className="text-sm text-gray-500">Select a PDF or document</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
