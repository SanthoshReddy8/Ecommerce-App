export class AppError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
    public code?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class OutOfStockError extends AppError {
  constructor(message = "Not enough stock available") {
    super(message, 409, "OUT_OF_STOCK");
    this.name = "OutOfStockError";
  }
}

export class ReservationExpiredError extends AppError {
  constructor(message = "Your reservation has expired") {
    super(message, 410, "RESERVATION_EXPIRED");
    this.name = "ReservationExpiredError";
  }
}

export class CouponError extends AppError {
  constructor(message: string) {
    super(message, 400, "COUPON_ERROR");
    this.name = "CouponError";
  }
}
