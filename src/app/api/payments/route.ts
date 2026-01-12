import { NextRequest, NextResponse } from 'next/server';
import { addPayment, getPayments } from '@/lib/dataStore';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if(!authHeader || !authHeader.startsWith('Bearer ')) return NextResponse.json({error:'Unauthorized'}, {status:401});
    
    const body = await request.json();
    const paymentRecord = {
      id: 'payment-'+Date.now(),
      orderId: body.orderId,
      userId: body.userId,
      amount: body.amount,
      paymentMethod: body.paymentMethod,
      cardDetails: {
        cardNumber: body.cardDetails?.cardNumber?.slice(-4)||'XXXX',
        cardholderName: body.cardDetails?.cardholderName,
        expiryDate: body.cardDetails?.expiryDate
      },
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    addPayment(paymentRecord);
    return NextResponse.json(paymentRecord,{status:201});
  } catch(error){
    console.error('Payment API error:', error);
    return NextResponse.json({error:'Payment processing failed'},{status:500});
  }
}

export async function GET(request: NextRequest){
  try{
    const {searchParams} = new URL(request.url);
    const userId = searchParams.get('userId');
    const payments = getPayments();
    const userPayments = userId ? payments.filter(p=>p.userId===userId) : payments;
    return NextResponse.json({payments:userPayments,total:userPayments.length});
  } catch(error){
    return NextResponse.json({error:'Failed to fetch payments'},{status:500});
  }
}
