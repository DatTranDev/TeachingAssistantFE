import { FontAwesome, FontAwesome5, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState,useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, Modal, TouchableWithoutFeedback, TextInput } from "react-native";
import get from "@/utils/get";
import { localHost } from "@/utils/localhost";
import { AuthContext } from "@/context/AuthContext";
import { formatNoWeekday, formatDate } from "@/utils/formatDate";
import ButtonCustom from "@/components/ui/ButtonCustom";
import * as ImagePicker from 'expo-image-picker';
import { Feather, Entypo } from '@expo/vector-icons';
import { colors } from "@/constants/colors";
import { Image } from "react-native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { uploadImage } from "@/utils/uploadImgae";
import post from "@/utils/post";
import Loading from "@/components/ui/Loading";
import deleteApi from "@/utils/delete";
export type AbsenceRequest={
    id:string,
    subjectId:string,
    proof:string[],
    status:string,
    reason:string,
    date:string,
}
export default function Absence() {
   const authContext = useContext(AuthContext);
   if (!authContext) {
     Alert.alert("Thông báo", "Đã xảy ra lỗi");
     return;
   }

   const { subjectId, code } = useLocalSearchParams();
   const { accessToken, user, FCMToken } = authContext;
    const [absenceRequests,setAbsenceRequests]=useState<any[]>([]);
    const [openModal,setOpenModal]=useState(false);
    const [openModalDetail,setOpenModalDetail]=useState(false);
    const [dateAbsence,setDateAbsence]=useState<Date>(new Date());
    const [reason,setReason]=useState("");
    const [proof,setProof]=useState<string[]>([]);
    const [uploading,setUploading]=useState(false);
    const [selectedAbsenceRequest,setSelectedAbsenceRequest]=useState<AbsenceRequest>({
      id: "",
      subjectId: "",
      proof: [],
      status: "",
      reason: "",
      date: "",
    });
    const getAbsenceRequests=async()=>{
        const res=await get({url:`${localHost}/api/v1/absence/studentRequest?subjectId=${subjectId}`,token:accessToken});
        if(res){
          if(res.status===200){
            setAbsenceRequests(res.data.absenceRequests);
          }
        }
    }
     const pickImages = async () => {
       try {
         const result = await ImagePicker.launchImageLibraryAsync({
           mediaTypes: ImagePicker.MediaTypeOptions.Images,
           allowsMultipleSelection: true,
           quality: 0.3,
         });

         if (!result.canceled) {
           const newImages = result.assets.map((asset) => asset.uri);
           setProof([...proof, ...newImages]);
         }
       } catch (error) {
         Alert.alert("Lỗi", "Không thể chọn ảnh");
       }
     };
     const removeImage = (index: number) => {
       const newImages = proof.filter((_, i) => i !== index);
       setProof(newImages);
     };
     const handleCreateAbsenceRequest=async()=>{
       if (proof.length > 0) {
         setUploading(true);
         try {
           // Sử dụng Promise.all để đợi tất cả file upload xong
           const uploadPromises = proof.map((item) =>
             uploadImage(item)
           );
           const urlDownload = await Promise.all(uploadPromises);
           // Lọc ra các file upload thành công (có tên trả về)
           const uploaded = urlDownload.filter(
             (url) => url !== false
           ) as string[];
           if (uploaded.length == proof.length) {
             await sendRequest(uploaded);
           } else {
             Alert.alert("Thông báo", "Có lỗi xảy ra");
           }
         } catch (error) {
           Alert.alert("Thông báo", "Có lỗi xảy ra");
         } finally {
           setUploading(false);
         }
       } else {
         await sendRequest([]);
       }
     }
     const sendRequest=async(proof:string[])=>{
      const res=await post({url:`${localHost}/api/v1/absence/create`,token:accessToken,data:{
        subjectId:subjectId,
        studentId:user?.id,
        proof:proof,
        reason:reason,
        date:dateAbsence.toLocaleDateString()
      }})
      if(res){
        if(res.status===201){
          Alert.alert("Thông báo", "Đơn xin nghỉ đã được gửi");
          setOpenModal(false);
          setProof([]);
          setReason("");
          setDateAbsence(new Date());
          setAbsenceRequests((prev) => [
            {
              id: res.data.absenceRequest.id,
              subjectId: subjectId as string,
              proof: proof,
              status: "pending",
              reason: reason,
              date: dateAbsence,
            },
            ...prev,
          ]);
        }
      }
     }
     const handleDetailAbsenceRequest=(item:AbsenceRequest)=>{
      console.log(item);
      setSelectedAbsenceRequest(item);
      setOpenModalDetail(true);
     }
     const deleteAbsenceRequest=async()=>{
      Alert.alert(
        "Xác nhận",
        "Bạn có chắc chắn muốn xóa đơn xin nghỉ này không?",
        [
          {
            text: "Hủy",
            style: "cancel"
          },
          { 
            text: "Đồng ý",
            onPress: async () => {
      setUploading(true);
      const res=await deleteApi({url:`${localHost}/api/v1/absence/delete/${selectedAbsenceRequest.id}`,token:accessToken})
      console.log(res);
      setUploading(false);
      if(res){
        if(res.status===200){
          Alert.alert("Thông báo", "Đơn xin nghỉ đã được xóa");
          setAbsenceRequests((prev) =>
            prev.filter((item) => item.id !== selectedAbsenceRequest.id)
          );
          setOpenModalDetail(false);
        }
      }
    }
  },])}
    useEffect(()=>{
        getAbsenceRequests();
    },[]);
    
    return (
      <View className="flex-1 relative">
        <Loading loading={uploading} />
        <Modal
          visible={openModal}
          className="flex-1"
          transparent={true}
          animationType="fade"
        >
          <View
            className="flex-1 justify-center items-center z-50 relative"
            style={{ backgroundColor: "rgba(170, 170, 170, 0.8)" }}
          >
            <TouchableOpacity
              onPress={() => setOpenModal(false)}
              className="ml-auto mr-[3%] mt-[-8px] mb-1"
            >
              <FontAwesome name="close" size={28} color="red" />
            </TouchableOpacity>
            <View className="bg-white px-[8%] w-[90%]  pt-3 pb-4 rounded-lg shadow-lg">
              <Text className="text-lg font-msemibold mb-4 mx-auto">
                Đơn xin nghỉ
              </Text>
              <Text className="text-base font-mmedium">Ngày nghỉ</Text>

              <View className=" mt-3 py-1 px-3 w-[100%] h-[40px]  border border-gray-300 rounded-md">
                <TouchableOpacity
                  onPress={() => {
                    DateTimePickerAndroid.open({
                      value: new Date(),
                      onChange: (event: any, selectedDate: any) => {
                        if (selectedDate) {
                          setDateAbsence(selectedDate);
                        }
                      },
                      mode: "date",
                    });
                  }}
                  className="flex-1 flex-row items-center justify-between"
                >
                  <Text>{dateAbsence.toLocaleDateString()}</Text>
                  <FontAwesome5 name="calendar-alt" size={20} color="black" />
                </TouchableOpacity>
              </View>
              <Text className="text-base font-mmedium mt-3">Lý do</Text>

              <View className=" mt-3 py-2 px-3  border border-gray-300 rounded-md">
                <TextInput
                  value={reason}
                  onChangeText={(e) => setReason(e)}
                  className="text-base leading-[22px] h-[100px]"
                  multiline={true}
                  textAlignVertical="top"
                  numberOfLines={5}
                />
              </View>
              <View className="flex-row  mt-3 items-center">
                <Text className="text-base font-mmedium">Minh chứng</Text>
                <TouchableOpacity
                  onPress={pickImages}
                  className="ml-1 mt-[2px]"
                >
                  <Entypo name="plus" size={26} color={colors.blue_primary} />
                </TouchableOpacity>
              </View>
              <View className="h-[180px] border border-gray-300 rounded-md px-1 mt-2">
                <ScrollView className="max-h-[178px]">
                  <View className="h-1" />
                  <View className="flex-row flex-wrap">
                    {proof.map((uri, index) => (
                      <View
                        key={index}
                        className="m-1 relative rounded-md border border-gray-200"
                      >
                        <Image
                          source={{ uri }}
                          className="w-[80px] h-[80px] rounded-md "
                        />
                        <TouchableOpacity
                          onPress={() => removeImage(index)}
                          className="absolute top-[-5] right-[-5] bg-white rounded-full p-1"
                        >
                          <Feather name="x" size={15} color="red" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
              <ButtonCustom
                handle={() => handleCreateAbsenceRequest()}
                content="Tạo đơn"
                otherStyle="mt-5 w-[60%]"
              />
            </View>
          </View>
        </Modal>
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
                <Text className={`-mt-1 ${selectedAbsenceRequest.status=="approved"?"text-green" :selectedAbsenceRequest.status=="rejected"?"text-red":"text-orange"}`}>{selectedAbsenceRequest.status=="approved"?"Đã duyệt":selectedAbsenceRequest.status=="rejected"?"Từ chối":"Chưa duyệt"}</Text>
              </View>

              <Text className="text-base font-mmedium">Ngày nghỉ</Text>

              <View className=" mt-3 py-1 px-3 w-[100%] h-[40px]  border border-gray-300 rounded-md justify-center">
                <Text>{formatDate(selectedAbsenceRequest.date)}</Text>
              </View>
              <Text className="text-base font-mmedium mt-3">Lý do</Text>

              <View className=" mt-3 py-2 px-3  border border-gray-300 rounded-md">
                <ScrollView className="max-h-[110px]">
                  <Text className="text-base leading-[22px]">
                    {selectedAbsenceRequest.reason}
                  </Text>
                </ScrollView>
              </View>
              <View className="flex-row  mt-3 items-center">
                <Text className="text-base font-mmedium">Minh chứng</Text>
              </View>
              <View className="h-[180px] border border-gray-300 rounded-md px-1 mt-2">
                <ScrollView className="max-h-[178px]">
                  <View className="h-1" />
                  <View className="flex-row flex-wrap">
                    {selectedAbsenceRequest.proof.map((uri, index) => (
                      <View
                        key={index}
                        className="m-1 relative rounded-md border border-gray-200"
                      >
                        <Image
                          source={{ uri }}
                          className="w-[80px] h-[80px] rounded-md"
                        />
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
              <ButtonCustom
                handle={() => deleteAbsenceRequest()}
                content="Xóa đơn"
                otherStyle="mt-5 w-[60%] bg-red"
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
              {code}
            </Text>
            <Text className="mt-[-3px] text-white font-mmedium">Xin vắng</Text>
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
                  <FontAwesome6 name="exclamation" size={22} color="#FE3535" />
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
                </TouchableOpacity>
              )
            )
          )}
        </ScrollView>
        {/* bottom */}
        <View>
          <TouchableOpacity
            onPress={() => setOpenModal(true)}
            className="absolute bottom-3 right-4 bg-blue_primary flex-row py-[6px] px-3 items-center
              rounded-lg shadow-md"
          >
            <FontAwesome name="pencil-square-o" size={24} color="white" />
            <Text className="text-white font-mmedium ml-2 text-base my-auto text-center">
              Tạo đơn
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
}
