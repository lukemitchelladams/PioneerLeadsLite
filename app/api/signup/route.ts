import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const { email, password, answer } = await request.json()

  // Secret answer is stored server-side only (not exposed to browser)
  const correctAnswer = (process.env.SECRET_ANSWER || '').trim().toLowerCase()
  const providedAnswer = (answer || '').trim().toLowerCase()

  if (!correctAnswer) {
    return NextResponse.json(
      { error: 'Account creation is not configured. Contact your administrator.' },
      { status: 500 }
    )
  }

  if (providedAnswer !== correctAnswer) {
    return NextResponse.json(
      { error: 'Incorrect answer. Please check with your manager and try again.' },
      { status: 401 }
    )
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters.' },
      { status: 400 }
    )
  }

  // Use service role key (never exposed to browser) to create user
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Skip email verification — user can log in immediately
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, userId: data.user?.id })
}
