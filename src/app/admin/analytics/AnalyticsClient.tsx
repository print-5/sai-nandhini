"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  PieChart,
  Search,
  ArrowRight,
  Star,
  TrendingUp,
  Award,
  CreditCard,
  Zap,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  PieChart as ReChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = ["#2F3E2C", "#C6A75E", "#8B4513", "#D2691E", "#CD853F"];

export default function AnalyticsClient({ initialData }: { initialData: any }) {
  const [data] = useState<any>(initialData);
  const [loading] = useState(false);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!data || data.error || !data.salesByCategory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-xl font-bold text-red-500 mb-2">
          Unable to load dashboard
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary-dark">
            Intelligence & Insights
          </h1>
          <p className="text-gray-400 mt-1 font-medium">
            Deep dive into your sales patterns and customer behavior.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => (window.location.href = "/api/admin/reports/orders")}
            className="bg-white px-6 py-4 rounded-2xl font-bold shadow-sm border border-gray-100 flex items-center gap-2 hover:bg-gray-50 transition-all text-primary-dark"
          >
            <Download size={20} />
            <span className="text-[12px] font-bold uppercase tracking-widest hidden md:inline">
              Download Report
            </span>
          </button>
          <div className="bg-primary/5 p-4 rounded-2xl flex items-center gap-4 border border-primary/5">
            <TrendingUp className="text-primary" />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Growth Index
              </p>
              <p className="text-sm font-bold text-primary">+24%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Category Performance */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-serif font-bold text-primary-dark flex items-center gap-2">
              <PieChart size={20} className="text-primary" /> Category Revenue
            </h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Distribution
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ReChart>
                  <Pie
                    data={data.salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="totalAmount"
                    nameKey="_id"
                  >
                    {data.salesByCategory.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "1rem",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: any) =>
                      `₹${(value || 0).toLocaleString()}`
                    }
                  />
                </ReChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {data.salesByCategory.map((cat: any, i: number) => (
                <div key={cat._id} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="font-bold text-primary-dark">
                        {cat._id}
                      </span>
                    </div>
                    <span className="font-bold text-gray-400">
                      ₹{cat.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(cat.totalAmount / data.salesByCategory[0].totalAmount) * 100}%`,
                      }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full rounded-full shadow-sm"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-serif font-bold text-primary-dark flex items-center gap-2">
              <Award size={20} className="text-primary" /> Top Delicacies
            </h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              By Revenue
            </span>
          </div>
          <div className="space-y-8">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={data.topProducts}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#F1F1F1"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fontSize: 10, fontWeight: 700, fill: "#2F3E2C" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "1rem",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: any) =>
                      `₹${(value || 0).toLocaleString()}`
                    }
                  />
                  <Bar
                    dataKey="totalSales"
                    fill="#C6A75E"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {data.topProducts.map((prod: any, i: number) => (
                <div
                  key={prod._id}
                  className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                >
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold text-primary text-xs">
                    {i + 1}
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-sm font-bold text-primary-dark line-clamp-1">
                      {prod.name}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                      {prod.totalQty} Units Sold
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary-dark">
                      ₹{prod.totalSales.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
          <h3 className="text-xl font-serif font-bold text-primary-dark mb-10 flex items-center gap-2">
            <CreditCard size={20} className="text-primary" /> Payment Mix
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ReChart>
                  <Pie
                    data={data.paymentMethods}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="totalAmount"
                    nameKey="_id"
                  >
                    {data.paymentMethods.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#2F3E2C" : "#C6A75E"}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "1rem",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: any) =>
                      `₹${(value || 0).toLocaleString()}`
                    }
                  />
                </ReChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {data.paymentMethods.map((method: any, index: number) => (
                <div
                  key={method._id}
                  className="p-4 bg-secondary/10 rounded-2xl border border-primary/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                      style={{
                        backgroundColor: index === 0 ? "#2F3E2C" : "#C6A75E",
                      }}
                    >
                      <Zap size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">
                        {method._id}
                      </p>
                      <p className="text-sm font-bold text-primary-dark">
                        ₹{method.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-primary">
                    {method.count} TRX
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-primary-dark p-10 rounded-[3rem] shadow-xl text-white relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h3 className="text-2xl font-serif font-bold mb-4 relative z-10">
            AI Strategy Insight
          </h3>
          <p className="text-primary-light font-medium leading-relaxed mb-8 relative z-10">
            Your "Sweets" category has grown by 40% this week. We recommend
            featuring **"Ghee Mysore Pak"** on the hero banner to drive more
            conversions during the upcoming festival season.
          </p>
          <button className="bg-white text-primary-dark px-8 py-4 rounded-2xl font-bold flex items-center gap-2 w-fit relative z-10 hover:bg-secondary transition-all active:scale-95">
            Apply Optimization <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
