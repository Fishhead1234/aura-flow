-- Aura Flow Database Schema for PostgreSQL / Supabase
-- Decoupled Multi-Tenant Architecture by studio_id with 0% Platform Commission

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('INSTRUCTOR', 'STUDENT');
CREATE TYPE supported_locale AS ENUM ('en', 'zh-TW', 'zh-CN', 'ja');
CREATE TYPE supported_currency AS ENUM ('USD', 'TWD', 'HKD', 'JPY', 'SGD', 'EUR', 'GBP');
CREATE TYPE class_category AS ENUM ('Reformer', 'Flow', 'Sound Bath', 'Yin Yoga', 'Mat Pilates', 'Barre', 'Workshop');
CREATE TYPE payment_method_type AS ENUM ('PASS_CREDIT', 'STRIPE_CARD', 'APPLE_PAY');
CREATE TYPE booking_status AS ENUM ('CONFIRMED', 'CANCELLED', 'CHECKED_IN');
CREATE TYPE waitlist_mode AS ENUM ('STANDARD', 'VIP_PREAUTH');
CREATE TYPE waitlist_status AS ENUM ('WAITING', 'OFFERED', 'CLAIMED', 'EXPIRED', 'DECLINED');
CREATE TYPE ledger_entry_type AS ENUM ('PURCHASE', 'BOOKING_DEBIT', 'CANCELLATION_REFUND', 'EXPIRED', 'ADMIN_ADJUSTMENT');

-- 3. USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role DEFAULT 'STUDENT',
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STUDIOS TABLE (Decoupled Studio Tenancy)
CREATE TABLE studios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slug VARCHAR(100) UNIQUE NOT NULL, -- e.g. "sol-sanctuary"
    name VARCHAR(255) NOT NULL,
    tagline TEXT,
    currency supported_currency DEFAULT 'USD',
    stripe_account_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_account_name VARCHAR(255) NOT NULL,
    cancel_window_hrs INT DEFAULT 12,
    waitlist_mins INT DEFAULT 30,
    rooms_count INT DEFAULT 1,
    monthly_subscription_price NUMERIC(10, 2) DEFAULT 29.00,
    platform_take_rate NUMERIC(5, 4) DEFAULT 0.0000,
    logo_mark TEXT DEFAULT '🌿',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_studios_slug ON studios(slug);
CREATE INDEX idx_studios_owner ON studios(owner_id);

-- 5. CLASS SESSIONS TABLE (Scoped by studio_id)
CREATE TABLE class_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category class_category DEFAULT 'Reformer',
    instructor VARCHAR(255) NOT NULL,
    instructor_avatar TEXT,
    instructor_bio TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_mins INT NOT NULL,
    capacity INT NOT NULL, -- Hard Cap (e.g. 8 reformers)
    booked_count INT DEFAULT 0,
    price NUMERIC(10, 2) NOT NULL,
    room_name VARCHAR(100) DEFAULT 'Reformer Studio A',
    level VARCHAR(50) DEFAULT 'All Levels',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_classes_studio_time ON class_sessions(studio_id, start_time);

-- 6. CLASS PACKS TABLE (Scoped by studio_id)
CREATE TABLE class_packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    credits INT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    expiry_days INT DEFAULT 90,
    popular_badge BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_packs_studio ON class_packs(studio_id);

-- 7. CLIENT PASSES TABLE (Scoped by user_id & studio_id)
CREATE TABLE client_passes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    pack_id UUID NOT NULL REFERENCES class_packs(id),
    pack_name VARCHAR(255) NOT NULL,
    credits_total INT NOT NULL,
    credits_left INT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_passes_user_studio ON client_passes(user_id, studio_id);

-- 8. BOOKINGS TABLE (Scoped by studio_id)
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
    client_email VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    payment_method payment_method_type NOT NULL,
    stripe_payment_id VARCHAR(255),
    amount_paid NUMERIC(10, 2) DEFAULT 0.00,
    credits_deducted INT DEFAULT 0,
    status booking_status DEFAULT 'CONFIRMED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_bookings_studio_session ON bookings(studio_id, session_id);
CREATE INDEX idx_bookings_client_email ON bookings(client_email);

