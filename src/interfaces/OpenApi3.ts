export type SemVer = `${number}.${number}.${number}`;

export interface OpenApi3 {
  openapi: SemVer;
  info: InfoObject;
  servers?: ServerObject[];
  paths: PathsObject;
  components?: ComponentsObject;
  security?: SecurityRequirementObject[];
  tags?: TagObject[];
  externalDocs?: ExternalDocumentationObject;
}

export interface InfoObject {
  title: string;
  description?: string;
  termsOfService?: string;
  contact?: ContactObject;
  license?: LicenseObject;
  version: string;
}

export interface ServerObject {
  url: string;
  description: string;
}

export interface PathsObject {
  [path: string]: {
    [method: string]: {
      description: string;
    };
  };
}

export interface ComponentsObject {
  schemas?: { [name: string]: SchemaObject };
}

export interface SecurityRequirementObject {
  [name: string]: string[];
}

export interface TagObject {
  name: string;
  description?: string;
  externalDocs: ExternalDocumentationObject;
}

export interface SchemaObject {
  [name: string]: unknown;
}

export interface ExternalDocumentationObject {
  description?: string;
  url: string;
}

export interface ContactObject {
  name?: string;
  url?: string;
  email?: string;
}

export interface LicenseObject {
  name: string;
  url?: string;
}
