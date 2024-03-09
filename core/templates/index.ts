import { labelify } from "../utils/string.ts";
import { getPath } from "../utils/path.ts";
import breadcrumb from "./breadcrumb.ts";

import type { CMSContent, SiteInfo, Versioning } from "../../types.ts";
import type Document from "../document.ts";
import type Collection from "../collection.ts";
import type Upload from "../upload.ts";

interface Props {
  options: CMSContent;
  collections: Record<string, Collection>;
  documents: Record<string, Document>;
  uploads: Record<string, Upload>;
  versioning?: Versioning;
  site: SiteInfo;
}

export default async function template(
  { options, collections, documents, uploads, versioning, site }: Props,
) {
  const { basePath } = options;
  const url = site.url
    ? `<p><a href="${site.url}" target="_blank">
      ${site.url} ↗
    </a></p>`
    : "";

  return `
${breadcrumb(options, await versioning?.current())}

<header class="header">
  <h1 class="header-title">
  ${site.name}
  </h1>
  <div class="header-description">
    ${site.description ?? ""}
    ${url}
  </div>
</header>

<ul class="list">
  ${
    Object.entries(collections).map(([name, collection]) => `
  <li>
    <a href="${getPath(basePath, "collection", name)}" class="list-item">
      <u-icon name="folder-fill"></u-icon>
      <div class="list-item-header">
        <strong>${labelify(name)}</strong>
        ${collection.description ? `<p>${collection.description}</p>` : ""}
      </div>
    </a>
  </li>`).join("")
  }

  ${
    Object.entries(documents).map(([name, document]) => `
  <li>
    <a
      href="${getPath(basePath, "document", name)}"
      class="list-item"
      title="${name}"
    >
      <u-icon name="file"></u-icon>
      <div class="list-item-header">
        <strong>${labelify(name)}</strong>
        ${document.description ? `<p>${document.description}</p>` : ""}
      </div>
    </a>
  </li>`).join("")
  }

  ${
    Object.entries(uploads).map(([name, upload]) => `
  <li>
    <a href="${getPath(basePath, "uploads", name)}" class="list-item">
      <u-icon name="image-square-fill"></u-icon>
      <div class="list-item-header">
        <strong>${labelify(name)}</strong>
        ${upload.description ? `<p>${upload.description}</p>` : ""}
      </div>
    </a>
  </li>`).join("")
  }

</ul>

${versioning && await versions(options, versioning) || ""}
`;
}

async function versions(options: CMSContent, versioning: Versioning) {
  return `
<header class="subheader" id="versions">
  <h2>Available versions</h2>
</header>

<ul class="list">
  ${
    (await Array.fromAsync(versioning)).map((version) => `
  <li>
    ${
      version.isCurrent
        ? `<span class="list-item">
            <u-icon class="is-version ${
          version.isProduction ? "is-production" : ""
        }" name="check-circle"></u-icon> ${version.name}
          </span>`
        : `<form class="list-item" method="post" action="${
          getPath(options.basePath, "versions", "change")
        }">
            <input type="hidden" name="name" value="${version.name}">
            <button>
              <u-icon name="circle"></u-icon>
              ${version.name}
            </button>
          </form>`
    }

    ${
      !version.isProduction &&
        `<u-confirm data-message="Are you sure?">
      <form method="post" action="${
          getPath(options.basePath, "versions", "delete")
        }">
        <input type="hidden" name="name" value="${version.name}">
        <button class="buttonIcon" aria-label="Delete">
          <u-icon name="trash"></u-icon>
        </button>
      </form>
    </u-confirm>` || ""
    }

    <form method="post" action="${
      getPath(options.basePath, "versions", "publish")
    }">
      <input type="hidden" name="name" value="${version.name}">
      <button class="button is-secondary">
        ${
      version.isProduction
        ? `<u-icon name="arrows-clockwise"></u-icon> Sync`
        : `<u-icon name="rocket-launch"></u-icon> Publish`
    }
      </button>
    </form>
  </li>`).join("")
  }
</ul>

  <u-modal-trigger data-target="modal-new-version">
    <button class="button is-secondary">New version</button>
  </u-modal-trigger>

  <dialog class="modal is-center" id="modal-new-version">
  <form
    method="post"
    action="${getPath(options.basePath, "versions", "create")}"
  >
    <div class="field">
      <label for="version-name">Name of the new version</label>
      <input
        id="version-name"
        class="input"
        type="text"
        required
        autofocus
        name="name"
      >

      <footer class="field-footer">
        <button class="button is-primary">Create version</button>
      </footer>
    </div>
  </form>
</dialog>
`;
}
