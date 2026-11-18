/** Fails if support-api/lib/knowledge.js is out of date with data/*.ts. Fix: npm run support:knowledge */
import { buildKnowledge } from "../scripts/build-support-knowledge";
import { KNOWLEDGE } from "../support-api/lib/knowledge.js";

if (KNOWLEDGE !== buildKnowledge()) {
  console.error("✗ support-api/lib/knowledge.js is stale. Run: npm run support:knowledge");
  process.exit(1);
}
console.log("support knowledge: in sync with data files");
