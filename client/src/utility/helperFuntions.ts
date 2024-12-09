type ChipAllowedValues =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

interface MyObject {
  [key: string]: ChipAllowedValues;
}
export const getChipColor = (value: string) => {
  let ChipColor: MyObject = {
    PENDING: "warning",
    SUCCESS: "success",
    COMPLETED: "success",
    PROCESSED: "success",
    FAILED: "error",
    DELETED: "error",
  };
  if (value in ChipColor) {
    return ChipColor[value];
  }
  return "primary";
};
