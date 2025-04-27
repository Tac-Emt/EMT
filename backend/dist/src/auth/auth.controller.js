"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const user_service_1 = require("../user/user.service");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const class_validator_1 = require("class-validator");
class SignupDto {
}
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Invalid email format' }),
    __metadata("design:type", String)
], SignupDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Password must be a string' }),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    __metadata("design:type", String)
], SignupDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Name must be a string' }),
    (0, class_validator_1.MinLength)(1, { message: 'Name is required' }),
    __metadata("design:type", String)
], SignupDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.Role, { message: 'Role must be one of: USER, ORGANIZER, ADMIN' }),
    __metadata("design:type", String)
], SignupDto.prototype, "role", void 0);
class LoginDto {
}
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Invalid email format' }),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Password must be a string' }),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class VerifyOtpDto {
}
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Invalid email format' }),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'OTP must be a string' }),
    (0, class_validator_1.MinLength)(6, { message: 'OTP must be 6 digits' }),
    (0, class_validator_1.MaxLength)(6, { message: 'OTP must be 6 digits' }),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "otp", void 0);
class ForgotPasswordDto {
}
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Invalid email format' }),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "email", void 0);
class ResetPasswordDto {
}
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Invalid email format' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'OTP must be a string' }),
    (0, class_validator_1.MinLength)(6, { message: 'OTP must be 6 digits' }),
    (0, class_validator_1.MaxLength)(6, { message: 'OTP must be 6 digits' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "otp", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'New password must be a string' }),
    (0, class_validator_1.MinLength)(8, { message: 'New password must be at least 8 characters long' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
let AuthController = class AuthController {
    constructor(authService, userService) {
        this.authService = authService;
        this.userService = userService;
    }
    async signup(body) {
        console.log(`🔍 [AuthController] Signup request for email: ${body.email}, name: ${body.name}`);
        try {
            return await this.authService.signup(body.email, body.password, body.name, body.role || client_1.Role.USER);
        }
        catch (error) {
            console.error(`🚨 [AuthController] Signup failed: ${error.message}`);
            throw new common_1.HttpException(error.message, error.status || 400);
        }
    }
    async getOtp(body) {
        console.log(`🔍 [AuthController] Get OTP request for email: ${body.email}`);
        try {
            return await this.authService.getOtp(body.email);
        }
        catch (error) {
            console.error(`🚨 [AuthController] Get OTP failed: ${error.message}`);
            throw new common_1.HttpException(error.message, error.status || 400);
        }
    }
    async login(body) {
        console.log(`🔍 [AuthController] Login request for email: ${body.email}`);
        try {
            return await this.authService.login(body);
        }
        catch (error) {
            console.error(`🚨 [AuthController] Login failed: ${error.message}`);
            throw new common_1.HttpException(error.message, error.status || 400);
        }
    }
    async verifyOtp(body) {
        console.log(`🔍 [AuthController] Verify OTP request for email: ${body.email}, otp: ${body.otp}`);
        try {
            return await this.authService.verifyOtp(body.email, body.otp);
        }
        catch (error) {
            console.error(`🚨 [AuthController] Verify OTP failed: ${error.message}`);
            throw new common_1.HttpException(error.message, error.status || 400);
        }
    }
    async forgotPassword(body) {
        console.log(`🔍 [AuthController] Forgot password request for email: ${body.email}`);
        try {
            return await this.authService.forgotPassword(body.email);
        }
        catch (error) {
            console.error(`🚨 [AuthController] Forgot password failed: ${error.message}`);
            throw new common_1.HttpException(error.message, error.status || 400);
        }
    }
    async resetPassword(body) {
        console.log(`🔍 [AuthController] Reset password request for email: ${body.email}`);
        try {
            return await this.authService.resetPassword(body.email, body.otp, body.newPassword);
        }
        catch (error) {
            console.error(`🚨 [AuthController] Reset password failed: ${error.message}`);
            throw new common_1.HttpException(error.message, error.status || 400);
        }
    }
    async deleteUser(id) {
        console.log(`🔍 [AuthController] Delete user request for ID: ${id}`);
        const userId = Number(id);
        if (isNaN(userId)) {
            throw new common_1.BadRequestException('Invalid user ID');
        }
        try {
            return await this.userService.deleteUser(userId);
        }
        catch (error) {
            console.error(`🚨 [AuthController] Delete user failed: ${error.message}`);
            throw new common_1.HttpException(error.message, error.status || 400);
        }
    }
};
__decorate([
    (0, common_1.Post)('signup'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SignupDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)('get-otp'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getOtp", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [VerifyOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "deleteUser", null);
AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        user_service_1.UserService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map