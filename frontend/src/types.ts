/* types.ts */

export type Report = {
    id: number;
    type: string;
    position: [number, number];
    timestamp: string;
    confirmations: number;
    dismissals: number;
};