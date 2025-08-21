/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB ,CLOSE_DB } from '~/config/mongodb'
import {env }from '~/config/environment'
import {APIs_V1} from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorhandlingMiddleware'
import cors from 'cors'
import { corsOptions } from '~/config/cors'
import cookieParser from 'cookie-parser'
const START_SERVER = () =>{
  const app = express()
  //fix cái Cache from disk của ExpressJs
  app.use((req, res ,next) =>{
    res.set('Cache-Control', 'no-store')
    next()
  })

  //cấu hình cookie parser
  app.use(cookieParser())
  //xử lí cors
  app.use(cors(corsOptions))
  //bật req.body json data (vào postman ghi dữ liệu có thể trả ra đúng)
  app.use(express.json())
//sử dụng API v1
  app.use('/v1', APIs_V1)
// middleware xử lí lỗi tập trung
  app.use( errorHandlingMiddleware)
//môi trường Production(cụ thể đang support Render.com)
  if(env.BUILD_MODE === 'production') {
    app.listen(process.env.PORT, () => {
    // eslint-disable-next-line no-console
      console.log(`Production: Hello ${env.AUTHOR}, back-end Server is running at Port: ${ process.env.PORT }`)
    })
  }
  else {
    // đây là môi trường localhost
    app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
    // eslint-disable-next-line no-console
      console.log(`Local Dev: Hello ${env.AUTHOR}, back-end Server is running at http://${ env.LOCAL_DEV_APP_HOST }:${ env.LOCAL_DEV_APP_PORT }/`)
    })
  }
  
  exitHook(async()=> {
    console.log( '4.Sever is shutting down');
    await CLOSE_DB()
     console.log( '5.Disconnected from MONGODB Colud Atlas');
  })
}
//Chỉ khi kết nối database thành công thì mới Start Serve Back-end lên


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

