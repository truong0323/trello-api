import { StatusCodes } from 'http-status-codes'
import multer from 'multer'
import ApiError from '~/utils/ApiError'
import { ALLOW_COMMON_FILE_TYPES ,LIMIT_COMMON_FILE_SIZE} from '~/utils/validators'
//Hầu hết những thứ bên dưới đều có trong docx của multer

//function Kiểm tra loại file nào được chấp nhận
const customFileFilter = (req, file , callback) => {
    // console.log('Multer: ',file)
    //Đối với thằng multer ,kiểm tra kiểu file thì sử dụng mimetype
    if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype) ) {
        const errorMessage =  'File type is invalid.Only accept jpg,jpeg and png'
        return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage),null)
    }
    //nếu như kiểu file hợp lệ:
    return callback(null, true)

}

//khởi tạo function đưcoj bọc bởi multer
const upload = multer ({
    limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
    fileFilter: customFileFilter
})
export const multerUploadMiddleware = {
    upload
}