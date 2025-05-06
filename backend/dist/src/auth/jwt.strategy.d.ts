import { Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
interface JwtPayload {
    sub: number;
    email: string;
    role: string;
    iat: number;
}
declare const JwtStrategy_base: new (...args: unknown[] | [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: JwtPayload): Promise<{
        id: number;
        email: string;
        role: string;
    }>;
}
export {};
