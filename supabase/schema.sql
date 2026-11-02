-- Aura Flow Database Schema for PostgreSQL / Supabase
-- Boutique Fitness & Workshop Booking Engine with 0% Platform Commission

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE supported_locale AS ENUM ('en', 'zh-TW', 'zh-CN', 'ja');
CREATE TYPE supported_currency AS ENUM ('USD', 'TWD', 'HKD', 'JPY', 'SGD', 'EUR', 'GBP');
CREATE TYPE class_category AS ENUM ('Reformer', 'Flow', 'Sound Bath', 'Yin Yoga', 'Mat Pilates', 'Barre', 'Workshop');
CREATE TYPE payment_method_type AS ENUM ('PASS_CREDIT', 'STRIPE_CARD', 'APPLE_PAY');
CREATE TYPE booking_status AS ENUM ('CONFIRMED', 'CANCELLED', 'CHECKED_IN');
CREATE TYPE waitlist_mode AS ENUM ('STANDARD', 'VIP_PREAUTH');
CREATE TYPE waitlist_status AS ENUM ('WAITING', 'OFFERED', 'CLAIMED', 'EXPIRED', 'DECLINED');
CREATE TYPE ledger_entry_type AS ENUM ('PURCHASE', 'BOOKING_DEBIT', 'CANCELLATION_REFUND', 'EXPIRED', 'ADMIN_ADJUSTMENT');

-- 3. STUDIOS TABLE
CREATE TABLE studios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
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
    logo_mark TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CLASS SESSIONS TABLE
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

-- 5. CLASS PACKS TABLE
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

-- 6. CLIENT PASSES TABLE
CREATE TABLE client_passes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    pack_id UUID NOT NULL REFERENCES class_packs(id),
    pack_name VARCHAR(255) NOT NULL,
    credits_total INT NOT NULL,
    credits_left INT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BOOKINGS TABLE
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 8. WAITLIST ENTRIES TABLE (30-Min Waterfall Support)
CREATE TABLE waitlist_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 9. CREDIT LEDGER TABLE (Immutable Audit Trail)
CREATE TABLE credit_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    pass_id UUID NOT NULL REFERENCES client_passes(id) ON DELETE CASCADE,
    type ledger_entry_type NOT NULL,
    delta INT NOT NULL,
    balance_after INT NOT NULL,
    reference_id VARCHAR(255) NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ATOMIC FUNCTION: Atomic Spot Booking with Race Condition Protection
CREATE OR REPLACE FUNCTION book_class_spot(
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
    -- Atomic Row Lock
    SELECT * INTO v_session
    FROM class_sessions
    WHERE id = p_session_id
    FOR UPDATE;

    IF v_session.booked_count >= v_session.capacity THEN
        RETURN json_build_object('success', false, 'error', 'CLASS_FULL');
    END IF;

    IF p_payment_method = 'PASS_CREDIT' THEN
        SELECT * INTO v_pass
        FROM client_passes
        WHERE id = p_pass_id
        FOR UPDATE;

        IF v_pass.credits_left <= 0 THEN
            RETURN json_build_object('success', false, 'error', 'INSUFFICIENT_CREDITS');
        END IF;

        v_new_credits := v_pass.credits_left - 1;
        UPDATE client_passes SET credits_left = v_new_credits WHERE id = p_pass_id;

        INSERT INTO credit_ledger (user_id, pass_id, type, delta, balance_after, reference_id, note)
        VALUES (v_pass.user_id, p_pass_id, 'BOOKING_DEBIT', -1, v_new_credits, p_session_id::text, 'Redeemed class pass');
    END IF;

    -- Increment booked count
    UPDATE class_sessions
    SET booked_count = booked_count + 1
    WHERE id = p_session_id;

    -- Create Booking
    INSERT INTO bookings (session_id, client_email, client_name, client_phone, payment_method, credits_deducted)
    VALUES (p_session_id, p_client_email, p_client_name, p_client_phone, p_payment_method, CASE WHEN p_payment_method = 'PASS_CREDIT' THEN 1 ELSE 0 END)
    RETURNING id INTO v_booking_id;

    RETURN json_build_object('success', true, 'booking_id', v_booking_id);
END;
$$ LANGUAGE plpgsql;

