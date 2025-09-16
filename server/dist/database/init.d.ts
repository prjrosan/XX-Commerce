export declare function initializeDatabase(): Promise<void>;
export declare function closeDatabase(): void;
export declare const db: {
    execute: (query: string, params?: any[]) => Promise<any>;
    get: (query: string, params: any[], callback: Function) => void;
    all: (query: string, params: any[], callback: Function) => void;
    run: (query: string, params: any[], callback: Function) => void;
};
//# sourceMappingURL=init.d.ts.map