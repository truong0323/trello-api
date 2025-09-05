 /** 
 * Simple method to Convert a String to Slug
 * Các bạn có thể tham khảo thêm kiến thức liên quan ở đây: https://byby.dev/js-slugify-string
 */
import bcryptjs from 'bcryptjs'
import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { ResendProvider } from '~/providers/ResendProvider'
import { env } from '~/config/environment'
import { JWTProvider } from '~/providers/JwtProvider'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
const createNew = async (reqBody) => {
    try {
        //kiểm tra xem email đã tồn tại chưa

        const existUser = await userModel.findOneByEmail(reqBody.email)
        if (existUser) {
            throw new ApiError(StatusCodes.CONFLICT, 'email alredy exists')
        }
        //tạo data để lưu vòa database
        //nameFromEmail: nếu email là truonglemanh295@gmail.com thì sẽ được truonglemanh295
        const nameFromEmail = reqBody.email.split('@')[0]
        const newUser = {
            email: reqBody.email,
            password: bcryptjs.hashSync(reqBody.password, 8),// tham số thứ 2 là độ phức tạp
            username: nameFromEmail,
            displayName: nameFromEmail ,//mặc định để giống username khi đnawg kí mới 
            verifyToken: uuidv4()
        }

        //thực hiện lưu vào database
         const  createdUser = await userModel.createNew(newUser )

        //lấy bản ghi board sau khi gọi (tùy mục đích)
        const getNewUser = await userModel.findOneById(createdUser.insertedId)
        

        //gửi email cho người dùng xác thực
        const to = getNewUser.email
        const subject = 'create account successfully -truong0323'
        const html = `
        <h1> Hello ${getNewUser.username}</h1> 
        <h2> Tài khoản của bạn đã được tạo </h2> 
        <h3> Trân trọng cảm ơn ,I am Truong0323 </h3>
        `
        const sentEmailResponse = await ResendProvider.sendEmail({to,subject,html})

        console.log('Resend: sent Email Done: ',sentEmailResponse);
        // return tra về dữ liệu cho phía contrller

        return pickUser(getNewUser)
    } catch (error) { throw error }
}

const verifyAccount = async(reqBody) => {
    try {
        //qunry User trong database
        const existUser = await userModel.findOneByEmail(reqBody.email)

        //các bước kiểm tra cần thiết
        if( !existUser) throw new ApiError (StatusCodes.NOT_FOUND, 'Account not found') 
        if (existUser.isActive) throw new ApiError (StatusCodes.NOT_ACCEPTABLE, 'Your Account is already Active') 
        if (reqBody.token !== existUser.verifyToken) {
            throw new ApiError(StatusCodes.NOT_ACCEPTABLE , 'Token is invalid')
        }
        // Nếu như mọi thứ Ok thì chúng ta bắt đầu cập nhật thông tin của user để verifi accounnt
        const updateData = {
            isActive: true,
            verifyToken: null
        }
        //thực hiện update user
        const updatedUser = await userModel.update(existUser._id,updateData)
        return pickUser(updatedUser)
    } catch (error) {
        throw error
    }
}
const login = async(reqBody) => {
    try {
        const existUser = await userModel.findOneByEmail(reqBody.email)

        //các bước kiểm tra cần thiết
        if( !existUser) throw new ApiError (StatusCodes.NOT_FOUND, 'Account not found') 
        if (!existUser.isActive) throw new ApiError (StatusCodes.NOT_ACCEPTABLE, 'Your Account is not Active(Hãy vào email và check link )') 
        if (!bcryptjs.compareSync(reqBody.password , existUser.password)) {
            throw new ApiError (StatusCodes.NOT_ACCEPTABLE, 'Your Email or Password is incorrect') 
        }
        //Nếu mọi thứ Ok thì bắt đầu tạo tokens đnawg nhập trả về cho phía FE

        // Tạo Thoong tin sẽ dinhs kefm trong JWT Token bao gồm _id và email  của user
        const userInfo = {
            _id: existUser._id,
            email: existUser.email
        }
        //Tạo ra 2 loại token ,accessToken và refreshToken để trả về phía FE
        const accessToken = await JWTProvider.generateToken(
            userInfo,
            env.ACCESS_TOKEN_SECRET_SIGNATURE,
            env.ACCESS_TOKEN_LIFE
            // 5
        )

        const refreshToken = await JWTProvider.generateToken(
            userInfo,
            env.REFRESH_TOKEN_SECRET_SIGNATURE,
            env.REFRESH_TOKEN_LIFE,
            // 15
            
            
        )

        //trả  về thông tin của user kèm theo 2 cái token vừa tạo
        return {
            accessToken,
            refreshToken,
            ...pickUser(existUser)
        }
        
    } catch (error) {
        throw error
    }
}
const refreshToken = async (clientRefreshToken) => {
    try {
        //Verify/ giải mã cái refresh token có hợp lệ hay không
        const refreshTokenDecoded = await JWTProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE)
        //Đoạn này vì chúng ta chỉ lưu những thông tin unique và cố định user trong token rồi ,vì vậy có thể lấy luôn từ decoded ra ,tiết kiệm query vào DB để lấy ra data mới
        const userInfo = {
            _id: refreshTokenDecoded._id,
            email: refreshTokenDecoded.email
        }
        //Taoj accessToken mowis
        const accessToken = await JWTProvider.generateToken(
            userInfo,
            env.ACCESS_TOKEN_SECRET_SIGNATURE,
            //dùng 5 giây để test token hết hạn
            env.ACCESS_TOKEN_LIFE,
            // 5
        )
        return {accessToken}

    } catch (error) { throw error}
}
const update = async (userId , reqBody,userAvatarFile) => {
    try {
        const existUser = await userModel.findOneById(userId)
        if (!existUser) throw new ApiError( StatusCodes.NOT_FOUND, 'Account not Found!')
        if (!existUser.isActive) throw new ApiError( StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')
        //Khởi tạo kết quả updated User ban đầu là empty
        let updatedUser = {}
        //trường hợp change password
        if(reqBody.current_password && reqBody.new_password) {
            //kiểm tra xem cái current_password đúng hay không
            if(!bcryptjs.compareSync(reqBody.current_password , existUser.password) ) {
                throw new ApiError (StatusCodes.NOT_ACCEPTABLE, 'Your Current Password is incorrect') 

            }
            //neeus current_password đúng thì hash mậtkhauar mới và update lại vào db:
            updatedUser = await userModel.update(userId , {
                password: bcryptjs.hashSync(reqBody.new_password, 8)
            })
        }
        else if (userAvatarFile) {
            //Truongwf hojwp upload file lên Cloud Storage ,cụ thể là Cloundinary
            const uploadResult = await CloudinaryProvider.streamUpload(userAvatarFile.buffer, 'users')
            console.log('uploadResult: ',uploadResult);

            //lưu lại URL của cái file ảnh vào trong DB
            updatedUser = await userModel.update(userId , {
                avatar: uploadResult.secure_url
            })

        }   
        else{
            // đây là trường hợp update những thoong tin chung như displayName
            updatedUser = await userModel.update(userId , reqBody)
        }
        return pickUser(updatedUser)

    } catch (error) {
        throw error
    }
}
export const userService = {
    createNew,
    verifyAccount,
    login,
    refreshToken,
    update

}