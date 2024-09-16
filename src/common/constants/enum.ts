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
  PRO = 3,
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

export enum AssignmentsType {
  INDIVIDUAL = 1,
  GROUP = 2,
}

export enum Difficulty {
  EAST = 1,
  MEDIUM = 2,
  HARD = 3,
}

export const Active = {
  INCLUDED : true,
  EXCLUDED : false,
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
  ALL = 3
}


