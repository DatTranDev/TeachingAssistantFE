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
import { SocketContext } from '@/context/SocketContext';

type Props = {};
type Student = {
  id: string;
  name: string;
  userCode: string;
  check: boolean;
};

export default function RollCall({}: Props) {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    return;
  }
  const socketContext = useContext(SocketContext);
  
  const { user, accessToken } = authContext;
  const { date, attendId, subjectId, name, sessionNumber } = useLocalSearchParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [totalStudent, setTotalStudent] = useState<number>(0);
  const [listStudent, setListStudent] = useState<Student[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [time, setTime] = useState<number>(3);
  const [checkLocation, setCheckLocation] = useState<boolean>(true);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [tabAutomation, setTabAutomation] = useState<boolean>(true);
  const [totalPresent, setTotalPresent] = useState<number>(0);
  const handleRollCall = () => {
    setOpenModal(true);
    setTime(3);
    setCheckLocation(true);
  };
  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Thông báo", "Cần cấp quyền truy cập vị trí để điểm danh");
        return false;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      return true;
    } catch {
      Alert.alert("Thông báo", "Đã xảy ra lỗi khi lấy vị trí");
      return false;
    }
  };
  const createRollCall = async () => {
    
      setLoading(true);
      if (checkLocation&&tabAutomation) {
        const check = await getLocation();
        if (!check) {
          return;
        }
      } else {
        setLocation({
          latitude: 0,
          longitude: 0,
        });
      }
      let data = {
        isActive: "true", //Bắt đầu điểm danh
        teacherLatitude: location?.latitude,
        teacherLongitude: location?.longitude,
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
          if(!checkTab){
            if (socketContext?.socket) {
              const dataMsg = {
                title: ``, //Tên môn học
                body: "", //Nội dung tin nhắn
                type: 'attendance', //Loại tin nhắn
                senderId: user?.id, //ID người gửi
                sender: 'Ẩn danh', //Tên người gửi
                subject: `${name}`, //Tên môn học
                room: '' //Phòng học
              };
              socketContext.socket.emit('attendace', {
                subjectID: subjectId,
                dataMsg: {
                  ...dataMsg,
                  cAttend: {
                    ...data,
                    id: attendId,
                    teacherLongitude: !location?.longitude ? 0 : location.longitude,
                    teacherLatitude: !location?.latitude ? 0 : location.latitude,
                    sessionNumber: sessionNumber,
                    date: date,
                    status: 'Chưa điểm danh'
                  },
                }
              });
            }
          }
          if (isActive) {
            Alert.alert("Thông báo", "Chỉnh sửa điểm danh thành công");
          } else {
            
            Alert.alert("Thông báo", "Tạo điểm danh thành công");
          }
          setIsActive(true);
        } else {
          console.log(res.status);
          Alert.alert("Thông báo", "Đã xảy ra lỗi");
        }
      }
      setTabAutomation(true);
      setOpenModal(false);
      setLoading(false);
    
  };
  const deleteRollCall = async () => {
    if (isActive) {
      setLoading(true);

     
      const res = await patch({
        url: localHost + `/api/v1/cAttend/reset/${attendId}`,
        data: {},
        token: accessToken,
      });
      if (res) {
        if (res.status === 200) {
          setIsActive(false);
          setListStudent(
            listStudent.map((item) => ({ ...item, check: false }))
          );
          Alert.alert("Thông báo", "Đã xóa điểm danh");
        } else {
          Alert.alert("Thông báo", "Đã xảy ra lỗi");
        }
      }
      setLoading(false);
      setOpenModal(false);
    }
  };

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
          list.forEach((item: any) => {
            const student = res.data.students.find(
              (student: any) => student.id == item.id && student.status == "CM"
            );
            if (student) {
              item.check = true;
            }
          });
          setListStudent(list);
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
  }, []);
  //Connect to socket
  useEffect(() => {
    if (socketContext) {
      console.log('socket: ', socketContext.socket.id);
      const { socket } = socketContext;
      if (socket) {
        socket.emit('joinSubject', { userID: user?.id, subjectID: subjectId });
        socket.on('receiveUserAttendance', (dataMsg: any) => {
            console.log('dataMsg receive: ', dataMsg);
            setListStudent((listStudent) => {
              return listStudent.map((item) => {
                if (item.id == dataMsg) {
                  item.check = true;
                }
                return item;  
              });
            }
            )
        });
      }
    }
    return () => {
      if (socketContext) {
        const { socket } = socketContext;
        if (socket) {
          socket.emit('leaveSubject', {
            userID: user?.id,
            subjectID: subjectId
          });
          socket.off('receiveUserAttendance');
        }
      }
    };
  }, [socketContext]);
  const countPresent = (list: Student[]) => {
    const count = list.filter((item: any) => item.check).length;
    return count || 0;
  };
  const checkPresent = async (student: Student) => {
    let status = "CM";
    if (student.check) {
      status = "KP";
    }
    setListStudent(
      listStudent.map((item: any) => {
        if (item.id == student.id) {
          item.check = status == "CM" ? true : false;
        }
        return item;
      })
    );
    const url = `${localHost}/api/v1/cAttend/attendrecord/add/forStudent`;
    const res = await post({
      url,
      data: {
        cAttendId: attendId,
        studentId: student.id,
        status: status,
      },
      token: accessToken,
    });
    if (res) {
      if (res.status != 200 && res.status != 201) {
        Alert.alert(
          "Thông báo",
          `Đã xảy ra lỗi khi điểm danh cho ${student.name}`
        );
        setListStudent(
          listStudent.map((item: any) => {
            if (item.id == student.id) {
              item.check = status == "CM" ? false : true;
            }
            return item;
          })
        );
      }
    }
  };
  
  return (
    <SafeAreaView className="flex-1">
      <Loading loading={loading} />
      <Modal
        animationType="fade"
        transparent={true}
        visible={openModal}
        onRequestClose={() => setOpenModal(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onPress={() => setOpenModal(false)}
        >
          <TouchableWithoutFeedback>
            <View className=" bg-white  pt-4 pb-5 rounded-lg px-1 z-50 mx-auto w-[87%] ">
              <Text className="text-base font-msemibold text-center">
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
              <ButtonCustom
                content={`${isActive ? "Lưu" : "Bắt đầu"}`}
                handle={() => createRollCall()}
                otherStyle={`w-[70%]  px-5 ${tabAutomation ? "" : "mt-4"}`}
              />
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
      <View className=" w-[91%] mx-auto mt-[2%] flex-1">
        <Text className="text-base font-msemibold text-center mt-2">
          Sinh viên có mặt ({countPresent(listStudent)}/{totalStudent})
        </Text>
        <ScrollView className="px-2">
          {!isActive ? (
            <Text className="text-center text-gray-500 mt-3">
              Chưa bắt đầu điểm danh
            </Text>
          ) : (
            listStudent.map((item, index) => (
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
                <TouchableOpacity
                  onPress={() => {
                    checkPresent(item);
                  }}
                  className="-mb-4  p-1"
                >
                  <View className="relative w-8 h-8">
                    <View
                      className="w-4 h-4 rounded-sm"
                      style={{
                        borderColor: item.check ? colors.blue_primary : "black",
                        borderWidth: 1.2,
                      }}
                    ></View>
                    {item.check && (
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
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>
      <LinearGradient
        className="h-[1px] bg-[#dbd7d7]"
        colors={["#F7F7F7", "#dbd7d7"]}
      />
      <View className="pb-4 pt-3">
        {isActive ? (
          <ButtonCustom
            content="Xóa điểm danh"
            handle={() => deleteRollCall()}
            otherStyle="w-[60%] bg-red"
          />
        ) : (
          <ButtonCustom
            content="Tạo điểm danh"
            handle={() => handleRollCall()}
            otherStyle="w-[60%]"
          />
        )}
      </View>
    </SafeAreaView>
  );
}
