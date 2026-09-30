import { START_ID } from '@/design/data';
import { Screen } from '@/render/Screen';

// Splash (A01, or A01h in landscape) — advances to onboarding on its own.
export default function Index() {
  return <Screen id={START_ID} />;
}
