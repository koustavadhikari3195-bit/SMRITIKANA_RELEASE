import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
    const supabase = await createClient()
    const {
        data: { session },
    } = await supabase.auth.getSession()

    // Fetch user's applications
    const { data: applications } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false })
        .limit(5) || []

    // Fetch user's documents
    const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('uploaded_at', { ascending: false })
        .limit(5) || []

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome to your MFI management portal</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600">Applications</p>
                            <p className="text-3xl font-bold text-primary mt-2">{applications?.length || 0}</p>
                        </div>
                        <div className="text-4xl">📝</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600">Documents</p>
                            <p className="text-3xl font-bold text-primary mt-2">{documents?.length || 0}</p>
                        </div>
                        <div className="text-4xl">📁</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600">In Progress</p>
                            <p className="text-3xl font-bold text-amber-500 mt-2">
                                {applications?.filter(a => a.status === 'submitted' || a.status === 'under_review').length || 0}
                            </p>
                        </div>
                        <div className="text-4xl">⏳</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600">Completed</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">
                                {applications?.filter(a => a.status === 'completed').length || 0}
                            </p>
                        </div>
                        <div className="text-4xl">✓</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <a
                            href="/dashboard/applications/new"
                            className="block w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition text-center"
                        >
                            Start New Application
                        </a>
                        <a
                            href="/dashboard/documents"
                            className="block w-full border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold py-3 px-4 rounded-lg transition text-center"
                        >
                            Upload Documents
                        </a>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-primary to-indigo-700 text-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold mb-2">Need Help?</h3>
                    <p className="text-sm opacity-90 mb-4">
                        Our consultants are here to guide you through the MFI registration process.
                    </p>
                    <a
                        href="../smritikana-microfinance/index.html#contact"
                        className="inline-block bg-white text-primary font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition"
                    >
                        Contact Support
                    </a>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Applications</h3>
                {applications && applications.length > 0 ? (
                    <div className="space-y-3">
                        {applications.map((app: any) => (
                            <div key={app.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                                <div>
                                    <p className="font-semibold text-gray-900">{app.application_type.toUpperCase()}</p>
                                    <p className="text-sm text-gray-600">Step {app.current_step} of {app.total_steps}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${app.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            app.status === 'under_review' ? 'bg-amber-100 text-amber-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {app.status}
                                    </span>
                                    <a href={`/dashboard/applications/${app.id}`} className="text-primary hover:text-primary-dark font-semibold">
                                        View →
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <p className="text-lg mb-2">No applications yet</p>
                        <p className="text-sm">Start your first MFI registration application</p>
                    </div>
                )}
            </div>
        </div>
    )
}
