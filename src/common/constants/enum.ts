export enum Status {
  INACTIVE = 0,
  ACTIVE = 1,
}

export enum AccountStatus {
  INACTIVE = Status.INACTIVE,
  ACTIVE = Status.ACTIVE,
}

export enum ModuleType {
  DELETED = 0,
  DRAFT = 1,
  OFFLINE = 2,
  LIVE = 3,
  PENDING = 4,
  REPLAY = 5,
}

export enum PaymentOrigin {
  NextMba = 1,
  NextUni = 2,
}

export enum AssignmentsType {
  INDIVIDUAL = 1,
  GROUP = 2,
}

export enum Difficulty {
  EAST = 1,
  MEDIUM = 2,
  HARD = 3,
}

export enum QuizStatus {
  DELETED = 0,
  ACTIVE = 1,
  PUBLISHED = 2,
}

export enum TakeStatus {
  FAIL = 0,
  ONGOING = 1,
  PASS = 2,
}

export enum ModuleTierType {
  FULL = 1,
  LIMITED = 2,
  ALL = 3,
}

export enum ChargeType {
  ONE_OFF = 1,
  RECURRING = 2,
}

export enum PaymentStatus {
  VOID = 0,
  PAID = 1,
  REFUNDED = 2,
}

// Affiliates
export enum AffiliateStatus {
  DECLINED = 0,
  ACTIVE = 1,
  PENDING = 2,
}

export enum CommissionStatus {
  UNPAID = 0,
  PAID = 1,
}

export enum WithdrawStatus {
  DECLINED = 0,
  PENDING = 1,
  APPROVED = 2,
}

// Subscriptions
export enum SubscriptionStatus {
  TRIALING = 'trialing',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  PAUSED = 'paused',
  UNPAID = 'unpaid',
  CANCELLED = 'canceled',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
}

export enum CourseTierStatus {
  PERMANENT = 1,
  PREMIUM = 2,
  TRIAL = 3,
}

export enum StudentAccountType {
  BASIC = 1,
  PREMIUM = 2,
  TRIAL = 3,
}
