const { v4: uuidv4 } = require("uuid");

/**
 * Simple PO number generator: PO-<timestamp>-<shortuuid>
 * You can replace with a DB-sequence for production.
 */
function generatePoNumber() {
  const short = uuidv4().split("-")[0].toUpperCase();
  const ts = Date.now().toString().slice(-6);
  return `PO-${ts}-${short}`;
}

module.exports = generatePoNumber;
