import { useState } from "react";
import { userService } from "../services/userService.js";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, User, Mail, ArrowRight, Layers, CheckCircle } from "lucide-react";
import bgImage from "../../assets/background.png";
import Login from "./Login.jsx";

function Register() {

    const [formData, setFormData] = useState({ username: "", password: "", fullName: "", email: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const[success, setSuccess] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) =>{
        setFormData({...formData, [e.target.name]: e.target.value});
    }

    const handleSubmit =  async (e) => {
        e.preventDefault();   //prevent from autoreload
        setError('');
        setSuccess(false);
        setLoading(true);

        try{
            const data= await userService.register(formData);
            console.log("Register response: ",data);
            setSuccess(true);

            setTimeout(()=>{
                navigate("/login");
            },2000);
        }
        catch(err){
            console.error("Full Axios Error Object:", err.response);
            // Agr backend se clear string message na aaye to poora data log krwaen
            setError(err.response?.data?.message || err.response?.data || "Registration failed. Try again");
        }
        finally{
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 h-full w-full flex items-center justify-center font-sans bg-cover bg-center bg-no-repeat overflow-hidden select-none"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-0" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md mx-4 p-6 lg:p-8 bg-slate-900/85 backdrop-blur-xl rounded-3xl border border-slate-700/40 shadow-2xl relative z-10 flex flex-col justify-between"
            >
                <div>
                    {/* Brand Logo */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                            <Layers className="h-4 w-4" />
                        </div>
                        <span className="text-white font-bold tracking-tight text-lg">Logix<span className="text-blue-500 font-normal">Core</span></span>
                    </div>

                    <div className="text-center mb-5">
                        <h2 className="text-2xl font-extrabold !text-white tracking-tight mb-1">Create Account</h2>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 text-red-400 p-3 rounded-xl text-xs mb-4 border border-red-500/20 font-medium flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl text-xs mb-4 border border-emerald-500/20 font-medium flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400 animate-bounce" />
                            <span>Registration successful! Redirecting...</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3.5">

                        {/* 1. Username Field */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Username</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-100 bg-slate-950/60 text-xs transition-all placeholder:text-slate-600 font-medium"
                                    placeholder="e.g. test_admin"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-100 bg-slate-950/60 text-xs transition-all placeholder:text-slate-600 font-medium"
                                    placeholder="e.g. test"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-100 bg-slate-950/60 text-xs transition-all placeholder:text-slate-600 font-medium"
                                    placeholder="admin@logistics.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* 4. Password Field */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-100 bg-slate-950/60 text-xs transition-all placeholder:text-slate-600 font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 mt-4 text-xs cursor-pointer flex items-center justify-center gap-1.5 group disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Register Account</span>
                                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-800/60 pt-3 text-[11px]">
                    <span className="text-slate-500">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-500 hover:text-blue-400 transition-all font-semibold">
                            Login Here
                        </Link>
                    </span>
                </div>
            </motion.div>
        </div>
    );
}

export default Register;