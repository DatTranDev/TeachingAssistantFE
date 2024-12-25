import React, { createContext, useState, ReactNode } from 'react';


type SharedContextType = {
  sharedSubject: {
      subjectId:string,
      name:string,
      code:string,
      currentSession:number,
  };
  setSharedSubject: (data: {
      subjectId:string,
      name:string,
      code:string,
      currentSession:number,
  }) => void;
  sharedAttend: {
    attendId:string,
    date:string,
    isActive:boolean,
    timeExpired:number,
  };
  setSharedAttend: (data: {
    attendId:string,
    date:string,
    isActive:boolean,
    timeExpired:number,
  }) => void;
};

export const SharedContext = createContext<SharedContextType | undefined>(undefined);

export const SharedProvider = ({ children }: { children: ReactNode }) => {
  const [sharedSubject, setSharedSubject] = useState<{
      subjectId:string,
      name:string,      
      code:string,
      currentSession:number,
  }>({
    subjectId:'',
    name:'',
    code:'',
    currentSession:0,
  });
  const [sharedAttend, setSharedAttend] = useState<{
    attendId:string,
    date:string,
    isActive:boolean,
    timeExpired:number,
  }>({
    attendId:'',
    date:'',
    isActive:false,
    timeExpired:0,
  });


  return (
    <SharedContext.Provider value={{ sharedSubject, setSharedSubject, sharedAttend, setSharedAttend }}>
      {children}
    </SharedContext.Provider>
  );
};