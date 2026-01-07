import { NextRequest, NextResponse } from 'next/server';
import { getUsers, getOrders, getPayments } from '@/lib/dataStore';

export async function GET(request: NextRequest) {
  try {
    const users = getUsers();
    const orders = getOrders();
    const payments = getPayments();
    
    console.log('=== 🔍 DEBUG API CALLED ===');
    console.log('👥 Users count:', users.length);
    console.log('📦 Orders count:', orders.length);
    console.log('💳 Payments count:', payments.length);
    
    return NextResponse.json({
      summary: {
        totalUsers: users.length,
        totalOrders: orders.length,
        totalPayments: payments.length,
        timestamp: new Date().toISOString()
      },
      data: {
        users: users.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          loyaltyPoints: u.loyaltyPoints,
          createdAt: u.createdAt
        })),
        orders: orders.map(o => ({
          id: o._id,
          userId: o.user,
          total: o.totalAmount,
          status: o.status,
          createdAt: o.createdAt
        })),
        payments: payments.map(p => ({
          id: p.id,
          orderId: p.orderId,
          amount: p.amount,
          status: p.status,
          createdAt: p.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ error: 'Debug failed' }, { status: 500 });
  }
}