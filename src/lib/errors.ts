export class NotFoundError extends Error {
  readonly status = 404;
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends Error {
  readonly status = 403;
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends Error {
  readonly status = 422;
  readonly fields: Record<string, string>;
  constructor(fields: Record<string, string>) {
    super("Validation failed");
    this.name = "ValidationError";
    this.fields = fields;
  }
}

export class DuplicateError extends Error {
  readonly status = 409;
  readonly field: string;
  readonly value: string;
  constructor(field: string, value: string) {
    super(`Duplicate value for field: ${field}`);
    this.name = "DuplicateError";
    this.field = field;
    this.value = value;
  }
}

/** Extract the Postgres constraint name from a 23505 error message. */
export function pgConstraintField(errorMessage?: string): string {
  const match = errorMessage?.match(/"([^"]+)"/);
  const constraint = match?.[1] ?? "";
  if (constraint.includes("lot_number")) return "lot_number";
  if (constraint.includes("phone")) return "phone";
  if (constraint.includes("gst")) return "gst";
  if (constraint.includes("name")) return "name";
  return "generic";
}
