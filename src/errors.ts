export class SheetFlowError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'SheetFlowError';
  }
}

export class SheetFlowValidationError extends SheetFlowError {
  public details: any;

  constructor(message: string, details?: any) {
    super(message);
    this.name = 'SheetFlowValidationError';
    this.details = details;
  }
}

export class SheetFlowConnectionError extends SheetFlowError {
  constructor(message: string) {
    super(message);
    this.name = 'SheetFlowConnectionError';
  }
}

export class SheetFlowAuthenticationError extends SheetFlowError {
  constructor(message: string) {
    super(message);
    this.name = 'SheetFlowAuthenticationError';
  }
}
