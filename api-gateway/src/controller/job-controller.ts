import { IJobId, IPostJobRequest } from '@/dto/request/job.js';
import { IJob, IPostJobResponse } from '@/dto/response/job.js';
import { enqueueJob, getJob, retryFailedJob } from '@/service/job-service.js';
import type { NextFunction, Request, Response } from 'express';
import FILE_CONSTANTS from 'shared/constants';
import logs from 'shared/logs';


/**
 * 
 * @param req accept request with job type
 * @param res send response containing jobIds
 * @param next handles global error
 * @returns  JSON containing JobId, Status, Type
 */

const submitWorkerType  = async(req: Request<object, IPostJobResponse, IPostJobRequest>, res: Response<IPostJobResponse>,  next: NextFunction) => {
  const type = req.body.type ;
  try{
    const job = await enqueueJob(type);
    logs.logSuccess({
      action: FILE_CONSTANTS.MESSAGES.ACTION.JOB_POST,
      message:`${FILE_CONSTANTS.MESSAGES.MESSAGES.API_GATE_WAY.JOB_POSTED_SUCCESSFULLY}${ job.jobId}`,
      module:FILE_CONSTANTS.MESSAGES.SERVICE.API_GATEWAY,
    });
    return res.status(FILE_CONSTANTS.HTTP_STATUS.CREATED).json(job);
  }
  catch(error){
    logs.logError({
      action: FILE_CONSTANTS.MESSAGES.ACTION.JOB_POST,
      message:FILE_CONSTANTS.MESSAGES.MESSAGES.API_GATE_WAY.JOB_POSTED_FAILED,
      module:FILE_CONSTANTS.MESSAGES.SERVICE.API_GATEWAY,
    });
    next(error);
  }
  const job = await enqueueJob(type);
  res.status(FILE_CONSTANTS.HTTP_STATUS.CREATED).json(job);
};


/**
 * Get a job status
 * @param req accepts jobId from params
 * @param res return job response matching to IJob DTO
 * @param next handles global error
 * @returns JSON matching to IJob
 */

const getJobStatus  = async(req: Request<IJobId, IJob, object>, res: Response<IJob>,  next: NextFunction) => {
  const request = req.params.id ;
  try{
    const job = await getJob(request);
    logs.logSuccess({
      action: FILE_CONSTANTS.MESSAGES.ACTION.JOB_STATUS,
      message:`${FILE_CONSTANTS.MESSAGES.MESSAGES.API_GATE_WAY.JOB_STATUS_FETCHED_SUCCESSFULLY}${request}`,
      module:FILE_CONSTANTS.MESSAGES.SERVICE.API_GATEWAY,
    });
    return res.status(FILE_CONSTANTS.HTTP_STATUS.OK).json(job!);
  }
  catch(error){
    logs.logError({
      action: FILE_CONSTANTS.MESSAGES.ACTION.JOB_STATUS,
      message:`${FILE_CONSTANTS.MESSAGES.MESSAGES.API_GATE_WAY.FAILED_JOB_STATUS_FETCHED}${request}`,
      module:FILE_CONSTANTS.MESSAGES.SERVICE.API_GATEWAY,
    });
    next(error);
  }
};
  

/**
 * Retry failed jobs
 * @param req accepts jobId from params
 * @param res return job response matching to IJob DTO
 * @param next handles global error
 * @returns JSON matching to IJob
 */

const retryJob  = async(req: Request<IJobId, IJob, object>, res: Response<IPostJobResponse>,  next: NextFunction) => {
  const request = req.params.id ;
  try{
    const job = await retryFailedJob(request);
    logs.logSuccess({
      action: FILE_CONSTANTS.MESSAGES.ACTION.JOB_RETRY,
      message:`${FILE_CONSTANTS.MESSAGES.MESSAGES.API_GATE_WAY.JOB_RETRY_SUCCESS}${request}`,
      module:FILE_CONSTANTS.MESSAGES.SERVICE.API_GATEWAY,
    });
    return res.status(FILE_CONSTANTS.HTTP_STATUS.OK).json(job);
  }
  catch(error){
    logs.logError({
      action: FILE_CONSTANTS.MESSAGES.ACTION.JOB_RETRY,
      message:`${FILE_CONSTANTS.MESSAGES.MESSAGES.API_GATE_WAY.JOB_RETRY_FAILED}${request}`,
      module:FILE_CONSTANTS.MESSAGES.SERVICE.API_GATEWAY,
    });
    next(error);
  }
};

const jobController = {
  submitWorkerType,
  getJobStatus,
  retryJob
};


export default jobController;