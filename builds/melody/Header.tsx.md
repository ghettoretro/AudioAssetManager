import { Music2 } from 'lucide-react';
import React from 'react';

const Header = () => {
  return (
    <header className="py-6 md:py-8 px-4">
      <div className="container mx-auto flex items-center gap-3">
        <Music2 className="w-8 h-8 text-primary" />
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight text-primary">
          Melody Pocket
        </h1>
      </div>
    </header>
  );
};

export default Header;
