/**
 * useVNAddress
 * Official 2-Level Administrative Division Hook (Tỉnh/Thành phố → Xã/Phường/Thị trấn)
 * Powered by vietnam-divisions-js (v3 - Resolution 202/2025/QH15 - 34 Provinces & 2-level Communes)
 */
import { useState, useEffect } from 'react';
import { v3 } from 'vietnam-divisions-js';

export interface VNProvince {
  code: string;
  name: string;
}

export interface VNWard {
  code: string;
  name: string;
}

interface UseVNAddressReturn {
  provinces: VNProvince[];
  wards: VNWard[];
  districts?: { code: string; name: string }[];
  selectedProvince: VNProvince | null;
  selectedDistrict: { code: string; name: string } | null;
  selectedWard: VNWard | null;
  loadingProvinces: boolean;
  loadingWards: boolean;
  selectProvince: (code: string) => void;
  selectDistrict: (code: string) => void;
  selectWard: (code: string) => void;
  setByName: (provinceName: string, districtName?: string, wardName?: string) => Promise<void>;
  getFullAddress: () => { province: string; district: string; ward: string };
}

export function useVNAddress(): UseVNAddressReturn {
  const [provinces, setProvinces] = useState<VNProvince[]>([]);
  const [wards, setWards] = useState<VNWard[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<VNProvince | null>(null);
  const [selectedWard, setSelectedWard] = useState<VNWard | null>(null);

  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingWards, setLoadingWards] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    let isMounted = true;
    setLoadingProvinces(true);

    Promise.resolve(v3.getAllProvinces())
      .then(data => {
        if (!isMounted) return;
        const mapped: VNProvince[] = data.map(item => ({
          code: String(item.idProvince),
          name: item.name || item.shortName,
        }));
        setProvinces(mapped);

        if (mapped.length > 0) {
          const hcm = mapped.find(p => p.name.includes('Hồ Chí Minh'));
          const initial = hcm || mapped[0];
          setSelectedProvince(initial);
          loadCommunes(initial.code);
        }
      })
      .catch(() => {
        if (isMounted) setProvinces([]);
      })
      .finally(() => {
        if (isMounted) setLoadingProvinces(false);
      });

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCommunes = (provinceId: string) => {
    setLoadingWards(true);
    setWards([]);
    setSelectedWard(null);

    Promise.resolve(v3.getCommunesByProvinceId(provinceId))
      .then(data => {
        const mapped: VNWard[] = (data || []).map(item => ({
          code: String(item.idCommune),
          name: item.name,
        }));
        setWards(mapped);
      })
      .catch(() => setWards([]))
      .finally(() => setLoadingWards(false));
  };

  const selectProvince = (code: string) => {
    const prov = provinces.find(p => p.code === String(code)) || null;
    setSelectedProvince(prov);
    setSelectedWard(null);
    setWards([]);
    if (prov) loadCommunes(prov.code);
  };

  const selectWard = (code: string) => {
    const ward = wards.find(w => w.code === String(code)) || null;
    setSelectedWard(ward);
  };

  /**
   * Restore saved address by name
   */
  const setByName = async (provinceName: string, _districtName?: string, wardName?: string) => {
    if (!provinceName) return;

    const allProv = await Promise.resolve(v3.getAllProvinces());
    const provMatch = allProv.find(p =>
      p.name.toLowerCase().includes(provinceName.toLowerCase()) ||
      provinceName.toLowerCase().includes(p.name.toLowerCase())
    );

    if (!provMatch) return;

    const provObj: VNProvince = {
      code: String(provMatch.idProvince),
      name: provMatch.name,
    };
    setSelectedProvince(provObj);

    if (!wardName) return;

    const communes = await Promise.resolve(v3.getCommunesByProvinceId(provMatch.idProvince));
    const mappedWards: VNWard[] = (communes || []).map(c => ({
      code: String(c.idCommune),
      name: c.name,
    }));
    setWards(mappedWards);

    const wardMatch = mappedWards.find(w =>
      w.name.toLowerCase().includes(wardName.toLowerCase()) ||
      wardName.toLowerCase().includes(w.name.toLowerCase())
    );
    if (wardMatch) setSelectedWard(wardMatch);
  };

  const getFullAddress = () => ({
    province: selectedProvince?.name || '',
    district: '',
    ward: selectedWard?.name || '',
  });

  return {
    provinces,
    wards,
    districts: [],
    selectedProvince,
    selectedDistrict: null,
    selectedWard,
    loadingProvinces,
    loadingWards,
    selectProvince,
    selectDistrict: () => {},
    selectWard,
    setByName,
    getFullAddress,
  };
}
