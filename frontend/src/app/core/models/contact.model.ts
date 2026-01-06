export interface Contact {
  id: string;
  name: string;
  type: 'CUSTOMER' | 'VENDOR' | 'EMPLOYEE';
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  active: boolean;
  currency: string;
  createdAt: string;
}
