import { MariaDBStorageOptions } from "../../interfaces/CrudityOptions";
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
