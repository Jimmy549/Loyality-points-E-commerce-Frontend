// Mapping of frontend product IDs to backend MongoDB IDs
export const productIdMapping: Record<number, string> = {
  1: '695e17c75c3dda7f8e316130',
  2: '695e17c75c3dda7f8e316131',
  3: '695e17c75c3dda7f8e316132',
  4: '695e17c75c3dda7f8e316133',
  5: '695e17c75c3dda7f8e316134',
  6: '695e17c75c3dda7f8e316135',
  7: '695e17c75c3dda7f8e316136',
  8: '695e17c75c3dda7f8e316137',
  12: '695e17c75c3dda7f8e316138',
  13: '695e17c75c3dda7f8e316139',
  14: '695e17c75c3dda7f8e31613a',
  15: '695e17c75c3dda7f8e31613b',
};

export const getBackendProductId = (frontendId: number): string => {
  return productIdMapping[frontendId] || String(frontendId);
};
