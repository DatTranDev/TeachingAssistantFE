// User.ts
export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    password: string;
    school: string;
    userCode: string;
    role:string
}

// Hàm khởi tạo để tạo đối tượng User từ dữ liệu API
export const createUserFromApi = (apiResponse: any): User => {
    return {
        id: apiResponse._id,
        name: apiResponse.name,
        email: apiResponse.email,
        avatar: apiResponse.avatar || '', // Đặt giá trị mặc định nếu không có
        password: '', // Đặt giá trị mặc định
        school: apiResponse.school,
        userCode: apiResponse.userCode,
        role:apiResponse.role
    };
};
