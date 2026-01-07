import { NextRequest, NextResponse } from 'next/server';
import { addUser, getUsers } from '@/lib/dataStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...userData } = body;
    
    console.log('Auth API called:', action, userData);
    
    if (action === 'register') {
      const users = getUsers();
      const existingUser = users.find(u => u.email === userData.email);
      if (existingUser) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 });
      }
      
      const newUser = {
        id: 'user-' + Date.now(),
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: 'customer',
        loyaltyPoints: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      addUser(newUser);
      console.log('✅ User registered and saved:', newUser.email);
      
      return NextResponse.json({
        message: 'Registration successful',
        access_token: 'token-' + Date.now(),
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          loyaltyPoints: newUser.loyaltyPoints
        }
      });
    }
    
    if (action === 'login') {
      const users = getUsers();
      const user = users.find(u => u.email === userData.email);
      
      if (user && user.password === userData.password) {
        console.log('✅ User logged in successfully:', user.email);
        return NextResponse.json({
          access_token: 'token-' + Date.now(),
          user: {
            id: user.id,
            name: user.name, // This will be the full name from registration
            email: user.email,
            role: user.role,
            loyaltyPoints: user.loyaltyPoints
          }
        });
      } else {
        console.log('❌ Invalid credentials for:', userData.email);
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}