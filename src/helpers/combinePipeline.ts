import { PipelineStage } from 'mongoose';
import { Sort } from '../types';

const combinePipeline = (skip: number, limit: number, sort: Sort | null, filter: any): PipelineStage[] => {
  let pipeline: PipelineStage[] = [{ $skip: skip || 0 }, { $limit: limit || 9999 }];

  if (!!sort && Object.values(sort).length) {
    pipeline = [{ $sort: sort }, ...pipeline];
  } else {
    pipeline = [{ $sort: { number: 1 } }, ...pipeline];
  }

  if (!!filter && Object.values(filter).length) {
    pipeline = [{ $match: filter }, ...pipeline];
  }

  return pipeline;
};

export { combinePipeline };
