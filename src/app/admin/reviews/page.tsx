"use client";

import { useState, useEffect } from "react";
import {
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  MessageSquare,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import ConfirmationModal from "@/components/admin/ConfirmationModal";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'pending', 'approved'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?filter=${filter}`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isApproved: !currentStatus }),
      });
      if (res.ok) {
        toast.success(
          !currentStatus ? "Review approved!" : "Review unapproved.",
        );
        fetchReviews();
      } else {
        toast.error("Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Review deleted.");
        fetchReviews();
      } else {
        toast.error("Failed to delete review.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setIsModalOpen(false);
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary-dark">
            Product Reviews
          </h1>
          <p className="text-gray-400 mt-1 font-medium">
            Manage customer reviews and ratings.
          </p>
        </div>
        <div className="flex gap-4">
          {["all", "pending", "approved"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 rounded-2xl font-bold text-sm tracking-wide capitalize transition-all ${
                filter === f
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reviews.map((review, i) => (
          <motion.div
            key={review._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-white p-8 rounded-[3rem] shadow-sm border-2 transition-all ${
              review.isApproved ? "border-green-100" : "border-orange-100"
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                  {review.user?.name?.[0] || "A"}
                </div>
                <div>
                  <h3 className="font-bold text-primary-dark">
                    {review.user?.name || "Anonymous"}
                  </h3>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        size={14}
                        className={
                          index < review.rating ? "fill-current" : "opacity-30"
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Product
              </p>
              <div className="font-bold text-primary text-sm line-clamp-1">
                {review.product?.name || "Unknown Product"}
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-8 leading-relaxed italic relative">
              <MessageSquare
                size={20}
                className="absolute -top-2 -left-3 text-gray-100 -z-10"
              />
              "{review.comment}"
            </p>

            <div className="flex gap-3 pt-6 border-t border-gray-100">
              <button
                onClick={() => toggleApproval(review._id, review.isApproved)}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all ${
                  review.isApproved
                    ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                    : "bg-green-50 text-green-600 hover:bg-green-100"
                }`}
              >
                {review.isApproved ? (
                  <>
                    <XCircle size={16} /> Reject
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Approve
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setDeleteId(review._id);
                  setIsModalOpen(true);
                }}
                className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </motion.div>
        ))}

        {reviews.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-[3rem] border border-gray-100">
            <MessageSquare size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
              No reviews found.
            </p>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setDeleteId(null);
        }}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        type="danger"
        confirmText="Delete Review"
      />
    </div>
  );
}
