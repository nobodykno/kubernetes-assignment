import type { ParamsDictionary } from 'express-serve-static-core';
export interface IPostJobRequest {
  type: string;  
}

export interface IGetJobRequest{
    id: string | number;
}


/**
 * DTO for download file params
 */

export interface IJobId extends ParamsDictionary {
    id: string;
  }
  