'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const APPLICATION_TYPES = [
    { value: 'dsc', label: 'Digital Signature Certificate (DSC)', steps: 3, description: 'Required for MCA filings' },
    { value: 'din', label: 'Director Identification Number (DIN)', steps: 4, description: 'Mandatory for all directors' },
    { value: 'name_reservation', label: 'Company Name Reservation', steps: 3, description: 'Reserve your MFI name' },
    { value: 'incorporation', label: 'Section 8 Incorporation', steps: 8, description: 'Non-profit MFI registration' },
    { value: 'nbfc_mfi_license', label: 'NBFC-MFI License', steps: 10, description: 'For-profit microfinance license' },
]

export default function NewApplicationPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [selectedType, setSelectedType] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            router.push('/login')
            return
        }

        const selectedApp = APPLICATION_TYPES.find(t => t.value === selectedType)

        const { data, error } = await supabase
            .from('applications')
            .insert({
                user_id: session.user.id,
                application_type: selectedType,
                status: 'draft',
                current_step: 1,
                total_steps: selectedApp?.steps || 8,
                form_data: {},
            })
            .select()
            .single()

        if (error) {
            alert('Error creating application: ' + error.message)
            setLoading(false)
            return
        }

        router.push(`/dashboard/applications/${data.id}`)
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Start New Application</h1>
                <p className="text-gray-600 mt-1">Choose the type of registration you need</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4">
                    {APPLICATION_TYPES.map((type) => (
                        <label
                            key={type.value}
                            className={`relative flex items-start p-6 border-2 rounded-xl cursor-pointer transition ${selectedType === type.value
                                    ? 'border-primary bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <input
                                type="radio"
                                name="application_type"
                                value={type.value}
                                checked={selectedType === type.value}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="mt-1 mr-4"
                                required
                            />
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-lg font-bold text-gray-900">{type.label}</h3>
                                    <span className="text-sm text-gray-500">{type.steps} steps</span>
                                </div>
                                <p className="text-sm text-gray-600">{type.description}</p>
                            </div>
                        </label>
                    ))}
                </div>

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !selectedType}
                        className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating...' : 'Create Application'}
                    </button>
                </div>
            </form>
        </div>
    )
}
