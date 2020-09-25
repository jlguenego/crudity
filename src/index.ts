import { Crudity } from "./Crudity";
import { CrudityOptions } from "./CrudityOptions";

export * from "./Crudity";
export * from "./CrudityOptions";

export function crudity<T>(opts: CrudityOptions<T>) {
    return new Crudity<T>(opts).router;
}
