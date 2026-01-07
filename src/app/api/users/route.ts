import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo
let users: any[] = [];

export async function GET(request: NextRequest) {
  try {
    console.log('Users API - GET request');
    console.log('Total users in system:', users.length);
    
    return NextResponse.json({
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        loyaltyPoints: u.loyaltyPoints,
        createdAt: u.createdAt
      })),
      total: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...updateData } = body;
    
    console.log('Updating user:', userId, updateData);
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updateData, updatedAt: new Date().toISOString() };
      console.log('User updated successfully');
      return NextResponse.json(users[userIndex]);
    } else {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}