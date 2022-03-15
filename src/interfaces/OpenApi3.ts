export interface OpenApi3 {
  openapi: "3.0.0";
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
