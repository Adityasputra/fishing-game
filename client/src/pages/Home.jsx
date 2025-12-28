import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();

    const handleEmailLogin = () => {
        navigate('/login');
    };

    const handleGuestLogin = () => {
        navigate('/guest');
    };

    return (
        <div className="w-screen h-screen bg-gradient-to-br from-sky-200 via-teal-100 to-amber-50 flex items-center justify-center overflow-hidden relative">
            {/* Subtle water ripple effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-teal-300/20 via-transparent to-sky-200/30"></div>
            
            {/* Floating decorative elements */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-teal-300/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-32 right-32 w-40 h-40 bg-sky-300/20 rounded-full blur-3xl animate-pulse delay-700"></div>
            <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-emerald-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>

            {/* Main content container */}
            <div className="relative z-10 max-w-xl w-full px-8">
                {/* Game title with fishing icon */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="text-8xl animate-bounce">🎣</div>
                    </div>
                    <h1 className="text-6xl font-bold text-teal-800 mb-3 tracking-wide drop-shadow-lg">
                        Tranquil Waters
                    </h1>
                    <p className="text-xl text-teal-600 font-medium">A Peaceful Fishing Journey</p>
                    <div className="h-1 w-32 bg-gradient-to-r from-transparent via-teal-400 to-transparent mx-auto mt-4"></div>
                </div>

                {/* Login card */}
                <div className="bg-white/80 backdrop-blur-lg border-2 border-teal-200/50 rounded-3xl p-10 shadow-2xl shadow-teal-900/10">
                    <h2 className="text-2xl font-semibold text-teal-800 text-center mb-8">
                        Welcome Back, Angler
                    </h2>

                    {/* Email Login Button - Primary */}
                    <button
                        onClick={handleEmailLogin}
                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold text-lg py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-teal-500/30 mb-5"
                    >
                        <div className="flex items-center justify-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>Sign In with Email</span>
                        </div>
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-teal-200"></div>
                        <span className="text-teal-500 font-medium text-sm">or</span>
                        <div className="flex-1 h-px bg-teal-200"></div>
                    </div>

                    {/* Guest Login Warning - Soft and gentle */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                                <p className="text-amber-800 font-medium text-sm mb-1">Quick Play Notice</p>
                                <p className="text-amber-700 text-xs leading-relaxed">
                                    Your progress won't be saved in guest mode. Sign in to keep your catches and achievements.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Guest Login Button - Secondary */}
                    <button
                        onClick={handleGuestLogin}
                        className="w-full bg-teal-100 hover:bg-teal-200 text-teal-700 font-semibold text-lg py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] border border-teal-200 hover:border-teal-300"
                    >
                        <div className="flex items-center justify-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Cast as Guest</span>
                        </div>
                    </button>
                </div>

                {/* Footer text */}
                <p className="text-center text-teal-600 mt-6 text-sm">
                    🌊 Find your perfect catch in calm waters
                </p>
            </div>
        </div>
    );
}