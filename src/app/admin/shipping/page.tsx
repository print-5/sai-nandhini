"use client";

import { useState, useEffect } from "react";
import { Truck, Plus, Trash2, Save, Loader2, Package } from "lucide-react";
import toast from "react-hot-toast";

interface ShippingRate {
  _id?: string;
  minAmount: number;
  maxAmount: number;
  rate: number;
}

export default function ShippingManagementPage() {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newRate, setNewRate] = useState<ShippingRate>({
    minAmount: 0,
    maxAmount: 0,
    rate: 0,
  });

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await fetch("/api/admin/shipping-rates");
      const data = await res.json();
      setRates(data);
    } catch (error) {
      toast.error("Failed to load shipping rates");
    } finally {
      setLoading(false);
    }
  };

  const addRate = async () => {
    if (newRate.minAmount >= newRate.maxAmount) {
      toast.error("Min amount must be less than max amount");
      return;
    }
    if (newRate.rate <= 0) {
      toast.error("Rate must be greater than 0");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/shipping-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRate),
      });

      if (res.ok) {
        toast.success("Shipping rate added successfully");
        setNewRate({ minAmount: 0, maxAmount: 0, rate: 0 });
        fetchRates();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to add rate");
      }
    } catch (error) {
      toast.error("Failed to add shipping rate");
    } finally {
      setSaving(false);
    }
  };

  const deleteRate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this shipping rate?")) return;

    try {
      const res = await fetch(`/api/admin/shipping-rates/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Shipping rate deleted");
        fetchRates();
      } else {
        toast.error("Failed to delete rate");
      }
    } catch (error) {
      toast.error("Failed to delete shipping rate");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Truck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary-dark">
                Shipping Management
              </h1>
              <p className="text-gray-500 text-sm">
                Manage amount-based shipping rates
              </p>
            </div>
          </div>
        </div>

        {/* Add New Rate Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-xl font-bold text-primary-dark mb-6 flex items-center gap-2">
            <Plus size={20} />
            Add New Shipping Rate
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">
                Min Amount (₹)
              </label>
              <input
                type="number"
                step="1"
                value={newRate.minAmount}
                onChange={(e) =>
                  setNewRate({
                    ...newRate,
                    minAmount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full border border-gray-300 rounded-lg py-3 px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">
                Max Amount (₹)
              </label>
              <input
                type="number"
                step="1"
                value={newRate.maxAmount}
                onChange={(e) =>
                  setNewRate({
                    ...newRate,
                    maxAmount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full border border-gray-300 rounded-lg py-3 px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">
                Rate (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={newRate.rate}
                onChange={(e) =>
                  setNewRate({
                    ...newRate,
                    rate: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full border border-gray-300 rounded-lg py-3 px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={addRate}
                disabled={saving}
                className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <Plus size={18} />
                    Add Rate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Existing Rates */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-primary-dark mb-6 flex items-center gap-2">
            <Package size={20} />
            Current Shipping Rates
          </h2>

          {rates.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Truck size={48} className="mx-auto mb-4 opacity-30" />
              <p>No shipping rates configured yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rates.map((rate) => (
                <div
                  key={rate._id}
                  className="flex items-center justify-between p-5 border border-gray-200 rounded-xl hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                        Amount Range
                      </p>
                      <p className="text-lg font-bold text-primary-dark">
                        ₹{rate.minAmount} - ₹{rate.maxAmount}
                      </p>
                    </div>
                    <div className="h-12 w-px bg-gray-200" />
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                        Shipping Rate
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        ₹{rate.rate}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteRate(rate._id!)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-3 rounded-lg transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
