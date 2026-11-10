"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  getRealtimeSocket,
  getRealtimeSocketEpoch,
  REALTIME_EVENT,
  subscribeAdmin,
  subscribeRealtimeResync,
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

    /**
     * 보드 응답에 모든 테이블의 활성 세션이 들어 있고, 보드 쿼리가 성공할 때 테이블별 캐시를 채운다.
     * 테이블 키(`/orders/v1/tables/...`)까지 무효화하면 테이블 수만큼 요청이 나가므로 보드만 다시 조회한다.
     */
    return subscribeRealtimeResync((resyncedStoreId) => {
      if (resyncedStoreId !== storeId) return;
      void queryClient.invalidateQueries({
        queryKey: makeQueryKey(`/orders/v1/stores/${storeId}/board`),
      });
    });
  }, [storeId, queryClient]);

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
