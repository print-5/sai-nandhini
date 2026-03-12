interface LoadingSpinnerProps {
  section?: "hero" | "categories" | "products" | "dashboard" | "general";
  size?: "sm" | "md" | "lg";
}

export default function LoadingSpinner({ 
  section = "general", 
  size = "md" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const getSectionContent = () => {
    switch (section) {
      case "hero":
        return (
          <div className="h-[500px] bg-[#ece0cc] flex items-center justify-center">
            <div className="text-center">
              <div className={`${sizeClasses[size]} border-4 border-[#f8bf51] border-t-transparent rounded-full animate-spin mx-auto mb-4`} />
              <p className="text-[#234d1b] font-medium text-sm">Loading hero content...</p>
            </div>
          </div>
        );
      
      case "categories":
        return (
          <section className="py-28 bg-[#ece0cc]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <div className="h-6 bg-[#234d1b]/10 rounded w-32 mx-auto mb-4 animate-pulse" />
                <div className="h-12 bg-[#234d1b]/10 rounded w-64 mx-auto mb-4 animate-pulse" />
                <div className="h-4 bg-[#234d1b]/10 rounded w-96 mx-auto animate-pulse" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-[400px] bg-[#234d1b]/10 rounded-3xl animate-pulse" />
                ))}
              </div>
            </div>
          </section>
        );
      
      case "products":
        return (
          <section className="py-28 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-end mb-14">
                <div>
                  <div className="h-4 bg-[#234d1b]/10 rounded w-32 mb-3 animate-pulse" />
                  <div className="h-12 bg-[#234d1b]/10 rounded w-48 animate-pulse" />
                </div>
                <div className="h-10 bg-[#234d1b]/10 rounded w-32 animate-pulse" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex flex-col">
                    <div className="aspect-square bg-[#234d1b]/10 rounded-2xl mb-4 animate-pulse" />
                    <div className="h-4 bg-[#234d1b]/10 rounded w-full mb-2 animate-pulse" />
                    <div className="h-6 bg-[#234d1b]/10 rounded w-20 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      
      case "dashboard":
        return (
          <div className="space-y-8 pb-20">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
              <div className="h-12 bg-[#234d1b]/10 rounded w-64 mb-4 animate-pulse" />
              <div className="h-4 bg-[#234d1b]/10 rounded w-96 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                  <div className="h-16 bg-[#234d1b]/10 rounded-2xl mb-6 animate-pulse" />
                  <div className="h-8 bg-[#234d1b]/10 rounded w-32 mb-2 animate-pulse" />
                  <div className="h-4 bg-[#234d1b]/10 rounded w-24 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className={`${sizeClasses[size]} border-4 border-[#f8bf51] border-t-transparent rounded-full animate-spin mx-auto mb-4`} />
              <p className="text-[#234d1b] font-medium text-sm">Loading...</p>
            </div>
          </div>
        );
    }
  };

  return getSectionContent();
}