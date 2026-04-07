import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { answer } = await request.json()

  const correctAnswer = (process.env.SECRET_ANSWER || '').trim().toLowerCase()
  const providedAnswer = (answer || '').trim().toLowerCase()

  if (!correctAnswer) {
    return NextResponse.json(
      { error: 'Account creation is not configured. Contact your administrator.' },
      { status: 500 }
    )
  }

  if (!providedAnswer || providedAnswer !== correctAnswer) {
    return NextResponse.json(
      { error: 'Incorrect answer. Check with your manager and try again.' },
      { status: 401 }
    )
  }

  return NextResponse.json({ verified: true })
}
