require("dotenv").config();
const mongoose = require("mongoose");
const QuoteConfig = require("../models/QuoteConfig");

/**
 * Fills the quotation configurator with sample rates so it can be exercised
 * end-to-end before the client's real price list is available.
 *
 * Run:  node scripts/seedQuotePricing.js
 * Undo: node scripts/seedQuotePricing.js --reset   (back to ₹0, names kept)
 *
 * The figures are plausible mid-market Indian rooftop rates rather than random
 * numbers, so totals land in a believable range and a wrong calculation is
 * obvious. They are still invented — every one must be replaced with the
 * client's actual pricing before this is shown to real customers, which is
 * what the --reset flag and the disclaimer below are for.
 */

// [name, sellingPrice, purchaseCost]
const PANELS = [
  ["Waaree", 32, 26], ["Adani", 34, 28], ["Australian Premium Solar", 30, 24],
  ["UTL", 29, 23], ["Novasys", 28, 22],
];

// [name, selling, cost, minKW, maxKW]
const INVERTERS = [
  ["Growatt", 8, 6.5, 1, 15], ["K-Solar", 7, 5.5, 1, 10], ["Waaree", 9, 7, 3, 25],
  ["Sunsathi", 6.5, 5, 1, 8], ["UTL", 7.5, 6, 2, 20], ["Solaire", 8.5, 7, 5, 50],
];

const STRUCTURES = [
  ["Standard GI", 4000, 3200], ["Heavy GI", 6500, 5200], ["Aluminium", 8000, 6400],
  ["Elevated", 11000, 8800], ["Designer", 14000, 11000], ["Customized Heavy", 16000, 12800],
];

const WALKWAY = [["No Walkway", 0, 0], ["Standard", 250, 190], ["Full", 400, 310], ["Customized", 550, 420]];
const RAILING = [["No Railing", 0, 0], ["Single Side", 180, 140], ["Double Side", 320, 250], ["Customized", 450, 350]];
const LADDER = [["No Ladder", 0, 0], ["Standard", 4500, 3500], ["Heavy Duty", 8500, 6800], ["Customized", 12000, 9500]];
const COVER = [["No Cover", 0, 0], ["Standard", 3500, 2700], ["Heavy Duty", 6500, 5000], ["Customized", 9000, 7000]];
const SPRINKLER = [
  ["No Sprinkler", 0, 0], ["Manual", 12000, 9000],
  ["Automatic", 28000, 22000], ["Complete Cleaning + Sprinkler", 45000, 35000],
];

const ADDONS = [
  ["Solar Inverter Protection Box", 3500, 2700],
  ["Solar Panel Water Sprinkler System", 2200, 1700],
  ["Fire Extinguisher", 2800, 2100],
  ["AMC with Cleaning", 900, 600],
  ["Solar Security Camera", 6500, 5000],
  ["Remote Monitoring + Live Camera", 18000, 14000],
  ["MSEDCL Load Extension", 15000, 11000],
  ["MSEDCL Name Change", 6000, 4500],
  ["Customized Decorative Heavy Structure", 15000, 12000],
  ["Solar Insurance", 1.5, 1.1], // percent of project value
  ["Solar Safety Kit", 4500, 3400],
  ["Solar Cleaning Brush", 2500, 1800],
  ["Pressure Pump / Motor", 9500, 7500],
  ["Solar Maintenance Walkway", 300, 230],
  ["Solar Maintenance Platform", 180, 140],
  ["Cable Tray & Service Walkway", 220, 170],
  ["Designer Elevated Solar Structure", 18000, 14000],
];

const SAMPLE_DISCLAIMER =
  "Sample rates shown for demonstration — final pricing is confirmed after a site survey.";

/** Applies rates by matching on option name, leaving anything unmatched at 0. */
const apply = (options, rates) => {
  for (const [name, price, cost, minKW, maxKW] of rates) {
    const option = options.find((o) => o.name === name);
    if (!option) continue;
    option.price = price;
    option.purchaseCost = cost;
    if (minKW !== undefined) option.minCapacityKW = minKW;
    if (maxKW !== undefined) option.maxCapacityKW = maxKW;
  }
};

const GROUPS = [
  "panelBrands", "inverterBrands", "structureTypes", "walkwayOptions", "railingOptions",
  "ladderOptions", "protectionCoverOptions", "sprinklerOptions", "addOns",
];

const run = async () => {
  const reset = process.argv.includes("--reset");
  await mongoose.connect(process.env.MONGO_URI);
  const config = await QuoteConfig.getSingleton();

  if (reset) {
    for (const group of GROUPS) {
      config[group].forEach((o) => {
        o.price = 0;
        o.purchaseCost = 0;
      });
    }
    Object.assign(config.charges, {
      transportation: 0, installation: 0, delivery: 0,
      msedclCharges: 0, extraMaterial: 0, siteSpecific: 0,
      discount: 0, specialDiscount: 0,
    });
    config.terms.disclaimer =
      "This is an indicative estimate generated from current rates. Final pricing is confirmed after a site survey.";
    await config.save();
    console.log("Reset: every rate back to ₹0. Option names kept.");
    console.log("The configurator is now hidden from the public site again.");
    await mongoose.disconnect();
    return;
  }

  apply(config.panelBrands, PANELS);
  apply(config.inverterBrands, INVERTERS);
  apply(config.structureTypes, STRUCTURES);
  apply(config.walkwayOptions, WALKWAY);
  apply(config.railingOptions, RAILING);
  apply(config.ladderOptions, LADDER);
  apply(config.protectionCoverOptions, COVER);
  apply(config.sprinklerOptions, SPRINKLER);
  apply(config.addOns, ADDONS);

  Object.assign(config.charges, {
    gstPercent: 13.8,
    transportation: 8000,
    installation: 15000,
    delivery: 3000,
    msedclCharges: 12000,
  });

  // Says plainly that the numbers are samples, for as long as they are live.
  config.terms.disclaimer = SAMPLE_DISCLAIMER;

  await config.save();

  const priced = GROUPS.reduce((n, g) => n + config[g].filter((o) => o.price > 0).length, 0);
  const total = GROUPS.reduce((n, g) => n + config[g].length, 0);
  console.log(`Seeded ${priced} of ${total} options with sample rates.`);
  console.log("The configurator is now visible on /pricing.");
  console.log("Undo with: node scripts/seedQuotePricing.js --reset");

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error("Failed:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
