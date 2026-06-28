import { initializeTimestampRevealer } from "./content-logic";

if (typeof chrome !== "undefined" && chrome?.runtime) {
  initializeTimestampRevealer();
}
