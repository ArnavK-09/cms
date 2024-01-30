import { Hono } from "hono/mod.ts";
import { serveStatic } from "hono/middleware.ts";
import cms from "../mod.ts";
import { dispatch } from "../src/utils/event.ts";
import { Git } from "../src/versioning/git.ts";

import type Site from "lume/core/site.ts";
import type Cms from "../src/cms.ts";

export interface Options {
  site: Site;
  basePath?: string;
  port?: number;
  versioning?: "git";
}

export const defaults: Omit<Options, "site"> = {
  basePath: "/admin",
  port: 8000,
};

export default async function lume(userOptions?: Options): Promise<Cms> {
  const options = {
    ...defaults,
    ...userOptions,
  } as Required<Options>;

  const { site, basePath } = options;

  site.options.location = new URL(`http://localhost:${options.port}/`);
  await site.build();

  const cwd = site.src();

  addEventListener("cms:updatedDocument", async (e) => {
    // @ts-ignore: Detail declared in the event.
    const { document } = e.detail;
    const { src } = document;

    await site.update(new Set([removePrefix(cwd, src)]));

    dispatch("previewUpdated", {
      src,
      url: getPreviewUrl(src),
    });
  });

  addEventListener("cms:createdDocument", async (e) => {
    // @ts-ignore: Detail declared in the event.
    const { document } = e.detail;
    const { src } = document;

    await site.update(new Set([removePrefix(cwd, src)]));

    dispatch("previewUpdated", {
      src,
      url: getPreviewUrl(src),
    });
  });

  addEventListener("cms:previewUrl", (e) => {
    // @ts-ignore: Detail declared in the event.
    e.detail.url = getPreviewUrl(e.detail.src);
  });

  function getPreviewUrl(src: string): string | undefined {
    for (const page of site.pages) {
      if (page.src.entry?.src === src) {
        return page.outputPath;
      }
    }

    for (const file of site.files) {
      if (file.entry?.src === src) {
        return file.outputPath;
      }
    }
  }

  const app = cms({
    cwd,
    basePath,
    appWrapper(app) {
      const previewer = new Hono({
        strict: false,
      });
      previewer.route(basePath, app);
      previewer.get(
        "*",
        serveStatic({
          root: removePrefix(cwd, site.dest()),
        }),
      );
      return previewer;
    },
  });

  app.storage("fs");

  if (options.versioning === "git") {
    app.versioning(
      new Git({
        root: cwd,
        prodBranch: "master",
      }),
    );
  }

  return app;
}

function removePrefix(prefix: string, path: string): string {
  if (path.startsWith(prefix)) {
    return path.slice(prefix.length);
  }

  return path;
}