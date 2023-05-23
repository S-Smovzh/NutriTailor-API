import { AnyObject, ProjectionElementType } from 'mongoose';

type ProjectionType<T> = { [P in keyof T]?: ProjectionElementType } | AnyObject;

export type { ProjectionType };
