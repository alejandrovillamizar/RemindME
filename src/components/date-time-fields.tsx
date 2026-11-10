import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';

type Props = { date:string; time:string; onDateChange:(value:string)=>void; onTimeChange:(value:string)=>void };
const fmtDate=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const fmtTime=(d:Date)=>`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
export default function DateTimeFields({date,time,onDateChange,onTimeChange}:Props) {
 const [picker,setPicker]=useState<'date'|'time'|null>(null);
 const parts=date?date.split('-').map(Number):[];
 const clock=time?time.split(':').map(Number):[9,0];
 const value=parts.length===3?new Date(parts[0],parts[1]-1,parts[2],clock[0],clock[1]):new Date();
 const handle=(event:DateTimePickerEvent,selected?:Date)=>{
   if(Platform.OS==='android') setPicker(null);
   if(event.type==='dismissed'||!selected)return;
   if(picker==='date')onDateChange(fmtDate(selected));
   if(picker==='time')onTimeChange(fmtTime(selected));
 };
 return <View style={styles.container}>
  <Text style={styles.label}>Fecha</Text>
  <Pressable style={styles.field} onPress={()=>setPicker('date')}><Text style={date?styles.value:styles.placeholder}>{date?new Date(date+'T12:00:00').toLocaleDateString('es-CO'):'Seleccionar fecha'}</Text><Text style={styles.icon}>▦</Text></Pressable>
  <Text style={styles.label}>Hora</Text>
  <Pressable style={styles.field} onPress={()=>setPicker('time')}><Text style={time?styles.value:styles.placeholder}>{time||'Seleccionar hora'}</Text><Text style={styles.icon}>◷</Text></Pressable>
  {picker&&<DateTimePicker value={value} mode={picker} display="default" minimumDate={picker==='date'?new Date():undefined} onChange={handle}/>}
  <Text style={styles.hint}>La fecha y la hora son opcionales, pero debes seleccionar ambas si deseas programar el recordatorio.</Text>
 </View>;
}
const styles=StyleSheet.create({container:{gap:9},label:{color:'#FFFFFF',fontSize:14,fontWeight:'600',marginTop:7},field:{minHeight:50,backgroundColor:'#25283A',borderRadius:12,borderWidth:1,borderColor:'#383B50',paddingHorizontal:15,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},value:{color:'#FFFFFF',fontSize:14},placeholder:{color:'#9295A5',fontSize:14},icon:{color:'#C4B5FD',fontSize:20},hint:{color:'#9295A5',fontSize:12,lineHeight:18,marginTop:2}});
