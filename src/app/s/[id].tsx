import { useLocalSearchParams } from 'expo-router';
import { dec, Screen } from '@/render/Screen';

export default function DesignScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Screen id={dec(String(id))} />;
}
