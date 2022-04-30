import { MariaDBStorageOptions } from "../../interfaces/CrudityOptions";
import { CrudityQueryString } from "../../interfaces/CrudityQueryString";
import { Idable } from "../../interfaces/Idable";

export const getColNames = (options: MariaDBStorageOptions, item: Idable) => {
  const colNames =
    options.mapping?.columns?.map((c) => c.name) || Object.keys(item);
  return colNames;
};

export const getColValues = (options: MariaDBStorageOptions, item: Idable) => {
  const colValues = options.mapping?.columns?.map((c) => {
    const val = (item as unknown as { [key: string]: unknown })[
      c.alias || c.name
    ];
    return val;
  });
  return colValues;
};

export const getColType = (options: MariaDBStorageOptions, colName: string) => {
  const column = options.mapping?.columns?.find((c) => c.name === colName);
  if (!column) {
    return "string";
  }
  return column.type;
};

export const getWhereClause = (
  options: MariaDBStorageOptions,
  query: CrudityQueryString
) => {
  if (!query.filter) {
    return "";
  }
  const conditions = Object.entries(query.filter).map(([key, value]) => {
    const valueStr =
      getColType(options, key) === "string" ? `'${value}'` : value;

    return `${key} = ${valueStr}`;
  });
  if (conditions.length === 0) {
    return "";
  }
  const whereClause = "WHERE " + conditions.join(" AND ");
  return whereClause;
};

export const parseRow = (options: MariaDBStorageOptions, row: object) => {
  const result: { [key: string]: unknown } = {};
  for (const [key, value] of Object.entries(row)) {
    if (getColType(options, key) === "number") {
      if (typeof value === "string") {
        result[key] = +value;
        continue;
      }
    }
    result[key] = value;
  }
  return result;
};

export const parseRows = (options: MariaDBStorageOptions, rows: any[]): any[] =>
  rows.map((row) => parseRow(options, row));
