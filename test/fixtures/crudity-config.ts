import { WebServerOptions } from "../../src/interfaces/WebServerOptions";

export const port = +(process.env.TEST_PORT || 3333);

export const webServerConfig: Partial<WebServerOptions> = {
  port,
  resources: {
    articles: {
      enableLogs: false,
      storage:
        process.env.TEST_STORAGE === "mongo"
          ? {
              type: "mongodb",
              uri: "mongodb://localhost/crudity-unit-test",
            }
          : process.env.TEST_STORAGE === "mariadb"
          ? {
              type: "mariadb",
              database: "crudity_unit_test",
              config: {
                host: "localhost",
                port: 3306,
                user: "root",
                password: "admin",
                connectTimeout: 2000,
                socketTimeout: 1000,
              },
              mapping: {
                tableCreationSQLRequest:
                  "create table articles (article_id INT(11) NOT NULL AUTO_INCREMENT, name TEXT, price DECIMAL(11,2) NULL, qty INT(11), PRIMARY KEY (article_id))",
                id: { name: "article_id", type: "number" },
                columns: [
                  { name: "name", type: "string" },
                  { name: "price", type: "number" },
                  { name: "qty", type: "number" },
                ],
              },
            }
          : {
              type: "file",
              dataDir: "./data/test",
            },
      validators: [{ name: "unique", args: ["name"] }],
    },
  },
  enableLogs: false,
};
