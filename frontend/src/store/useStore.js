import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useStore = create(
  persist(
    (set, get) => ({
      // Products State
      products: [],
      isProductsLoading: false,
      fetchProducts: async () => {
        set({ isProductsLoading: true });
        try {
          const res = await fetch(`${API_URL}/api/products`);
          const data = await res.json();
          // Ensure data is an array
          set({ products: Array.isArray(data) ? data : [], isProductsLoading: false });
        } catch (error) {
          console.error("Failed to fetch products", error);
          set({ products: [], isProductsLoading: false });
        }
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
          
          return { cart: [...state.cart, { ...product, quantity }] };
        });
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
      },
      removeFromCart: (productId) => {
        set((state) => ({ cart: state.cart.filter(item => item.id !== productId) }));
      },
      clearCart: () => set({ cart: [] }),
      
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

      // User State
      user: null,
      login: (userData) => {
        set({ user: userData });
        get().fetchUserOrders(userData.id);
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
          const res = await fetch(`${API_URL}/api/orders/user/${userId}`);
          const data = await res.json();
          set({ orders: Array.isArray(data) ? data : [] });
        } catch (err) {
          console.error("Failed to sync orders", err);
        }
      },
      
      // Live Sync Engine
      liveSyncActive: false,
      startLiveSync: () => {
        if (get().liveSyncActive) return;
        set({ liveSyncActive: true });
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
