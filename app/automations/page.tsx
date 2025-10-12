import React from 'react';
import { PhoneModule } from '@/components/phone/phone-module';

export default function AutomationsPage() {
  return (
    <main className="w-full h-full">
      <div className="w-full p-0 md:p-6 space-y-4 md:space-y-6 pb-24 md:pb-6">
        <div className="mb-6 px-2">
          <h1 className="text-3xl font-bold">Tools</h1>
          <p className="mt-2 text-muted-foreground">
            Access productivity tools and utilities to enhance your workflow
          </p>
        </div>
        <div className="w-full px-2">
          <PhoneModule className="w-full" />
        </div>
      </div>
    </main>
  );
}
