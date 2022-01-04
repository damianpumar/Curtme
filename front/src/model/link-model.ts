export interface LinkModel {
  id: string;
  date: string;
  shortURL: string;
  sourceURL: string;
  title: string;
  visited: number;
  hasPassword: boolean;
  isPublic: boolean;
}

export interface LinkDetailModel {
  ip: string;
  isp: string;
  countryEmoji: string;
  continentName: string;
  device: string;
  browser: string;
  platform: string;
  platformVersion: string;
  date: string;
  city: string;
  countryName: string;
  host: string;
}
