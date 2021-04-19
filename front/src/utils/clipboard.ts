import { VISIT_LINK } from "./config";
import type { LinkModel } from "../model/link-model";

export function copy(link: LinkModel) {
  if (navigator.clipboard) {
    return navigator.clipboard
      .writeText(VISIT_LINK(link.shortURL))
      .catch(function (err) {
        throw err !== undefined
          ? err
          : new DOMException("The request is not allowed", "NotAllowedError");
      });
  }
}
