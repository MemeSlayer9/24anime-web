'use client';

import { use } from 'react';

export default function ItemPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);
  
  return (
    <div style={{ padding: 20 }}>
      <h1 className="text-3xl font-bold">Item Details</h1>
      <p className="text-lg mt-4">You clicked item with ID: {id}</p>
    </div>
  );
}