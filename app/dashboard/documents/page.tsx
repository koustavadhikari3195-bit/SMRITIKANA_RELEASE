import { createClient } from '@/lib/supabase/server'
import UploadButton from './upload-button'

export default async function DocumentsPage() {
    const supabase = await createClient()
    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) return null

    const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('uploaded_at', { ascending: false }) || { data: [] }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Document Vault</h1>
                    <p className="text-gray-600 mt-1">Securely store and manage your KYC documents</p>
                </div>
                <UploadButton userId={session.user.id} />
            </div>

            {documents && documents.length > 0 ? (
                <div className="grid gap-4">
                    {documents.map((doc: any) => (
                        <div key={doc.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">📄</div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{doc.file_name}</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {doc.document_type.replace(/_/g, ' ').toUpperCase()}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Uploaded {new Date(doc.uploaded_at).toLocaleDateString()} • {(doc.file_size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${doc.verification_status === 'verified' ? 'bg-green-100 text-green-700' :
                                        doc.verification_status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                        {doc.verification_status.toUpperCase()}
                                    </span>
                                    {/* Download logic would require signed URL - simpler to omit or link to file if public (buckets are private) */}
                                    {/* For now keeping button UI only as requested */}
                                    <button className="text-primary hover:text-primary-dark font-semibold text-sm">
                                        Download
                                    </button>
                                </div>
                            </div>
                            {doc.rejection_reason && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-700">
                                        <strong>Rejection Reason:</strong> {doc.rejection_reason}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
                    <div className="mb-6 flex justify-center">
                        <img
                            src="/smritikana-microfinance/assets/document-vault.png"
                            alt="Document Vault"
                            className="w-48 h-auto opacity-80"
                        />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Documents Yet</h3>
                    <p className="text-gray-600 mb-6">
                        Upload your KYC documents to get started with verification
                    </p>
                    <div className="inline-block">
                        <UploadButton userId={session.user.id} />
                    </div>
                </div>
            )}

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">📋 Required Documents</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                    <li>✓ PAN Card (Directors & Company)</li>
                    <li>✓ Aadhaar Card (All Directors)</li>
                    <li>✓ Address Proof (Registered Office)</li>
                    <li>✓ Bank Statement (Last 3 months)</li>
                    <li>✓ Income Proof (For eligibility assessment)</li>
                </ul>
            </div>
        </div>
    )
}
