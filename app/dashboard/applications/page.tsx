import { createClient } from '@/lib/supabase/server'

export default async function ApplicationsPage() {
    const supabase = await createClient()
    const {
        data: { session },
    } = await supabase.auth.getSession()

    const { data: applications } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false }) || { data: [] }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
                    <p className="text-gray-600 mt-1">Track your MFI registration progress</p>
                </div>
                <a
                    href="/dashboard/applications/new"
                    className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                    + New Application
                </a>
            </div>

            {applications && applications.length > 0 ? (
                <div className="grid gap-6">
                    {applications.map((app: any) => (
                        <div key={app.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {app.application_type.replace(/_/g, ' ').toUpperCase()}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Created {new Date(app.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${app.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        app.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                            app.status === 'under_review' ? 'bg-amber-100 text-amber-700' :
                                                app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-700'
                                    }`}>
                                    {app.status.replace(/_/g, ' ').toUpperCase()}
                                </span>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                    <span>Progress: Step {app.current_step} of {app.total_steps}</span>
                                    <span>{Math.round((app.current_step / app.total_steps) * 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all"
                                        style={{ width: `${(app.current_step / app.total_steps) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {app.notes && (
                                <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                                    📝 {app.notes}
                                </p>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex gap-4 text-sm">
                                    {app.household_income_verified && (
                                        <span className="text-green-600">✓ Income Verified</span>
                                    )}
                                    {app.foir_compliant && (
                                        <span className="text-green-600">✓ FOIR Compliant</span>
                                    )}
                                </div>
                                <a
                                    href={`/dashboard/applications/${app.id}`}
                                    className="text-primary hover:text-primary-dark font-semibold"
                                >
                                    View Details →
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Applications Yet</h3>
                    <p className="text-gray-600 mb-6">
                        Start your MFI registration journey by creating your first application
                    </p>
                    <a
                        href="/dashboard/applications/new"
                        className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition"
                    >
                        Create First Application
                    </a>
                </div>
            )}
        </div>
    )
}
