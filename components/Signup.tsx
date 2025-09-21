import React, { useState } from "react";
import { User } from "../types";
import Spinner from "./Spinner";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://careerkraft.up.railway.app"
    : "http://localhost:3001";

interface SignupProps {
  onSignupSuccess: (user: User) => void;
  onSwitchToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({
  onSignupSuccess,
  onSwitchToLogin,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to sign up");
      }
      onSignupSuccess(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-gray-800/50 rounded-2xl shadow-2xl backdrop-blur-sm border border-gray-700 animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-white mb-2">
        Create Your Account
      </h2>
      <p className="text-center text-gray-400 mb-8">
        Start your career journey with us today.
      </p>

      {error && (
        <div className="bg-red-800/50 text-red-300 p-3 rounded-lg mb-6 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="email-signup"
            className="block text-gray-300 text-sm font-bold mb-2"
          >
            Email
          </label>
          <input
            id="email-signup"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="password-signup"
            className="block text-gray-300 text-sm font-bold mb-2"
          >
            Password
          </label>
          <input
            id="password-signup"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          />
        </div>
        <div className="mb-6">
          {isLoading ? (
            <Spinner />
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Create Account
            </button>
          )}
        </div>
        <p className="text-center text-gray-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-purple-400 hover:text-purple-300"
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
};

export default Signup;
