import { createElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { date: string; time: string; onDateChange: (value: string) => void; onTimeChange: (value: string) => void };

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

export default function DateTimeFields({ date, time, onDateChange, onTimeChange }: Props) {
  const inputStyle = { backgroundColor:'#25283A', color:'#FFFFFF', padding:'14px 15px', borderRadius:12, border:'1px solid #383B50', fontSize:14, width:'100%', boxSizing:'border-box' as const, colorScheme:'dark', minHeight:50 };
  return <View style={styles.container}>
    <Text style={styles.label}>Fecha</Text>
    {createElement('input', { type:'date', value:date, min:today(), onChange:(e:{currentTarget:{value:string}})=>onDateChange(e.currentTarget.value), 'aria-label':'Fecha del recordatorio', style:inputStyle })}
    <Text style={styles.label}>Hora</Text>
    {createElement('input', { type:'time', value:time, onChange:(e:{currentTarget:{value:string}})=>onTimeChange(e.currentTarget.value), 'aria-label':'Hora del recordatorio', style:inputStyle })}
    <Text style={styles.hint}>Selecciona la fecha en el calendario y la hora en el selector. Ambos campos son opcionales, pero debes completar los dos para programar el recordatorio.</Text>
  </View>;
}
const styles=StyleSheet.create({container:{gap:9},label:{color:'#FFFFFF',fontSize:14,fontWeight:'600',marginTop:7},hint:{color:'#9295A5',fontSize:12,lineHeight:18,marginTop:2}});
