import { MariaDBStorageOptions } from "../../interfaces/CrudityOptions";
import { CrudityQueryString } from "../../interfaces/CrudityQueryString";
import { Idable } from "../../interfaces/Idable";

export const getAllColNames = (options: MariaDBStorageOptions) => {
  const colNames = options.mapping?.columns?.map((c) => c.name) || [];
  colNames.unshift(getIdColName(options));
  return colNames;
};

export const getColNames = (options: MariaDBStorageOptions, item: Idable) => {
  const colNames = Object.keys(item);
  // check if colNames are configured in the config file
  if (options.mapping?.columns) {
    const optColNames = options.mapping.columns.map((c) => c.name);
    const filteredColNames = colNames.filter((name) =>
      optColNames.includes(name)
    );
    return filteredColNames;
  }
  return colNames;
};

export const getColValues = (options: MariaDBStorageOptions, item: Idable) => {
  const colValues = getColNames(options, item).map((colName) => {
    const c = options.mapping?.columns?.find((col) => col.name === colName);
    const val = (item as unknown as { [key: string]: unknown })[
      c?.alias || c?.name || colName
    ];
    return val;
  });
  return colValues || [];
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

export const isIdColumn = (options: MariaDBStorageOptions, key: string) => {
  return options.mapping?.id.name === key;
};

export const parseRow = (options: MariaDBStorageOptions, row: object) => {
  const result: { [key: string]: unknown } = {};
  for (const [key, value] of Object.entries(row)) {
    if (isIdColumn(options, key)) {
      result["id"] = value + "";
      continue;
    }
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

export const getSetClause = (
  options: MariaDBStorageOptions,
  body: { [key: string]: unknown }
) => {
  return Object.entries(body).map(([key, value]) => {
    const valueStr = value;
    return key + " = " + valueStr;
  });
};

export const getIdColName = (options: MariaDBStorageOptions) => {
  return options.mapping?.id.name || "id";
};

export const getIdColValue = (options: MariaDBStorageOptions, item: Idable) => {
  if (options.mapping?.id.type === "number") {
    return +item.id;
  }
  return item.id;
};
