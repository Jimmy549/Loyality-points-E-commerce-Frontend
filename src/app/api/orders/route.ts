import { NextRequest, NextResponse } from 'next/server';
import { addOrder, getOrders } from '@/lib/dataStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📦 Order data received:', JSON.stringify(body, null, 2));
    
    const newOrder = {
      _id: 'order-' + Date.now(),
      user: body.userDetails?.email || 'user-123',
      items: [
        {
          product: {
            _id: 'prod1',
            name: 'Sample Product',
            price: body.total || 50,
            images: ['/images/pic1.png']
          },
          quantity: 1,
          size: 'M',
          color: 'Black',
          price: body.total || 50
        }
      ],
      totalAmount: body.total || 50,
      loyaltyPointsEarned: Math.floor(body.total || 50),
      loyaltyPointsUsed: body.pointsToUse || 0,
      status: 'confirmed',
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod || 'credit_card',
      paymentDetails: body.paymentDetails,
      userDetails: body.userDetails,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    addOrder(newOrder);
    console.log('✅ Order saved to backend:', newOrder._id);
    
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const orders = getOrders();
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedOrders = orders.slice(startIndex, endIndex);
    
    console.log('📋 Fetching orders - Total:', orders.length, 'Page:', page);
    
    return NextResponse.json({
      orders: paginatedOrders,
      total: orders.length,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}