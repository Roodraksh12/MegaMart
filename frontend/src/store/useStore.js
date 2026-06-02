import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useStore = create(
  persist(
    (set, get) => ({
      // Products State
      products: [],
      isProductsLoading: false,
      fetchProducts: async () => {
        set({ isProductsLoading: get().products.length === 0 });
        try {
          const { data, error } = await supabase.from('products').select('*');
          if (error) throw error;
          const mappedProducts = (data || []).map(r => ({
            ...r,
            inStock: r.in_stock,
            isFresh: r.is_fresh,
            tags: Array.isArray(r.tags) ? r.tags : (() => { try { return JSON.parse(r.tags || '[]'); } catch { return []; } })()
          }));
          set({ products: mappedProducts, isProductsLoading: false });
        } catch (error) {
          console.error("Failed to fetch products", error);
          set({ products: [], isProductsLoading: false });
        }
      },

      // Cart Syncing
      syncCart: async () => {
        const { cart, user } = get();
        if (!user) return;
        try {
          const { error } = await supabase.from('user_carts').upsert({ user_id: user.id, items: cart });
          if (error) throw error;
        } catch (e) {
          // Fallback if SQL table wasn't created
          await supabase.from('admin_settings').upsert({ key: `cart_${user.id}`, value: JSON.stringify(cart) }).catch(() => {});
        }
      },

      fetchRemoteCart: async (userId) => {
        try {
          const { data, error } = await supabase.from('user_carts').select('items').eq('user_id', userId).single();
          if (data && data.items && Array.isArray(data.items)) return data.items;
          if (error) throw error;
        } catch (e) {
          try {
            const { data } = await supabase.from('admin_settings').select('value').eq('key', `cart_${userId}`).single();
            if (data && data.value) return JSON.parse(data.value);
          } catch (err) {}
        }
        return null;
      },

      // Cart State
      cart: [],
      addToCart: (productId, quantity = 1) => {
        set((state) => {
          const existingItem = state.cart.find(item => item.id === productId);
          if (existingItem) {
            return {
              cart: state.cart.map(item =>
                item.id === productId ? { ...item, quantity: item.quantity + quantity } : item
              )
            };
          }
          const product = get().products.find(p => p.id === productId);
          if (!product) return state;
          // Fire a toast notification
          get().addToast({ message: `${product.name} added to cart`, type: 'success' });
          return { cart: [...state.cart, { ...product, quantity }] };
        });
        get().syncCart();
      },
      updateQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { cart: state.cart.filter(item => item.id !== productId) };
          }
          return {
            cart: state.cart.map(item =>
              item.id === productId ? { ...item, quantity } : item
            )
          };
        });
        get().syncCart();
      },
      removeFromCart: (productId) => {
        set((state) => ({ cart: state.cart.filter(item => item.id !== productId) }));
        get().syncCart();
      },
      clearCart: () => {
        set({ cart: [] });
        get().syncCart();
      },
      
      // Calculate derived cart values
      getCartTotal: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      getCartSavings: () => {
        const { cart } = get();
        return cart.reduce((savings, item) => {
          if (item.mrp && item.mrp > item.price) {
            return savings + ((item.mrp - item.price) * item.quantity);
          }
          return savings;
        }, 0);
      },
      getCartItemCount: () => {
        const { cart } = get();
        return cart.reduce((count, item) => count + item.quantity, 0);
      },

      // Wishlist State
      wishlist: [],
      toggleWishlist: (productId) => {
        set((state) => {
          if (state.wishlist.includes(productId)) {
            return { wishlist: state.wishlist.filter(id => id !== productId) };
          }
          return { wishlist: [...state.wishlist, productId] };
        });
      },

      // UI State
      isCartOpen: false,
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
      
      isAuthOpen: false,
      toggleAuth: () => set((state) => ({ isAuthOpen: !state.isAuthOpen })),
      setAuthOpen: (isOpen) => set({ isAuthOpen: isOpen }),

      // Toast State
      toasts: [],
      addToast: ({ message, type = 'info', duration = 2800 }) => {
        const id = Date.now() + Math.random();
        set((state) => ({ toasts: [...state.toasts, { id, message, type, duration }] }));
      },
      removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
      },

      // User State
      user: null,
      login: async (userData) => {
        set({ user: userData });
        get().fetchUserOrders(userData.id);
        
        const remoteCart = await get().fetchRemoteCart(userData.id);
        if (remoteCart) set({ cart: remoteCart });
      },
      logout: () => {
        set({ user: null, orders: [], cart: [], wishlist: [] });
        localStorage.removeItem('token');
      },
      
      // Pincode State
      coveredPincodes: ['302001', '302012', '302015', '302017', '302021'],
      userPincode: null,
      setPincode: (pincode) => set({ userPincode: pincode }),
      isPincodeValid: () => {
        const { userPincode, coveredPincodes } = get();
        return coveredPincodes.includes(userPincode);
      },

      // Orders State
      orders: [],
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      fetchUserOrders: async (userId) => {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select(`
              *,
              items:order_items (
                id,
                quantity,
                price_at_time,
                product:products (id, name, image, unit, price)
              )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) throw error;

          const mappedOrders = (data || []).map(order => ({
            ...order,
            date: order.created_at,
            total: order.total_amount,
            items: (order.items || []).map(item => ({
               id: item.product?.id,
               name: item.product?.name,
               image: item.product?.image,
               unit: item.product?.unit,
               quantity: item.quantity,
               price: item.price_at_time
            }))
          }));

          set({ orders: mappedOrders });
        } catch (err) {
          console.error("Failed to sync orders", err);
        }
      },
      cancelOrder: async (orderId) => {
        const { user } = get();
        if (!user) return false;
        try {
          const { error } = await supabase
            .from('orders')
            .update({ status: 'Cancelled' })
            .eq('id', orderId)
            .eq('user_id', user.id);
            
          if (error) throw error;
          
          get().fetchUserOrders(user.id);
          return true;
        } catch (err) {
          console.error("Failed to cancel order", err);
          return false;
        }
      },
      
      // Live Sync Engine
      liveSyncActive: false,
      startLiveSync: () => {
        if (get().liveSyncActive) return;
        set({ liveSyncActive: true });
        
        // Initial boot sync for cart
        const bootUser = get().user;
        if (bootUser) {
          get().fetchRemoteCart(bootUser.id).then(remoteCart => {
            if (remoteCart && JSON.stringify(remoteCart) !== JSON.stringify(get().cart)) {
              set({ cart: remoteCart });
            }
          });
        }

        // Poll every 5 seconds for absolute highest fidelity offline-first state tracking
        setInterval(() => {
          get().fetchProducts();
          const currentUser = get().user;
          if (currentUser) {
            get().fetchUserOrders(currentUser.id);
          }
        }, 5000);
      },
    }),
    {
      name: 'supermart-storage',
      partialize: (state) => ({ 
        cart: state.cart, 
        wishlist: state.wishlist, 
        user: state.user,
        orders: state.orders,
        userPincode: state.userPincode
      }),
    }
  )
);
