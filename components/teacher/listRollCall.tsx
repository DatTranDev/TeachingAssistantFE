import { colors } from "@/constants/colors";
import { localHost } from "@/utils/localhost";
import post from "@/utils/post";
import { AntDesign } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
type Student = {
  id: string;
  name: string;
  userCode: string;
  listStatus: {
    [key: number]: string;
  };
  status: string;
};
type StudentPresent = {
  id: string;
  name: string;
  userCode: string;
  status: string;
};
type Props = {
  students: Student[];
  numberRollCall: number;
  attendId: string;
  accessToken: string;
  changeStatus: (status: string, id: string, index: number) => void;
};

export default function ListRollCall({ students, numberRollCall, attendId, accessToken, changeStatus }: Props) {
    const totalStudent=students.length;
    const [listStudent, setListStudent] = useState<StudentPresent[]>([]);
    const countPresent = ()=> listStudent.filter((item)=>item.status==="CM"||item.status==="CP").length;
   const checkPresent = async (student: StudentPresent) => {
     let status = "CM";
     if (student.status=="CM") {
       status = "KP";
     }
     changeStatus(status, student.id, numberRollCall);
     const url = `${localHost}/api/v1/cAttend/attendrecord/add/forStudent`;
     const res = await post({
       url,
       data: {
         cAttendId: attendId,
         studentId: student.id,
         status: status,
         index: numberRollCall,
       },
       token: accessToken,
     });
     if (res) {
       if (res.status != 200 && res.status != 201) {
         Alert.alert(
           "Thông báo",
           `Đã xảy ra lỗi khi điểm danh cho ${student.name}`
         );
         changeStatus(status == "CM" ? "KP" : "CM", student.id, numberRollCall);
       }
     }
   };
   useEffect(() => {
    console.log("students",students);
    const listStudent = students.map((item: any) => {
        let status = "KP";
        if(item.listStatus[numberRollCall]){
            status = item.listStatus[numberRollCall];
        }
        if(item.status=="CP"){
            status="CP"
        }
        return {
            id: item.id,
            name: item.name,
            userCode: item.userCode,
            status: status,
        }
    });
    setListStudent(listStudent);
  }, [students, numberRollCall]);
  return (
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
              {item.status=="CP" ?
              (<View className=" -mb-4 mr-5">
                <Text className="text-base font-medium text-orange">CP</Text>
              </View>):
              (<TouchableOpacity
                onPress={() => {
                  checkPresent(item);
                }}
                className="-mb-4  p-1"
              >
                <View className="relative w-8 h-8">
                  <View
                    className="w-4 h-4 rounded-sm"
                    style={{
                      borderColor: item.status=="CM" ? colors.blue_primary : "black",
                      borderWidth: 1.2,
                    }}
                  ></View>
                  {item.status=="CM" && (
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
              </TouchableOpacity>)
          }
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
