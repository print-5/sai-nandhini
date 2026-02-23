"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  ChevronRight,
  UserCheck,
  ShieldAlert,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/admin/customers");
        const json = await res.json();
        if (Array.isArray(json)) {
          setCustomers(json);
        } else {
          console.error("API did not return an array:", json);
          setCustomers([]);
        }
      } catch (err) {
        console.error(err);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-10">
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary-dark">
            Customer Database
          </h1>
          <p className="text-gray-400 mt-1 font-medium">
            Manage your relationships and view customer lifetime value.
          </p>
        </div>
        <div className="relative w-72">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-transparent focus:border-primary/20 rounded-2xl py-4 pl-12 pr-6 outline-none transition-all shadow-sm font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((customer, i) => (
          <motion.div
            key={customer._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary font-bold text-xl relative">
                {customer.name[0]}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-lg border-4 border-white flex items-center justify-center text-white">
                  <UserCheck size={10} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-primary-dark">
                  {customer.name}
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  <Calendar size={12} /> Joined{" "}
                  {new Date(customer.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                <Mail size={16} className="text-gray-400" /> {customer.email}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                <Phone size={16} className="text-gray-400" />{" "}
                {customer.phone || "N/A"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-50">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Total Orders
                </p>
                <div className="flex items-center gap-2 font-bold text-primary-dark">
                  <ShoppingBag size={16} className="text-primary" />{" "}
                  {customer.orderCount}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Lifetime Value
                </p>
                <p className="font-bold text-primary text-lg">
                  ₹{customer.totalSpent.toLocaleString()}
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                router.push(
                  `/admin/orders?search=${encodeURIComponent(customer.name)}`,
                )
              }
              className="w-full mt-8 py-4 bg-gray-50 rounded-2xl text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-center gap-2 group"
            >
              View Purchase History{" "}
              <ChevronRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100">
          <ShieldAlert size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
            No customers found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
