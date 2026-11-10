import { generateApi } from "./api/generate";

const check = process.argv.includes("--check");
const result = generateApi({ check });

if (check) {
  if (result.ok) {
    console.log("API reference is up to date.");
  } else {
    process.exitCode = 1;
  }
} else {
  console.log(`Generated ${result.files.length} API files.`);
}
