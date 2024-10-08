// Generated by Xata Codegen 0.29.4. Please do not edit.
import { buildClient } from "@xata.io/client";
/** @typedef { import('./types').SchemaTables } SchemaTables */
/** @type { SchemaTables } */
const tables = [
  {
    name: "requests",
    columns: [
      { name: "applicant", type: "json" },
      { name: "contact", type: "string" },
      { name: "reason", type: "string" },
      { name: "time", type: "string" },
      { name: "isApproved", type: "bool" },
      { name: "status", type: "string" },
      { name: "ip", type: "text" },
    ],
  },
  {
    name: "password",
    columns: [
      { name: "name", type: "string" },
      { name: "value", type: "string" },
    ],
  },
];
/** @type { import('@xata.io/client').ClientConstructor<{}> } */
const DatabaseClient = buildClient();
const defaultOptions = {
  databaseURL:
    "https://pr-citrate-s-workspace-piheva.ap-southeast-2.xata.sh/db/sunja-approve",
};
/** @typedef { import('./types').DatabaseSchema } DatabaseSchema */
/** @extends DatabaseClient<DatabaseSchema> */
export class XataClient extends DatabaseClient {
  constructor(options) {
    super({ ...defaultOptions, ...options }, tables);
  }
}
let instance = undefined;
/** @type { () => XataClient } */
export const getXataClient = () => {
  if (instance) return instance;
  instance = new XataClient();
  return instance;
};
