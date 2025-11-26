import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Briefcase, Home, BookOpen, ShoppingBag, MessageSquare, Vote, Menu, X, Scale, User } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import { useState } from 'react';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { to: '/dashboard', icon: Home, label: 'Dashboard' },
        { to: '/cases', icon: Briefcase, label: 'Cases' },
        { to: '/research', icon: BookOpen, label: 'Research' },
        { to: '/lawyers', icon: User, label: 'Directory' },
        { to: '/marketplace', icon: ShoppingBag, label: 'Market' },
        { to: '/chat', icon: MessageSquare, label: 'Chat' },
        { to: '/elections', icon: Vote, label: 'Elections' },
    ];

    const SidebarLink = ({ to, icon: Icon, label }) => (
        <Link
            to={to}
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive(to)
                    ? 'bg-primary-800 text-white shadow-sm'
                    : 'text-primary-200 hover:bg-primary-800 hover:text-white'
                }`}
        >
            <Icon className={`w-5 h-5 ${isActive(to) ? 'text-accent-400' : 'text-primary-300 group-hover:text-accent-400'}`} />
            <span className="font-medium">{label}</span>
        </Link>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-primary-900 transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:inset-0
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3 px-6 py-5 border-b border-primary-800">
                        <div className="w-10 h-10 bg-accent-400 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Scale className="w-6 h-6 text-primary-900" />
                        </div>
                        <div>
                            <h1 className="text-white font-serif font-bold text-lg leading-tight">Lawyer App</h1>
                            <p className="text-primary-300 text-xs">Legal Workspace</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <SidebarLink key={item.to} {...item} />
                        ))}
                    </nav>

                    {/* User Section */}
                    <div className="p-4 border-t border-primary-800">
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary-800">
                            <div className="w-9 h-9 rounded-full bg-primary-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                <p className="text-xs text-primary-300 capitalize truncate">{user?.role || 'User'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Close button for mobile */}
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="lg:hidden absolute top-4 right-4 text-primary-200 hover:text-white"
                >
                    <X className="w-6 h-6" />
                </button>
            </aside>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Mobile menu button */}
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden text-slate-600 hover:text-slate-900"
                            >
                                <Menu className="w-6 h-6" />
                                <span className="sr-only">Open sidebar</span>
                            </button>

                            {/* Spacer */}
                            <div className="flex-1"></div>

                            {/* Right Section */}
                            <div className="flex items-center gap-4">
                                <NotificationBell />
                                <button
                                    onClick={handleLogout}
                                    className="btn-ghost text-sm"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Outlet />
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
                        &copy; {new Date().getFullYear()} Lawyer App. All rights reserved.
                    </div>
                </footer>
            </div>
        </div>
    );
}
