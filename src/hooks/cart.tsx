import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      if (products.length === 0) {
        const productsList = await AsyncStorage.getItem('@GoMarketplace');
        if (productsList) setProducts(JSON.parse(productsList));
      }
    }

    loadProducts();
  }, [products]);

  const addToCart = useCallback(
    async product => {
      const findIndexProduct = products.findIndex(
        item => item.id === product.id,
      );

      if (findIndexProduct < 0) {
        setProducts([...products, { ...product, quantity: 1 }]);
        await AsyncStorage.setItem('@GoMarketplace', JSON.stringify(products));
        return;
      }

      const auxProducts = [...products];
      auxProducts[findIndexProduct].quantity =
        Number(auxProducts[findIndexProduct].quantity) + 1;
      setProducts(auxProducts);
      await AsyncStorage.setItem('@GoMarketplace', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const findIndexProduct = products.findIndex(item => item.id === id);

      const auxProducts = [...products];

      auxProducts[findIndexProduct].quantity =
        Number(auxProducts[findIndexProduct].quantity) + 1;

      setProducts(auxProducts);
      await AsyncStorage.setItem('@GoMarketplace', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const findIndexProduct = products.findIndex(item => item.id === id);

      const auxProducts = [...products];
      auxProducts[findIndexProduct].quantity =
        Number(auxProducts[findIndexProduct].quantity) - 1;

      setProducts(auxProducts);
      await AsyncStorage.setItem('@GoMarketplace', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
