import { PrismaService } from '../prisma.service';
interface JwtPayload {
    sub: number;
    email: string;
    role: string;
    iat: number;
}
declare const JwtStrategy_base: new (...args: unknown[]) => any;
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
