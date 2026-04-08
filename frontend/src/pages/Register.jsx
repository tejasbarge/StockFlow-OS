import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { UserPlus, Mail, Lock, User, ArrowRight } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { registerUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    try {
      await registerUser({ name, email, password });
      navigate("/"); // Redirect to dashboard heavily after successful registration
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center w-full px-4">
      {/* Subtle modern background gradient (Light Theme) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 via-white to-indigo-50 -z-10" />
      
      {/* Glassmorphic-inspired Card */}
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-gray-900/5 rounded-3xl p-8 sm:p-10 transition-all">
        
        {/* Header styling */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-gray-900 to-gray-800 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-gray-900/20">
            <UserPlus size={28} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create an account</h2>
          <p className="text-gray-500 mt-2 text-sm font-medium">Start managing your inventory in seconds.</p>
        </div>

        {/* Error alert component */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm font-medium animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block ml-1">Full Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <User size={18} />
              </div>
              <input
                type="text"
                required
                className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block ml-1">Email address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full relative flex items-center justify-center gap-2 py-3.5 mt-2 px-4 border border-transparent rounded-xl shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
            {!isSubmitting && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
