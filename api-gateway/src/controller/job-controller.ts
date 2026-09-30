import { IJobId, IPostJobRequest } from "@/dto/request/job.js";
import { IJob, IPostJobResponse } from "@/dto/response/job.js";
import { enqueueJob, getJob } from "@/service/job-service.js";
import type { NextFunction, Request, Response } from 'express';



const submitWorkerType  = async(req: Request<object, IPostJobResponse, IPostJobRequest>, res: Response<IPostJobResponse>,  next: NextFunction) => {
  const type = req.body.type ;
  try{
    const job = await enqueueJob(type);
    return res.status(201).json(job);
  }
  catch(error){
       next(error)
  }
  const job = await enqueueJob(type);
  res.status(201).json(job);
}


const getJobStatus  = async(req: Request<IJobId, IJob, object>, res: Response<IJob>,  next: NextFunction) => {
    const request = req.params.id ;
    try{
      const job = await getJob(request);
      return res.status(200).json(job!);
    }
    catch(error){
         next(error)
    }
  }
  

const jobController = {
    submitWorkerType,
    getJobStatus
}


export default jobController