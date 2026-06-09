import { create } from 'zustand';
import type { Customer } from '../entities/customer/types';
import type { Waiter } from '../entities/waiter/types';
import type { Chef } from '../entities/chef/types';
import type { Table } from '../entities/table/types';
import type { Order } from '../entities/order/types';

interface SimulationState {
  customers: Customer[];
  waiters: Waiter[];
  chefs: Chef[];
  tables: Table[];
  orders: Order[];

  // Customers
  addCustomer: (c: Customer) => void;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  removeCustomer: (id: string) => void;

  // Waiters
  addWaiter: (w: Waiter) => void;
  updateWaiter: (id: string, patch: Partial<Waiter>) => void;

  // Chefs
  addChef: (ch: Chef) => void;
  updateChef: (id: string, patch: Partial<Chef>) => void;

  // Tables
  addTable: (t: Table) => void;
  updateTable: (id: string, patch: Partial<Table>) => void;

  // Orders
  addOrder: (o: Order) => void;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  removeOrder: (id: string) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  customers: [],
  waiters: [],
  chefs: [],
  tables: [],
  orders: [],

  addCustomer: (c) => set((s) => ({ customers: [...s.customers, c] })),
  updateCustomer: (id, patch) =>
    set((s) => ({ customers: s.customers.map((c) => c.id === id ? { ...c, ...patch } : c) })),
  removeCustomer: (id) =>
    set((s) => ({ customers: s.customers.filter((c) => c.id !== id) })),

  addWaiter: (w) => set((s) => ({ waiters: [...s.waiters, w] })),
  updateWaiter: (id, patch) =>
    set((s) => ({ waiters: s.waiters.map((w) => w.id === id ? { ...w, ...patch } : w) })),

  addChef: (ch) => set((s) => ({ chefs: [...s.chefs, ch] })),
  updateChef: (id, patch) =>
    set((s) => ({ chefs: s.chefs.map((c) => c.id === id ? { ...c, ...patch } : c) })),

  addTable: (t) => set((s) => ({ tables: [...s.tables, t] })),
  updateTable: (id, patch) =>
    set((s) => ({ tables: s.tables.map((t) => t.id === id ? { ...t, ...patch } : t) })),

  addOrder: (o) => set((s) => ({ orders: [...s.orders, o] })),
  updateOrder: (id, patch) =>
    set((s) => ({ orders: s.orders.map((o) => o.id === id ? { ...o, ...patch } : o) })),
  removeOrder: (id) =>
    set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),
}));
