import { getUrl } from "../utils/string.ts";
import { changesToData } from "../utils/data.ts";
import DocumentEdit from "./templates/document/edit.tsx";

import type { Context, Hono } from "hono/mod.ts";
import type { CMSContent } from "../types.ts";

export default function (app: Hono) {
  app
    .get("/document/:document", async (c: Context) => {
      const { documents } = c.get("options") as CMSContent;
      const documentId = c.req.param("document");
      const document = documents[documentId];
      const data = await document.read();

      return c.render(
        <DocumentEdit
          document={documentId}
          fields={document.fields}
          data={data}
        />,
      );
    })
    .post(async (c: Context) => {
      const { documents } = c.get("options") as CMSContent;
      const documentId = c.req.param("document");
      const document = documents[documentId];
      const body = await c.req.parseBody();

      await document.write(changesToData(body));

      return c.redirect(getUrl("document", documentId));
    });
}
