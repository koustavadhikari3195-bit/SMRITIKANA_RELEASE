'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UploadButton({ userId }: { userId: string }) {
    const router = useRouter()
    const [uploading, setUploading] = useState(false)
    const [msg, setMsg] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return
        const file = e.target.files[0]

        // 5MB limit
        if (file.size > 5 * 1024 * 1024) {
            setMsg('Error: File size must be less than 5MB')
            return
        }

        setUploading(true)
        setMsg('')

        try {
            const supabase = createClient()
            const fileExt = file.name.split('.').pop()
            const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${fileName}`

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('kyc-documents')
                .upload(filePath, file)

            if (uploadError) {
                if (uploadError.message.includes('Bucket not found')) {
                    throw new Error('Storage bucket "kyc-documents" not found. Please create it in Supabase Dashboard.')
                }
                throw uploadError
            }

            // 2. Insert into Database
            const { error: dbError } = await supabase
                .from('documents')
                .insert({
                    user_id: userId,
                    file_name: file.name,
                    file_size: file.size,
                    mime_type: file.type,
                    storage_path: filePath,
                    document_type: 'other', // Default to other for now, ideally user selects
                    verification_status: 'pending'
                })

            if (dbError) throw dbError

            setMsg('✅ Upload successful!')
            router.refresh()

            // Clear input
            if (fileInputRef.current) fileInputRef.current.value = ''

        } catch (error: any) {
            console.error(error)
            setMsg(`❌ Upload failed: ${error.message}`)
        } finally {
            setUploading(false)
            // Clear message after 3 seconds
            setTimeout(() => setMsg(''), 5000)
        }
    }

    return (
        <div className="relative">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
            />

            <div className="flex flex-col items-end gap-2">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
                >
                    {uploading ? 'Uploading...' : '+ Upload Document'}
                </button>

                {msg && (
                    <div className={`text-sm font-medium px-3 py-1 rounded ${msg.includes('✅') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                        {msg}
                    </div>
                )}
            </div>
        </div>
    )
}
