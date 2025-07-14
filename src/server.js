/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB , GET_DB ,CLOSE_DB } from '~/config/mongodb'
import {env }from '~/config/environment'
const START_SERVER = () =>{
  const app = express()

  app.get('/', async(req, res) => {

    // console.log( await GET_DB().listCollections().toArray());
   
    res.end('<h1>Hello World!</h1><hr>');
  })

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`Hello ${env.AUTHOR}, I am running at http://${ env.APP_HOST }:${ env.APP_PORT }/`)
  })
  exitHook(async()=> {
    console.log( '4.Sever is shutting down');
    await CLOSE_DB()
     console.log( '5.Disconnected from MONGODB Colud Atlas');
  })
}
//Chỉ khi kết nối database thành công thì mới Start Serve Back-end lên


//dang tesst 
(async () => {
  try {
    console.log('connecting to MONGODB Cloud Atlas');
    await CONNECT_DB()
    console.log('connected to MONGODB Cloud Atlas');
    //khởi động serve backend sau khi connect db thành công
     START_SERVER()
  }catch(error) {
    console.log(error);
    // process.exit(0)
  }
}) ()


// CONNECT_DB()
//   .then(() => console.log('connect to MONGODB Cloud Atlas'))
//   .then(()=> START_SERVER())
//   .catch(error => {
//     console.log(error)
//     process.exit(0)
//   })

