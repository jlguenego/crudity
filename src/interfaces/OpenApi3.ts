export type SemVer = `${number}.${number}.${number}`;

export interface OpenApi3 {
  openapi: SemVer;
  info?: {
    title: string;
    version: string;
    description: string;
  };
  servers?: {
    url: string;
    description: string;
  }[];
  paths: {
    [path: string]: {
      [method: string]: {
        description: string;
      };
    };
  };
}
