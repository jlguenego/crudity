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
  description?: string;
  variables?: {
    [name: string]: ServerVariableObject;
  };
}

export interface PathsObject {
  [path: `/${string}`]: PathItemObject;
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
  externalDocs?: ExternalDocumentationObject;
}

export interface SchemaObject {
  [name: string]: unknown;
}

export interface ExternalDocumentationObject {
  url: string;
  description?: string;
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

export interface ServerVariableObject {
  enum?: string[];
  default: string;
  description?: string;
}

export type PathItemObject = {
  $ref?: string;
  summary?: string;
  description?: string;
  parameters?: (ParameterObject | ReferenceObject)[];
} & {
  [operation in HTTPMethod]?: OperationObject;
};

export type HTTPMethod =
  | "get"
  | "put"
  | "post"
  | "delete"
  | "options"
  | "head"
  | "patch"
  | "trace";

export interface OperationObject {
  tags?: string[];
  description?: string;
  responses: ResponsesObject;
  externalDocs?: ExternalDocumentationObject;
  operationId?: string;
  parameters?: (ParameterObject | ReferenceObject)[];
}

export type ParameterObject = {
  name: string;
  description?: string;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
} & (
  | {
      in: "path";
      required: boolean;
    }
  | {
      in: "query" | "header" | "cookie";
      required?: boolean;
    }
);

export interface ResponsesObject {
  default?: ResponseObject | ReferenceObject;
}

export interface ResponseObject {
  description: string;
}

export interface ReferenceObject {
  $ref: string;
}
