import React, { useContext, useState,useEffect } from 'react'
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert, Modal } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Foundation from '@expo/vector-icons/Foundation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { localHost } from '@/utils/localhost';
import { AuthContext } from '@/context/AuthContext';
import get from '@/utils/get';
import Loading from '@/components/ui/Loading';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import { formatNoWeekday } from '@/utils/formatDate';
import Octicons from '@expo/vector-icons/Octicons';
export type Attend={
      id:string,
      sessionNumber:number,
      date:string,
}
type Group = {
  id: string;
  name: string;
  members: string[];
  cAttend: Attend;
  reviewedBy?:Group;
  admin?:string;
};
type Props = {}

export default function listRoom({ }: Props) {
      const authContext = useContext(AuthContext);
  if (!authContext) {
    Alert.alert("Thông báo", "Đã xảy ra lỗi")
    return;
  }
      const router = useRouter()
      const {user,accessToken}= authContext;
      const { subjectId,code,name } = useLocalSearchParams();
      const [loading,setLoading]= useState(false)
      const [listAttend,setListAttend]= useState<Attend[]>([])
      const [listRandomGroup,setListRandomGroup]= useState<Group[]>([])
      const [showListRandomGroup,setShowListRandomGroup]= useState(false)
      const getChannel= async()=>{
            setLoading(true)
            const url=`${localHost}/api/v1/cAttend/findBySubject/${subjectId}`
            const res= await get({url,token:accessToken})
            const res2 = await get({
              url: `${localHost}/api/v1/group/random/${subjectId}`,
              token: accessToken,
            });
            if(res && res.status==200)
            {
                  setListAttend(res.data.cAttends.reverse())
            }
            else
            {
                  Alert.alert("Thông báo","Đã xảy ra lỗi")
            }
            setLoading(false)
      }
      const getRandomGroup= async()=>{
        setLoading(true)
        console.log(accessToken)
            const res = await get({
              url: `${localHost}/api/v1/group/random/${subjectId}`,
              token: accessToken,
            });
            if(listAttend.length==0)
            {
              Alert.alert("Thông báo","Chưa có buổi học")
              setLoading(false)
              return
            }
            if(res)
              {
                if(res.status==200 || res.status==304)
                  {
                const data= res.data.groups;
                console.log("data: ",data)
                const listGroup= data.map((item:any)=>({
                  id:item._id,
                  name:item.name,
                  members:item.members,
                  cAttend:listAttend.find((attend:Attend)=>attend.id===item.cAttendId),
                  reviewedBy:item?.reviewedBy||null,
                  admin:item?.admin||item?.admin.id|| null
                }))
                setListRandomGroup(listGroup.sort((a:Group,b:Group)=>b.cAttend.sessionNumber-a.cAttend.sessionNumber))
                setShowListRandomGroup(true)
                setLoading(false)
              }else
              {
                Alert.alert("Thông báo","Đã xảy ra lỗi")
              }
            }
            setLoading(false)
      }
      useEffect(()=>{
            getChannel()
      },[])
      const goToGeneral = () => {
            router.push({
                  pathname: '/classDetail/generalRoom',
                  params: {
                        subjectId:`${subjectId}`,
                        name:`${name}`,
                        code:`${code}`
                      },
            });
      }
      const goToChannel = (attend:Attend) => {
            router.push({
                  pathname: '/classDetail/discussionRoom',
                  params: {
                        cAttendId: attend.id,
                        sessionNumber:attend.sessionNumber,
                        date:attend.date,
                        subjectId:`${subjectId}`
                      },
            });
      }
      const goToFixedGroup = async() => {
        try{
          const res = await get({
            url: `${localHost}/api/v1/group/default/${subjectId}`,
            token: accessToken,
          });
          if(res)
          {
            if(res.status==200)
            {
            const myGroup= res.data.group
            if(myGroup)
            {
              router.push({
                pathname: "/classDetail/discussion/fixedGroup",
                params: {
                  subjectId: `${subjectId}`,
                  name: `${name}`,
                  code: `${code}`,
                  group: JSON.stringify(myGroup),
                },
              });
            }
          }
            if(res.status==404)
            {
              router.push({
                    pathname: '/classDetail/discussion/joinFixedGroup',
                    params: { subjectId: `${subjectId}`,name: `${name}`,code: `${code}` },
              });
            }
          }
        }
        catch(error)
        {
          Alert.alert("Thông báo","Đã xảy ra lỗi")
        }
      }
      const goToRandomGroup = async(item:Group) => {
        console.log("item: ",item)
        setShowListRandomGroup(false)
        router.push({
          pathname: "/classDetail/discussion/randomGroup",
          params: {
            subjectId: `${subjectId}`,
            name: `${name}`,
            code: `${code}`,
            group: JSON.stringify(item),
          },
        });
      }
      return (
        <SafeAreaView>
          <Loading loading={loading} />
          <View className=" shadow-md  pb-[1.5%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center ">
            <TouchableOpacity onPress={router.back}>
              <Ionicons name="chevron-back-sharp" size={24} color="white" />
            </TouchableOpacity>
            <View className="mx-auto items-center pr-6">
              <Text className="text-[18px] font-msemibold uppercase text-white">
                {code}
              </Text>
              <Text className="mt-[-3px] text-white font-mmedium">
                Trao đổi
              </Text>
            </View>
          </View>
          <View>
            <Text className="text-base font-semibold mt-[4%] ml-[5%]">
              Thảo luận
            </Text>
            <TouchableOpacity
              onPress={goToGeneral}
              className="flex-row items-center bg-white w-[94%] mx-auto px-[6%] py-4 rounded-2xl mt-2   "
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={24}
                color="black"
              />
              <Text className="text-base font-msemibold ml-4 mr-auto">
                Kênh chung
              </Text>
            </TouchableOpacity>
            <Text className="text-base font-semibold mt-3 ml-[5%]">Nhóm</Text>
            <TouchableOpacity
              onPress={goToFixedGroup}
              className="flex-row items-center bg-white w-[94%] mx-auto px-[6%] py-4 rounded-2xl mt-2   "
            >
              <Octicons name="people" size={24} color="black" />
              <Text className="text-base font-msemibold ml-4 mr-auto">
                Nhóm cố định
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={()=>getRandomGroup()}
              className="flex-row items-center bg-white w-[94%] mx-auto px-[6%] py-4 rounded-2xl mt-2   "
            >
              <Octicons name="people" size={24} color="black" />
              <Text className="text-base font-msemibold ml-4 mr-auto">
                Nhóm theo buổi
              </Text>
            </TouchableOpacity>

            {listAttend.length > 0 && (
              <Text className="text-base font-semibold mt-3 ml-[5%]">
                Đặt câu hỏi
              </Text>
            )}
            <ScrollView className="mt-2 h-[380px]">
              {listAttend.length > 0 &&
                listAttend.map((channel, index) => {
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => goToChannel(channel)}
                      className="flex-row items-center bg-white w-[94%] mx-auto px-[6%] py-4 rounded-2xl mb-3"
                    >
                      <Feather name="book" size={24} color="black" />
                      <Text className="text-base font-msemibold ml-4 mr-auto">
                        Buổi {channel.sessionNumber} -{" "}
                        {formatNoWeekday(channel.date)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          </View>
          <Modal
            animationType="fade"
            transparent={true}
            visible={showListRandomGroup}
            onRequestClose={() => setShowListRandomGroup(false)}
          >
            <View
              className="flex-1 justify-center"
              style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            >
              <TouchableOpacity
                className="ml-auto mr-3 -mb-1"
                onPress={() => setShowListRandomGroup(false)}
              >
                <Ionicons name="close" size={26} color="red" />
              </TouchableOpacity>

              <View className="mt-2 bg-white p-2 rounded-xl w-[90%] mx-auto px-4 pb-3">
                <Text className="text-base font-semibold text-center">
                  Nhóm theo buổi
                </Text>
                
                <ScrollView className="max-h-[240px] pb-1">
                  {listRandomGroup.map((group: Group) => (
                    <TouchableOpacity
                      key={group.id}
                      onPress={()=>goToRandomGroup(group)}
                      className="bg-gray-200 rounded-xl py-2 px-4 mt-2"
                    >
                      <Text className="text-base">
                        {group.name} - Buổi {group.cAttend.sessionNumber} - {formatNoWeekday(group.cAttend.date)}  
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      );
}