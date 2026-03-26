import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-white px-6 py-12"
        >
            {/* ── Advanced Layout Base Layers ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-100/30 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-100/30 blur-[120px]" />
                <div className="particle-grid opacity-20" />
            </div>

            <div className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center space-y-12">

                {/* ── 3D Morphing Logo ── */}
                <motion.div
                    initial={{ scale: 0.5, rotateY: -30, opacity: 0, filter: 'blur(10px)' }}
                    animate={{
                        scale: [1, 1.05, 1],
                        rotateY: [0, 15, -15, 0],
                        rotateX: [0, 10, -10, 0],
                        filter: ['blur(0px)', 'blur(1px)', 'blur(0px)'],
                        opacity: 1
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="relative group cursor-pointer"
                >
                    <div className="absolute -inset-8 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <motion.img
                        src={logo}
                        alt="Academic Wellness Logo"
                        className="h-40 w-auto object-contain relative z-10 select-none pointer-events-none filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.1)]"
                        style={{ transformPerspective: 1000 }}
                    />
                </motion.div>

                {/* ── Content ── */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">Institutional Excellence System</span>
                    </motion.div>

                    <motion.h1
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]"
                    >
                        Academic <span className="text-blue-600 italic">Wellness</span> Risk <br />
                        <span className="text-slate-400">Dashboard.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="text-slate-500 font-medium text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed"
                    >
                        A unified platform to monitor performance, predict risks, and foster student success with AI-driven insights.
                    </motion.p>
                </div>

                {/* ── Action Buttons ── */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="flex flex-col sm:flex-row gap-6 w-full max-w-md mx-auto"
                >
                    <button
                        onClick={() => navigate('/login')}
                        className="flex-1 h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm tracking-wider transition-all duration-300 shadow-xl shadow-slate-900/20 hover:-translate-y-1 active:scale-[0.98]"
                    >
                        Access Portal
                    </button>

                    <button
                        onClick={() => navigate('/register')}
                        className="flex-1 h-16 bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 rounded-2xl font-bold text-sm tracking-wider transition-all duration-300 shadow-lg hover:-translate-y-1 active:scale-[0.98]"
                    >
                        Join Registry
                    </button>
                </motion.div>

                {/* ── Status Bar ── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="pt-12 border-t border-slate-100 w-full flex flex-wrap justify-center gap-10 opacity-40 group hover:opacity-100 transition-opacity duration-700"
                >
                    <div className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-slate-400" />
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-900">Health-Tech Optimized</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-slate-400" />
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-900">Privacy Compliant</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-slate-400" />
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-900">Real-time Telemetry</p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Landing;

