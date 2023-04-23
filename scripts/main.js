/**
 * Start using "FIXME:", "TODO:", "HACK" and "BUG" comments
 * FIXME comments are often used to indicate code that does not work correctly
 * or that may not work in all supported environments
 *
 * Modules:
 * Usage:
 * Note:
 * To do:
 * Issue:
 */

import database from "./database.js";
import features from "./features.js";
import items from "./items.js";
import spells from "./spells.js";
import utils from "./utils.js";

globalThis.feanor = {database, features, items, spells, utils};
