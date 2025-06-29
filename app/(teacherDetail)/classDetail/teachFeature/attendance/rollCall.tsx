import ButtonCustom from "@/components/ui/ButtonCustom";
import Loading from "@/components/ui/Loading";
import { colors } from "@/constants/colors";
import { formatNoWeekday } from "@/utils/formatDate";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import * as Location from "expo-location";
import { localHost } from "@/utils/localhost";
import { AuthContext } from "@/context/AuthContext";
import get from "@/utils/get";
import patch from "@/utils/patch";
import post from "@/utils/post";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SocketContext } from "@/context/SocketContext";
import ListRollCall from "@/components/teacher/listRollCall";
import { Path } from "@shopify/react-native-skia";

type Props = {};
type Student = {
  id: string;
  name: string;
  userCode: string;
  check: boolean;
  listStatus: {
    [key: number]: string;
  };
  status: string;
};
type StudentPresent = {
  id: string;
  name: string;
  userCode: string;
  status: string[];
};

export default function RollCall({}: Props) {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    return;
  }
  const socketContext = useContext(SocketContext);

  const { user, accessToken } = authContext;
  const { date, attendId, subjectId, name, sessionNumber } =
    useLocalSearchParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [totalStudent, setTotalStudent] = useState<number>(0);
  const [listStudent, setListStudent] = useState<Student[]>([]);
  const [openModalCreate, setOpenModalCreate] = useState<boolean>(false);
  const [openEditLastes, setOpenEditLastes] = useState<boolean>(false);
  const [openModalEditAll, setOpenModalEditAll] = useState<boolean>(false);
  const [time, setTime] = useState<number>(3);
  const [acceptedNumberPick, setAcceptedNumberPick] = useState<number>(1);
  const [checkLocation, setCheckLocation] = useState<boolean>(true);
  // const [location, setLocation] = useState<{
  //   latitude: number;
  //   longitude: number;
  // } | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [tabAutomation, setTabAutomation] = useState<boolean>(true);
  const [studentsPresent, setStudentsPresent] = useState<StudentPresent[]>([]);
  const [numberOfAttend, setNumberOfAttend] = useState<number>(0);
  const [totalPresent, setTotalPresent] = useState<number>(0);
  const [numberRollCall, setNumberRollCall] = useState<number>(1);
  const [tabNumber, setTabNumber] = useState<number>(0);
  const [acceptedNumber, setAcceptedNumber] = useState<number>(0);
  const [resetForDelete, setResetForDelete] = useState<number>(0);
  const handleRollCall = () => {
    setOpenEditLastes(false);
    setOpenModalCreate(true);
    setTime(3);
    setCheckLocation(true);
  };
  const handleAddRollCall = () => {
    setOpenEditLastes(true);
    setTime(3);
    setCheckLocation(true);
  };
  const getLocation = async () => {
    console.log("getLocation");
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Thông báo", "Cần cấp quyền truy cập vị trí để điểm danh");
        return false;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      if(currentLocation)
      {
        return {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };
      }else {
        return false;
      }
      
    } catch {
      Alert.alert("Thông báo", "Đã xảy ra lỗi khi lấy vị trí");
      return false;
    }
  };
  const createRollCall = async () => {
    if(numberOfAttend>=3)
    {
      Alert.alert("Thông báo", "Chỉ được tạo tối đa 3 lần điểm danh");
      setOpenModalCreate(false);
      return;
    }
    setLoading(true);
    let location: {
      latitude: number;
      longitude: number;
    } | null = null;
    if (checkLocation && tabAutomation) {
      const check = await getLocation();
      if (!check) {
        setLoading(false);
        Alert.alert("Thông báo", "Đã xảy ra lỗi khi lấy vị trí");
        return;
      } else {
        location = check;
      }
    } else {
      location = {
        latitude: 0,
        longitude: 0,
      };
    }
    let data = {
      isActive: "true", //Bắt đầu điểm danh
      teacherLatitude: location?.latitude || 0,
      teacherLongitude: location?.longitude || 0,
      timeExpired: time, //Thời gian hết hạn(đơn vị phút)
      numberOfAttend: numberOfAttend + 1,
      acceptedNumber: numberOfAttend + 1,
    };
    let checkTab = false;
    if (!tabAutomation) {
      data = {
        isActive: "true", //Bắt đầu điểm danh
        teacherLatitude: 0,
        teacherLongitude: 0,
        timeExpired: 0, //Thời gian hết hạn(đơn vị phút)
        numberOfAttend: numberOfAttend + 1,
        acceptedNumber: numberOfAttend + 1,
      };
      checkTab = true;
    }
    const res = await patch({
      url: localHost + `/api/v1/cAttend/update/${attendId}`,
      data: data,
      token: accessToken,
    });
    if (res) {
      if (res.status === 200) {
        if (!checkTab) {
          if (socketContext?.socket) {
            const dataMsg = {
              title: ``, //Tên môn học
              body: "", //Nội dung tin nhắn
              type: "attendance", //Loại tin nhắn
              senderId: user?.id, //ID người gửi
              sender: "Ẩn danh", //Tên người gửi
              subject: `${name}`, //Tên môn học
              room: "", //Phòng học
            };
            socketContext.socket.emit("attendace", {
              subjectID: subjectId,
              dataMsg: {
                ...dataMsg,
                cAttend: {
                  ...data,
                  id: attendId,
                  teacherLongitude: !location?.longitude
                    ? 0
                    : location.longitude,
                  teacherLatitude: !location?.latitude ? 0 : location.latitude,
                  sessionNumber: sessionNumber,
                  date: date,
                  status: "Chưa điểm danh",
                },
              },
            });
          }
        }
        if (isActive) {
          Alert.alert("Thông báo", "Chỉnh sửa điểm danh thành công");
        } else {
           const res3 = await patch({
             url:
               localHost + `/api/v1/cAttend/attendRecord/markExcusedAttendance`,
             data: {
               subjectId: subjectId,
               cAttendId: attendId,
               date: formatNoWeekday(date),
             },
             token: accessToken,
           });
          Alert.alert("Thông báo", "Tạo điểm danh thành công");
        }
        setIsActive(true);
        setAcceptedNumber(numberOfAttend + 1);
        setNumberOfAttend(numberOfAttend + 1);
        setTabNumber(numberOfAttend + 1);
      } else {
        Alert.alert("Thông báo", "Đã xảy ra lỗi");
      }
    }
    setTabAutomation(true);
    setOpenModalCreate(false);
    setLoading(false);
  };
  const deleteSingleRollCall = async () => {
    if (isActive) {
      setLoading(true);
      const res = await patch({
        url: localHost + `/api/v1/cAttend/resetSingle/${attendId}/${tabNumber}`,
        data: {},
        token: accessToken,
      });
      console.log("res", res);
      if (res) {
        if (res.status === 200) { 
          if(numberOfAttend==1)
          {
            setIsActive(false);
          }
          setNumberOfAttend(numberOfAttend - 1);
          setTabNumber(tabNumber - 1);
          setResetForDelete(resetForDelete + 1);
          Alert.alert("Thông báo", "Đã xóa điểm danh");
        } else {
          Alert.alert("Thông báo", "Đã xảy ra lỗi");
        }
      }
      
      setLoading(false);
      setOpenModalCreate(false);
    }
  };
  const deleteAllRollCall = async () => {
     if (isActive && tabNumber > numberOfAttend) {
       setLoading(true);
       const res = await patch({
         url: localHost + `/api/v1/cAttend/reset/${attendId}`,
         data: {},
         token: accessToken,
       });
       if (res) {
         if (res.status === 200) {
           setNumberOfAttend(0);
           setTabNumber(0);
           setIsActive(false);
           setResetForDelete(resetForDelete + 1);
           Alert.alert("Thông báo", "Đã xóa điểm danh");
         } else {
           Alert.alert("Thông báo", "Đã xảy ra lỗi");
         }
       }
       setLoading(false);
     }
  }
  useEffect(() => {
    async function getAttend() {
      setLoading(true);
      const res = await get({
        url: localHost + `/api/v1/cAttend/${attendId}`,
        token: accessToken,
      });
      if (res) {
        if (res.status == 200) {
          setIsActive(res.data.cAttend.isActive);
          setNumberOfAttend(res.data.cAttend.numberOfAttend);
          setAcceptedNumber(res.data.cAttend.acceptedNumber);
          setTabNumber(res.data.cAttend.numberOfAttend);
          let list = await getAllStudent();
          if (list) {
            setListStudent(list);
            if (res.data.cAttend.isActive) {
              await getPresentStudent(list);
            } else {
              setLoading(false);
              return;
            }
          }
        } else {
          setLoading(false);
          Alert.alert("Thông báo", "Đã xảy ra lỗi");
        }
      } else {
        setLoading(false);
      }
    }
    async function getPresentStudent(list: Student[]) {
      const res = await get({
        url: localHost + `/api/v1/cAttend/attendStudents/${attendId}`,
        token: accessToken,
      });
      if (res) {
        if (res.status == 200) {
          const studentsPresent = res.data.students;
          setStudentsPresent(studentsPresent);
          console.log(studentsPresent);
          const newList = list.map((item: any) => {
            const student = studentsPresent.map((student: any) => {
              if(student.id === item.id){
                item.status = student.status;
                student.listStatus.map((status: any) => {
                  item.listStatus[status.index] = status.status;
                });
              }
            });
            return item;
          });
          console.log("list", newList);
          setListStudent(newList);
          setLoading(false);
        } else {
          setLoading(false);
          Alert.alert("Thông báo", "Đã xảy ra lỗi");
        }
      } else {
        setLoading(false);
      }
    }
    async function getAllStudent() {
      const res = await get({
        url: localHost + `/api/v1/subject/${subjectId}/students`,
        token: accessToken,
      });
      if (res) {
        if (res.status == 200) {
          setTotalStudent(res.data.students.length);
          const list = res.data.students.map((item: any) => ({
            id: item.id,
            name: item.name,
            userCode: item.userCode,
            check: false,
            listStatus: {},
            status: "",
          }));
          return list;
        } else {
          Alert.alert("Thông báo", "Đã xảy ra lỗi");
          return null;
        }
      }
      return null;
    }
    getAllStudent();
    getAttend();
  }, [resetForDelete]);
  //Connect to socket
  useEffect(() => {
    if (socketContext) {
      console.log("socket: ", socketContext.socket.id);
      const { socket } = socketContext;
      if (socket) {
        socket.emit("joinSubject", { userID: user?.id, subjectID: subjectId });
        socket.on("receiveUserAttendance", (dataMsg: any) => {
          setListStudent((listStudent) => {
            return listStudent.map((item) => {
              if (item.id == dataMsg.student) {
                item.status = dataMsg.status;
                item.listStatus[dataMsg.index] = "CM";
              }
              return item;
            });
          });
        });
      }
    }
    return () => {
      if (socketContext) {
        const { socket } = socketContext;
        if (socket) {
          socket.emit("leaveSubject", {
            userID: user?.id,
            subjectID: subjectId,
          });
          socket.off("receiveUserAttendance");
        }
      }
    };
  }, [socketContext]);
  const countPresent = () => {
    let count = 0;
    listStudent.forEach(item=>{
      if(checkPresent(item)=="CM" || checkPresent(item)=="CP"){
        count++;
      }
    })
    return count;
  };
  const checkPresent = (student: Student) => {
    console.log("student", student);

   if(student.status=="CP")
   {
    return "CP"
   }
   console.log("student.listStatus", Object.values(student.listStatus));
   const count = Object.values(student.listStatus).filter((item: any) => item == "CM").length;
   if(count>=acceptedNumber)
   {
    return "CM"
   }
   return "KP"
  };
  const changeStatus = async (status: string, id: string, index: number) => {
    setListStudent(
      listStudent.map((student: any) => {
        if (student.id == id) {
          student.listStatus[index] = status;
        }
        return student;
      })
    );
  };
  const handleEdit = () => {
    handleRollCall();
    setOpenEditLastes(true);
  }
  const updateLastestRollCall= async ()=>{
    setLoading(true);
    let location: {
      latitude: number;
      longitude: number;
    } | null = null;
    if (checkLocation && tabAutomation) {
      const check = await getLocation();
      if (!check) {
        setLoading(false);
        Alert.alert("Thông báo", "Đã xảy ra lỗi khi lấy vị trí");
        return;
      } else {
        location = check;
      }
    } else {
      location = {
        latitude: 0,
        longitude: 0,
      };
    }
    let data = {
      isActive: "true", //Bắt đầu điểm danh
      teacherLatitude: location?.latitude || 0,
      teacherLongitude: location?.longitude || 0,
      timeExpired: time, //Thời gian hết hạn(đơn vị phút)
    };
    let checkTab = false;
    if (!tabAutomation) {
      data = {
        isActive: "true", //Bắt đầu điểm danh
        teacherLatitude: 0,
        teacherLongitude: 0,
        timeExpired: 0, //Thời gian hết hạn(đơn vị phút)
      };
      checkTab = true;
    }
    const res = await patch({
      url: localHost + `/api/v1/cAttend/update/${attendId}`,
      data: data,
      token: accessToken,
    });
    if (res) {
      if (res.status === 200) {
        if (!checkTab) {
          if (socketContext?.socket) {
            const dataMsg = {
              title: ``, //Tên môn học
              body: "", //Nội dung tin nhắn
              type: "attendance", //Loại tin nhắn
              senderId: user?.id, //ID người gửi
              sender: "Ẩn danh", //Tên người gửi
              subject: `${name}`, //Tên môn học
              room: "", //Phòng học
            };
            socketContext.socket.emit("attendace", {
              subjectID: subjectId,
              dataMsg: {
                ...dataMsg,
                cAttend: {
                  ...data,
                  id: attendId,
                  teacherLongitude: !location?.longitude
                    ? 0
                    : location.longitude,
                  teacherLatitude: !location?.latitude ? 0 : location.latitude,
                  sessionNumber: sessionNumber,
                  date: date,
                  status: "Chưa điểm danh",
                },
              },
            });
          }
        }
        if (isActive) {
          Alert.alert("Thông báo", "Chỉnh sửa điểm danh thành công");
        } else {
          Alert.alert("Thông báo", "Tạo điểm danh thành công");
        }
      } else {
        Alert.alert("Thông báo", "Đã xảy ra lỗi");
      }
    }
    setTabAutomation(true);
    setOpenModalCreate(false);
    setLoading(false);
  }
  const updateAcceptNumber = async ()=>{
    setLoading(true);
    const res = await patch({
      url: localHost + `/api/v1/cAttend/update/${attendId}`,
      data: {acceptedNumber: acceptedNumberPick},
      token: accessToken,
    });
    if (res) {
      if (res.status === 200) {
        setAcceptedNumber(acceptedNumberPick);
        setOpenModalEditAll(false);
      }
    }
    setLoading(false);
  }
  return (
    <SafeAreaView className="flex-1">
      <Loading loading={loading} />
      {/* tao va them */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={openModalCreate}
        onRequestClose={() => setOpenModalCreate(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onPress={() => setOpenModalCreate(false)}
        >
          <TouchableWithoutFeedback>
            <View className=" bg-white  pt-4 pb-5 rounded-lg px-1 z-50 mx-auto w-[85%] ">
              <Text className="text-base font-msemibold text-center -mt-2 -mb-1">
                {`${openEditLastes ? "Chỉnh sửa lần " + tabNumber : "Tạo điểm danh"}`}
              </Text>
              <Text className="text-sm font-regular text-center">
                {formatNoWeekday(date)}
              </Text>
              <View className="flex-row mx-auto mt-2 mb-1  ">
                <TouchableOpacity onPress={() => setTabAutomation(true)}>
                  <Text
                    className={` text-base text-gray_primary px-2 py-[2px] rounded-md ${
                      tabAutomation
                        ? "text-black bg-gray-100 border-gray-500 border-[0.5px]"
                        : ""
                    }`}
                  >
                    Tự động
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTabAutomation(false)}>
                  <Text
                    className={` text-base text-gray_primary px-2 py-[2px] rounded-md ${
                      !tabAutomation
                        ? "text-black bg-gray-100 border-gray-500 border-[0.5px]"
                        : ""
                    }`}
                  >
                    Thủ công
                  </Text>
                </TouchableOpacity>
              </View>
              {tabAutomation && (
                <>
                  <View className="flex-row  w-[65%] px-[4%] items-center gap-4 mt-1">
                    <Text className="text-base font-mmedium">Thời gian</Text>
                    <View className="border-[1.2px] rounded-lg border-gray-400 justify-center w-full p-0 ">
                      <Picker
                        style={{
                          height: 30,
                          color: "#1F2937",
                          marginBottom: -10,
                        }}
                        className="text-xs"
                        selectedValue={time}
                        onValueChange={(a) => setTime(a)}
                      >
                        <Picker.Item label="3 phút" value="3" />
                        <Picker.Item label="5 phút" value="5" />
                        <Picker.Item label="10 phút" value="10" />
                        <Picker.Item label="15 phút" value="15" />
                        <Picker.Item label="30 phút" value="30" />
                      </Picker>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setCheckLocation(!checkLocation)}
                    className="flex-row items-center mt-5 px-[5%]"
                  >
                    <View className="relative w-8 h-8">
                      <View
                        className="w-4 h-4 rounded-sm"
                        style={{
                          borderColor: checkLocation
                            ? colors.blue_primary
                            : "black",
                          borderWidth: 1.2,
                        }}
                      ></View>
                      {checkLocation && (
                        <View
                          className="absolute "
                          style={{
                            top: -7,
                            left: -3,
                          }}
                        >
                          <AntDesign
                            name="check"
                            size={26}
                            color={colors.blue_primary}
                          />
                        </View>
                      )}
                    </View>
                    <Text className=" text-base  font-msemibold text-center -ml-1 mb-4">
                      Sử dụng vị trí
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              {openEditLastes ?  
              <ButtonCustom
                content={`Lưu`}
                handle={() => updateLastestRollCall()}
                otherStyle={`w-[40%]  px-5 ${tabAutomation ? "" : "mt-4"}`}
              />
              :
              <ButtonCustom
                content={`Bắt đầu`}
                handle={() => createRollCall()}
                otherStyle={`w-[40%]  px-5 ${tabAutomation ? "" : "mt-4"}`}
              />
              }
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
      {/* modal chinh sua tong hop */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={openModalEditAll}
        onRequestClose={() => setOpenModalEditAll(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onPress={() => setOpenModalEditAll(false)}
        >
          <TouchableWithoutFeedback>
            <View className=" bg-white  pt-4 pb-5 rounded-lg px-1 z-50 mx-auto w-[87%] ">
              <Text className="text-base font-msemibold text-center">
                Chỉnh sửa điểm danh tổng hợp
              </Text>
              <Text className="text-sm font-mregular text-center">
                {formatNoWeekday(date)}
              </Text>
              {tabAutomation && (
                <>
                  <View className="flex-row  w-[65%] px-[4%] items-center gap-4 mt-1">
                    <Text className="text-base font-mmedium">Số lần điểm danh</Text>
                    <View className="border-[1.2px] rounded-lg border-gray-400 justify-center w-32 p-0 ">
                      <Picker
                        style={{
                          height: 30,
                          color: "#1F2937",
                          marginBottom: -10,
                        }}
                        className="text-xs"
                        selectedValue={acceptedNumberPick}
                        onValueChange={(a) => setAcceptedNumberPick(a)}
                      >
                        {Array.from({ length: numberOfAttend }).map((item, index) => (
                        <Picker.Item key={index} label={`${index + 1} lần`} value={index + 1} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                  
                </>
              )}
              <View className="px-[4%] flex-row justify-between mt-5">
                <ButtonCustom
                  content={`Lưu`}
                  handle={() => updateAcceptNumber()}
                  otherStyle={`w-[40%]  px-5 ${tabAutomation ? "" : "mt-4"}`}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
      <View className=" shadow-md  pb-[1.5%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center ">
        <TouchableOpacity onPress={router.back}>
          <Ionicons name="chevron-back-sharp" size={24} color="white" />
        </TouchableOpacity>
        <View className={`mx-auto items-center  ${isActive ? "" : "pr-6"}`}>
          <Text className="text-[18px] font-msemibold uppercase text-white">
            Điểm danh
          </Text>
          <Text className="mt-[-3px] text-white font-mmedium">
            {formatNoWeekday(date)}
          </Text>
        </View>
        {isActive && (
          <TouchableOpacity onPress={handleRollCall}>
            <MaterialIcons name="more-time" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {isActive && (
        <View className="flex-row mx-auto mt-[4%] border-b-[1px] border-gray-300 mb-1">
          {Array.from({ length: numberOfAttend }).map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setTabNumber(index + 1)}
            >
              <Text
                className={`text-base font-mmedium px-2 ${
                  tabNumber === index + 1
                    ? "text-black font-msemibold border-b-[2px] border-black -mb-[1px] "
                    : "text-gray_primary"
                }`}
              >
                Lần {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => setTabNumber(numberOfAttend + 1)}>
            <Text
              className={`text-base font-mmedium px-2 ${
                tabNumber === numberOfAttend + 1
                  ? "text-black font-msemibold border-b-[2px] border-black -mb-[1.5px]  "
                  : "text-gray_primary"
              }`}
            >
              Tổng hợp ({acceptedNumber})
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {!isActive ? (
        <Text className="flex-1 text-center text-gray-500 mt-3">
          Chưa bắt đầu điểm danh
        </Text>
      ) : tabNumber <= numberOfAttend ? (
        <ListRollCall
          students={listStudent}
          numberRollCall={tabNumber}
          attendId={String(attendId)}
          accessToken={accessToken || ""}
          changeStatus={changeStatus}
        />
      ) : (
        <View className=" w-[91%] mx-auto mt-[2%] flex-1">
          <Text className="text-base font-msemibold text-center mt-2">
            Đã điểm danh ({countPresent()}/{totalStudent})
          </Text>
          <ScrollView className="px-2">
            {listStudent.map((item, index) => (
              <View
                key={index}
                className="bg-white rounded-md py-3 pl-4 mt-2 mb-1 flex-row justify-between"
              >
                <Text
                  numberOfLines={1}
                  className="text-base text-[15px] font-mregular flex-1"
                >
                  {index + 1}. {item.userCode} - {item.name}
                </Text>
                {checkPresent(item) == "CP" ? (
                  <View className=" -mb-4 mr-5">
                    <Text className="text-base font-medium text-orange">
                      CP
                    </Text>
                  </View>
                ) : (
                  <View className=" -mb-4  p-1">
                    <View className="relative w-8 h-8">
                      <View
                        className="w-4 h-4 rounded-sm"
                        style={{
                          borderColor:
                            checkPresent(item) == "CM"
                              ? colors.blue_primary
                              : "black",
                          borderWidth: 1.2,
                        }}
                      ></View>
                      {checkPresent(item) == "CM" && (
                        <View
                          className="absolute "
                          style={{
                            top: -7,
                            left: -3,
                          }}
                        >
                          <AntDesign
                            name="check"
                            size={26}
                            color={colors.blue_primary}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      <LinearGradient
        className="h-[1px] bg-[#dbd7d7]"
        colors={["#F7F7F7", "#dbd7d7"]}
      />
      <View className="pb-4 pt-3">
        {!isActive ? (
          <ButtonCustom
            content="Tạo điểm danh"
            handle={() => handleRollCall()}
            otherStyle="w-[60%]"
          />
        ) : tabNumber < numberOfAttend ? (
          <ButtonCustom
            content="Xóa"
            handle={() => deleteSingleRollCall()}
            otherStyle="w-[60%] bg-red"
          />
        ) : tabNumber==numberOfAttend ? (
          <View className="flex-row justify-between">
            <ButtonCustom
              content="Chỉnh sửa"
              handle={() => handleEdit()}
              otherStyle="w-[40%]"
            />
            
            <ButtonCustom
              content="Xóa"
              handle={() => deleteSingleRollCall()}
              otherStyle="w-[40%] bg-red"
            />
          </View>
        ) : (
        <View className="flex-row justify-between">
        <ButtonCustom
              content="Chỉnh sửa"
              handle={() => setOpenModalEditAll(true)}
              otherStyle="w-[40%]"
            />
          <ButtonCustom
            content="Xóa"
            handle={() => deleteAllRollCall()}
            otherStyle="w-[40%] bg-red"
          />
        </View>
        )}
      </View>
    </SafeAreaView>
  );
}
