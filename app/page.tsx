"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  PieChart,
  Receipt,
  BellRing,
  Wallet,
  CheckCircle2,
  ChevronDown,
  Plus,
  Sparkles,
  CreditCard,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface Transaction {
  id: string;
  name: string;
  category: string;
  amount: number;
  time: string;
  iconBg: string;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "1", name: "Figma Subscription", category: "Software", amount: 15.0, time: "2h ago", iconBg: "bg-purple-500/20 text-purple-400" },
  { id: "2", name: "Blue Bottle Coffee", category: "Food & Drink", amount: 6.8, time: "4h ago", iconBg: "bg-amber-500/20 text-amber-400" },
  { id: "3", name: "AWS Cloud Services", category: "Hosting", amount: 64.2, time: "Yesterday", iconBg: "bg-orange-500/20 text-orange-400" },
];

export default function Home() {

  // --- Dashboard Interactive State ---
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [balance, setBalance] = useState<number>(4280.5);
  const [spentThisMonth, setSpentThisMonth] = useState<number>(1420.0);
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");

  // --- Calculator State ---
  const [monthlyIncome, setMonthlyIncome] = useState<number>(6500);
  const [savingsRate, setSavingsRate] = useState<number>(30);

  // --- Billing State ---
  const [annualBilling, setAnnualBilling] = useState<boolean>(true);

  // --- FAQ State ---
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newAmount);
    if (!newTitle.trim() || isNaN(val) || val <= 0) return;

    const newTx: Transaction = {
      id: Date.now().toString(),
      name: newTitle.trim(),
      category: "Quick Log",
      amount: val,
      time: "Just now",
      iconBg: "bg-emerald-500/20 text-emerald-400",
    };

    setTransactions([newTx, ...transactions.slice(0, 3)]);
    setBalance((prev) => Math.max(0, prev - val));
    setSpentThisMonth((prev) => prev + val);
    setNewTitle("");
    setNewAmount("");
  };

  const calculatedSavings = (monthlyIncome * (savingsRate / 100));
  const calculatedMaxSpend = monthlyIncome - calculatedSavings;
  const annualSavings = calculatedSavings * 12;

  const faqs = [
    {
      q: "Does this require linking directly to my bank accounts?",
      a: "No! ExpenseTracker don't require any bank connections. ",
    },
    {
      q: "How does the AI detect subscription price hikes?",
      a: "Our AI model monitors recurring transaction intervals and merchant IDs. Whenever a known subscription increases by even ₦0.50, an alert is dispatched prior to next month's bill.",
    },
    {
      q: "Can I export data for tax season?",
      a: "Yes! Export one-click categorized summaries in CSV, JSON, or IRS/HMRC-ready PDF formats filtered by calendar year or custom business tax quarter.",
    },
    {
      q: "Is there a free tier?",
      a: "Yes. Our Starter plan is 100% free forever for up to 2 accounts and unlimited manual & CSV expense logging.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 antialiased overflow-x-hidden">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-emerald-500/15 via-teal-500/10 to-transparent blur-3xl rounded-full" />
        <div className="absolute top-[35%] right-[-10%] w-[500px] h-[400px] bg-cyan-500/10 blur-3xl rounded-full" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Wallet className="h-5 w-5 text-slate-950" />
            </div>
            <span>Expense<span className="text-emerald-400">Tracker</span></span>
          </div>

          {/* <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400 font-medium">
            <a href="#features" className="hover:text-slate-100 transition-colors">Features</a>
            <a href="#simulator" className="hover:text-slate-100 transition-colors">Runway Simulator</a>
            <a href="#pricing" className="hover:text-slate-100 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-slate-100 transition-colors">FAQ</a>
          </nav> */}

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 transition">
              Sign In
            </Link>
            <Link href="/signup" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm px-4 py-2 rounded-lg shadow-md shadow-emerald-500/20 transition-all active:scale-95">
              Start Free
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium mb-8 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>AI-Driven Realtime Financial Clarity</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              0.1s Zero-Latency Sync
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
            Master every Naira <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              without manual spreadsheets.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Effortlessly monitor personal finances, detect rogue micro-subscriptions, and simulate financial runways with sub-millisecond precision.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/signup" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/20 transition-all active:scale-95 group">
              Start Tracking Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            {/* <a
              href="#interactive-demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-semibold text-base transition-colors"
            >
              Try Live Demo Below
            </a> */}
          </div>

          {/* Trust Badges */}
        </section>

        {/* INTERACTIVE DEMO COMPONENT */}
        <section id="interactive-demo" className="py-12 px-6 max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">Interactive Sandbox</span>
            <h2 className="text-2xl font-bold mt-1 text-slate-100">Experience the live dashboard widget</h2>
            <p className="text-sm text-slate-400 mt-1">Add a mock transaction to observe real-time recalculations</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-md">
            {/* Top Mock Window Bar */}
            <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">app.expensetracker.io/dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Sync
              </div>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Balances & Stats */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="text-xs font-medium text-slate-400">Total Checking Balance</div>
                  <div className="text-3xl font-extrabold text-white mt-1">
                    ₦{balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2 font-medium">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+₦340.20 cashflow this cycle</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="flex justify-between items-center text-xs font-medium text-slate-400 mb-1">
                    <span>Monthly Target Spend</span>
                    <span className="text-slate-300 font-bold">₦{spentThisMonth.toFixed(0)} / ₦2,500</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (spentThisMonth / 2500) * 100)}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">
                    {((spentThisMonth / 2500) * 100).toFixed(0)}% of month limit reached
                  </div>
                </div>

                {/* Quick Add Mock Form */}
                <form onSubmit={handleAddExpense} className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-3">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Quick-Record Mock Expense
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="e.g. Spotify, Dinner, Taxi"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1.5 text-xs text-slate-500">₦</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-6 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      Log
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Recent Transactions Feed */}
              <div className="lg:col-span-2 bg-slate-950/50 rounded-xl border border-slate-800 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm text-slate-200">Recent Stream Activity</h3>
                    <span className="text-xs text-slate-500 font-mono">Updated real-time</span>
                  </div>

                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-850 hover:border-slate-700/80 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg text-xs font-semibold ${tx.iconBg}`}>
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-xs sm:text-sm text-slate-100">{tx.name}</div>
                            <div className="text-[11px] text-slate-500">{tx.category} • {tx.time}</div>
                          </div>
                        </div>
                        <div className="font-semibold text-sm text-rose-400">
                          -₦{tx.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400">
                  <span>Categories automatically partitioned</span>
                  <span className="text-emerald-400 hover:underline cursor-pointer flex items-center gap-1">
                    Export statement <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
              Engineered for absolute budget certainty
            </h2>
            <p className="text-slate-400 text-base">
              Say goodbye to end-of-the-month spending shock. Kudoflow equips you with proactive alerts and autonomous tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Automated OCR Snap</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Take a picture of any restaurant receipt, grocery bill, or invoice. The app extracts line items, tips, and taxes in milliseconds.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
                <BellRing className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Ghost Charge Watchdog</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Flags double charges, silent subscription price hikes, and forgotten trial roll-overs before your bank balance takes the hit.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5">
                <PieChart className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Dynamic Multi-Currency</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Traveling or spending internationally? Real-time forex rates normalize all your transactions automatically to your primary fiat.
              </p>
            </div>
          </div>
        </section>

        {/* FINANCIAL RUNWAY SIMULATOR */}
        <section id="simulator" className="py-16 px-6 max-w-5xl mx-auto">
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-8 sm:p-12 shadow-xl">
            <div className="max-w-2xl mb-8">
              <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Interactive Tool</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Savings & Runway Predictor</h2>
              <p className="text-slate-400 text-sm mt-2">
                Adjust your expected monthly net income and target savings percentage to preview your safe-spend allowance and wealth build-up.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-medium mb-2 text-slate-300">
                    <span>Monthly Take-Home</span>
                    <span className="font-mono text-emerald-400 font-bold">₦{monthlyIncome.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="1500"
                    max="25000"
                    step="250"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>₦1,500</span>
                    <span>₦25,000+</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-medium mb-2 text-slate-300">
                    <span>Target Savings Rate</span>
                    <span className="font-mono text-teal-400 font-bold">{savingsRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="70"
                    step="5"
                    value={savingsRate}
                    onChange={(e) => setSavingsRate(Number(e.target.value))}
                    className="w-full accent-teal-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>5%</span>
                    <span>70%</span>
                  </div>
                </div>
              </div>

              {/* Calculator Output Display */}
              <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Safe Maximum Spend / Mo:</span>
                  <span className="text-lg font-mono font-bold text-slate-100">
                    ₦{calculatedMaxSpend.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Monthly Retained Wealth:</span>
                  <span className="text-lg font-mono font-bold text-emerald-400">
                    +₦{calculatedSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="pt-1">
                  <div className="text-xs text-slate-500">12-Month Projected Reservoir</div>
                  <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-mono mt-0.5">
                    ₦{annualSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-3">Transparent, fair pricing</h2>
            <p className="text-slate-400 text-sm">Save thousands in leaked subscriptions for less than the cost of one lunch.</p>

            <div className="mt-6 inline-flex items-center bg-slate-900 border border-slate-800 rounded-full p-1 text-xs">
              <button
                onClick={() => setAnnualBilling(false)}
                className={`px-4 py-1.5 rounded-full font-medium transition ${
                  !annualBilling ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnualBilling(true)}
                className={`px-4 py-1.5 rounded-full font-medium transition flex items-center gap-1.5 ${
                  annualBilling ? "bg-emerald-500 text-slate-950 font-bold shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Annual <span className="text-[10px] bg-emerald-900/40 text-emerald-100 px-1.5 py-0.2 rounded-full">Save 25%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-7 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-200">Starter</h3>
                <p className="text-xs text-slate-400 mt-1">For basic individual budgeting.</p>
                <div className="mt-5 mb-6">
                  <span className="text-4xl font-extrabold text-white">₦0</span>
                  <span className="text-xs text-slate-500 ml-1">/ forever</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Up to 2 Bank/Card connections</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Manual & CSV imports</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Standard categorization</li>
                </ul>
              </div>
              <button className="mt-8 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs transition">
                Get Started
              </button>
            </div>

            {/* Pro (Highlighted) */}
            <div className="rounded-2xl bg-slate-900/80 border-2 border-emerald-500/80 p-7 flex flex-col justify-between relative shadow-2xl shadow-emerald-500/10">
              <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider bg-emerald-500 text-slate-950 uppercase">
                Most Popular
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Pro Trader & Saver</h3>
                <p className="text-xs text-slate-400 mt-1">Autonomous micro-auditing & OCR.</p>
                <div className="mt-5 mb-6">
                  <span className="text-4xl font-extrabold text-white">{annualBilling ? "$7" : "$9"}</span>
                  <span className="text-xs text-slate-500 ml-1">/ month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-200">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited accounts & cards</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Receipt OCR scanner (Unlimited)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Recurring price hike alert system</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Multi-currency auto-conversion</li>
                </ul>
              </div>
              <button className="mt-8 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/25">
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Business / Family */}
            <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-7 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-200">Family & Team</h3>
                <p className="text-xs text-slate-400 mt-1">Multi-user budgeting & sync.</p>
                <div className="mt-5 mb-6">
                  <span className="text-4xl font-extrabold text-white">{annualBilling ? "$18" : "$24"}</span>
                  <span className="text-xs text-slate-500 ml-1">/ month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Everything in Pro</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Up to 5 member seats</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Tax write-off tagging & export</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Priority 24/7 support</li>
                </ul>
              </div>
              <button className="mt-8 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs transition">
                Choose Family & Team
              </button>
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section id="faq" className="py-16 px-6 max-w-3xl mx-auto border-t border-slate-850">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-800/80 bg-slate-900/40 overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-5 py-4 text-left flex justify-between items-center text-sm font-semibold text-slate-200 hover:text-white"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-emerald-400" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-850/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-20 px-6 text-center">
          <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 p-10 sm:p-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Stop worrying about where your money goes.
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base mb-8">
              Join thousands of individuals track your funds and have your finances in control.
            </p>
            <Link href="/signup" className="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm sm:text-base shadow-xl shadow-emerald-500/25 transition-transform active:scale-95">
              Create Your Free Account
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-[10px]">
              E
            </div>
            <span>© {new Date().getFullYear()} ExpenseTracker Inc. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <a href="#" className="hover:text-slate-300">Security Architecture</a>
          </div>
        </div>
      </footer>
    </div>
  );
}