"use client";

import { useState } from "react";

export default function FindPlaceIdPage() {
  const [apiKey, setApiKey] = useState("");
  const [businessName, setBusinessName] = useState("Sai Nandhini Tasty World Madurai");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const findPlaceId = async () => {
    if (!apiKey) {
      alert("Please enter your Google Maps API Key");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(businessName)}&inputtype=textquery&fields=place_id,name,formatted_address,rating,user_ratings_total&key=${apiKey}`;
      
      // Use a proxy to avoid CORS issues
      const proxyUrl = `/api/find-place?query=${encodeURIComponent(businessName)}&key=${encodeURIComponent(apiKey)}`;
      
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/30 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-primary-dark mb-2">
            Find Your Google Place ID
          </h1>
          <p className="text-gray-600 mb-8">
            Use your Google Maps API Key to find your business Place ID
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Google Maps API Key
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 text-gray-900 py-3 px-4 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your Google Maps API Key (starts with AIzaSy)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Name & Location
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your Business Name, City"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 text-gray-900 py-3 px-4 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your business name and city for better results
              </p>
            </div>

            <button
              onClick={findPlaceId}
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Searching..." : "Find Place ID"}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {result.error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
                <p className="text-red-700">{result.error}</p>
              </div>
            ) : result.candidates && result.candidates.length > 0 ? (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                  <h2 className="text-xl font-bold text-green-800 mb-2">
                    ✓ Found Your Business!
                  </h2>
                  <p className="text-green-700">
                    Copy the Place ID below and paste it in your admin settings
                  </p>
                </div>

                {result.candidates.map((place: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-6 mb-4">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-primary-dark mb-1">
                        {place.name}
                      </h3>
                      {place.formatted_address && (
                        <p className="text-sm text-gray-600">{place.formatted_address}</p>
                      )}
                      {place.rating && (
                        <p className="text-sm text-gray-600 mt-1">
                          Rating: {place.rating} ⭐ ({place.user_ratings_total} reviews)
                        </p>
                      )}
                    </div>

                    <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                        Place ID (Copy This):
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-white px-4 py-3 rounded-lg text-sm font-mono border border-gray-200">
                          {place.place_id}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(place.place_id);
                            alert("Place ID copied to clipboard!");
                          }}
                          className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-dark transition-colors whitespace-nowrap"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
                  <h3 className="font-bold text-blue-900 mb-3">Next Steps:</h3>
                  <ol className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="font-bold">1.</span>
                      <span>Copy the Place ID above</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">2.</span>
                      <span>Go to /admin/settings → Google Reviews tab</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">3.</span>
                      <span>Paste the Place ID in the "Google Place ID" field</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">4.</span>
                      <span>Make sure "Enable Google Reviews" is ON</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">5.</span>
                      <span>Click "Save All Changes"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">6.</span>
                      <span>Visit your homepage to see the reviews!</span>
                    </li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-yellow-800 mb-2">
                  No Results Found
                </h2>
                <p className="text-yellow-700 mb-4">
                  Try searching with different keywords or check:
                </p>
                <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                  <li>Is your business listed on Google Maps?</li>
                  <li>Is the Places API enabled in Google Cloud Console?</li>
                  <li>Is your API key correct?</li>
                  <li>Try adding your full address to the search</li>
                </ul>
              </div>
            )}

            <div className="mt-6">
              <details className="bg-gray-50 rounded-xl p-4">
                <summary className="font-bold text-gray-700 cursor-pointer">
                  View Full API Response
                </summary>
                <pre className="mt-4 bg-white p-4 rounded-lg overflow-auto text-xs border border-gray-200">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
