import Sidebar from './Sidebar';
import AiChatAssist from './AiChatAssist';

const FacultyLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen relative bg-transparent">
            {/* Using global dark mode background from index.css */}
            <Sidebar />
            <main className="ml-64 flex-1 p-6 lg:p-10 relative z-10">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* AI Assistant FAB */}
            <AiChatAssist />
        </div>
    );
};

export default FacultyLayout;
