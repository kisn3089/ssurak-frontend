import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpCart } from "./httpCart";
import { makeQueryKey } from "../../utils/makeQueryKey";
import { Cart } from "../../types/cart/cart.interface";
import {
  AddCartItemPayload,
  UpdateCartItemPayload,
} from "../../schemas/model/cart.schema";

const cartQueryKey = makeQueryKey("/carts/v1/sessions/carts");

export function useCartMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: cartQueryKey });

  const add = useMutation({
    mutationKey: ["cart", "add"],
    mutationFn: (payload: AddCartItemPayload) => httpCart.addCartItem(payload),
    onSuccess: ({ cart }) => queryClient.setQueryData(cartQueryKey, cart),
  });

  const update = useMutation({
    mutationKey: ["cart", "update"],
    mutationFn: ({
      cartItemId,
      payload,
    }: {
      cartItemId: string;
      payload: UpdateCartItemPayload;
    }) => httpCart.updateCartItem(cartItemId, payload),
    onMutate: async ({ cartItemId, payload }) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey });

      const previousCart = queryClient.getQueryData(cartQueryKey);

      queryClient.setQueryData<Cart>(cartQueryKey, (oldCart) => {
        if (!oldCart) return oldCart;

        const updatedMenus = oldCart.menus.map((menu) => {
          if (menu.id !== cartItemId) {
            return menu;
          }
          // 옵션 선택(id 목록)만으로는 장바구니가 들고 있는 스냅샷(이름·금액)을 만들 수 없다.
          // 수량만 낙관적으로 반영하고 옵션은 서버 응답이 오면 통째로 갈아끼운다.
          const { options: _options, ...optimistic } = payload;
          return { ...menu, ...optimistic };
        });

        return { ...oldCart, menus: updatedMenus };
      });

      return { previousCart };
    },
    onError: (_e, _v, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKey, context.previousCart);
      }
      invalidate();
    },
    onSuccess: ({ cart }) => {
      queryClient.setQueryData<Cart>(cartQueryKey, cart);
    },
  });

  const remove = useMutation({
    mutationKey: ["cart", "remove"],
    mutationFn: (cartItemId: string) => httpCart.removeCartItem(cartItemId),
    onSuccess: ({ cart }) => queryClient.setQueryData(cartQueryKey, cart),
  });

  const clearCart = useMutation({
    mutationKey: ["cart", "clear"],
    mutationFn: () => httpCart.clearCart(),
    onSuccess: () =>
      queryClient.setQueryData(cartQueryKey, {
        menus: [],
        updatedAt: new Date().toISOString(),
      }),
  });

  return { add, update, remove, clearCart };
}
