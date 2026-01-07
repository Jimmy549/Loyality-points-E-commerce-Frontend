// Shared in-memory data store for all APIs
export const dataStore = {
  users: [] as any[],
  orders: [] as any[],
  payments: [] as any[]
};

export const addUser = (user: any) => {
  dataStore.users.push(user);
  console.log('User added to store. Total users:', dataStore.users.length);
};

export const addOrder = (order: any) => {
  dataStore.orders.push(order);
  console.log('Order added to store. Total orders:', dataStore.orders.length);
};

export const addPayment = (payment: any) => {
  dataStore.payments.push(payment);
  console.log('Payment added to store. Total payments:', dataStore.payments.length);
};

export const getUsers = () => dataStore.users;
export const getOrders = () => dataStore.orders;
export const getPayments = () => dataStore.payments;