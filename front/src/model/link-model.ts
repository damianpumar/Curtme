export interface LinkModel {
  id: string;
  date: string;
  shortURL: string;
  sourceURL: string;
  title: string;
  visited: number;
  hasPassword: any;
}

export interface LinkDetailModel {
  ip: any;
  isp: any;
  countryEmoji: string;
  continentName: any;
  device: any;
  browser: any;
  platform: any;
  platformVersion: any;
  date: string;
  city: string;
  countryName: string;
}
