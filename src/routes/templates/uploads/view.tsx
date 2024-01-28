import { getPath } from "../../../utils/path.ts";
import { format } from "std/fmt/bytes.ts";

interface Props {
  file: string;
  publicPath: string;
  type: string;
  size: number;
  collection: string;
}

export default function Template(
  { type, file, collection, size, publicPath }: Props,
) {
  const src = getPath("uploads", collection, "raw", file);

  return (
    <>
      <nav aria-label="You are here:">
        <ul class="breadcrumb">
          <li>
            <a href={getPath()}>Home</a>
          </li>
          <li>
            <a href={getPath("uploads", collection)}>{collection}</a>
          </li>
          <li>
            <a>{file}</a>
          </li>
        </ul>
      </nav>
      <header class="header">
        <h1 class="header-title">
          Details of
          <input
            class="input is-inline"
            id="_id"
            type="text"
            name="_id"
            value={file}
            placeholder="Rename the file…"
            form="form-edit"
            aria-label="File name"
            required
          />
        </h1>
        <dl class="header-description">
          <dt>Public path:</dt>
          <dd>
            {publicPath} <u-copy text={publicPath}></u-copy>
          </dd>
          <dt>Type:</dt>
          <dd>{type}</dd>
          <dt>Size:</dt>
          <dd>{format(size)}</dd>
        </dl>
      </header>

      <form
        method="post"
        class="form"
        enctype="multipart/form-data"
        id="form-edit"
      >
        <div class="field">
          <input
            aria-label="Update"
            id="new-file"
            type="file"
            name="file"
            class="inputFile"
          />
        </div>
        <footer class="footer ly-rowStack">
          <button class="button is-primary" type="submit">
            <u-icon name="check" />
            Update file
          </button>
          <u-confirm data-message="Are you sure?">
            <button
              class="button is-secondary"
              formAction={getPath("uploads", collection, "delete", file)}
            >
              <u-icon name="trash" />
              Delete
            </button>
          </u-confirm>
        </footer>
      </form>

      <figure class="preview">
        <u-preview class="preview-media" data-src={src} />
        <figcaption class="preview-caption">
          <a href={src} download={file} class="button is-secondary">
            <u-icon name="download-simple" />
            Download file
          </a>
        </figcaption>
      </figure>
    </>
  );
}
