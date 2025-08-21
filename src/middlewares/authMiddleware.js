import { StatusCodes } from 'http-status-codes'
import { JWTProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'

//middleware này sẽ đảm nhiệm việc : Xác thực JWT accessToken nhận được từ phía FE có hượp lệ hay không

const isAuthorized = async(req, res, next) => {
    //lấy accessToken nằm trong request cookies phía client -withCredentials trong file authorizeAxios
    const clientAccessToken = req.cookies?.accessToken
    //nếu clientAccessToken không tồn tại thì trả về lỗi luoon
    if( !clientAccessToken) {
        next( new ApiError(StatusCodes.UNAUTHORIZED, 'Unaythorized: (token not found)'))
        return
    }
    try {
        // bước 1:  thực hiện giải má token xem nó có hợp lệ hay không
        const acccessTokenDecoded = await JWTProvider.verifyToken(clientAccessToken,env.ACCESS_TOKEN_SECRET_SIGNATURE)
        // console.log(acccessTokenDecoded);
        // bước 2: quan trọng :  nếu như cái token hợp lệ , thì sẽ cần phải lưu thông tin giải mã đưuojcc vòa cái req.jwtDecoded( giờ mới được tạo để lưu cái token được giải mã ) để sử dụng cho các tầng cần xử lí
        req.jwtDecoded = acccessTokenDecoded
        //bước 3: Cho phép cái request đi tiếp
        next()

    } catch (error) {
        // console.log('authMiddleware:',error);
        //nếu cái acccessToken nó bị hết hạn (expired) thì mình cần trả về một cái mã lỗi 410 cho phía FE biết để gọi api refershToken
        if( error?.message?.includes('jwt expired')) {
            next(new ApiError(StatusCodes.GONE ,'Need to refesh Token'))
            return
        }
        // nếu nhưu cái accessToken nó không hợp lệ do bất kì điều gì khác vụ hết hạn thì chungs ta thangwr tay trả về mã 404 cho phía FE gọi api sign_out luôn
        next( new ApiError(StatusCodes.UNAUTHORIZED, 'Unaythorized!'))

    }
}
export const authMiddleware = {
    isAuthorized
}


