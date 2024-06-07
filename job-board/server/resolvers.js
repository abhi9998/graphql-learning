import {  GraphQLError} from 'graphql';
import {  getCompany } from './db/companies.js';
import { createJob, deleteJob, getJobs,getJobsByCompany,getJob, updateJob, countJobs } from './db/jobs.js';
import { getUser } from './db/users.js';

export const resolvers = {
    Query: {
        jobs: async(__root, {limit,offset}) => {
            const items = await getJobs(limit,offset);
            const totalCount = await countJobs();
            console.log(items);
            return { items, totalCount };
        },
        job: async(parent, {id}) => {
            const jobs = await getJobs();
            const job = jobs.find((job) => job.id === id);

            if(!job) throw new GraphQLError('Error getting jobs', {
                extensions:{
                    code: 'ERROR_GETTING_JOBS'
                }
            });

            return job;
        },
        company: async(parent, {id}) => {
            return getCompany(id);
        }
    },
    Job: {
        date: (job) => {
            return toISOString(job.createdAt);
        },
        company: async(job, __args, {companyLoader} ) => {
            
            const Company =  companyLoader.load(job.companyId);
            
            return Company;
        }
    },
    Company:{
        jobs: (company) => {
            return getJobsByCompany(company.id);
        }
    
    },

    Mutation:{
        createJob:async (__root,{input:{title,description}},context)=>{

            if(!context.user) throw new GraphQLError('Error creating job', {
                extensions:{
                    code: 'ERROR_CREATING_JOB'
                }
            });

              
            const companyId = context.user.companyId;
            console.log(companyId);
            return createJob({companyId,title,description});

        },
        deleteJob: async (__root,{id}, {user})=>{
            console.log("The value of user is ");

            if(!user) throw new GraphQLError('Error deleting job', {
                extensions:{
                    code: 'ERROR_DELETING_JOB'
                }
            });

            const job = await getJob(id);
            console.log("The value of data is ");
            console.log(job);
            console.log(user);
            if(!job || job.companyId !== user.companyId ) throw new GraphQLError('Error deleting job', {
                extensions:{
                    code: 'ERROR_DELETING_JOB'
                }
            });
            const companyId = "FjcJCHJALA4i";     
            return deleteJob(id,companyId);
        },
        updateJob: async (__root,{input:{id,title,description}})=> {
            const companyId = "FjcJCHJALA4i";

            const job = await getJob(id);
            console.log(job);
            if(!job) throw new GraphQLError('Error updating job', {
                extensions:{
                    code: 'ERROR_UPDATING_JOB'
                }
            });

            return updateJob({id,companyId,title,description});
        }

    }
};

function toISOString(value){
    return value.slice(0,'yyyy-mm-dd'.length);
}