import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client'; // Import Prisma types

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal Server Error'; // Default error message
    let stackTrace = null; // Variable to hold the stack trace

    if (exception instanceof HttpException) {
      // If the exception is an HttpException, extract the status code and message
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
        message = (exceptionResponse as { message: string }).message;
      }

      // Check if the exception has a stack trace
      if (exception.stack) {
        stackTrace = exception.stack;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle Prisma errors
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR; // You can customize the status code for Prisma errors

      if (exception.code === 'P2002' && exception.meta?.target && Array.isArray(exception.meta.target)) {
        // Check if it's a unique constraint violation (P2002)
        const uniqueViolationField = exception.meta.target[0];

        message = `Unique constraint violation for field: ${uniqueViolationField}`;
        // Customize the message to provide more information about the unique constraint violation
      } else {
        message = 'Prisma Database Error'; // Default message for other Prisma errors
      }

      stackTrace = exception.stack || stackTrace; // Use the exception stack trace if available
    } else {
      // Handle other types of exceptions
      message = exception.message || message; // Use the exception message if available
      stackTrace = exception.stack || stackTrace; // Use the exception stack trace if available
    }

    response.status(statusCode).json({
      statusCode,
      message,
      stackTrace,
      timestamp: new Date().toISOString(),
    });
  }
}
