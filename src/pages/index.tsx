// src/pages/index.tsx

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

const style = `
  @keyframes borderFlow {
    0% {
      border-image-source: linear-gradient(0deg, #00BFFF, rgba(0, 191, 255, 0.3));
    }
    50% {
      border-image-source: linear-gradient(180deg, #00BFFF, rgba(0, 191, 255, 0.3));
    }
    100% {
      border-image-source: linear-gradient(360deg, #00BFFF, rgba(0, 191, 255, 0.3));
    }
  }

  @keyframes glowPulse {
    0%, 100% {
      text-shadow: 
        0 0 10px #00BFFF,
        0 0 20px #00BFFF,
        0 0 30px #00BFFF,
        0 0 40px #0099FF,
        0 0 70px #0099FF,
        0 0 80px #0099FF;
    }
    50% {
      text-shadow: 
        0 0 20px #00BFFF,
        0 0 30px #00BFFF,
        0 0 40px #00BFFF,
        0 0 50px #0099FF,
        0 0 80px #0099FF,
        0 0 90px #0099FF;
    }
  }

  .tron-text {
    color: #00BFFF;
    animation: glowPulse 3s ease-in-out infinite;
    position: relative;
  }

  .tron-text::before {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    filter: blur(15px);
    opacity: 0.8;
    animation: glowPulse 3s ease-in-out infinite;
  }

  .tron-border {
    border: 2px solid #00BFFF;
    box-shadow: 0 0 15px rgba(0, 191, 255, 0.5);
  }

  .tron-grid {
    background-image: 
      linear-gradient(rgba(0, 191, 255, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 191, 255, 0.05) 1px, transparent 1px);
    background-size: 30px 30px;
  }
`;

export default function WelcomePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    role: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if we're coming from the leaderboard
    const fromLeaderboard = sessionStorage.getItem('fromLeaderboard');
    if (!fromLeaderboard) {
      // If not from leaderboard, redirect to it
      router.push('/leaderboard');
    } else {
      // Clear the flag and continue with normal index page
      sessionStorage.removeItem('fromLeaderboard');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.companyName || !formData.role) {
      setError("Please fill in all fields");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    localStorage.setItem("userData", JSON.stringify(formData));
    router.push("/create-persona");
  };

  return (
    <>
      <style>{style}</style>
      <div className="relative min-h-screen">
        {/* Background with overlay */}
        <div className="absolute inset-0 courtroom-bg opacity-50" />
        <div className="absolute inset-0 bg-black/50 tron-grid" />

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-md space-y-10">
            {/* Header */}
            <div className="text-center space-y-3 backdrop-blur-[2px]">
              <h1 
                className="text-6xl font-bold uppercase tracking-wider text-cyan-100"
                style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}
              >
                Legal Battle
              </h1>
              <p className="game-subtitle">
                ENTER THE DIGITAL ARENA
              </p>
            </div>

            {/* Form Card */}
            <div className="backdrop-blur-[2px] p-8 rounded-xl border-2 border-cyan-500/50 relative" 
                 style={{ background: 'rgba(0, 10, 20, 0.8)' }}>
              <div className="absolute inset-0 rounded-xl border-2 border-cyan-400/30 animate-[borderPulse_2s_ease-in-out_infinite]" />
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div>
                  <label htmlFor="name" className="block text-cyan-100 font-bold uppercase tracking-wider mb-2">
                    Legal Alias <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black/40 text-cyan-100 placeholder-cyan-300/30 border-2 border-cyan-500/30 
                      rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400
                      transition duration-200"
                    placeholder="Enter your legal alias"
                  />
                </div>

                <div>
                  <label htmlFor="companyName" className="block text-cyan-100 font-bold uppercase tracking-wider mb-2">
                    Company Name <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full bg-black/40 text-cyan-100 placeholder-cyan-300/30 border-2 border-cyan-500/30 
                      rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400
                      transition duration-200"
                    placeholder="Enter your company name"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-cyan-100 font-bold uppercase tracking-wider mb-2">
                    Job Role <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="role"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-black/40 text-cyan-100 placeholder-cyan-300/30 border-2 border-cyan-500/30 
                      rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400
                      transition duration-200"
                    placeholder="Enter your job role"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-cyan-100 font-bold uppercase tracking-wider mb-2">
                    Email Address <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-black/40 text-cyan-100 placeholder-cyan-300/30 border-2 border-cyan-500/30 
                      rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400
                      transition duration-200"
                    placeholder="Enter your email address"
                  />
                </div>

                {error && (
                  <div className="bg-red-900/20 border-2 border-red-500/50 rounded-lg p-4">
                    <p className="text-red-400 text-sm uppercase tracking-wider">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full px-8 py-3 tron-border rounded-lg text-lg uppercase tracking-wider transition-all duration-300
                    hover:scale-[1.02] text-cyan-100"
                  style={{ background: 'rgba(0, 10, 20, 0.9)', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}
                >
                  Proceed
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-cyan-300/60 text-sm uppercase tracking-wider">
                System v2.0.45 // Judicial Protocol Active
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}