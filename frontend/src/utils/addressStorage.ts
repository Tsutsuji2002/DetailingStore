import type { UserAddress } from '@/types';

const STORAGE_KEY_PREFIX = 'motoshine_user_addresses_';

export const VN_PROVINCES = [
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Bình Dương',
  'Đồng Nai',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Bà Rịa - Vũng Tàu',
  'An Giang',
  'Bắc Giang',
  'Bắc Kạn',
  'Bạc Liêu',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Định',
  'Bình Phước',
  'Bình Thuận',
  'Cà Mau',
  'Cao Bằng',
  'Đắk Lắk',
  'Đắk Nông',
  'Điện Biên',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Giang',
  'Hà Nam',
  'Hà Tĩnh',
  'Hải Dương',
  'Hậu Giang',
  'Hòa Bình',
  'Hưng Yên',
  'Khánh Hòa',
  'Kiên Giang',
  'Kon Tum',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Long An',
  'Nam Định',
  'Nghệ An',
  'Ninh Bình',
  'Ninh Thuận',
  'Phú Thọ',
  'Phú Yên',
  'Quảng Bình',
  'Quảng Nam',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sóc Trăng',
  'Sơn La',
  'Tây Ninh',
  'Thái Bình',
  'Thái Nguyên',
  'Thanh Hóa',
  'Thừa Thiên Huế',
  'Tiền Giang',
  'Trà Vinh',
  'Tuyên Quang',
  'Vĩnh Long',
  'Vĩnh Phúc',
  'Yên Bái',
];

export const MAX_ADDRESSES = 5;

const getStorageKey = (userId?: string) => {
  return `${STORAGE_KEY_PREFIX}${userId || 'guest'}`;
};

export const getSavedAddresses = (userId?: string): UserAddress[] => {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading saved addresses:', err);
    return [];
  }
};

export const saveAddress = (
  address: Omit<UserAddress, 'id'>,
  userId?: string
): { success: boolean; message?: string; addresses: UserAddress[] } => {
  const current = getSavedAddresses(userId);
  if (current.length >= MAX_ADDRESSES) {
    return {
      success: false,
      message: `Bạn chỉ có thể lưu tối đa ${MAX_ADDRESSES} địa chỉ thanh toán.`,
      addresses: current,
    };
  }

  const id = `ADDR-${Math.random().toString(36).substring(2, 9)}`;
  const isFirst = current.length === 0;
  const newAddr: UserAddress = {
    ...address,
    id,
    isDefault: address.isDefault ?? isFirst,
  };

  let updated = [...current];
  if (newAddr.isDefault) {
    updated = updated.map(a => ({ ...a, isDefault: false }));
  }
  updated.unshift(newAddr);

  localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
  return { success: true, addresses: updated };
};

export const updateAddress = (
  id: string,
  updatedFields: Partial<UserAddress>,
  userId?: string
): UserAddress[] => {
  const current = getSavedAddresses(userId);
  let updated = current.map(a => {
    if (a.id === id) {
      return { ...a, ...updatedFields };
    }
    return a;
  });

  if (updatedFields.isDefault) {
    updated = updated.map(a => ({
      ...a,
      isDefault: a.id === id,
    }));
  }

  localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
  return updated;
};

export const deleteAddress = (id: string, userId?: string): UserAddress[] => {
  const current = getSavedAddresses(userId);
  const target = current.find(a => a.id === id);
  let updated = current.filter(a => a.id !== id);

  if (target?.isDefault && updated.length > 0) {
    updated[0].isDefault = true;
  }

  localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
  return updated;
};

export const setDefaultAddress = (id: string, userId?: string): UserAddress[] => {
  const current = getSavedAddresses(userId);
  const updated = current.map(a => ({
    ...a,
    isDefault: a.id === id,
  }));
  localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
  return updated;
};

export const formatFullAddress = (addr: Partial<UserAddress> | string): string => {
  if (typeof addr === 'string') return addr;
  const parts = [
    addr.streetAddress,
    addr.ward,
    addr.district,
    addr.province,
  ].filter(Boolean);
  return parts.join(', ');
};
