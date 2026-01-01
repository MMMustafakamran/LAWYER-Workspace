import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Briefcase, BookOpen, Users, Plus, Calendar, ShoppingBag, MessageSquare, Vote, Settings, Scale, TrendingUp } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const isUrdu = i18n.language === 'ur';

    // Role-based quick actions
    const getQuickActions = () => {
        const common = [
            { name: t('research'), icon: BookOpen, href: '/research', color: 'bg-blue-500' },
            { name: t('marketplace'), icon: ShoppingBag, href: '/marketplace', color: 'bg-green-500' },
        ];

        if (user?.role === 'LAWYER') {
            return [
                { name: t('appointments'), icon: Calendar, href: '/appointments', color: 'bg-purple-500' },
                { name: t('my_cases'), icon: Briefcase, href: '/cases', color: 'bg-primary-600' },
                ...common,
                { name: t('elections'), icon: Vote, href: '/elections', color: 'bg-orange-500' },
            ];
        } else if (user?.role === 'SYSTEM_ADMIN' || user?.role === 'SUPER_ADMIN') {
            return [
                { name: t('manage_users'), icon: Users, href: '/admin/users', color: 'bg-red-500' },
                { name: t('system_stats'), icon: TrendingUp, href: '/admin', color: 'bg-purple-500' },
                ...common,
                { name: t('elections'), icon: Vote, href: '/elections', color: 'bg-orange-500' },
            ];
        } else {
            // LITIGANT / CLERK
            return [
                { name: t('new_case'), icon: Plus, href: '/cases/new', color: 'bg-primary-600' },
                { name: t('find_lawyer'), icon: Users, href: '/lawyers', color: 'bg-purple-500' },
                { name: t('appointments'), icon: Calendar, href: '/appointments', color: 'bg-orange-500' },
                ...common,
            ];
        }
    };

    const quickActions = getQuickActions();

    // Role-specific greeting and subtitle
    const getRoleInfo = () => {
        switch (user?.role) {
            case 'LAWYER':
                return { subtitle: isUrdu ? 'وکیل ڈیش بورڈ' : 'Lawyer Dashboard', color: 'text-purple-600' };
            case 'SYSTEM_ADMIN':
            case 'SUPER_ADMIN':
                return { subtitle: isUrdu ? 'انتظامی ڈیش بورڈ' : 'Admin Dashboard', color: 'text-red-600' };
            case 'CLERK':
                return { subtitle: isUrdu ? 'کلرک ڈیش بورڈ' : 'Clerk Dashboard', color: 'text-blue-600' };
            default:
                return { subtitle: isUrdu ? 'موکل ڈیش بورڈ' : 'Client Dashboard', color: 'text-green-600' };
        }
    };

    const roleInfo = getRoleInfo();

    return (
        <div className={`${isUrdu ? 'font-serif text-right' : ''}`} dir={isUrdu ? 'rtl' : 'ltr'}>
            {/* Compact Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-primary-900">
                        {t('welcome')}, {user?.name}!
                    </h1>
                    <p className={`text-sm font-medium ${roleInfo.color}`}>{roleInfo.subtitle}</p>
                </div>
                {(user?.role === 'LITIGANT' || user?.role === 'CLERK') && (
                    <Link to="/cases/new" className="btn-primary flex items-center">
                        <Plus className={`w-4 h-4 ${isUrdu ? 'ml-2' : 'mr-2'}`} />
                        {t('new_case')}
                    </Link>
                )}
            </div>

            {/* Quick Actions Grid - Compact */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                {quickActions.map((action) => (
                    <Link
                        key={action.href}
                        to={action.href}
                        className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group"
                    >
                        <div className={`${action.color} p-3 rounded-lg mb-2 group-hover:scale-110 transition-transform`}>
                            <action.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className={`text-sm font-medium text-gray-700 text-center ${isUrdu ? 'text-base' : ''}`}>
                            {action.name}
                        </span>
                    </Link>
                ))}
            </div>

            {/* Role-based Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Lawyer: Practice Section */}
                {user?.role === 'LAWYER' && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h2 className="text-lg font-semibold text-primary-900 mb-3 flex items-center">
                            <Briefcase className={`w-5 h-5 ${isUrdu ? 'ml-2' : 'mr-2'}`} />
                            {isUrdu ? 'آپ کی پریکٹس' : 'Your Practice'}
                        </h2>
                        <div className="space-y-2">
                            <Link to="/cases" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span className="font-medium">{isUrdu ? 'میرے مقدمات دیکھیں' : 'View My Cases'}</span>
                            </Link>
                            <Link to="/appointments" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span className="font-medium">{isUrdu ? 'اپائنٹمنٹس' : 'Appointments'}</span>
                            </Link>
                            <Link to="/profile" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span className="font-medium">{isUrdu ? 'پروفائل میں ترمیم' : 'Edit Profile'}</span>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Admin: Management Section */}
                {(user?.role === 'SYSTEM_ADMIN' || user?.role === 'SUPER_ADMIN') && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h2 className="text-lg font-semibold text-primary-900 mb-3 flex items-center">
                            <Settings className={`w-5 h-5 ${isUrdu ? 'ml-2' : 'mr-2'}`} />
                            {isUrdu ? 'انتظامی پینل' : 'Admin Panel'}
                        </h2>
                        <div className="space-y-2">
                            <Link to="/admin/users" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span className="font-medium">{isUrdu ? 'صارفین کا انتظام' : 'Manage Users'}</span>
                            </Link>
                            <Link to="/admin" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span className="font-medium">{isUrdu ? 'اعدادوشمار' : 'Statistics'}</span>
                            </Link>
                            <Link to="/elections" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span className="font-medium">{isUrdu ? 'الیکشن کا انتظام' : 'Manage Elections'}</span>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Litigant/Clerk: Find Help */}
                {(user?.role === 'LITIGANT' || user?.role === 'CLERK') && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h2 className="text-lg font-semibold text-primary-900 mb-3 flex items-center">
                            <Users className={`w-5 h-5 ${isUrdu ? 'ml-2' : 'mr-2'}`} />
                            {isUrdu ? 'قانونی مدد' : 'Legal Help'}
                        </h2>
                        <div className="space-y-2">
                            <Link to="/lawyers" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span className="font-medium">{isUrdu ? 'وکیل تلاش کریں' : 'Find a Lawyer'}</span>
                            </Link>
                            <Link to="/cases" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span className="font-medium">{isUrdu ? 'میرے مقدمات' : 'My Cases'}</span>
                            </Link>
                            <Link to="/appointments" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span className="font-medium">{isUrdu ? 'اپائنٹمنٹس' : 'Appointments'}</span>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Resources - Common */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 className="text-lg font-semibold text-primary-900 mb-3 flex items-center">
                        <BookOpen className={`w-5 h-5 ${isUrdu ? 'ml-2' : 'mr-2'}`} />
                        {isUrdu ? 'وسائل' : 'Resources'}
                    </h2>
                    <div className="space-y-2">
                        <Link to="/research" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <span className="font-medium">{isUrdu ? 'قانونی تحقیق' : 'Legal Research'}</span>
                        </Link>
                        <Link to="/marketplace" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <span className="font-medium">{isUrdu ? 'مارکیٹ پلیس' : 'Marketplace'}</span>
                        </Link>
                        <Link to="/chat" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <span className="font-medium">{isUrdu ? 'پیغامات' : 'Messages'}</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
