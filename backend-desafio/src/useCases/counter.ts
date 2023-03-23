import { ICounter } from "../models/counters";
import counters from "../models/counters"

const incrementValue = 1

async function createCounter(name:string): Promise<ICounter>{
  return await counters.create(
    { nameCounter: name }
  ) as unknown as ICounter;
}

async function updateCounter(id:string, currentCount:number): Promise<ICounter>{
  return await counters.findByIdAndUpdate(
    id,
    {seq: currentCount+incrementValue},
    {new: true}
  ) as unknown as ICounter;
}

const counterIncrement = async function (name: string): Promise<number> {
  const query = { nameCounter: name }
  let counter = await counters.findOne(query) as unknown as ICounter
  if (!counter) {
    counter = await createCounter(name)
  }else{
    counter = await updateCounter(counter._id, counter.seq) 
  }
  return counter.seq;
}
export default counterIncrement 