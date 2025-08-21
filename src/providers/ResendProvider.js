///http;resend.com
import { Resend } from 'resend'
import { env } from '~/config/environment'
const RESEND_API_KEY = env.RESEND_API_KEY

//để gửi được email ,bạn phải chứng minh được rằng bạn sở hữu và có quyền kiểm soát tên miền (domain) mà bạn đnag dùng để gửi .
// Nếu không có domain thì bắt buộc phải dùng tạm email  dev này của resend để test gửi email
const ADMIN_SENDER_EMAIL = env.ADMIN_SENDER_EMAIL

//tạo môttj cái instance của Resend để dùng
const resendInstance = new Resend(RESEND_API_KEY)

//function guwir mail
const sendEmail = async ({ to , subject, html}) =>{
    try {
        const data = await resendInstance.emails.send({
            from: ADMIN_SENDER_EMAIL,
            to,//nếu chưa có valid domain thì chỉ được gửi ddeeens email mà bạn đnagw ký tài khỏa với Resend thôi
            subject,
            html
        })
        return data
    } catch (error) {
        console.log('ResendProvider.sendEmail erorr: ', error)
        throw error
    }
}
export const ResendProvider = {
    sendEmail
}
