"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  getRealtimeSocket,
  getRealtimeSocketEpoch,
  REALTIME_EVENT,
  subscribeAdmin,
  subscribeRealtimeSocketEpoch,
  unsubscribeAdmin,
} from "./socket";
import { OrderSyncEvent } from "@ssurak/api/types/realtime/syncNotice.interface";
import { useQueryClient } from "@tanstack/react-query";
import { makeQueryKey } from "@ssurak/api/utils/makeQueryKey";

export type StoreRealtimeHandlers = {
  onCreatedAction?: (event: OrderSyncEvent) => void;
  onUpdatedAction?: (event: OrderSyncEvent) => void;
  onCancelledAction?: (event: OrderSyncEvent) => void;
};

const getServerRealtimeSocketEpoch = (): number => 0;

export const useStoreOrderSyncDaemon = (
  storeId: string,
  handlers: StoreRealtimeHandlers
): void => {
  const { onCreatedAction, onUpdatedAction, onCancelledAction } = handlers;
  const queryClient = useQueryClient();

  /** resetRealtimeSocket으로 인스턴스가 교체되면 새 소켓에 다시 구독한다 */
  const socketEpoch = useSyncExternalStore(
    subscribeRealtimeSocketEpoch,
    getRealtimeSocketEpoch,
    getServerRealtimeSocketEpoch
  );

  useEffect(() => {
    if (!storeId) return;

    const socket = getRealtimeSocket();

    const invalidateOrders = () => {
      void queryClient.invalidateQueries({
        queryKey: makeQueryKey(`/orders/v1/stores/${storeId}/board`),
      });
      void queryClient.invalidateQueries({
        queryKey: makeQueryKey("/orders/v1/tables"),
      });
    };

    socket.io.on("reconnect", invalidateOrders);

    return () => {
      socket.io.off("reconnect", invalidateOrders);
    };
  }, [storeId, queryClient, socketEpoch]);

  useEffect(() => {
    if (!storeId) return;

    const socket = getRealtimeSocket();
    subscribeAdmin(storeId);

    if (onCreatedAction) {
      socket.on(REALTIME_EVENT.ORDER_CREATED, onCreatedAction);
    }

    if (onUpdatedAction) {
      socket.on(REALTIME_EVENT.ORDER_UPDATED, onUpdatedAction);
      socket.on(REALTIME_EVENT.ORDER_ITEM_UPDATED, onUpdatedAction);
    }

    if (onCancelledAction) {
      socket.on(REALTIME_EVENT.ORDER_CANCELLED, onCancelledAction);
      socket.on(REALTIME_EVENT.ORDER_ITEM_DELETED, onCancelledAction);
    }

    return () => {
      if (onCreatedAction) {
        socket.off(REALTIME_EVENT.ORDER_CREATED, onCreatedAction);
      }

      if (onUpdatedAction) {
        socket.off(REALTIME_EVENT.ORDER_UPDATED, onUpdatedAction);
        socket.off(REALTIME_EVENT.ORDER_ITEM_UPDATED, onUpdatedAction);
      }

      if (onCancelledAction) {
        socket.off(REALTIME_EVENT.ORDER_CANCELLED, onCancelledAction);
        socket.off(REALTIME_EVENT.ORDER_ITEM_DELETED, onCancelledAction);
      }

      unsubscribeAdmin(storeId);
    };
  }, [
    storeId,
    onCreatedAction,
    onUpdatedAction,
    onCancelledAction,
    socketEpoch,
  ]);
};
