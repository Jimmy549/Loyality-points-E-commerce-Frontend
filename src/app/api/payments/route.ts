import { NextRequest, NextResponse } from 'next/server';
import { addPayment, getPayments } from '@/lib/dataStore';

export async function POST(request: NextRequest) {
  try {
    // Check authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    console.log('💳 Payment data received:', JSON.stringify(body, null, 2));
    
    const paymentRecord = {
      id: 'payment-' + Date.now(),
      orderId: body.orderId,
      userId: body.userId,
      amount: body.amount,
      paymentMethod: body.paymentMethod,
      cardDetails: {
        cardNumber: body.cardDetails?.cardNumber?.slice(-4) || 'XXXX',
        cardholderName: body.cardDetails?.cardholderName,
        expiryDate: body.cardDetails?.expiryDate
      },
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    
    addPayment(paymentRecord);
    console.log('✅ Payment saved:', paymentRecord.id);
    
    return NextResponse.json(paymentRecord, { status: 201 });
  } catch (error) {
    console.error('❌ Payment API error:', error);
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const payments = getPayments();
    let userPayments = payments;
    if (userId) {
      userPayments = payments.filter(p => p.userId === userId);
    }
    
    console.log('📋 Fetching payments - Total:', payments.length);
    
    return NextResponse.json({
      payments: userPayments,
      total: userPayments.length
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}