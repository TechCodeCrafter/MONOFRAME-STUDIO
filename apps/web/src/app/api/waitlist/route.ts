import { NextRequest, NextResponse } from 'next/server';

// In-memory storage (will be replaced with database in production)
const waitlistEmails = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const emailTrimmed = email.trim().toLowerCase();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Check for duplicates
    if (waitlistEmails.has(emailTrimmed)) {
      return NextResponse.json(
        { success: false, message: 'This email is already on the waitlist' },
        { status: 400 }
      );
    }

    // Add to waitlist
    waitlistEmails.add(emailTrimmed);

    // Log to console (for development)
    console.log(`✅ New waitlist signup: ${emailTrimmed}`);
    console.log(`📊 Total waitlist count: ${waitlistEmails.size}`);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Successfully joined the waitlist',
        count: waitlistEmails.size 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check waitlist count (optional, for admin)
export async function GET() {
  return NextResponse.json(
    { 
      success: true,
      count: waitlistEmails.size,
      // Don't expose actual emails for privacy
    },
    { status: 200 }
  );
}

