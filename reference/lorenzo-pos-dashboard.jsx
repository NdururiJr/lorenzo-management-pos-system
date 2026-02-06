import React, { useState } from 'react';
import { Search, Plus, Printer, Settings, ChevronDown, Shirt, X, CreditCard, Smartphone, Clock, User, Package, BarChart3, Store, Sparkles, Wind, Droplets, Edit2, Trash2, Phone } from 'lucide-react';

// Lorenzo Dry Cleaners POS Dashboard
export default function LorenzoPOS() {
  const [activeCategory, setActiveCategory] = useState('All Services');
  const [cart, setCart] = useState([
    { id: 1, name: 'Executive Suit', service: '2-Piece', type: 'Premium Clean', price: 850, qty: 1 },
    { id: 2, name: 'Silk Dress', service: 'Delicate', type: 'Hand Finish', price: 650, qty: 2 }
  ]);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');

  const categories = [
    { name: 'All Services', icon: '✨', color: '#2DD4BF' },
    { name: 'Shirts & Tops', icon: '👔', color: '#14524A' },
    { name: 'Suits & Jackets', icon: '🤵', color: '#0F3D38' },
    { name: 'Dresses', icon: '👗', color: '#1E6B5E' },
    { name: 'Household', icon: '🏠', color: '#14524A' },
    { name: 'Specialty', icon: '⭐', color: '#C9A962' }
  ];

  const services = [
    { id: 1, name: 'Business Shirt', type: 'Wash & Press', price: 150, turnaround: '24h', category: 'Shirts & Tops', icon: '👔', available: true },
    { id: 2, name: 'Executive Suit', type: '2-Piece Premium', price: 850, turnaround: '48h', category: 'Suits & Jackets', icon: '🤵', available: true },
    { id: 3, name: 'Evening Dress', type: 'Delicate Clean', price: 750, turnaround: '72h', category: 'Dresses', icon: '👗', available: true },
    { id: 4, name: 'Silk Blouse', type: 'Hand Finish', price: 350, turnaround: '48h', category: 'Shirts & Tops', icon: '👚', available: true },
    { id: 5, name: 'Winter Coat', type: 'Deep Clean', price: 1200, turnaround: '72h', category: 'Suits & Jackets', icon: '🧥', available: true },
    { id: 6, name: 'Duvet Cover', type: 'King Size', price: 800, turnaround: '48h', category: 'Household', icon: '🛏️', available: true },
    { id: 7, name: 'Curtains', type: 'Per Panel', price: 450, turnaround: '72h', category: 'Household', icon: '🪟', available: true },
    { id: 8, name: 'Wedding Gown', type: 'Preservation', price: 3500, turnaround: '7 days', category: 'Specialty', icon: '👰', available: true },
    { id: 9, name: 'Leather Jacket', type: 'Conditioning', price: 1800, turnaround: '5 days', category: 'Specialty', icon: '🧥', available: true },
    { id: 10, name: 'Polo Shirt', type: 'Wash & Fold', price: 120, turnaround: '24h', category: 'Shirts & Tops', icon: '👕', available: true },
    { id: 11, name: 'Blazer', type: 'Dry Clean', price: 550, turnaround: '48h', category: 'Suits & Jackets', icon: '🧥', available: true },
    { id: 12, name: 'Maxi Dress', type: 'Steam Press', price: 500, turnaround: '48h', category: 'Dresses', icon: '👗', available: true },
    { id: 13, name: 'Bed Sheets', type: 'Full Set', price: 400, turnaround: '24h', category: 'Household', icon: '🛏️', available: true },
    { id: 14, name: 'Table Linens', type: 'Starch & Press', price: 300, turnaround: '48h', category: 'Household', icon: '🍽️', available: true },
    { id: 15, name: 'Suede Shoes', type: 'Restoration', price: 950, turnaround: '5 days', category: 'Specialty', icon: '👞', available: true },
  ];

  const filteredServices = activeCategory === 'All Services' 
    ? services 
    : services.filter(s => s.category === activeCategory);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const vat = subtotal * 0.16;
  const total = subtotal + vat;

  const addToCart = (service) => {
    const existing = cart.find(item => item.name === service.name);
    if (existing) {
      setCart(cart.map(item => 
        item.name === service.name ? {...item, qty: item.qty + 1} : item
      ));
    } else {
      setCart([...cart, { 
        id: Date.now(), 
        name: service.name, 
        service: service.type.split(' ')[0], 
        type: service.type, 
        price: service.price, 
        qty: 1 
      }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      background: '#F8F9FA',
      color: '#1a1a1a'
    }}>
      {/* Google Font Import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 8px;
          margin: 4px 10px;
          font-weight: 400;
          font-size: 13px;
        }
        .sidebar-item:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
        }
        .sidebar-item.active {
          background: linear-gradient(135deg, #1E6B5E 0%, #14524A 100%);
          color: #fff;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(30, 107, 94, 0.3);
        }
        
        .service-card {
          background: #fff;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #E8E8E8;
        }
        .service-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(10, 47, 44, 0.12);
          border-color: #2DD4BF;
        }
        
        .add-btn {
          background: linear-gradient(135deg, #0F3D38 0%, #14524A 100%);
          color: #fff;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .add-btn:hover {
          background: linear-gradient(135deg, #14524A 0%, #1E6B5E 100%);
          transform: scale(1.02);
        }
        
        .category-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 12px 8px;
          background: #fff;
          border: 2px solid #E8E8E8;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: inherit;
          gap: 6px;
          min-height: 75px;
        }
        .category-card:hover {
          border-color: #2DD4BF;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(10, 47, 44, 0.1);
        }
        .category-card.active {
          background: linear-gradient(135deg, #0F3D38 0%, #14524A 100%);
          border-color: transparent;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(15, 61, 56, 0.25);
        }
        .category-card.active .category-name {
          color: #fff;
        }
        .category-card .category-icon {
          font-size: 24px;
          line-height: 1;
        }
        .category-card .category-name {
          font-size: 11px;
          font-weight: 600;
          color: #0F3D38;
          text-align: center;
          line-height: 1.2;
        }
        
        .payment-btn {
          padding: 8px 12px;
          border: 2px solid #E0E0E0;
          background: #fff;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #666;
          font-family: inherit;
        }
        .payment-btn:hover {
          border-color: #0F3D38;
          color: #0F3D38;
        }
        .payment-btn.active {
          border-color: #0F3D38;
          background: linear-gradient(135deg, #0F3D38 0%, #14524A 100%);
          color: #fff;
        }
        
        .action-btn {
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .action-btn:hover {
          transform: scale(1.02);
        }
        
        .turnaround-badge {
          background: linear-gradient(135deg, #E8F5F3 0%, #D4EFEA 100%);
          color: #0F3D38;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .logo-text {
          font-family: 'Outfit', sans-serif;
          font-weight: 300;
          letter-spacing: 8px;
          font-size: 20px;
          text-transform: uppercase;
        }
        .logo-subtext {
          font-size: 10px;
          letter-spacing: 4px;
          opacity: 0.8;
          font-weight: 400;
        }

        .order-item {
          display: flex;
          align-items: center;
          padding: 10px;
          background: #F8FAFA;
          border-radius: 10px;
          margin-bottom: 8px;
          transition: all 0.2s ease;
        }
        .order-item:hover {
          background: #F0F5F4;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #aaa;
        }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width: '220px',
        minWidth: '220px',
        background: 'linear-gradient(180deg, #0A2F2C 0%, #0F3D38 100%)',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 24px rgba(0,0,0,0.1)'
      }}>
        {/* Logo */}
        <div style={{ padding: '0 16px 28px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="logo-text" style={{ color: '#fff', marginBottom: '4px', fontSize: '16px', letterSpacing: '6px' }}>
            LORENZO
          </div>
          <div className="logo-subtext" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px', letterSpacing: '3px' }}>
            DRY CLEANERS
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ marginTop: '20px', flex: 1 }}>
          <div className="sidebar-item active">
            <Store size={20} />
            <span>Point of Sale</span>
          </div>
          <div className="sidebar-item">
            <Package size={20} />
            <span>Orders</span>
            <ChevronDown size={16} style={{ marginLeft: 'auto' }} />
          </div>
          <div className="sidebar-item">
            <User size={20} />
            <span>Customers</span>
            <ChevronDown size={16} style={{ marginLeft: 'auto' }} />
          </div>
          <div className="sidebar-item">
            <Sparkles size={20} />
            <span>Services</span>
            <ChevronDown size={16} style={{ marginLeft: 'auto' }} />
          </div>
          <div className="sidebar-item">
            <BarChart3 size={20} />
            <span>Analytics</span>
            <ChevronDown size={16} style={{ marginLeft: 'auto' }} />
          </div>
          <div className="sidebar-item">
            <Settings size={20} />
            <span>Settings</span>
          </div>
        </nav>

        {/* Staff Profile */}
        <div style={{ 
          padding: '20px 24px', 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <img 
            src="data:image/jpeg;base64,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" 
            alt="Frank Mwangi"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
          <div>
            <div style={{ color: '#fff', fontWeight: '500', fontSize: '14px' }}>Frank Mwangi</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Cashier</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{
          padding: '16px 32px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          borderBottom: '1px solid #E8E8E8'
        }}>
          {/* Search */}
          <div style={{
            flex: 1,
            maxWidth: '480px',
            position: 'relative'
          }}>
            <Search size={20} style={{ 
              position: 'absolute', 
              left: '16px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#999'
            }} />
            <input 
              type="text" 
              placeholder="Search services, orders, customers..."
              style={{
                width: '100%',
                padding: '14px 16px 14px 48px',
                border: '2px solid #E8E8E8',
                borderRadius: '12px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2DD4BF'}
              onBlur={(e) => e.target.style.borderColor = '#E8E8E8'}
            />
          </div>

          {/* Actions */}
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #0F3D38 0%, #1E6B5E 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(15, 61, 56, 0.3)',
            fontFamily: 'inherit'
          }}>
            <Plus size={18} />
            New Order
          </button>

          <button style={{
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F5F5F5',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            color: '#666'
          }}>
            <Printer size={20} />
          </button>

          <button style={{
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F5F5F5',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            color: '#666'
          }}>
            <Settings size={20} />
          </button>
        </header>

        {/* Content Area */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          padding: '20px 24px',
          gap: '16px'
        }}>
          {/* Services Section - Takes most of the space */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
            {/* Category Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '10px', 
              marginBottom: '16px'
            }}>
              {categories.map(cat => (
                <button 
                  key={cat.name}
                  className={`category-card ${activeCategory === cat.name ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.name)}
                >
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-name">{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Services Grid */}
            <div className="scrollbar-thin" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '12px',
              overflow: 'auto',
              paddingRight: '8px',
              paddingBottom: '12px',
              alignContent: 'start',
              flex: 1
            }}>
              {filteredServices.map(service => (
                <div key={service.id} className="service-card" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '14px 10px'
                }}>
                  {/* Icon */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #F0F9F7 0%, #E0F2EE 100%)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    marginBottom: '8px'
                  }}>
                    {service.icon}
                  </div>

                  {/* Details */}
                  <h3 style={{ 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: '#0A2F2C',
                    marginBottom: '2px'
                  }}>
                    {service.name}
                  </h3>
                  <p style={{ 
                    fontSize: '10px', 
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    {service.type}
                  </p>

                  {/* Price */}
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '700',
                    color: '#0F3D38',
                    marginBottom: '8px'
                  }}>
                    KES {service.price}
                  </span>

                  {/* Add Button */}
                  <button className="add-btn" onClick={() => addToCart(service)} style={{ width: '100%', justifyContent: 'center', padding: '6px 10px', fontSize: '11px' }}>
                    <Plus size={12} />
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary - Bottom Bar */}
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
            border: '1px solid #E8E8E8'
          }}>
            {/* Customer Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              paddingRight: '20px',
              borderRight: '1px solid #E8E8E8'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0F3D38 0%, #1E6B5E 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                JW
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '12px', color: '#0A2F2C' }}>Jane Wanjiku</div>
                <div style={{ fontSize: '10px', color: '#888' }}>+254 722 345 678</div>
              </div>
            </div>

            {/* Cart Items - Horizontal scroll */}
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center',
              gap: '10px',
              overflow: 'auto',
              paddingRight: '10px'
            }}>
              {cart.length === 0 ? (
                <span style={{ color: '#888', fontSize: '12px' }}>No items in cart</span>
              ) : (
                cart.map(item => (
                  <div key={item.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#F8FAFA',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    flexShrink: 0
                  }}>
                    <Shirt size={16} style={{ color: '#0F3D38' }} />
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#0A2F2C' }}>{item.name}</div>
                      <div style={{ fontSize: '10px', color: '#888' }}>x{item.qty} • KES {item.price * item.qty}</div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ccc',
                        cursor: 'pointer',
                        padding: '2px',
                        marginLeft: '4px'
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Payment Method */}
            <div style={{ display: 'flex', gap: '6px', paddingLeft: '10px', borderLeft: '1px solid #E8E8E8' }}>
              <button 
                className={`payment-btn ${paymentMethod === 'mpesa' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('mpesa')}
                style={{ padding: '8px 12px', fontSize: '11px' }}
              >
                <Smartphone size={14} />
                M-Pesa
              </button>

              <button 
                className={`payment-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
                style={{ padding: '8px 12px', fontSize: '11px' }}
              >
                <CreditCard size={14} />
                Card
              </button>
            </div>

            {/* Total & Actions */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              paddingLeft: '20px',
              borderLeft: '1px solid #E8E8E8'
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', color: '#888' }}>Total (incl. VAT)</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#0F3D38' }}>
                  KES {total.toLocaleString()}
                </div>
              </div>
              <button 
                className="action-btn"
                style={{
                  background: 'linear-gradient(135deg, #0F3D38 0%, #1E6B5E 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(15, 61, 56, 0.3)',
                  padding: '12px 24px',
                  fontSize: '13px',
                  whiteSpace: 'nowrap'
                }}
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
