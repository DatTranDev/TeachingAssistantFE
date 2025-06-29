import { useContext, useEffect, useState } from "react";
import { View, SafeAreaView, TouchableOpacity, Text, Alert, ScrollView, Image, Button } from "react-native";
import { AuthContext } from "@/context/AuthContext";
import { localHost } from "@/utils/localhost";
import get from "@/utils/get";
import patch from "@/utils/patch";
import { useRouter, useLocalSearchParams } from "expo-router";
import LinearField from "@/components/ui/LinearField";

import { formatNoWeekday } from "@/utils/formatDate";
import { Ionicons } from "@expo/vector-icons";
import Loading from "@/components/ui/Loading";

type AbsenceRequest = {
    id: string;
    studentId: {
        id: string;
        name: string;
        userCode: string;
    };
    subjectId: {
        id: string;
        name: string;
    };
    proof: string[] | null;
    date: string;
    reason: string;
    status: string;
    createdAt: string;
    updatedAt?: string;
}
const exampleData: AbsenceRequest = {
    id: "1",
    studentId: {
        id: "1",
        name: "Nguyễn Văn A",
        userCode: "123456",
    },
    subjectId: {
        id: "1",
        name: "Môn học 1",
    },
    proof: ['https://firebasestorage.googleapis.com/v0/b/expensetracker-214d3.appspot.com/o/files%2F1735574215344_1735574215950?alt=media&token=f3a45a4b-290d-49a2-b5f5-d74db82867b5', 'https://firebasestorage.googleapis.com/v0/b/expensetracker-214d3.appspot.com/o/files%2F1735574215344_1735574215950?alt=media&token=f3a45a4b-290d-49a2-b5f5-d74db82867b5', 'https://firebasestorage.googleapis.com/v0/b/expensetracker-214d3.appspot.com/o/files%2F1735574215344_1735574215950?alt=media&token=f3a45a4b-290d-49a2-b5f5-d74db82867b5', 'https://firebasestorage.googleapis.com/v0/b/expensetracker-214d3.appspot.com/o/files%2F1735574215344_1735574215950?alt=media&token=f3a45a4b-290d-49a2-b5f5-d74db82867b5'],
    reason: "Lý do vắng mặt",
    date: "2023-10-02",
    status: "pending",
    createdAt: "2023-10-02",
}
export default function NotificationDetail() {
    const authContext = useContext(AuthContext);
    if (!authContext) {
        Alert.alert("Thông báo", "Đã xảy ra lỗi");
        return;
    }
    const { user, accessToken } = authContext;
    const router = useRouter();
    const { id, model } = useLocalSearchParams();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("pendding");
    const [absenceRequest, setAbsenceRequest] = useState<AbsenceRequest>();

    const response = async (acepted: boolean) => {
        setLoading(true);
        const status = acepted ? "approved" : "rejected";
        const url = `${localHost}/api/v1/absence/update/${id}`;
        const token = accessToken;
        const data = {
            status: status,
            comment: "",
        };
        const response = await patch({ url, data, token });
        if (response) {
            if (response.status == 200) {
                Alert.alert("Thông báo", "Cập nhật thành công");
                setLoading(false);
                router.back();
            }
            else {
                Alert.alert("Thông báo", "Đã xảy ra lỗi, vui lòng thử lại sau !");
            }
            setLoading(false);
        }
        else
            Alert.alert("Thông báo", "Đã xảy ra lỗi, vui lòng thử lại sau !");
        setLoading(false);
    }
    useEffect(() => {
        const fetchAbsenceRequest = async () => {
            const url = `${localHost}/api/v1/absence/info/${id}`;
            const token = accessToken;
            const response = await get({ url, token });
            if (response) {
                if (response.status == 200) {
                    const data = response.data;
                    setAbsenceRequest(data.absenceRequest);
                    setStatus(data.absenceRequest.status);
                }
                else{
                    Alert.alert("Thông báo", "Đã xảy ra lỗi, vui lòng thử lại sau !");
                }
            }
            else
                setAbsenceRequest(exampleData)
        };
        if(model == "AbsenceRequest")
            fetchAbsenceRequest();
    }, []);
    return (
        <SafeAreaView className="flex-1">
            <Loading loading={loading} />

            {/* Header */}
            <View className="pb-[3.5%] border-b-[1px] border-gray-200 flex-row pt-[13%] px-[4%] items-center bg-blue_primary">
                <TouchableOpacity onPress={router.back}>
                    <Ionicons name="chevron-back-sharp" size={24} color="white" />
                </TouchableOpacity>
                <Text className="mx-auto text-[18px] font-msemibold uppercase text-white pr-1">
                    Nghỉ phép
                </Text>
            </View>

            {/* Nội dung cuộn */}
            <View className="flex-1 px-[8%] mb-[80px]">
                <View className="text-base my-[5%] p-[4%] bg-white rounded-2xl">
                    <LinearField field="Tên sinh viên:" value={absenceRequest?.studentId.name} />
                    <LinearField field="Mã sinh viên:" value={absenceRequest?.studentId.userCode} />
                    <LinearField field="Ngày vắng:" value={formatNoWeekday(absenceRequest?.date ?? '')} />
                    <LinearField field="Môn học:" value={absenceRequest?.subjectId.name} />
                    <LinearField customStyle="text-red" field="Lý do:" value={absenceRequest?.reason} />
                </View>

                <Text className="text-base font-bold">Minh chứng</Text>

                {absenceRequest?.proof !== null ? (
                    <ScrollView className="h-[300px] mt-2" scrollEnabled={true}>
                        {absenceRequest?.proof.map((item, index) => (
                            <View className="items-center justify-center" key={index}>
                                <Image source={{ uri: item }} className="w-[150px] h-[150px] mt-4" />
                            </View>
                        ))}
                    </ScrollView>
                ) : (
                    <View className="items-center justify-center mt-4">
                        <Image source={require('@/assets/images/empty.png')} className="w-[100px] h-[100px]" />
                        <Text className="text-base text-center mt-2">Không có minh chứng</Text>
                    </View>
                )}
            </View>

            {/* Nút bám đáy */}
            {
                status == "pending" && 
                (
                    <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
                        <TouchableOpacity
                            className="mx-2"
                            onPress={() => response(false)}
                        >
                            <View className="items-center rounded-3xl flex-row justify-center bg-red w-[120px] h-[40px]">
                                <Ionicons name="close" size={22} color="white" />
                                <Text className="text-[16px] text-white font-msemibold ml-1">Từ chối</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="mx-2"
                            onPress={() => response(true)}
                        >
                            <View className="items-center rounded-3xl flex-row justify-center bg-green w-[120px] h-[40px]">
                                <Ionicons name="checkmark" size={22} color="white" />
                                <Text className="text-[16px] text-white font-msemibold ml-1">Phê duyệt</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )
            }
            {
                status == "approved" && 
                (
                    <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
                            <View className="items-center rounded-3xl flex-row justify-center bg-green w-[160px] h-[40px]">
                                <Ionicons name="checkmark" size={22} color="white" />
                                <Text className="text-[16px] text-white font-msemibold ml-1">Đã phê duyệt</Text>
                            </View>
                    </View>
                )
            }
            {
                status == "rejected" && 
                (
                    <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
                        <View className="items-center rounded-3xl flex-row justify-center bg-red w-[160px] h-[40px]">
                            <Ionicons name="close" size={22} color="white" />
                            <Text className="text-[16px] text-white font-msemibold ml-1">Đã từ chối</Text>
                        </View>
                    </View>
                )
            }
        </SafeAreaView>

    );
}