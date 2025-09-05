import cloudinary from 'cloudinary'
import { reject } from 'lodash'
import streamifier from 'streamifier'
import { env } from '~/config/environment'

//bước cấu hình cloudinary , sử dụng v2-vesion 2
const cloudinaryV2 = cloudinary.v2
cloudinaryV2.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key:env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
})
//khởi tạo1 function để thựchhieenj upload file lên Cloudinary
const streamUpload = (fileBuffer, folderName) => {
    return new Promise((resolve,reject)=>{
        const stream  = cloudinaryV2.uploader.upload_stream({ folder: folderName, secure: true }, (err,result)=>{
            if(err) reject(err)
            else resolve(result)
        })
        //Thực hiện upload cái luồng tên bằng lib streamifier
        streamifier.createReadStream(fileBuffer).pipe(stream)
    })
    
}
export const CloudinaryProvider = {
    streamUpload
}