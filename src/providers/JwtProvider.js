import JWT from 'jsonwebtoken'
//funciton tạo mới 1 token -cần 3 tham số đầu vào 
// userInfo : những thông tin muốn đính kèm vào token
// secretSignature: Chữ kí bí mật (dạng một chuỗi string ngẫu nhiên ) trên docs thì để tên là privatekey tùy đều được
// tokenLife: thời gian sống của token
const generateToken = async (userInfo, secretSignature, tokenLife ) =>{
    try {
        //Hàm sign của JWT -thuật toán mặc định là HS256 
        return JWT.sign(userInfo, secretSignature, { algorithm: 'HS256',expiresIn: tokenLife })
    } catch (error) {
        throw new Error(error)
    }
}

//fucntion kiểm tra một token có hợp lê hay không
//Hợp lệ ở đây hiểu đơn giản là cái token đưuocj tạo ra có đúng với cái chữ ký bí mật secretSignature trong dự án hay không
const verifyToken = async (token , secretSignature) =>{
    try {
        //hàm verify của thư viện JWT
        return JWT.verify(token, secretSignature)
    } catch (error) {
        throw new Error(error)
    }
}
export const JWTProvider = {
    generateToken,

    verifyToken
}