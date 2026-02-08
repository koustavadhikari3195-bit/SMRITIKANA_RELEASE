export default function TrackerPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Registration Tracker</h1>
                <p className="text-gray-600 mt-1">Real-time status of your MFI activation journey</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Gramin Sahyog Microfinance</h3>
                        <p className="text-sm text-gray-600 mt-1">Section 8 Model • ID: #demo-001</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                        <span className="text-sm font-semibold">IN PROGRESS</span>
                    </div>
                </div>

                {/* Visual Timeline */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {[
                            { icon: '📝', label: 'Docs', active: true },
                            { icon: '✍️', label: 'Name', active: true },
                            { icon: '📜', label: 'MOA', active: true },
                            { icon: '🏛️', label: 'COI', active: true, pulse: true },
                            { icon: '🆔', label: 'PAN', active: false },
                            { icon: '🏦', label: 'Bank', active: false },
                            { icon: '💰', label: 'Capital', active: false },
                            { icon: '🎯', label: 'RBI', active: false },
                        ].map((step, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 ${step.active ? 'bg-primary text-white' : 'bg-gray-200'
                                    } ${step.pulse ? 'animate-pulse' : ''}`}>
                                    {step.icon}
                                </div>
                                <span className={`text-xs font-semibold ${step.active ? 'text-primary' : 'text-gray-500'}`}>
                                    {step.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-bold text-gray-900 mb-2">Current Stage: Certificate of Incorporation</h4>
                    <p className="text-sm text-gray-700">
                        ROC Hooghly has processed the SPICE+ filing. DSC and DIN are tagged.
                        Certificate dispatch pending. <strong>ETA: 48 hours</strong>
                    </p>
                </div>

                <div className="mt-6 flex gap-3">
                    <button className="flex-1 border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold py-3 rounded-lg transition">
                        View Documents
                    </button>
                    <button className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition">
                        Request Update
                    </button>
                </div>
            </div>

            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-gray-700">
                <strong>💡 Note:</strong> This is a demo tracker. Connect to Supabase Realtime to enable live status updates from your consultant.
            </div>
        </div>
    )
}
