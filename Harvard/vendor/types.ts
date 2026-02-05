export interface Vendor {
  id: string;
  name: string;
  imageUrl: string;
  shortDescription: string;
  fullDescription: string;
  address: string;
  phone: string;
  website: string;
  category: VendorCategory;
  city: string;
  services: string[];
  cases: CaseStudy[];
  updatedAt?: string;
}

export interface CaseStudy {
  title: string;
  url: string;
}

export enum VendorCategory {
  ALL = '全部',
  ECOMMERCE = '電商購物',
  CORPORATE = '企業形象',
  LANDING = '活動頁面',
  SYSTEM = '系統開發',
}

export interface FilterState {
  keyword: string;
  category: string;
  city: string;
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}