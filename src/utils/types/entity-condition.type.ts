export type EntityCondition<T> = {
  [P in keyof T]?: T[P] extends number
    ? number | { $gt?: number; $lt?: number; $in?: number[] }
    : T[P] extends string
    ? string | { $regex?: string; $in?: string[] }
    : any;
};
