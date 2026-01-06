export interface OrganizationSettings {
  id: string;
  organizationName: string;
  taxId?: string;
  baseCurrency: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface FiscalPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'OPEN' | 'CLOSED';
}
