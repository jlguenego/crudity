// Credits: https://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
export function pascalize(str: string): string {
  return (" " + str)
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, function (match, chr) {
      return chr.toUpperCase();
    });
}
