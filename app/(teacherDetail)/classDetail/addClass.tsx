import React, {useContext} from 'react'
import { SafeAreaView, View , Text,TextInput, ScrollView, Alert} from 'react-native'
import InputLayout from '@/components/ui/inputLayout'
import { Picker } from '@react-native-picker/picker';
import ButtonCustom from '@/components/ui/ButtonCustom';
import { AuthContext } from '@/context/AuthContext';
import post from '@/utils/post';
import { localHost } from '@/utils/localhost';
import Loading from '@/components/ui/Loading';
type Props = {}

type Session = {
  dayOfWeek: number;
  room: string;
  start: string;
  end: string;
};


export default function AddClass({}: Props) {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    Alert.alert("Thông báo", "Đã xảy ra lỗi")
    return;
  }
  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [numberOfSesion, setNumberOfSesion] = React.useState(1);
  const [sessions, setSessions] = React.useState<Session[]>([
    { dayOfWeek: 1, room: '', start: 'Tiết 1', end: '2' },
  ]);
  const [loading, setLoading] = React.useState(false);
  
  const updateSession = <K extends keyof Session>(
    index: number,
    key: K,
    value: Session[K] // Ensure the value matches the type of the specified key
  ) => {
    setSessions((prevSessions) => {
      const updatedSessions = [...prevSessions];
      updatedSessions[index][key] = value; // Type-safe update
      return updatedSessions;
    });
  };
  
  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Tên lớp học là bắt buộc');
      return;
    }

    if (!code.trim()) {
      Alert.alert('Lỗi', 'Mã lớp học là bắt buộc');
      return;
    }
    // Validate session details
    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];

      if (!session.room.trim()) {
        Alert.alert('Lỗi', `Phòng học ở buổi ${i + 1} là bắt buộc`);
        return;
      }

      const start = parseInt(session.start.replace('Tiết ', ''), 10);
      const end = parseInt(session.end, 10);
      if (start > end) {
        Alert.alert(
          'Lỗi',
          `Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc ở buổi ${i + 1}`
        );
        return;
      }
      // Check for overlapping sessions
      for (let j = i + 1; j < sessions.length; j++) {
        const otherSession = sessions[j];
        if (
          session.dayOfWeek === otherSession.dayOfWeek && // Same day
          parseInt(otherSession.start.replace('Tiết ', ''), 10) < end && // Overlap start
          start < parseInt(otherSession.end, 10) // Overlap end
        ) {
          Alert.alert(
            'Lỗi',
            `Buổi ${i + 1} và buổi ${j + 1} bị trùng thời gian. Vui lòng điều chỉnh.`
          );
          return;
        }
      }
    }
    const {user, accessToken} = authContext;
    const data = {
      name,
      code,
      hostId: user?.id,
      sessions,
    };
    console.log(data);
    const url = `${localHost}/api/v1/subject/add`;
    const token = accessToken;
    setLoading(true);
    const response = await post({ url, data, token });
    if (response) {
      if (response.status === 201) {
        Alert.alert('Thành công', 'Lớp học đã được tạo');
        setName('');
        setCode('');
        setSessions([{ dayOfWeek: 1, room: '', start: 'Tiết 1', end: '2' }]);
        //Navigate
        setLoading(false);
        return;
      }
    }
    else
    {
      Alert.alert('Thông báo', 'Đã xảy ra lỗi, vui lòng thử lại sau !')
      setLoading(false);
      return;
    }
  };
  
  React.useEffect(() => {
    setSessions((prevSessions) => {
      if (numberOfSesion > prevSessions.length) {
        return [
          ...prevSessions,
          ...Array(numberOfSesion - prevSessions.length).fill({
            dayOfWeek: 1,
            room: '',
            start: 'Tiết 1',
            end: '2',
          }),
        ];
      }
      return prevSessions.slice(0, numberOfSesion);
    });
  }, [numberOfSesion]);

  return (
      <SafeAreaView className='px-8'>
          <Loading loading={loading} />
          <InputLayout
            style='w-[100%] mt-8'
            title={'Tên lớp học'}
            placeHorder={'Lập trình hướng đối tượng'}
            value={name}
            handle={setName}
          />
          <InputLayout
            style='w-[100%] my-4'
            title={'Mã lớp học'}
            placeHorder={'SE102.P20'}
            value={code}
            handle={setCode}
          />
          <Text className="text-[16px] font-msemibold text-gray_primary mb-2">Số buổi học</Text>
          <View className="mx-auto p-0 bg-white w-[100%] border-[1px] rounded-2xl border-gray-300 mb-2">
            <Picker 
                style={{padding: 0, margin: 0}}
                selectedValue={numberOfSesion}
                onValueChange={(a)=>setNumberOfSesion(a)} >
                  <Picker.Item label="1 buổi" value={1} />
                  <Picker.Item label="2 buổi" value={2} />
                  <Picker.Item label="3 buổi" value={3} />
            </Picker>
          </View>

          <ScrollView className='flex-grow h-[45%]'  keyboardShouldPersistTaps="handled">
            {sessions.map((session, index) => (
              //For each session
              <View key={index}>
                <Text className='font-msemibold text-gray_primary my-2'>Thông tin buổi {index + 1}</Text>
                <View className='border-[1px] border-gray-300 p-2 rounded-xl'>
                  <View className='flex flex-row justify-between'>
                    <View>
                      <Text className='text-gray_primary mb-2'>Ngày</Text>
                      <View className="p-0 w-36 bg-white border-[1px] rounded-2xl border-gray-300 ">
                        <Picker 
                            style={{padding: 0, margin: 0}}
                            selectedValue={session.dayOfWeek}
                            onValueChange={(value) => updateSession(index, 'dayOfWeek', value)} >
                              <Picker.Item label="Thứ 2" value={1} />
                              <Picker.Item label="Thứ 3" value={2} />
                              <Picker.Item label="Thứ 4" value={3} />
                              <Picker.Item label="Thứ 5" value={4} />
                              <Picker.Item label="Thứ 6" value={5} />
                              <Picker.Item label="Thứ 7" value={6} />
                              <Picker.Item label="Chủ nhật" value={7} />
                        </Picker>
                      </View>
                    </View>
                    <View>
                      <Text className=" text-gray_primary mb-2">Phòng học</Text>
                      <View className="border-[1px] w-36 rounded-2xl border-gray-300 px-2 py-[6px] bg-white">
                        <TextInput className="text-[14px] font-mmedium text-gray-800 h-[44px] " 
                          placeholder='B3.12'
                          value={session.room}
                          onChangeText={(value) => updateSession(index, 'room', value)}
                          autoCorrect={false}
                          keyboardType='email-address'
                          placeholderTextColor="rgba(0, 0, 0, 0.15)"
                          secureTextEntry={true} />
                      </View>
                    </View>
                  </View>
                  <View className='flex flex-row justify-between'>
                    <View>
                    <Text className='text-gray_primary mb-2'>Từ</Text>
                      <View className="p-0 w-36 bg-white border-[1px] rounded-2xl border-gray-300 ">
                        <Picker 
                            style={{padding: 0, margin: 0}}
                            selectedValue={session.start}
                            onValueChange={(value) => updateSession(index, 'start', value)} >
                              <Picker.Item label="Tiết 1" value="Tiết 1" />
                              <Picker.Item label="Tiết 2" value="Tiết 2" />
                              <Picker.Item label="Tiết 3" value="Tiết 3" />
                              <Picker.Item label="Tiết 4" value="Tiết 4" />
                              <Picker.Item label="Tiết 5" value="Tiết 5" />
                              <Picker.Item label="Tiết 6" value="Tiết 6" />
                              <Picker.Item label="Tiết 7" value="Tiết 7" />
                              <Picker.Item label="Tiết 8" value="Tiết 8" />
                              <Picker.Item label="Tiết 9" value="Tiết 9" />
                              <Picker.Item label="Tiết 10" value="Tiết 10" />
                        </Picker>
                      </View>
                    </View>
                    <View>
                    <Text className='text-gray_primary mb-2'>Đến</Text>
                      <View className="p-0 w-36 bg-white border-[1px] rounded-2xl border-gray-300 ">
                        <Picker 
                            style={{padding: 0, margin: 0}}
                            selectedValue={session.end}
                            onValueChange={(value) => updateSession(index, 'end', value)} >
                              <Picker.Item label="Tiết 1" value="1" />
                              <Picker.Item label="Tiết 2" value="2" />
                              <Picker.Item label="Tiết 3" value="3" />
                              <Picker.Item label="Tiết 4" value="4" />
                              <Picker.Item label="Tiết 5" value="5" />
                              <Picker.Item label="Tiết 6" value="6" />
                              <Picker.Item label="Tiết 7" value="7" />
                              <Picker.Item label="Tiết 8" value="8" />
                              <Picker.Item label="Tiết 9" value="9" />
                              <Picker.Item label="Tiết 10" value="10" />
                        </Picker>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))
            }
          </ScrollView>
          <ButtonCustom 
            otherStyle='mt-8'
            content='Tạo lớp học'
            handle={handleSubmit}
            >

          </ButtonCustom>
      </SafeAreaView>
  )
}