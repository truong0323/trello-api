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

        // return tra về dữ liệu cho phía contrller

        return pickUser(getNewUser)
    } catch (error) { throw error }
}
export const userService = {
    createNew
}