enum Status {
  INACTIVE = 0,
  ACTIVE = 1,
}

export enum AccountStatus {
  INACTIVE = Status.INACTIVE,
  ACTIVE = Status.ACTIVE,
}

export enum AccountType {
  REGULAR = 1,
  PRO = 2,
}

export enum ModuleType {
  DELETED = 0,
  DRAFT = 1,
  OFFLINE = 2,
  LIVE = 3,
  PENDING = 4,
  REPLAY = 5,
}

export enum CourseTierType {
  FULL = 1,
  LIMITED = 2,
}

export enum PaymentOrigin {
  NextMba = 1,
  NextUni = 2,
}
