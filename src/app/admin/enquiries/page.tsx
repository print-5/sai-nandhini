"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  Briefcase,
  Search,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const res = await fetch("/api/admin/enquiries");
        const data = await res.json();
        if (Array.isArray(data)) {
          setEnquiries(data);
        } else {
          console.error("Invalid data format", data);
        }
      } catch (error) {
        console.error("Failed to fetch enquiries", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, []);

  const filteredEnquiries = enquiries.filter((enq) => {
    const matchesSearch =
      enq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enq.company?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filter === "All" || enq.type === filter;

    return matchesSearch && matchesFilter;
  });

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        toast.success("Enquiry status updated");
        setEnquiries(
          enquiries.map((enq) =>
            enq._id === id ? { ...enq, status: newStatus } : enq,
          ),
        );
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Corporate Booking":
        return <Briefcase size={14} />;
      case "Event Catering":
        return <Calendar size={14} />;
      case "Bulk Order":
        return <Users size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-black text-primary-dark tracking-tighter">
            Event Enquiries
          </h1>
          <p className="text-gray-400 font-medium">
            Manage corporate bookings and catering requests.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
          {["All", "Corporate Booking", "Event Catering", "Bulk Order"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === tab ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-primary"}`}
              >
                {tab}
              </button>
            ),
          )}
        </div>
      </header>

      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
        {/* Toolbar */}
        <div className="p-8 border-b border-gray-50 flex items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, email or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold text-primary-dark outline-none focus:bg-white focus:ring-2 ring-primary/10 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <th className="px-8 py-6 pl-10">Client Details</th>
                <th className="px-8 py-6">Request Type</th>
                <th className="px-8 py-6">Message / Requirements</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 pr-10 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Loader2 className="animate-spin" size={24} />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        Loading Requests...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-300">
                      <Briefcase size={40} strokeWidth={1} />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        No Enquiries Found
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enq, i) => (
                  <tr
                    key={enq._id}
                    className="group hover:bg-secondary/5 transition-colors"
                  >
                    <td className="px-8 py-6 pl-10">
                      <div className="flex flex-col">
                        <span className="font-bold text-primary-dark text-sm">
                          {enq.name}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          {enq.email}
                        </span>
                        <span className="text-[10px] text-primary/60 font-black tracking-wider mt-1">
                          {enq.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-primary shadow-sm">
                          {getTypeIcon(enq.type)}
                        </div>
                        <span className="text-xs font-bold text-gray-600">
                          {enq.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 max-w-xs">
                      <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">
                        {enq.message}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(enq.status)}`}
                      >
                        {enq.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 pr-10 text-right">
                      <div className="relative inline-block">
                        <select
                          value={enq.status}
                          onChange={(e) =>
                            updateStatus(enq._id, e.target.value)
                          }
                          className="appearance-none bg-gray-50 border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-widest rounded-xl px-3 py-2 pr-8 outline-none focus:ring-2 focus:ring-primary/20 hover:border-gray-300 transition-all cursor-pointer"
                        >
                          <option value="New">New</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
