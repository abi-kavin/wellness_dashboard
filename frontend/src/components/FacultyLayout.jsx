import Sidebar from './Sidebar';

const FacultyLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-slate-50 relative">
            {/* gradient mesh background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-60"
                style={{
                    background: `
                        radial-gradient(at 20% 20%, hsla(252,100%,92%,0.4) 0px, transparent 50%),
                        radial-gradient(at 80% 10%, hsla(217,100%,90%,0.3) 0px, transparent 50%),
                        radial-gradient(at 60% 80%, hsla(190,80%,88%,0.3) 0px, transparent 50%)
                    `
                }}
            />
            <Sidebar />
            <main className="ml-64 flex-1 p-6 lg:p-10 relative z-10">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default FacultyLayout;
