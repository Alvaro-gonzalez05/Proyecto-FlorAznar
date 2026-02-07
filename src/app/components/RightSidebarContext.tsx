'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface RightSidebarContextType {
    content: ReactNode | null;
    setContent: (content: ReactNode | null) => void;
}

const RightSidebarContext = createContext<RightSidebarContextType | undefined>(undefined);

export function RightSidebarProvider({ children }: { children: ReactNode }) {
    const [content, setContent] = useState<ReactNode | null>(null);

    return (
        <RightSidebarContext.Provider value={{ content, setContent }}>
            {children}
        </RightSidebarContext.Provider>
    );
}

export function useRightSidebar() {
    const context = useContext(RightSidebarContext);
    if (!context) {
        throw new Error('useRightSidebar must be used within RightSidebarProvider');
    }
    return context;
}
