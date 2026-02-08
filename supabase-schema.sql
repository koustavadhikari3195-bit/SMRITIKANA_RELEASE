-- ============================================
-- SMRITIKANA SUPABASE SCHEMA
-- Run this in your Supabase SQL editor
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    organization_name TEXT,
    role TEXT CHECK (role IN ('admin', 'consultant', 'client', 'viewer')) DEFAULT 'client',
    phone TEXT,
    kyc_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================
-- APPLICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    application_type TEXT CHECK (application_type IN ('dsc', 'din', 'name_reservation', 'incorporation', 'cor', 'nbfc_mfi_license')) NOT NULL,
    status TEXT CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'completed')) DEFAULT 'draft',
    
    form_data JSONB DEFAULT '{}',
    
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER DEFAULT 8,
    step_status JSONB DEFAULT '[]',
    
    household_income_verified BOOLEAN DEFAULT FALSE,
    foir_compliant BOOLEAN DEFAULT FALSE,
    capital_adequacy_met BOOLEAN DEFAULT FALSE,
    
    submitted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    assigned_consultant UUID REFERENCES profiles(id),
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
    ON applications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
    ON applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
    ON applications FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    
    document_type TEXT CHECK (document_type IN (
        'pan_card', 'aadhaar_card', 'passport', 'driving_license',
        'address_proof', 'income_proof', 'bank_statement',
        'incorporation_certificate', 'moa', 'aoa', 'board_resolution',
        'audited_financials', 'compliance_report', 'other'
    )) NOT NULL,
    
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    
    verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
    ON documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can upload own documents"
    ON documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ELIGIBILITY ASSESSMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS eligibility_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    annual_household_income DECIMAL(12,2),
    loan_purpose TEXT,
    collateral_free BOOLEAN,
    rural_location BOOLEAN,
    existing_loans DECIMAL(12,2) DEFAULT 0,
    
    income_within_limit BOOLEAN,
    foir_compliant BOOLEAN,
    qualifies_as_microfinance BOOLEAN,
    
    assessment_result JSONB,
    recommended_next_steps TEXT[],
    
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE eligibility_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anonymous can create assessments"
    ON eligibility_assessments FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view own assessments"
    ON eligibility_assessments FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_eligibility_user_id ON eligibility_assessments(user_id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Run these in the Supabase Storage section:
-- 1. Create bucket: 'kyc-documents'
-- 2. Set as private
-- 3. Add RLS policy: Users can upload to their own folder

-- ============================================
-- TRIGGER: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER: Create Profile on Signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, organization_name, created_at)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'organization_name',
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