-- 9. WAITLIST ENTRIES TABLE (Scoped by studio_id, supporting 30-min waterfall cascade)
CREATE TABLE waitlist_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    priority_order INT NOT NULL,
    mode waitlist_mode DEFAULT 'STANDARD',
    status waitlist_status DEFAULT 'WAITING',
    offer_expires_at TIMESTAMPTZ, -- 30-min window
    claim_token VARCHAR(255) UNIQUE,
    pre_auth_card_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_session_priority UNIQUE(session_id, priority_order)
);
CREATE INDEX idx_waitlist_studio_session ON waitlist_entries(studio_id, session_id);

-- 10. CREDIT LEDGER TABLE (Scoped by studio_id & user_id)
CREATE TABLE credit_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    pass_id UUID NOT NULL REFERENCES client_passes(id) ON DELETE CASCADE,
    type ledger_entry_type NOT NULL,
    delta INT NOT NULL,
    balance_after INT NOT NULL,
    reference_id VARCHAR(255) NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ledger_studio_user ON credit_ledger(studio_id, user_id);

-- 11. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;

-- Public can view active studios by slug and their scheduled classes
CREATE POLICY "Public studios viewable" ON studios FOR SELECT USING (true);
CREATE POLICY "Public classes viewable" ON class_sessions FOR SELECT USING (true);

-- Instructors can only view and manage resources matching their owned studio_id
CREATE POLICY "Instructors manage own classes" ON class_sessions 
    FOR ALL USING (
        studio_id IN (SELECT id FROM studios WHERE owner_id = auth.uid())
    );

CREATE POLICY "Instructors manage own bookings" ON bookings 
    FOR ALL USING (
        studio_id IN (SELECT id FROM studios WHERE owner_id = auth.uid())
    );

CREATE POLICY "Instructors manage own waitlist" ON waitlist_entries 
    FOR ALL USING (
        studio_id IN (SELECT id FROM studios WHERE owner_id = auth.uid())
    );

-- 12. ATOMIC TRANSACTION: book_class_spot (with SELECT FOR UPDATE row locking)
CREATE OR REPLACE FUNCTION book_class_spot(
    p_studio_id UUID,
    p_session_id UUID,
    p_client_name VARCHAR,
    p_client_email VARCHAR,
    p_client_phone VARCHAR,
    p_payment_method payment_method_type,
    p_pass_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_session RECORD;
    v_pass RECORD;
    v_booking_id UUID;
    v_new_credits INT;
BEGIN
    -- Atomic Row Lock on specific studio class
    SELECT * INTO v_session
    FROM class_sessions
    WHERE id = p_session_id AND studio_id = p_studio_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'SESSION_NOT_FOUND');
    END IF;

    IF v_session.booked_count >= v_session.capacity THEN
        RETURN json_build_object('success', false, 'error', 'CLASS_FULL');
    END IF;

    IF p_payment_method = 'PASS_CREDIT' THEN
        SELECT * INTO v_pass
        FROM client_passes
        WHERE id = p_pass_id AND studio_id = p_studio_id
        FOR UPDATE;

        IF NOT FOUND OR v_pass.credits_left <= 0 THEN
            RETURN json_build_object('success', false, 'error', 'INSUFFICIENT_CREDITS');
        END IF;

        v_new_credits := v_pass.credits_left - 1;
        UPDATE client_passes SET credits_left = v_new_credits WHERE id = p_pass_id;

        INSERT INTO credit_ledger (user_id, studio_id, pass_id, type, delta, balance_after, reference_id, note)
        VALUES (v_pass.user_id, p_studio_id, p_pass_id, 'BOOKING_DEBIT', -1, v_new_credits, p_session_id::text, 'Redeemed class pass');
    END IF;

    -- Increment booked count
    UPDATE class_sessions
    SET booked_count = booked_count + 1
    WHERE id = p_session_id;

    -- Create Booking
    INSERT INTO bookings (studio_id, session_id, client_email, client_name, client_phone, payment_method, credits_deducted)
    VALUES (p_studio_id, p_session_id, p_client_email, p_client_name, p_client_phone, p_payment_method, CASE WHEN p_payment_method = 'PASS_CREDIT' THEN 1 ELSE 0 END)
    RETURNING id INTO v_booking_id;

    RETURN json_build_object('success', true, 'booking_id', v_booking_id);
END;
$$ LANGUAGE plpgsql;
