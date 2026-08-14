// react-select's `filterOption` signature: `option.data` is the original
// option object passed in `selectData`/`options`, so this works whether the
// short code is embedded in the visible label (Sale's product picker) or
// kept as a separate `shortId` field alongside a plain-name label
// (Purchase's product picker, which needs the label to be just the name for
// correct "Create X" matching in the creatable select).
export const searchByLabelOrShortId = (
  option: { label: string; data?: { shortId?: string } },
  inputValue: string,
): boolean => {
  const search = inputValue.trim().toLowerCase();
  if (!search) {
    return true;
  }
  return (
    option.label.toLowerCase().includes(search) ||
    !!option.data?.shortId?.toLowerCase().includes(search)
  );
};

export default searchByLabelOrShortId;
