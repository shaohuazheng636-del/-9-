export interface SceneAnalysis {
  cn: string;
  en: string;
}

export interface ShotDefinition {
  id: string;
  labelCN: string;
  labelEN: string;
  valueCN: string;
  valueEN: string;
  icon?: string;
}

export type Lang = 'CN' | 'EN';

export interface GridState {
  [key: number]: string; // index 0-8 to ShotDefinition ID
}
