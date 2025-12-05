import { createContext } from "react";

export const CartContext = createContext({
  cart: [],
  addToCart: () => {},
  setCart: () => {},
  removeCart: () => {}
});
