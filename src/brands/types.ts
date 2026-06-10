export type BrandId = 'edeka-foodservice' | 'handelshof';

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textOnPrimary: string;
  textSecondary: string;
  border: string;
  success: string;
  error: string;
}

export interface BrandConfig {
  id: BrandId;
  /** Full display name, e.g. shown on splash and login */
  name: string;
  /** Short name used in tight spaces (tab bar, headers) */
  shortName: string;
  /** Greeting form used on the dashboard, e.g. "Edeka ONE" */
  appLabel: string;
  colors: BrandColors;
  /** Path to logo assets - drop real files into assets/brands/<id>/ */
  logo: {
    light: string;
    dark: string;
  };
}
