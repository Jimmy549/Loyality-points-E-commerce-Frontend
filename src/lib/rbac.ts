export type UserRole = 'user' | 'admin' | 'super_admin';

export interface Permission {
  resource: string;
  actions: string[];
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  user: [
    { resource: 'products', actions: ['read'] },
    { resource: 'cart', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'orders', actions: ['create', 'read'] },
    { resource: 'profile', actions: ['read', 'update'] },
    { resource: 'loyalty_points', actions: ['read', 'spend'] },
  ],
  admin: [
    { resource: 'products', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'orders', actions: ['read', 'update'] },
    { resource: 'users', actions: ['read', 'update'] },
    { resource: 'sales', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'notifications', actions: ['create', 'read'] },
    { resource: 'analytics', actions: ['read'] },
  ],
  super_admin: [
    { resource: '*', actions: ['*'] }, // Full access
  ],
};

export const hasPermission = (
  userRole: UserRole,
  resource: string,
  action: string
): boolean => {
  const permissions = ROLE_PERMISSIONS[userRole];
  
  // Super admin has all permissions
  if (userRole === 'super_admin') {
    return true;
  }
  
  return permissions.some(permission => {
    const hasResource = permission.resource === resource || permission.resource === '*';
    const hasAction = permission.actions.includes(action) || permission.actions.includes('*');
    return hasResource && hasAction;
  });
};

export const canAccessAdminPanel = (userRole: UserRole): boolean => {
  return userRole === 'admin' || userRole === 'super_admin';
};

export const canManageUsers = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'users', 'update') || userRole === 'super_admin';
};

export const canManageProducts = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'products', 'create') || userRole === 'super_admin';
};