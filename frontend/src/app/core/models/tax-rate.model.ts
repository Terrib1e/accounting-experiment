export interface TaxRate {
    id: string;
    name: string;
    code: string;
    rate: number;
    active: boolean;
    description?: string;
}
