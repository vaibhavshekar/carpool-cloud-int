"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("https://carpool-cloud-backend.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // Save token to local storage
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-3">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* Branding */}
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium font-semibold">
            HopIn
          </a>
        </div>

        {/* Login Form */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>

            <form className="space-y-8" onSubmit={handleSubmit}>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-lg font-medium text-gray-900">
                  University Email
                </label>
                <div className="mt-2">
                  <input
                    type="email"
                    id="email"
                    required
                    placeholder="yourname@cb.students.amrita.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none text-lg"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-lg font-medium text-gray-900">
                    Password
                  </label>
                  <div className="text-sm">
                    <a href="#" className="font-semibold text-[#ffcc24] hover:text-indigo-500">
                      Forgot password?
                    </a>
                  </div>
                </div>
                <div className="mt-2">
                  <input
                    type="password"
                    id="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none text-lg"
                  />
                </div>
              </div>

              {/* Sign In Button */}
              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-[#ffcc24] px-4 py-3 text-lg font-semibold text-white shadow hover:bg-indigo-500 focus:ring-2 focus:ring-[#ffcc24] focus:outline-none"
                >
                  Sign In
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Not a member?{" "}
              <button
                onClick={() => router.push("/auth/signup")}
                className="font-semibold text-[#ffcc24] hover:text-indigo-500"
              >
                Sign up now
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="relative hidden bg-muted lg:col-span-2 lg:block min-h-full">
        <img
          src="/login-bg.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
