
import React from 'react';

interface HeaderProps {
    title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <div className="flex items-center justify-between space-y-2">
      <h2 className="text-3xl font-bold tracking-tight text-foreground">
        {title}
      </h2>
    </div>
  );
}
