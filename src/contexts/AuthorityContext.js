import React, { createContext, useContext, useState } from 'react';

const AuthorityContext = createContext();

export const useAuthority = () => {
  const context = useContext(AuthorityContext);
  if (context === undefined) {
    throw new Error('useAuthority must be used within an AuthorityProvider');
  }
  return context;
};

export const AuthorityProvider = ({ children }) => {
  const [selectedAuthority, setSelectedAuthority] = useState(null);

  const value = {
    selectedAuthority,
    setSelectedAuthority,
  };

  return (
    <AuthorityContext.Provider value={value}>
      {children}
    </AuthorityContext.Provider>
  );
};
