import { DraftItemFormValue } from "./draft-review";

export function createEmptyMenuItem(): DraftItemFormValue {
  return {
    name: "",
    price: null,
    description: null,
    excluded: false,
    extractionIssues: [],
  };
}
