import { Wifi, RefreshCw, Home, Phone } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "You're Offline | Sai Nandhini Tasty World",
  description: "You're currently offline. Please check your internet connection.",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#ece0cc] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#234d1b]/10">
          {/* Offline Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-[#234d1b]/10 rounded-full flex items-center justify-center">
            <Wifi size={40} className="text-[#234d1b]/50" />
          </div>
          
          {/* Title */}
          <h1 className="text-2xl font-serif font-black text-[#234d1b] mb-4">
            You're Offline
          </h1>
          
          {/* Description */}
          <p className="text-[#234d1b]/60 mb-8 leading-relaxed">
            It looks like you've lost your internet connection. Don't worry, some content is still available offline.
          </p>
          
          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-3 bg-[#234d1b] text-white py-3 px-6 rounded-xl font-bold hover:bg-[#234d1b]/90 transition-colors"
            >
              <RefreshCw size={20} />
              Try Again
            </button>
            
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-3 bg-[#f8bf51] text-[#234d1b] py-3 px-6 rounded-xl font-bold hover:bg-[#f8bf51]/90 transition-colors"
            >
              <Home size={20} />
              Go Home
            </Link>
          </div>
          
          {/* Contact Info */}
          <div className="mt-8 pt-6 border-t border-[#234d1b]/10">
            <p className="text-sm text-[#234d1b]/50 mb-3">
              Need help? Contact us:
            </p>
            <a
              href="tel:+919600916065"
              className="inline-flex items-center gap-2 text-[#234d1b] font-medium hover:text-[#f8bf51] transition-colors"
            >
              <Phone size={16} />
              +91 96009 16065
            </a>
          </div>
        </div>
        
        {/* Footer */}
        <p className="text-xs text-[#234d1b]/40 mt-6">
          Some features may be limited while offline
        </p>
      </div>
    </div>
  );
}