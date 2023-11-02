import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.header('api-key');
    const expectedApiKey = process.env.API_KEY;
    
    return apiKey === expectedApiKey;
  }
}