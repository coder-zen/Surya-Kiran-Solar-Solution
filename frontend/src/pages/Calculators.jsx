import { useState } from "react";
import SeoHead from "../components/common/SeoHead";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import api from "../config/api";
import { rawCapacityForAnnualUnits, areaSqFtForCapacity } from "../utils/quotePricing";

/** ₹ per unit, used only to turn units back into a rupee saving figure. */
const UNIT_RATE_RUPEES = 8;
/** Share of the bill a correctly sized system displaces. */
const BILL_OFFSET = 0.85;
const COST_PER_KW = 55000;

/**
 * Solar Savings Calculator
 * Simplified estimation model (for lead-gen purposes only — NOT a formal quote).
 *
 * Sized from a year's units rather than one month's bill: consumption swings
 * hard between summer and winter, so any single month sizes the system wrong
 * in one direction or the other. Units rather than rupees because rupees would
 * have to be divided back through a slab tariff, and a wrong tariff moves the
 * answer by multiples.
 *
 *   units/year ÷ 12 ÷ 30 ÷ 4 units-per-kW-per-day = kW
 */
const SolarSavingsCalculator = () => {
  const [result, setResult] = useState(null);
  const { register, handleSubmit, getValues } = useForm({
    defaultValues: { annualUnits: 4800, roofArea: 300, location: "" },
  });

  const onCalculate = (data) => {
    const annualUnits = Number(data.annualUnits);
    const roofArea = Number(data.roofArea) || 0;

    const systemSizeKW = Math.max(1, Math.round(rawCapacityForAnnualUnits(null, annualUnits) * 10) / 10);
    const systemCost = systemSizeKW * COST_PER_KW;
    const monthlyBill = (annualUnits / 12) * UNIT_RATE_RUPEES;
    const monthlySavings = Math.round(monthlyBill * BILL_OFFSET);
    const paybackYears = Math.round((systemCost / (monthlySavings * 12)) * 10) / 10;
    const carbonOffsetKg = Math.round(systemSizeKW * 1.2 * 365); // ~1.2kg CO2 offset per kWh/day/kW
    const areaNeededSqFt = areaSqFtForCapacity(null, systemSizeKW);
    // Only judge the roof when they actually told us its size.
    const roofFits = roofArea > 0 ? roofArea >= areaNeededSqFt : null;

    setResult({ systemSizeKW, monthlySavings, paybackYears, carbonOffsetKg, systemCost, areaNeededSqFt, roofFits });
  };

  const { register: register2, handleSubmit: handleSubmit2, formState: { isSubmitting } } = useForm();
  const onRequestQuote = async (leadData) => {
    try {
      const values = getValues();
      await api.post("/enquiries", {
        ...leadData,
        message: `Solar Savings Calculator lead — Yearly usage: ${values.annualUnits} units, Estimated size: ${result?.systemSizeKW}kW (needs ~${result?.areaNeededSqFt} sq ft)`,
        source: "calculator",
      });
      toast.success("Thanks! Our team will call you with a detailed quote.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const chartData = result
    ? [
        { name: "System Cost", value: result.systemCost },
        { name: "5yr Savings", value: result.monthlySavings * 60 },
      ]
    : [];

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      <form onSubmit={handleSubmit(onCalculate)} className="glass-card !bg-gray-50 p-8 space-y-5">
        <div>
          <label className="section-label">Electricity Used Last Year (units / kWh)</label>
          <p className="text-xs text-gray-400 mt-0.5">
            The yearly total printed on your MSEDCL bill. A full year evens out the summer and
            winter swing, so the size comes out right.
          </p>
          <input
            type="number"
            {...register("annualUnits", { required: true, min: 100 })}
            className="input-field mt-1"
          />
        </div>
        <div>
          <label className="section-label">Available Roof Area (sq. ft.)</label>
          <input
            type="number"
            {...register("roofArea")}
            className="input-field mt-1"
          />
        </div>
        <div>
          <label className="section-label">City / Location</label>
          <input {...register("location")} placeholder="e.g. Pune" className="input-field mt-1" />
        </div>
        <button type="submit" className="btn-primary w-full">Calculate Savings</button>
      </form>

      <div className="glass-card !bg-white p-8">
        {!result && <p className="text-gray-400 text-center py-16">Fill the form to see your estimated savings.</p>}
        {result && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6 text-center">
              <div><p className="text-2xl font-display font-bold text-navy">{result.systemSizeKW}kW</p><p className="text-xs text-gray-500">Recommended Size</p></div>
              <div><p className="text-2xl font-display font-bold text-navy">₹{result.monthlySavings.toLocaleString()}</p><p className="text-xs text-gray-500">Monthly Savings</p></div>
              <div><p className="text-2xl font-display font-bold text-navy">{result.paybackYears} yrs</p><p className="text-xs text-gray-500">Payback Period</p></div>
              <div><p className="text-2xl font-display font-bold text-navy">{result.carbonOffsetKg.toLocaleString()} kg</p><p className="text-xs text-gray-500">Annual CO₂ Offset</p></div>
              <div className="col-span-2">
                <p className="text-2xl font-display font-bold text-navy">{result.areaNeededSqFt.toLocaleString()} sq ft</p>
                <p className="text-xs text-gray-500">Shadow-Free Roof Space Needed</p>
              </div>
            </div>

            {/* Only shown when they gave us a roof area to compare against. */}
            {result.roofFits !== null && (
              <p className={`text-sm text-center mb-6 ${result.roofFits ? "text-green-600" : "text-solar-orange"}`}>
                {result.roofFits
                  ? "Your roof has enough space for this system."
                  : "That's more roof than you listed — we can fit a smaller system, or survey the site for options."}
              </p>
            )}

            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                  <Cell fill="#0B2447" />
                  <Cell fill="#FFC93C" />
                </Pie>
                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>

            {/* Wraps on mobile: three fields plus a button do not fit a phone
                in one row. Email is here for the same reason as the quote
                modal — without it the customer gets no written follow-up. */}
            <form onSubmit={handleSubmit2(onRequestQuote)} className="mt-6 flex flex-wrap gap-2">
              <input {...register2("name", { required: true })} placeholder="Your Name" className="flex-1 min-w-[140px] rounded-lg border border-gray-200 px-3 py-2 text-sm" />
              <input {...register2("phone", { required: true })} placeholder="Phone" className="flex-1 min-w-[140px] rounded-lg border border-gray-200 px-3 py-2 text-sm" />
              <input type="email" {...register2("email", { required: true })} placeholder="Email" className="flex-1 min-w-[180px] rounded-lg border border-gray-200 px-3 py-2 text-sm" />
              <button disabled={isSubmitting} className="btn-primary !px-4 !py-2 text-sm shrink-0">Get Quote</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * EMI Calculator — standard reducing-balance EMI formula.
 */
const EMICalculator = () => {
  const [loan, setLoan] = useState(200000);
  const [rate, setRate] = useState(10);
  const [tenure, setTenure] = useState(5);

  const monthlyRate = rate / 12 / 100;
  const months = tenure * 12;
  const emi = loan && monthlyRate
    ? Math.round((loan * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1))
    : 0;
  const totalPayment = emi * months;
  const totalInterest = totalPayment - loan;

  const chartData = Array.from({ length: tenure }).map((_, i) => ({
    year: `Yr ${i + 1}`,
    balance: Math.round(loan - (loan / tenure) * (i + 1)),
  }));

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      <div className="glass-card !bg-gray-50 p-8 space-y-6">
        <div>
          <label className="section-label">Loan Amount (₹): {loan.toLocaleString()}</label>
          <input type="range" min="50000" max="2000000" step="10000" value={loan} onChange={(e) => setLoan(Number(e.target.value))} className="w-full mt-2" />
        </div>
        <div>
          <label className="section-label">Interest Rate (%): {rate}</label>
          <input type="range" min="5" max="18" step="0.5" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full mt-2" />
        </div>
        <div>
          <label className="section-label">Tenure (Years): {tenure}</label>
          <input type="range" min="1" max="15" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full mt-2" />
        </div>
      </div>

      <div className="glass-card !bg-white p-8">
        <div className="grid grid-cols-3 gap-4 text-center mb-6">
          <div><p className="text-xl font-display font-bold text-navy">₹{emi.toLocaleString()}</p><p className="text-xs text-gray-500">Monthly EMI</p></div>
          <div><p className="text-xl font-display font-bold text-navy">₹{totalInterest.toLocaleString()}</p><p className="text-xs text-gray-500">Total Interest</p></div>
          <div><p className="text-xl font-display font-bold text-navy">₹{totalPayment.toLocaleString()}</p><p className="text-xs text-gray-500">Total Payment</p></div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
            <Line type="monotone" dataKey="balance" stroke="#FF7A00" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const Calculators = () => {
  const [tab, setTab] = useState("savings");

  return (
    <>
      <SeoHead title="Solar & EMI Calculators" path="/calculators" description="Estimate your solar savings and EMI with SK Solar Solutions' free online calculators." />
      <section className="pt-32 pb-12 bg-navy-gradient text-white text-center">
        <div className="container-custom">
          <h1 className="text-4xl lg:text-5xl font-display font-bold">Solar Savings & EMI Calculators</h1>
          <p className="mt-4 text-gray-300 max-w-xl mx-auto">Estimate your savings and financing options instantly.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="flex justify-center gap-2 mb-10">
            <button onClick={() => setTab("savings")} className={`option-btn ${tab === "savings" ? "bg-navy text-white" : "bg-gray-100 text-gray-600"}`}>Solar Savings</button>
            <button onClick={() => setTab("emi")} className={`option-btn ${tab === "emi" ? "bg-navy text-white" : "bg-gray-100 text-gray-600"}`}>EMI Calculator</button>
          </div>
          {tab === "savings" ? <SolarSavingsCalculator /> : <EMICalculator />}
          <p className="terms-text text-center mt-8 max-w-xl mx-auto">
            Figures shown are indicative estimates for planning purposes only and do not constitute a
            binding quote. Actual system sizing, cost, and savings depend on a physical site survey.
          </p>
        </div>
      </section>
    </>
  );
};

export default Calculators;
