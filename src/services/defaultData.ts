// FLAVENCIA 2026 - Default Master Data Seeds

import { CategoryRecord, AccountRecord, SettingItem } from '../types/financial';

export const DEFAULT_INCOME_CATEGORIES: Omit<CategoryRecord, 'createdAt'>[] = [
  { categoryId: 'CAT-INC-01', categoryName: 'Individual Donations', categoryType: 'INCOME', description: 'Donations from patrons and alumni', isActive: true },
  { categoryId: 'CAT-INC-02', categoryName: 'Institutional Donations', categoryType: 'INCOME', description: 'Grants and corporate donations', isActive: true },
  { categoryId: 'CAT-INC-03', categoryName: 'Sponsorship', categoryType: 'INCOME', description: 'Title, co-sponsor, and associate sponsors', isActive: true },
  { categoryId: 'CAT-INC-04', categoryName: 'Registration Fees', categoryType: 'INCOME', description: 'General delegate registration', isActive: true },
  { categoryId: 'CAT-INC-05', categoryName: 'Competition Entry Fees', categoryType: 'INCOME', description: 'Contest and events registration fees', isActive: true },
  { categoryId: 'CAT-INC-06', categoryName: 'Advertisement Revenue', categoryType: 'INCOME', description: 'Souvenir, banner, and display ads', isActive: true },
  { categoryId: 'CAT-INC-07', categoryName: 'Stall Revenue', categoryType: 'INCOME', description: 'Commercial and exhibition stall rents', isActive: true },
  { categoryId: 'CAT-INC-08', categoryName: 'Food Sales', categoryType: 'INCOME', description: 'Official food stall coupons and proceeds', isActive: true },
  { categoryId: 'CAT-INC-09', categoryName: 'Other Income', categoryType: 'INCOME', description: 'Miscellaneous festival receipts', isActive: true },
];

export const DEFAULT_EXPENSE_CATEGORIES: Omit<CategoryRecord, 'createdAt'>[] = [
  { categoryId: 'CAT-EXP-01', categoryName: 'Stage and Sound', categoryType: 'EXPENSE', description: 'Pro sound system, acoustics, truss & staging', isActive: true },
  { categoryId: 'CAT-EXP-02', categoryName: 'Lighting and Decoration', categoryType: 'EXPENSE', description: 'Stage lighting, campus illumination & floral decor', isActive: true },
  { categoryId: 'CAT-EXP-03', categoryName: 'Food and Catering', categoryType: 'EXPENSE', description: 'Meals for guests, judges, participants & team', isActive: true },
  { categoryId: 'CAT-EXP-04', categoryName: 'Printing and Designing', categoryType: 'EXPENSE', description: 'Brochures, posters, banners, ID cards & flex', isActive: true },
  { categoryId: 'CAT-EXP-05', categoryName: 'Trophies and Certificates', categoryType: 'EXPENSE', description: 'Awards, certificates, medals & mementos', isActive: true },
  { categoryId: 'CAT-EXP-06', categoryName: 'Transportation', categoryType: 'EXPENSE', description: 'Vehicle rentals, fuel & guest transit', isActive: true },
  { categoryId: 'CAT-EXP-07', categoryName: 'Accommodation', categoryType: 'EXPENSE', description: 'Hotel rooms & guest house stay', isActive: true },
  { categoryId: 'CAT-EXP-08', categoryName: 'Marketing and Promotion', categoryType: 'EXPENSE', description: 'Social media ads, PR & promotional hoardings', isActive: true },
  { categoryId: 'CAT-EXP-09', categoryName: 'Gifts and Prizes', categoryType: 'EXPENSE', description: 'Cash prizes, gift hampers & token of appreciation', isActive: true },
  { categoryId: 'CAT-EXP-10', categoryName: 'Stationery', categoryType: 'EXPENSE', description: 'Office supplies, pens, files & desk items', isActive: true },
  { categoryId: 'CAT-EXP-11', categoryName: 'Volunteer Expenses', categoryType: 'EXPENSE', description: 'T-shirts, refreshments & logistics for volunteers', isActive: true },
  { categoryId: 'CAT-EXP-12', categoryName: 'Equipment', categoryType: 'EXPENSE', description: 'Generators, walkie-talkies & event tech rentals', isActive: true },
  { categoryId: 'CAT-EXP-13', categoryName: 'Miscellaneous', categoryType: 'EXPENSE', description: 'Contingency & sundry event expenditures', isActive: true },
];

export const DEFAULT_ACCOUNTS: Omit<AccountRecord, 'createdAt'>[] = [
  { accountId: 'ACC-01', accountName: 'Cash in Hand', accountType: 'CASH', openingBalance: 0, isActive: true },
  { accountId: 'ACC-02', accountName: 'Bank Account', accountType: 'BANK', openingBalance: 0, isActive: true },
  { accountId: 'ACC-03', accountName: 'UPI Account', accountType: 'UPI', openingBalance: 0, isActive: true },
];

export const DEFAULT_SETTINGS: SettingItem[] = [
  { settingKey: 'festivalName', settingValue: 'FLAVENCIA 2026', updatedAt: new Date().toISOString() },
  { settingKey: 'tagline', settingValue: 'BEYOND BOUNDARIES', updatedAt: new Date().toISOString() },
  { settingKey: 'festivalYear', settingValue: '2026', updatedAt: new Date().toISOString() },
  { settingKey: 'currency', settingValue: 'INR', updatedAt: new Date().toISOString() },
  { settingKey: 'timezone', settingValue: 'Asia/Kolkata', updatedAt: new Date().toISOString() },
  { settingKey: 'adminUsername', settingValue: 'admin', updatedAt: new Date().toISOString() },
  // Default password hash for 'flavencia2026' (SHA-256)
  { settingKey: 'adminPasswordHash', settingValue: '3e042bce5c9bc052df3a94f6f7eb35a74e539959e1c28c89d2d0c242c7e0b6ea', updatedAt: new Date().toISOString() },
];
