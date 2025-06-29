import { formatDate, formatNoWeekday } from "@/utils/formatDate";
import { localHost } from "@/utils/localhost";
import { FontAwesome, FontAwesome6, Ionicons, Octicons, AntDesign } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { View, Text, TouchableOpacity, Alert, ScrollView, Modal, Image } from "react-native";
import get  from "@/utils/get";
import { AuthContext} from "@/context/AuthContext";
import { useContext, useState, useEffect } from "react";
import ButtonCustom from "@/components/ui/ButtonCustom";
import { colors } from "@/constants/colors";
import { downloadImage } from "@/utils/downloadImage";
import patch from "@/utils/patch";
import Loading from "@/components/ui/Loading";
type AbsenceRequest={
    id:string,
    subjectId:string,
    proof:string[],
    status:string,
    reason:string,
    date:string,
    studentId:{
      name:string,
      userCode:string,
    },
}
export default function Absence() {
   const authContext = useContext(AuthContext);
   if (!authContext) {
     Alert.alert("Thông báo", "Đã xảy ra lỗi");
     return;
   }
  const { subjectId, name, code, date, sessionNumber, attendId } = useLocalSearchParams();
  const [absenceRequests, setAbsenceRequests] = useState<AbsenceRequest[]>([]);
  const { user, accessToken } = authContext;
  const [openModalDetail, setOpenModalDetail] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedAbsenceRequest, setSelectedAbsenceRequest] = useState<AbsenceRequest>({
      id: "",
      subjectId: "",
      proof: [],
      status: "",
      reason: "",
      date: "",
      studentId:{
        name: "",
        userCode: "",
      },
    });
  const [modalImageVisible, setModalImageVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const getAbsenceRequests=async()=>{
    const res=await get({url:`${localHost}/api/v1/absence/teacherRequest?subjectId=${subjectId}`,token:accessToken});
    console.log(res);
    if(res){
      if(res.status===200){
        const data=res.data.absenceRequests;
        const filterData=data.filter((item:AbsenceRequest)=>item.date==date);
        setAbsenceRequests(filterData);
        // setAbsenceRequests(data);
      }
    }
  }
  const handleDetailAbsenceRequest=(item:AbsenceRequest)=>{
    setSelectedAbsenceRequest(item);
    setOpenModalDetail(true);
  }
  //
  const changeStatus=async(status:string, id:string)=>{
    setLoading(true);
    const res=await patch({url:`${localHost}/api/v1/absence/update/${id}`,token:accessToken,data:{status}});
    if(res){
      if(res.status===200){
        Alert.alert("Thông báo", "Đã thay đổi trạng thái");
        setAbsenceRequests(absenceRequests.map((item)=>item.id===id?{...item,status:status}:item));
        setOpenModalDetail(false);
      }
    }
    setLoading(false);
  }

  useEffect(()=>{
    getAbsenceRequests();
  },[]);
  return (
    <View className="flex-1">
      <Loading loading={loading} />
      {/* selected absence request */}
      <Modal
        visible={openModalDetail}
        className="flex-1"
        transparent={true}
        animationType="fade"
      >
        <View
          className="flex-1 justify-center items-center z-50 relative"
          style={{ backgroundColor: "rgba(170, 170, 170, 0.8)" }}
        >
          <TouchableOpacity
            onPress={() => setOpenModalDetail(false)}
            className="ml-auto mr-[3%] mt-[-8px] mb-1"
          >
            <FontAwesome name="close" size={28} color="red" />
          </TouchableOpacity>
          <View className="bg-white px-[8%] w-[90%]  pt-3 pb-4 rounded-lg shadow-lg">
            <View className=" mb-4 items-center justify-center">
              <Text className="text-lg font-msemibold mx-auto">
                Đơn xin nghỉ
              </Text>
              <Text
                className={`-mt-1 ${
                  selectedAbsenceRequest.status == "approved"
                    ? "text-green"
                    : selectedAbsenceRequest.status == "rejected"
                    ? "text-red"
                    : "text-orange"
                }`}
              >
                {selectedAbsenceRequest.status == "approved"
                  ? "Đã duyệt"
                  : selectedAbsenceRequest.status == "rejected"
                  ? "Từ chối"
                  : "Chưa duyệt"}
              </Text>
            </View>
            <Text className="text-base font-mmedium -mt-1">Họ tên</Text>

            <View className=" mt-1 py-1 px-3 w-[100%] h-[40px]  border border-gray-300 rounded-md justify-center">
              <Text>{selectedAbsenceRequest.studentId.name}</Text>
            </View>

            <Text className="text-base font-mmedium mt-2">MSSV</Text>
            <View className=" mt-1 py-1 px-3 w-[100%] h-[40px]  border border-gray-300 rounded-md justify-center">
              <Text>{selectedAbsenceRequest.studentId.userCode}</Text>
            </View>
            <Text className="text-base font-mmedium mt-2">Lý do</Text>
            <View className=" mt-1 py-2 px-3  border border-gray-300 rounded-md">
              <ScrollView className="max-h-[110px]">
                <Text className="text-base leading-[22px]">
                  {selectedAbsenceRequest.reason}
                </Text>
              </ScrollView>
            </View>
            <View className="flex-row  mt-2 items-center">
              <Text className="text-base font-mmedium">Minh chứng</Text>
            </View>
            <View className="h-[180px] border border-gray-300 rounded-md px-1 mt-1">
              <ScrollView className="max-h-[178px]">
                <View className="h-1" />
                <View className="flex-row flex-wrap">
                  {selectedAbsenceRequest.proof.map((uri, index) => (
                    <View
                      key={index}
                      className="m-1 relative rounded-md border border-gray-200"
                    >
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedImage(uri);
                          setModalImageVisible(true);
                        }}
                      >
                        <Image
                          source={{ uri }}
                          className="w-[80px] h-[80px] rounded-md"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
            {selectedAbsenceRequest.status == "pending" ? (
              <View className="flex-row justify-center">
                <ButtonCustom
                  handle={() => changeStatus("rejected", selectedAbsenceRequest.id)}
                  content="Từ chối"
                  otherStyle="mt-5 w-[40%] bg-red"
              />
              <ButtonCustom
                handle={() => changeStatus("approved", selectedAbsenceRequest.id)}
                content="Duyệt đơn"
                otherStyle="mt-5 w-[40%] bg-green"
                />
              </View>
            ) : (
              <ButtonCustom
                handle={() => changeStatus("pending", selectedAbsenceRequest.id)}
                content="Hủy bỏ"
                otherStyle="mt-5 w-[40%] bg-blue"
              />
            )}
          </View>
        </View>
      </Modal>
      {/* modal image */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalImageVisible}
        onRequestClose={() => setModalImageVisible(false)}
      >
        <View
          className="relative p-0 m-0 w-full h-full"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
        >
          <View className="flex-row absolute top-2 right-3 z-50">
            <TouchableOpacity
              className="ml-auto mr-[6px] bg-gray-300/60 rounded-full w-[32px] h-[32px] items-center justify-center"
              onPress={() => downloadImage(selectedImage)}
            >
              <Octicons name="download" size={23} color={colors.blue_primary} />
            </TouchableOpacity>
            <TouchableOpacity
              className="ml-auto bg-gray-300/60 rounded-full w-[32px] h-[32px] items-center justify-center"
              onPress={() => setModalImageVisible(false)}
            >
              <AntDesign name="close" size={23} color="red" />
            </TouchableOpacity>
          </View>

          <View className="w-full h-[85%] my-auto">
            <Image
              className="w-full h-full"
              source={{ uri: selectedImage }}
              style={{ resizeMode: "contain" }}
            />
          </View>
        </View>
      </Modal>
      <View className=" shadow-md  pb-[1.8%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center ">
        <TouchableOpacity onPress={router.back}>
          <Ionicons name="chevron-back-sharp" size={24} color="white" />
        </TouchableOpacity>
        <View className="mx-auto items-center pr-6">
          <Text className="text-[18px] font-msemibold uppercase text-white">
            Giấy phép
          </Text>
          <Text className="mt-[-3px] text-white font-mmedium">
            {formatNoWeekday(date)}
          </Text>
        </View>
      </View>
      <ScrollView className="mt-3">
        {absenceRequests.length == 0 ? (
          <View className="flex-1 items-center justify-center h-full">
            <Text className="text-gray-500">Không tìm thấy</Text>
          </View>
        ) : (
          absenceRequests.map((item, index) =>
            item.status == "rejected" ? (
              <TouchableOpacity
                key={index}
                onPress={() => handleDetailAbsenceRequest(item)}
                className="flex-row bg-white w-[90%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3"
              >
                <View className="mx-auto items-center justify-center">
                  <Text>{formatDate(item.date)}</Text>
                  <Text className="text-[#FE3535] text-base font-mmedium mt-1">
                    Từ chối
                  </Text>
                </View>
              </TouchableOpacity>
            ) : item.status == "approved" ? (
              <TouchableOpacity
                key={index}
                onPress={() => handleDetailAbsenceRequest(item)}
                className="flex-row bg-white w-[90%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3"
              >
                <View className="mx-auto items-center justify-center">
                  <Text>{formatDate(item.date)}</Text>
                  <Text className="text-green text-base font-mmedium mt-1">
                    Đã duyệt
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                key={index}
                onPress={() => handleDetailAbsenceRequest(item)}
                className="flex-row bg-white w-[90%] mx-auto py-2 rounded-2xl items-center justify-end px-5 mb-3"
              >
                <View className="mx-auto items-center justify-center">
                  <Text>{formatDate(item.date)}</Text>
                  <Text className="text-orange text-base font-mmedium mt-1">
                    Chưa duyệt
                  </Text>
                </View>
                <FontAwesome6 name="exclamation" size={22} color={colors.orange} />
              </TouchableOpacity>
            )
          )
        )}
      </ScrollView>
    </View>
  );
}

