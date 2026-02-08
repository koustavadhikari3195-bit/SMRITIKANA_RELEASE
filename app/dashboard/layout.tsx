import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
        redirect('/login')
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white fixed h-full">
                <div className="p-6 flex items-center gap-3">
                    <img src="/smritikana-microfinance/assets/Sbsss.jpg" alt="Logo" className="w-10 h-10 rounded border border-gray-700" />
                    <div>
                        <h2 className="text-xl font-bold">Smritikana</h2>
                        <p className="text-xs text-gray-400">Business Solutions</p>
                    </div>
                </div>

                <nav className="mt-6">
                    <a
                        href="/dashboard"
                        className="flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 hover:text-white transition"
                    >
                        <span className="mr-3">📊</span>
                        Dashboard
                    </a>
                    <a
                        href="/dashboard/applications"
                        className="flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 hover:text-white transition"
                    >
                        <span className="mr-3">📝</span>
                        Applications
                    </a>
                    <a
                        href="/dashboard/documents"
                        className="flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 hover:text-white transition"
                    >
                        <span className="mr-3">📁</span>
                        Documents
                    </a>
                    <a
                        href="/dashboard/tracker"
                        className="flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 hover:text-white transition"
                    >
                        <span className="mr-3">🚀</span>
                        Tracker
                    </a>
                </nav>

                <div className="absolute bottom-0 w-64 p-6 border-t border-gray-700">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                            {profile?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-semibold">{profile?.full_name || 'User'}</p>
                            <p className="text-xs text-gray-400">{profile?.role || 'Client'}</p>
                        </div>
                    </div>
                    <form action="/api/auth/signout" method="post">
                        <button
                            type="submit"
                            className="w-full text-left text-sm text-gray-400 hover:text-white transition"
                        >
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    )
}
