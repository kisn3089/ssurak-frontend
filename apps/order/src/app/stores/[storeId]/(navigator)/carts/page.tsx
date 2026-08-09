import CartMenuList from "./components/CartMenuList";
import CartPayment from "./components/CartPayment";
import CartProvider from "./components/CartProvider";

export default function CartPage() {
  return (
    <CartProvider>
      <div className="flex flex-col gap-y-2">
        <CartMenuList />
        <CartPayment />
      </div>
    </CartProvider>
  );
}
